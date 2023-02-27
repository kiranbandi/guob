/** @jsxImportSource @emotion/react */
import { addComplicatedTrack, selectComplicatedTracks, appendComplicatedTrack } from 'components/tracks/complicatedTrackSlice'
import { selectDraggables, addDraggable, deleteAllDraggables, selectGroup, setDraggables } from 'features/draggable/draggableSlice'
import React from 'react'
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import parseGFF from 'features/parsers/gffParser';
import { addGenome, deleteAllGenome, selectGenome } from 'components/tracks/genomeSlice';
import _, { reject } from 'lodash';
import { scaleOrdinal } from 'd3-scale';
import { css } from '@emotion/react';
import DragContainer from 'features/draggable/DragContainer';
import Draggable from 'features/draggable/Draggable';
import { addBasicTrack, selectBasicTracks, deleteAllBasicTracks, updateTrack, updateBothTracks} from 'components/tracks/basicTrackSlice';
import { Typography, Slider, Tooltip } from '@mui/material';
import { CustomDragLayer } from 'features/draggable/CustomDragLayer';
import TrackListener from 'components/tracks/TrackListener';
import Miniview from '../features/miniview/Miniview';
import OrthologLinks from '../components/tracks/OrthologLinks'
import { selectMiniviews, moveCollabPreview } from '../features/miniview/miniviewSlice';
import TrackContainer from 'components/tracks/TrackContainer'
import { Switch, Button, Stack, Divider, FormControl, FormControlLabel, Drawer } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import processFile from '../utils/processFile'
import { addAnnotation, clearSearches, addSearch, removeAnnotation } from 'features/annotation/annotationSlice';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Track from 'components/tracks/Track'

import { text } from "d3-fetch"


