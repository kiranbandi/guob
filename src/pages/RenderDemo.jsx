/** @jsxImportSource @emotion/react */
import { selectDraggables, addDraggable, deleteAllDraggables, selectGroup, setDraggables, sortDraggables } from 'redux/slices/draggableSlice'
import React from 'react'
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { addGenome, deleteAllGenome, selectGenome } from 'redux/slices/genomeSlice';
import _ from 'lodash';
import { scaleOrdinal } from 'd3-scale';
import { css } from '@emotion/react';
import DragContainer from 'features/draggable/DragContainer';
import Draggable from 'features/draggable/Draggable';
import { addBasicTrack, selectBasicTracks, deleteAllBasicTracks, updateTrack, updateBothTracks, initializeBasicTracks } from 'redux/slices/basicTrackSlice';
import { Typography, Slider, Tooltip } from '@mui/material';
import { CustomDragLayer } from 'features/draggable/CustomDragLayer';
import TrackListener from 'components/tracks/TrackListener';
import OrthologLinks from '../components/tracks/OrthologLinks'
import { moveCollabPreview } from '../features/miniview/miniviewSlice';
import SVTrack from '../components/tracks/SVTrack'
import { selectMiniviews } from '../features/miniview/miniviewSlice';
import TrackContainer from 'components/tracks/TrackContainer'
import IndexBased from 'components/tracks/IndexBased'
import { Switch, Button, Stack, Divider, FormControl, FormControlLabel, Drawer } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import sendFileToWorkers from '../utils/sendFileToWorkers'
import { addAnnotation, clearSearches, addSearch, removeAnnotation } from 'redux/slices/annotationSlice';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Track from 'components/tracks/Track'

import { text, json } from "d3-fetch"
import StackedProcessor from 'features/parsers/stackedProcessoor';