function RenderDemo({ isDark }) {

    const previewSelector = useSelector(selectMiniviews)['newPreview']
    const trackSelector = useSelector(selectComplicatedTracks)
    const basicTrackSelector = useSelector(selectBasicTracks)
    const draggableSelector = useSelector(selectDraggables)['draggables']
    const genomeSelector = useSelector(selectGenome)
    let [sliderHeight, setSliderHeight] = useState(250);
    const [draggableSpacing, setDraggableSpacing] = useState(true)
    const groupSelector = useSelector(selectGroup)

    const [titleState, setTitleState] = useState("Arabidopsis Thaliana")
    const [demoFile, setDemoFile] = useState("/files/at_coordinate.gff")
    const [demoCollinearity, setDemoCollinearity] = useState("files/at_vv_collinear.collinearity")
    const [normalize, setNormalize] = useState(false)
    const [bitmap, setBitmap] = useState(true)
    const [resolution, setResolution] = useState(false)
    let [loading, setLoading] = useState(false)
    const [firstLoad, setFirstLoad] = useState(true)



    const dispatch = useDispatch()
    const ColourScale = scaleOrdinal().domain([0, 9])
        .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"])

    let previewBackground = isDark ? 'grey' : 'whitesmoke'

    // const fileWorker = new Worker("test.worker.js");

    useEffect(() => {
        if (loading) {
            dispatch(deleteAllGenome({}))
            dispatch(deleteAllBasicTracks({}))
            dispatch(deleteAllDraggables({
                dragGroup: "draggables"
            }))

            switch (demoFile) {
                case "files/at_coordinate.gff":
                    for (let k = 1; k < 6; k++) {
                        let color = ColourScale((k - 1) % 10)
                        dispatch(addBasicTrack({
                            key: "at" + k,
                            trackType: 'default',
                            color,
                            start: 0,
                            zoom: 1.0,
                            offset: 0,
                        }))
                        dispatch(addDraggable({
                            key: "at" + k,
                            dragGroup: "draggables"
                        }))
                        dispatch(addGenome({
                            key: "at" + k,
                            array: []
                        }))
                    }
                    dispatch(addDraggable({
                        key: "links",
                        dragGroup: "draggables"
                    }))
                    setLoading(false)
                    break
                case "files/bn_coordinate.gff":
                    for (let k = 1; k < 20; k++) {
                        let color = ColourScale((k - 1) % 10)
                        dispatch(addBasicTrack({
                            key: "bn" + k,
                            trackType: 'default',
                            color,
                            start: 0,
                            zoom: 1.0,
                            offset: 0,
                        }))
                        dispatch(addDraggable({
                            key: "bn" + k,
                            dragGroup: "draggables"
                        }))
                        dispatch(addGenome({
                            key: "bn" + k,
                            array: []
                        }))
                    }
                    setLoading(false)
                    break
                case "files/ta_hb_coordinate.gff":
                    let totalIndex = 0
                    for (let k = 1; k < 8; k++) {
                        ['A', 'B', 'D'].forEach((letter, i) => {
                            let color = ColourScale(totalIndex % 10)
                            totalIndex++;
                            dispatch(addBasicTrack({
                                key: "ta" + k + letter,
                                trackType: 'default',
                                color,
                                start: 0,
                                zoom: 1.0,
                                offset: 0,
                            }))
                            dispatch(addDraggable({
                                key: "ta" + k + letter,
                                dragGroup: "draggables"
                            }))
                            dispatch(addGenome({
                                key: "ta" + k + letter,
                                array: []
                            }))
                        })
                    }
                    setLoading(false)
                    break
            }

            let x = text(demoFile).then(data => {
                if(demoCollinearity){
                    return text(demoCollinearity).then(c =>{
                        return processFile(data, c)
                    })
                }
                else{
                    return processFile(data)
                }

            }).then(parsedData => {
                buildDemo(parsedData.chromosomalData, parsedData.dataset)
            })
            setLoading(false)

        }
        if (firstLoad) {
            setFirstLoad(false)
            let x = text(demoFile).then(data => {

                return text(demoCollinearity).then(c =>{
                    return processFile(data, c)
                })
            }).then(parsedData => {
                buildDemo(parsedData.chromosomalData, parsedData.dataset)
            })
        }

    }, [demoFile])


    const buildDemo = (chromosomalData, dataset) => {
        window.dataset = dataset
        window.chromosomalData = chromosomalData
        window.chromosomes = chromosomalData.map((_ => _.key.chromosome))
        let normalizedLength = 0;
        let color;
        normalizedLength = +_.maxBy(_.map(dataset), d => +d.end).end;
        window.maximumLength = 0
        chromosomalData.forEach((point, i) => {
            // debugger
            if (point.trackType === 'default') {
                color = ColourScale(i % 10)
            }
            else {
                color = ColourScale(3)
            }

            let end = Math.max(...point.data.map(d => d.end))
            dispatch(addGenome({
                key: point.key.chromosome,
                array: point.data
            }))
            dispatch(addComplicatedTrack({
                key: point.key.chromosome,
                // array: point.data,
                zoom: 1,
                pastZoom: 1,
                offset: 0,
                color,
            }))
            dispatch(addBasicTrack({
                key: point.key.chromosome,
                trackType: point.trackType,
                normalizedLength,
                color,
                start: 0,
                end,
                zoom: 1.0,
                pastZoom: 1.0,
                offset: 0,
            }))
            // dispatch(addDraggable({
            //     key: point.key.chromosome,
            //     dragGroup: "draggables"
            // }))
            window.maximumLength += end;
        })

    }


    const buildGenomeView = () => {
        let genomeTracks = []
        let genomeNames = Object.keys(basicTrackSelector)

        let totalSize = Object.keys(basicTrackSelector).map(x => basicTrackSelector[x].end).reduce((z, sum) => sum + z, 0)


        let maxWidth = document.querySelector('.widthSlider')?.getBoundingClientRect()?.width ? document.querySelector('.widthSlider')?.getBoundingClientRect()?.width : 600
        let x = 0

        while (x < genomeNames.length) {
            let totalWidth = 0
            let currentGenomes = genomeNames.slice(x)

            let chosenGenomes = []
            for (let _ = 0; _ < currentGenomes.length; _++) {

                let width = maxWidth * basicTrackSelector[currentGenomes[_]].end / totalSize * Math.ceil(genomeNames.length / 5)
                totalWidth += width
                if (totalWidth > maxWidth) break
                chosenGenomes.push({
                    genome: currentGenomes[_],
                    width
                })
                x++

            }
            genomeTracks.push(<Stack direction="row" marginBottom={5} id={"gtVerticalReference"} key={"Stack_" + x} justifyContent={"space-around"}>
                {chosenGenomes.map(genomeItem => {
                    return (
                        <TrackContainer
                            key={genomeItem.genome + "genome"}
                            array={genomeSelector[genomeItem.genome].array}
                            color={basicTrackSelector[genomeItem.genome].color}
                            genome={true}
                            width={genomeItem.width}
                            height={Math.min(sliderHeight, 100)}
                            cap={basicTrackSelector[genomeItem.genome].end}
                            normalizedLength={basicTrackSelector[genomeItem.genome].normalizedLength}
                            trackType={basicTrackSelector[genomeItem.genome].trackType}
                            title={genomeItem.genome}
                            id={genomeItem.genome}
                            zoom={1}
                            pastZoom={basicTrackSelector[genomeItem.genome].pastZoom}
                            offset={0}
                            selection={basicTrackSelector[genomeItem.genome].selection}
                            isDark={isDark}
                            normalize={normalize}
                            renderTrack={"bitmap"}
                            resolution={resolution}
                        />
                    )
                })
                }
            </Stack>)
        }
        if (Object.keys(basicTrackSelector).length == 0) return
        if (basicTrackSelector[genomeNames[0]].end) {
            return <>{genomeTracks}</>
        }
    }


    let styling = css(css`.example {
        width: 500px;
        height: 700px;
        border: 1px solid black;
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
        width: 100%;;
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
        width: 100%;
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

                    gt = window.createGt('hci-sandbox.usask.ca:3001')
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
            gt.updateState({ Action: "changeNormalize", Todo: e.target.checked })
        }
        setBitmap(e.target.checked)
    }

    function changeResolution(e) {

        let gt = window.gt;
        if (gt) {
            gt.updateState({ Action: "changeNormalize", Todo: e.target.checked })
        }
        setResolution(e.target.checked)
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



    let maxWidth = Math.round(document.querySelector('.tracks')?.getBoundingClientRect()?.width );
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
            }

        })
    }



    const longtext = "Alt + scroll to zoom\nClick and drag to pan\nShift + click to add annotation\n Ctrl + click to remove annotation"

    return (


        <div css={styling}>
            <Slider className="widthSlider"
                step={1}
                min={75}
                max={300}
                valueLabelDisplay={"auto"}
                onChange={handleSlider}
            />
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
            <TrackListener>
                <Stack mt={5} direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                    {/* <Button variant='outlined' onClick={() => {
                        if(demoFile != "files/bn_methylation_100k.bed") setLoading(true)
                        // clearComparisonTracks()
                        setDemoFile("files/bn_methylation_100k.bed")
                        setTitleState("Canola Methylation")
                        setDemoCollinearity()
                    }}>Canola Methylation</Button> */}
                    <Button variant='outlined' onClick={() => {
                        if (demoFile != "files/at_coordinate.gff") setLoading(true)
                        // clearComparisonTracks()
                        setDemoFile("files/at_coordinate.gff")
                        setTitleState("Aradopsis thaliana")
                        setDemoCollinearity("files/at_vv_collinear.collinearity")
                    }}>Aradopsis thaliana</Button>
                    <Button variant='outlined' onClick={() => {
                        if (demoFile != "files/bn_coordinate.gff") setLoading(true)
                        // clearComparisonTracks()
                        setDemoFile("files/bn_coordinate.gff")
                        setTitleState("Brassica napus")
                        setDemoCollinearity()
                    }}>Brassica napus</Button>
                    <Button variant='outlined' onClick={() => {
                        if (demoFile != "files/ta_hb_coordinate.gff") setLoading(true)
                        // clearComparisonTracks()
                        setDemoFile("files/ta_hb_coordinate.gff")
                        setTitleState("Triticum aestivum")
                        setDemoCollinearity()
                    }}>Triticum aestivum</Button>

                </Stack>
                <Stack direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>

                <FormControlLabel control={<Switch onChange={changeMargins} checked={draggableSpacing} />} label={"Toggle Margins"} />
                <FormControlLabel control={<Switch onChange={changeNormalize} checked={normalize} />} label={"Normalize"} />
                {titleState !== "Canola Methylation" && <FormControlLabel control={<Switch onChange={changeRender} checked={bitmap} />} label={"Use Bitmaps"} />}
                {titleState !== "Canola Methylation" && <FormControlLabel control={<Switch onChange={changeResolution} checked={resolution} />} label={"Use Max Resolution"} />}
                <FormControlLabel control={<Switch onChange={enableGT} />} label={"Enable Collaboration"} />
                </Stack>
                {/* <Stack mt={2} spacing={2}> */}
                <Stack direction='row' justifyContent={"flex-start"}>
                    <Autocomplete sx={{ width: '15%' }}
                        multiple
                        size="small"
                        onChange={(event, newValue) => {
                            setSearchingChromosome(newValue)
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
                    {window.dataset && <Autocomplete sx={{ width: '70%' }}
                        multiple
                        size="small"
                        onChange={(event, newValue) => {
                            setSearchTerms(newValue)
                        }}
                        id="Gene Search"
                        options={Object.keys(window.dataset).filter(_ => window.dataset[_].chromosome == searchingChromosome)}
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

                {/* <Slider className="widthSlider"
                            step={1}
                            min={75}
                            max={300}
                            valueLabelDisplay={"auto"}
                            onChange={handleSlider}
                        />

                        <Button variant="outline" onClick={toggleDrawer} >
                            Upload files
                        </Button>
                    </Stack> */}

                {/* {previewSelector.visible && <Miniview
                    className={'preview'}
                    array={previewSelector.linkedTrack.includes('ortholog') ? genomeSelector[previewSelector.linkedTrack.substring(0, 3)].array : genomeSelector[previewSelector.linkedTrack].array}
                    coordinateX={previewSelector.coordinateX}
                    coordinateY={previewSelector.coordinateY}
                    width={previewSelector.width}
                    height={previewSelector.height}
                    beginning={previewSelector.start}
                    fin={previewSelector.end}
                    color={previewSelector.color}
                    id={previewSelector.id}
                    absolutePositioning={true}
                    preview={true}
                    isDark={isDark}
                    trackType={basicTrackSelector[previewSelector.linkedTrack].trackType}
                    center={previewSelector.center}
                />} */}
                <Divider orientatio="horizontal" />
                {
                    loading ? <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 40 }}>
                        <CircularProgress size={75} />
                    </Box> :
                        <>

                            <Typography variant="h3">
                                {titleState}
                            </Typography>
                            {buildGenomeView()}
                            <CustomDragLayer groupID={groupSelector} isDark={isDark} />
                            <DragContainer startingList={draggableSelector}>
                                {draggableSelector.map((x, i) => {
                                    if (x == "links") {
                                        return (
                                            <Draggable key={x} grouped={groupSelector.includes(x)} groupID={groupSelector} className={"draggable"} dragGroup={"draggables"}>
                                                <OrthologLinks key={x} id={x} index={draggableSelector.indexOf(x)} normalize={false} dragGroup={"draggables"}></OrthologLinks>
                                            </Draggable>
                                        )
                                    }
                                    else {
                                        return (
                                            <Draggable key={x} grouped={groupSelector.includes(x)} groupID={groupSelector} className={"draggable"} dragGroup={"draggables"}>
                                                <Track
                                                    id={x}
                                                    normalize={normalize}
                                                    isDark={isDark}
                                                    renderTrack={bitmap ? "bitmap" : 'basic'}
                                                />
                                                {/* <TrackContainer
                                                    key={genomeSelector[x].key + "_container"}
                                                    id={genomeSelector[x].key}
                                                    array={genomeSelector[x].array}
                                                    color={basicTrackSelector[x].color}
                                                    isDark={isDark}
                                                    offset={basicTrackSelector[x].offset}
                                                    zoom={basicTrackSelector[x].zoom}
                                                    pastZoom={basicTrackSelector[x].pastZoom}
                                                    normalizedLength={basicTrackSelector[x].normalizedLength}
                                                    height={1}
                                                    trackType={basicTrackSelector[x].trackType}
                                                    renderTrack={bitmap ? "bitmap" : 'basic'}
                                                    normalize={normalize}
                                                    cap={basicTrackSelector[x].end}
                                                    resolution={resolution}
                                                /> */}
                                            </Draggable>
                                        )
                                    }
                                })}
                            </DragContainer>
                        </>
                }
            </TrackListener>
        </div>
    )
}

export default RenderDemo