function RenderDemo({ isDark }) {

    const basicTrackSelector = useSelector(selectBasicTracks)
    const draggableSelector = useSelector(selectDraggables)['draggables']
    const orthologDraggableSelector = useSelector(selectDraggables)['ortholog']
    const genomeSelector = useSelector(selectGenome)
    let [sliderHeight, setSliderHeight] = useState(130);
    const [draggableSpacing, setDraggableSpacing] = useState(true)
    const groupSelector = useSelector(selectGroup)

    const [titleState, setTitleState] = useState("Arabidopsis thaliana")
    const [demoFile, setDemoFile] = useState(["files/at_coordinate.gff"])
    const [demoCollinearity, setDemoCollinearity] = useState("files/at_vv_collinear.collinearity")
    const [normalize, setNormalize] = useState(false)
    const [preloaded, setPreloaded] = useState(true)
    const [bitmap, setBitmap] = useState(true)
    let [loading, setLoading] = useState(false)
    const [firstLoad, setFirstLoad] = useState(true)
    const [listening, setListening] = useState(false)
    const [genomeView, setGenomeView] = useState(true)
    const [calculationFinished, setCalculationFinished] = useState(false)
    const [stackedArray, setStackedArray] = useState({})
    const [alignmentList, setAlignmentList] = useState([])
    const [chromosomeMap, setChromosomeMap] = useState({})
    const [cursorPosition, setCursorPosition] = useState(0)


    const dispatch = useDispatch()
    const ColourScale = scaleOrdinal().domain([0, 9])
        .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"])

    let previewBackground = isDark ? 'grey' : 'whitesmoke'

    //! Receive a message once done
    function checking(e) {

        // fetch('http://localhost:8080', {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'image/png',
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         chromosome: e.data.key.chromosome,
        //         data: e.data.data,
        //         isDark: isDark,
        //         end: e.data.end
        //     })
        // })
        //     .then(response =>{
        //         return response.blob()
        //         })
        //     .then(blob => {
        //         const imageObjectURL = URL.createObjectURL(blob);
        //         var img = document.createElement("img");
        //         img.src = imageObjectURL
        //         document.body.appendChild(img);
        //     })

        // window.dataset[e.data.key.chromosome] = {
        //     key: e.data.key.chromosome,
        //     array: e.data.data
        // }
        // dispatch(addGenome({
        //     key: e.data.key.chromosome,
        //     array: e.data.data
        // }))
        dispatch(addBasicTrack({
            key: e.data.key.chromosome,
            trackType: e.data.trackType,
            start: 0,
            end: e.data.end
        }))
    }

    function buildTracks(designation, numberOfTracks, suffix = "", trackType = "default") {

        for (let k = 1; k < numberOfTracks + 1; k++) {
            let color = ColourScale((k - 1) % 10)
            dispatch(addBasicTrack({
                key: designation + k + suffix,
                trackType: trackType,
                color,
                start: 0,
                zoom: 1.0,
                offset: 0,
            }))
            dispatch(addDraggable({
                key: designation + k + suffix,
                dragGroup: "draggables"
            }))
            dispatch(addGenome({
                key: designation + k + suffix,
                array: []
            }))
        }
    }


    function moveCursor(location) {
        setCursorPosition(location)
    }

    useEffect(() => {


        if (!listening) {
            setListening(true)
            const channel = new BroadcastChannel("testing")
            channel.addEventListener('message', checking);
        }

        if (loading && !firstLoad) {
            setCalculationFinished(false)
            dispatch(deleteAllGenome({}))
            dispatch(deleteAllBasicTracks({}))
            dispatch(deleteAllDraggables({
                dragGroup: "draggables"
            }))
            window.maximumLength = 0
            window.dataset = undefined
            window.chromosomalData = []

            //! This can absolutely be done programatically
            switch (demoFile[0]) {
                case "files/at_coordinate.gff":
                    buildTracks("at-coordinate_at", 5)
                    dispatch(addDraggable({
                        key: "links",
                        dragGroup: "draggables"
                    }))
                    json('files/at_chromosomalData.json').then(x => buildJsonDemo(x))
                    json('files/at_dataset.json').then(x => window.dataset = x)
                    break
                case "files/bn_coordinate.gff":
                    buildTracks("bn-coordinate_bn", 19)
                    json('files/bn_chromosomalData.json').then(x => buildJsonDemo(x))
                    json('files/bn_dataset.json').then(x => window.dataset = x)
                    break
                case "files/bn_methylation_100k.bed":
                    buildTracks("bn-methylation-100k_N-METHYL-", 19, "", "histogram")
                    json('files/bn-methylation_chromosomalData.json').then(x => buildJsonDemo(x))
                    json('files/bn-methylation_dataset.json').then(x => window.dataset = x)
                    break
                case "files/ta_hb_coordinate.gff":
                    buildTracks("ta_hb_coordinate", 7, "A")
                    buildTracks("ta_hb_coordinate", 7, "B")
                    buildTracks("ta_hb_coordinate", 7, "D")
                    // json('files/ta_hb_chromosomalData.json').then(x => buildJsonDemo(x))
                    // json('files/ta_hb_dataset.json').then(x => window.dataset = x)
                    demoFile.forEach(file => {
                        text(file).then(async data => {
                            let fileName = file.split(".")[0].split("/")
                            let nameDesignation = fileName[fileName.length - 1].split("_").join("-")
                            if (demoCollinearity) {
                                return text(demoCollinearity).then(c => {
                                    return sendFileToWorkers('gff', data, nameDesignation, c);
                                })
                            }
                            else {
                                if (file.includes(".bed")) {
                                    return sendFileToWorkers('bed', data, nameDesignation)
                                }
                                else {
                                    return sendFileToWorkers('gff', data, nameDesignation)
                                }
                            }

                        }).then(parsedData => {
                            buildDemo(parsedData.chromosomalData, parsedData.dataset)
                        })

                    })
                    setLoading(false)
                    break
                case "files/topas/all_gene_expression_100k.bed":
                    buildTracks("all-smallRNA-100k_N", 19, "", "histogram")
                    buildTracks("all-gene-expression-100k_N", 19, "", "histogram")
                    buildTracks("seed-smallRNA-100k_N", 19, "", "histogram")
                    buildTracks("seed-gene-expression-100k_N", 19, "", "histogram")
                    buildTracks("leaf-smallRNA-100k_N", 19, "", "histogram")
                    buildTracks("leaf-gene-expression-100k_N", 19, "", "histogram")
                    json('files/topas_chromosomalData.json').then(x => buildJsonDemo(x))
                    json('files/topas_dataset.json').then(x => window.dataset = x)
                    break
                default:
                    setLoading(false)

            }

            setLoading(false)

            // demoFile.forEach(file => {
            //     text(file).then(async data => {
            //         let fileName = file.split(".")[0].split("/")
            //         let nameDesignation = fileName[fileName.length - 1].split("_").join("-")                
            //         if (demoCollinearity) {
            //             return text(demoCollinearity).then(c => {
            //                 return sendFileToWorkers('gff', data, nameDesignation, c);
            //             })
            //         }
            //         else {
            //             if (file.includes(".bed")) {
            //                 return sendFileToWorkers('bed', data, nameDesignation)
            //             }
            //             else {
            //                 return sendFileToWorkers('gff', data, nameDesignation)
            //             }
            //         }

            //     }).then(parsedData => {
            //         buildDemo(parsedData.chromosomalData, parsedData.dataset)
            //     })

            // })
            // setLoading(false)

        }
        if (firstLoad) {
            json('files/at_chromosomalData.json').then(x => window.chromosomalData = x)
            json('files/at_dataset.json').then(x => window.dataset = x)
            window.previewVisible = false
            window.previewCenter = 0
            dispatch(deleteAllBasicTracks({}))
            dispatch(deleteAllDraggables({
                dragGroup: "draggables"
            }))
            window.maximumLength = 119135637
            let starting_draggables = ['at-coordinate_at1', 'at-coordinate_at2', 'at-coordinate_at3', 'links', 'at-coordinate_at4', 'at-coordinate_at5',]
            let starting_tracks = {
                'at-coordinate_at1': {
                    // array: at1_array,
                    key: 'at1',
                    color: "#4e79a7",
                    zoom: 1,
                    pastZoom: 1,
                    normalizedLength: 30425192,
                    end: 30425192,
                    offset: 0,
                },
                'at-coordinate_at2': {
                    key: 'at2',
                    // array: at2_array,
                    color: "#e15759",
                    zoom: 1,
                    pastZoom: 1,
                    normalizedLength: 30425192,
                    end: 19696821,
                    offset: 0,
                },
                'at-coordinate_at3': {
                    key: 'at3',
                    // array: at3_array,
                    color: "#76b7b2",
                    zoom: 1,
                    pastZoom: 1,
                    normalizedLength: 30425192,
                    end: 23458459,
                    offset: 0,
                },
                'at-coordinate_at4': {
                    key: 'at4',
                    // array: at4_array,
                    color: "#59a14f",
                    zoom: 1,
                    pastZoom: 1,
                    normalizedLength: 30425192,
                    end: 18584524,
                    offset: 0,
                },
                'at-coordinate_at5': {
                    key: 'at5',
                    // array: at5_array,
                    color: "#edc949",
                    zoom: 1,
                    pastZoom: 1,
                    normalizedLength: 30425192,
                    end: 26970641,
                    offset: 0,
                }
            }
            for (let key in starting_tracks) {
                const track = starting_tracks[key]
                let new_track = { [key]: track }
                dispatch(initializeBasicTracks(new_track))
            }
            starting_draggables.forEach(draggable => {
                dispatch(addDraggable({
                    key: draggable,
                    dragGroup: "draggables"
                }))
            })


            // text(demoFile[0]).then(async data => {
            //     return text(demoCollinearity).then(c => {
            //         return sendFileToWorkers('gff', data, demoFile[0].split(".")[0].split("_")[1], c)
            //     })
            // }).then(parsedData => {
            //      buildDemo(parsedData.chromosomalData, parsedData.dataset)
            // })
            // debugger

            setCalculationFinished(true)

            setFirstLoad(false)
        }

    }, [demoFile])


    useEffect(() => {
    }, [calculationFinished])

    async function buildDemo(chromosomalData, dataset) {
        window.dataset = { ...window.dataset, ...dataset }
        if (!window.chromosomalData) window.chromosomalData = []
        window.chromosomalData.push(...chromosomalData)
        window.chromosomes = chromosomalData.map((_ => _.key.chromosome))
        let normalizedLength = 0;
        normalizedLength = Math.max(...window.chromosomalData.map(d => d.end))
        chromosomalData.forEach((point, i) => {

            point.normalizedLength = normalizedLength

            window.maximumLength += point.end;
        })

        setCalculationFinished(true)
    }

    async function buildJsonDemo(chromosomalData) {
        window.chromosomalData = chromosomalData
        window.chromosomes = []
        chromosomalData.forEach(x => {
            window.chromosomes.push(x.key.chromosome)
            dispatch(addBasicTrack({
                key: x.key.chromosome,
                trackType: x.trackType,
                start: 0,
                end: x.end
            }))
        })
        let normalizedLength = 0;
        normalizedLength = Math.max(...window.chromosomalData.map(d => d.end))
        chromosomalData.forEach((point, i) => {

            point.normalizedLength = normalizedLength

            window.maximumLength += point.end;
        })

        setCalculationFinished(true)
    }


    const buildGenomeView = () => {
        if (!window.chromosomalData || window.chromosomalData.length === 0) return

        let genomeTracks = []
        let genomeNames = Object.keys(basicTrackSelector)

        let totalSize = window.maximumLength
        let maxWidth = window.innerWidth - 100
        let x = 0

        while (x < genomeNames.length) {

            let currentGenomes = genomeNames.slice(x)

            let chosenGenomes = []
            for (let _ = 0; _ < currentGenomes.length; _++) {
                let width = maxWidth * basicTrackSelector[currentGenomes[_]].end / totalSize
                chosenGenomes.push({
                    genome: currentGenomes[_],
                    width
                })
                x++

            }
            genomeTracks.push(

                <Stack direction="row" marginBottom={0} paddingTop={3} key={"Stack_" + x} justifyContent={"space-around"} style={{ position: "sticky", top: 0, zIndex: 4, background: isDark ? "#121212" : "white" }}>
                    {chosenGenomes.map(genomeItem => {
                        return (
                            <Track
                                id={genomeItem.genome + "_genome"}
                                normalize={normalize}
                                isDark={isDark}
                                renderTrack={bitmap ? "bitmap" : 'basic'}
                                usePreloadedImages={preloaded}
                                genome={true}
                                width={genomeItem.width}
                                moveCursor={moveCursor}
                                cursorPosition={cursorPosition}
                            />
                        )
                    })
                    }
                </Stack>

            )
        }
        if (Object.keys(basicTrackSelector).length === 0) return
        if (basicTrackSelector[genomeNames[0]].end) {
            return <>{genomeTracks}</>
        }
    }


    let styling = css(css`.example {
        width: 500px;
        height: 700px;
        border: 1px solid black;
    }
    :root {
    --placeholder-primary: #eeeeee;
    --placeholder-secondary: #cccccc;
}
@keyframes placeholder {
    0% {
        background-color: var(--placeholder-primary);
    }
    50% {
        background-color: var(--placeholder-secondary);
    }
    100% {
        background-color: var(--placeholder-primary);
    }
}
    .draggable {
        cursor: crosshair; 
        border: 1px solid grey;
        margin-bottom: ${draggableSpacing ? 0 : "1.5rem"};
        height: ${sliderHeight + 'px'};
        border:solid black 1px;
        flex-direction: row;
    }
    .body {
        overflow: hidden;
    }
    .miniview {
      cursor: crosshair;
    }
    .genomeView {
        flex-direction: row;
        display: "flex";
    }
    .draggableItem {
        height: 100%;
        width: 98%;
        float: left;
        margin: 0px;
        overflow: hidden;
    
        &.smaller {
          width: 95%;
        }
      }
      .handle {
        width: 2%;
        float: left;
        height: 100%;
        margin:0%;
        padding: 0%;
        cursor: grab;
    
        &.smaller {
          margin: 0% 0.5% 0% 0%;
        }
      }
      .halfHandle {
        ${'' /* height: 45%; */}
        ${'' /* border-radius: 50%; */}
        width: 20px;
        margin: 0%;
        padding: 0%;
        ${'' /* paddingLeft: 0px; */}
      }
    .alternateDraggable{
      height: 50px;
      width: 96%;
      margin-bottom: 35px;
      border:solid black 1px;
      flex-direction: row;
      left: 2%;
    }
    .preview {
        border: 1px solid black;
        background-color: ${previewBackground};
        z-index: 2;
        height: .5rem;
    }
    .comparison {
        height: ${sliderHeight - 25 + 'px'};
    }
    .groupedComparison {
      height : 2.5rem;
    }
    .genome {
        width: 100%;
    }
    .actualTrack {
        height: ${sliderHeight - 50 + 'px'};
        width: 100%;
    }
    .tracks::before{
        background: "red";
        content: "";
    }
    .trackButtons {
        width: 20px;
        margin: 0%;
        margin-top: -30px;
        margin-bottom: 30px;
        padding: 0%;
        height: ${(sliderHeight) / 3 + 'px'};
    }
    ${'' /* .genomeTrack {
        height: ${Math.min(sliderHeight, 100) + 'px'};
    } */}
    .Container{
        border: 2px solid grey;
        margin-bottom: 1ch;
        float: left;
        width: ${orthologDraggableSelector.length > 0 ? "50%" : "100%"};
    }
    `)


    const handleSlider = (event, newValue) => {
        if (typeof newValue === 'number') {
            setSliderHeight(newValue)
        }
    }


    function enableGT(e) {
        if (e.target.checked) {
            let gt;
            async function connect() {
                try {

                    gt = window.createGt('https://hci-sandbox.usask.ca:3001')
                    await gt.connect();
                    await gt.auth();
                    await gt.join('gutb-test');
                }
                catch (e) {
                    console.error(e)
                }
                window.gt = gt;
            }
            connect();
        }
        else {
            let gt = window.gt;
            gt.disconnect();
            window.location.reload()
        }
    }

    function toggleImages(e) {
        setPreloaded(e.target.checked)
    }

    function changeNormalize(e) {

        let gt = window.gt;
        if (gt) {
            gt.updateState({ Action: "changeNormalize", Todo: e.target.checked })
        }

        setNormalize(e.target.checked)
    }

    function changeRender(e) {

        let gt = window.gt;
        if (gt) {
            gt.updateState({ Action: "changeRender", Todo: e.target.checked })
        }
        setBitmap(e.target.checked)
    }

    function changeGenomeView(e) {
        setGenomeView(e.target.checked)
    }

    function changeMargins(e) {

        let gt = window.gt;
        if (gt) {
            gt.updateState({ Action: "changeMargins", Todo: e.target.checked })
        }
        setDraggableSpacing(e.target.checked)
    }

    const [searchTerms, setSearchTerms] = useState()
    const [searchingChromosome, setSearchingChromosome] = useState()



    let maxWidth = Math.round(document.querySelector('.tracks')?.getBoundingClientRect()?.width);
    function updateSingleTrack(event) {
        dispatch(updateTrack({
            key: event.id,
            offset: event.ratio * maxWidth,
            zoom: event.zoom
        }))
    }
    function updateTwoTracks(event) {
        dispatch(updateBothTracks({
            topKey: event.topKey,
            bottomKey: event.bottomKey,
            topOffset: event.topRatio * maxWidth,
            bottomOffset: event.bottomRatio * maxWidth,
            topZoom: event.topZoom,
            bottomZoom: event.bottomZoom
        }))
    }

    if (window.gt) {
        window.gt.on('state_updated_reliable', (userID, payload) => {

            // TODO this feels like a hacky way of doing this
            if (userID === document.title) return
            switch (payload.Action) {
                case "handleTrackUpdate":
                    updateSingleTrack(payload.trackInfo)
                    break
                case "handleBothTrackUpdate":
                    updateTwoTracks(payload.trackInfo)
                    break
                case "changeNormalize":
                    setNormalize(payload.Todo)
                    break
                case "changeMargins":
                    setDraggableSpacing(payload.Todo)
                    break
                case "handleAnnotation":
                    dispatch(addAnnotation(payload.annotation))
                    break
                case "handleDeleteAnnotation":
                    dispatch(removeAnnotation(payload.annotation))
                    break
                case "handleSearch":
                    dispatch(addSearch(payload.annotation))
                    break
                case "clearSearch":
                    dispatch(clearSearches())
                    break
                case "handleDragged":
                    dispatch(setDraggables({
                        dragGroup: "draggables",
                        order: payload.order
                    }))
                    break
                case "handlePreviewPosition":
                    dispatch(moveCollabPreview(payload.info))
                    break
                default:
                    console.log(`Error, no cases to handle {payload}`)
            }

        })
    }

    function toggleSortedTracks(e) {
        dispatch(sortDraggables({
            dragGroup: "draggables"
        }))
    }


    const longtext = "Alt + scroll to zoom\nClick and drag to pan\nShift + click to add annotation\n Ctrl + click to remove annotation"
    return (


        <div css={styling}>
            {firstLoad ? <img src={"files/Arabidopsis_image.png"}></img> :
                <>
                    <Typography variant={'h5'} sx={{
                        WebkitUserSelect: 'none',
                    }}>
                        {"Render Demo"}
                    </Typography>
                    <Tooltip title={<Typography
                        variant="caption"
                        style={{ whiteSpace: 'pre-line' }}
                    >
                        {longtext}
                    </Typography>} arrow style={{ whiteSpace: 'pre-line' }}>
                        <HelpOutlineIcon size="large"></HelpOutlineIcon>
                    </Tooltip>
                    <TrackListener isDark={isDark} style={{ height: document.querySelector(".Container") ? document.querySelector(".Container").getBoundingClientRect().height : "100vh" }}>
                        <Stack mt={5} direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                            <Button variant='outlined' onClick={() => {
                                if (JSON.stringify(demoFile) !== JSON.stringify(["files/bn_methylation_100k.bed"])) setLoading(true)
                                setDemoFile(["files/bn_methylation_100k.bed"])
                                setTitleState("Canola Methylation")
                                setDemoCollinearity()
                            }}>Canola Methylation</Button>
                            <Button variant='outlined' onClick={() => {
                                if (JSON.stringify(demoFile) !== JSON.stringify(["files/at_coordinate.gff"])) setLoading(true)
                                setDemoFile(["files/at_coordinate.gff"])
                                setTitleState("Aradopsis thaliana")
                                setDemoCollinearity("files/at_vv_collinear.collinearity")
                            }}>Aradopsis thaliana</Button>
                            <Button variant='outlined' onClick={() => {
                                if (JSON.stringify(demoFile) !== JSON.stringify(["files/bn_coordinate.gff"])) setLoading(true)
                                setDemoFile(["files/bn_coordinate.gff"])
                                setTitleState("Brassica napus")
                                setDemoCollinearity()
                            }}>Brassica napus</Button>
                            <Button variant='outlined' onClick={() => {
                                if (JSON.stringify(demoFile) !== JSON.stringify(["files/ta_hb_coordinate.gff"])) setLoading(true)
                                setDemoFile(["files/ta_hb_coordinate.gff"])
                                setTitleState("Triticum aestivum")
                                setDemoCollinearity()
                            }}>Triticum aestivum</Button>
                            <Button variant='outlined' onClick={() => {
                                if (JSON.stringify(demoFile) !== JSON.stringify(["files/topas/all_gene_expression_100k.bed", "files/topas/all_smallRNA_100k.bed", "files/topas/leaf_gene_expression_100k.bed", "files/topas/leaf_smallRNA_100k.bed", "files/topas/seed_gene_expression_100k.bed", "files/topas/seed_smallRNA_100k.bed"])) setLoading(true)

                                setDemoFile(["files/topas/all_gene_expression_100k.bed", "files/topas/all_smallRNA_100k.bed", "files/topas/leaf_gene_expression_100k.bed", "files/topas/leaf_smallRNA_100k.bed", "files/topas/seed_gene_expression_100k.bed", "files/topas/seed_smallRNA_100k.bed"])
                                setTitleState("Topas")
                                setDemoCollinearity()
                            }}>Topas</Button>

                        </Stack>
                        <Stack direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>

                            {/* <FormControlLabel control={<Switch onChange={changeMargins} checked={draggableSpacing} />} label={"Toggle Margins"} /> */}
                            <FormControlLabel control={<Switch onChange={changeNormalize} checked={normalize} />} label={"Normalize"} />
                            <FormControlLabel control={<Switch onChange={toggleImages} checked={preloaded} />} label={"Use Preloaded Images"} />
                            <FormControlLabel control={<Switch onChange={changeRender} checked={bitmap} />} label={"Use Bitmaps"} />
                            <FormControlLabel control={<Switch onChange={changeGenomeView} checked={genomeView} />} label={"Enable overview"} />
                            <FormControlLabel control={<Switch onChange={enableGT} />} label={"Enable Collaboration"} />
                        </Stack>
                        {/* <Stack mt={2} spacing={2}> */}
                        <Stack direction='row' justifyContent={"flex-start"}>
                            <Autocomplete sx={{ width: '15%' }}
                                multiple
                                size="small"
                                onChange={(event, newValue) => {
                                    setSearchingChromosome(newValue[0])
                                }}
                                id="Chromosome Category"
                                options={window.chromosomes ? window.chromosomes : []}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Chromosome"
                                        InputProps={{
                                            ...params.InputProps,
                                            type: 'search',
                                        }}
                                    />
                                )}
                            />
                            <Button onClick={toggleSortedTracks}
                            >Sort Tracks</Button>
                            {window.dataset && <Autocomplete sx={{ width: '70%' }}
                                multiple
                                size="small"
                                onChange={(event, newValue) => {
                                    setSearchTerms(newValue)
                                }}
                                id="Gene Search"
                                options={Object.keys(window.dataset).filter(_ => window.dataset[_].chromosome === searchingChromosome)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search input"
                                        InputProps={{
                                            ...params.InputProps,
                                            type: 'search',
                                        }}
                                    />
                                )}
                            />}
                            <Button onClick={() => {
                                let gt = window.gt;

                                dispatch(clearSearches())
                                if (gt) {
                                    gt.updateState({ Action: "clearSearch" })
                                }

                                if (!searchTerms || searchTerms.length < 1) return
                                searchTerms.forEach(term => {
                                    let gene = window.dataset[term]
                                    let annotation = {
                                        key: gene.chromosome,
                                        note: gene.key,
                                        location: +gene.start
                                    }
                                    dispatch(addSearch(annotation))
                                    if (gt) {
                                        gt.updateState({ Action: "handleSearch", annotation })
                                    }
                                })
                            }

                            }>
                                Update Search
                            </Button>

                        </Stack>

                        <Slider className="widthSlider"
                            step={1}
                            min={75}
                            max={300}
                            value={sliderHeight}
                            valueLabelDisplay={"auto"}
                            onChange={handleSlider}
                        />
                        <Divider orientation="horizontal" />
                        {
                            loading ? <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 40 }}>
                                <CircularProgress size={75} />
                            </Box> :
                                <>

                                    <Typography variant="h3" id={"gtVerticalReference"}>
                                        {titleState}
                                    </Typography>
                                    {genomeView && buildGenomeView()}
                                    <CustomDragLayer groupID={groupSelector} isDark={isDark} />
                                    <DragContainer startingList={draggableSelector} isDark={isDark}>
                                        {draggableSelector.map((x, i) => {
                                            if (x === "links") {
                                                return (
                                                    <Draggable key={x} grouped={groupSelector.includes(x)} groupID={groupSelector} className={"draggable"} dragGroup={"draggables"}>
                                                        <OrthologLinks key={x} id={x} index={draggableSelector.indexOf(x)} normalize={normalize} dragGroup={"draggables"}></OrthologLinks>
                                                    </Draggable>
                                                )
                                            }
                                            else {
                                                return (
                                                    <Draggable
                                                        key={x}
                                                        grouped={groupSelector.includes(x)}
                                                        groupID={groupSelector}
                                                        className={"draggable"}
                                                        dragGroup={"draggables"}
                                                    >
                                                        <Track
                                                            id={x}
                                                            normalize={normalize}
                                                            isDark={isDark}
                                                            renderTrack={bitmap ? "bitmap" : 'basic'}
                                                            usePreloadedImages={preloaded}
                                                            moveCursor={moveCursor}
                                                            cursorPosition={cursorPosition}
                                                        />
                                                    </Draggable>
                                                )
                                            }
                                        })}

                                    </DragContainer>
                                    {orthologDraggableSelector.length > 0 && Object.keys(basicTrackSelector).some(x => x.includes("_splitview")) &&
                                        <DragContainer startingList={orthologDraggableSelector} style={{ float: "left" }} isDark={isDark}>
                                            {orthologDraggableSelector.map(item => {
                                                console.log(item)
                                                return (
                                                    <Draggable key={item} grouped={groupSelector.includes(item)} groupID={groupSelector} className={"draggable"} dragGroup={"ortholog"}>
                                                        {item !== 'links' && !item.includes('genome') &&
                                                            <Track
                                                                id={item}
                                                                normalize={normalize}
                                                                isDark={isDark}
                                                                renderTrack={bitmap ? "bitmap" : 'basic'}
                                                                usePreloadedImages={preloaded}
                                                            /> || item === 'links' && <OrthologLinks key={item} id={item} index={draggableSelector.indexOf(item)} normalize={normalize} dragGroup={"ortholog"}></OrthologLinks>}
                                                        {/* {item === 'links' && <OrthologLinks key={item} id={item} index={draggableSelector.indexOf(item)} normalize={normalize} dragGroup={"ortholog"}></OrthologLinks>} */}
                                                    </Draggable>

                                                )
                                            })}

                                        </DragContainer>}
                                </>
                        }
                    </TrackListener>
                </>
            }
        </div>
    )
}

export default RenderDemo
