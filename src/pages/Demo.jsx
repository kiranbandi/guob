/** @jsxImportSource @emotion/react */
import Miniview from '../features/miniview/Miniview';
import testing_array from '../data/testing_array';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import AlternateDraggable from '../features/draggable/AlternateDraggable'
import { useSelector, useDispatch } from 'react-redux';
import { addComparison, selectMiniviews, clearComparisons } from '../features/miniview/miniviewSlice';
import { moveAlternateDraggable, selectAlternateDraggables } from '../features/draggable/alternateDraggableSlice';
import { deleteAllDraggables, selectDraggables, selectGroup, setDraggables } from '../features/draggable/draggableSlice';
import { css } from '@emotion/react';
import { useState } from 'react';
import { addDraggable, removeDraggable } from '../features/draggable/draggableSlice';
import { addAlternateDraggable, removeAlternateDraggable } from '../features/draggable/alternateDraggableSlice';
import { addMiniview, removeMiniview, selectComparison, removeComparison } from '../features/miniview/miniviewSlice';
import { Switch, Button, Stack, Divider, FormControl, FormControlLabel } from '@mui/material'
import testing_array2 from '../data/testing_array2';
import testing_array3 from '../data/testing_array3';
import { Typography, Slider } from '@mui/material';
import { CustomDragLayer } from 'features/draggable/CustomDragLayer';
import BasicTrack from 'components/tracks/BasicTrack';
import { selectBasicTracks, addBasicTrack, removeBasicTrack, deleteAllBasicTracks, updateTrack, changeZoom, pan, updateBothTracks } from 'components/tracks/basicTrackSlice';
// import { pullInfo } from 'features/parsers/gffParser'; 
import { text } from "d3-request";
import $ from 'jquery';
import { scaleOrdinal } from 'd3-scale';
import { useEffect, useRef } from "react"
import { useFetch } from '../hooks/useFetch';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import parseGFF from 'features/parsers/gffParser';
import _ from 'lodash';
import OrthologLinks from 'components/tracks/OrthologLinks';
import { addAnnotation } from 'features/annotation/annotationSlice';
// import './canola.gff'

// import 'canola.gff';

export default function Demo({ isDark }) {


    // Demo of redux miniview
    const previewSelector = useSelector(selectMiniviews)['newPreview']
    const miniviewSelector = useSelector(selectMiniviews)
    const draggableSelector = useSelector(selectDraggables)
    const alternateDraggableSelector = useSelector(selectAlternateDraggables)
    const comparableSelector = useSelector(selectComparison)
    const groupSelector = useSelector(selectGroup)
    const basicTrackSelector = useSelector(selectBasicTracks)


    const [testId, setTestId] = useState(5)
    const [startY, setStartY] = useState(900)

    const [demoFile, setDemoFile] = useState("files/at_coordinate.gff")
    const [demoCollinearity, setDemoCollinearity] = useState("files/at_vv_collinear.collinearity")
    const [titleState, setTitleState] = useState("Aradopsis thaliana")
    const [normalize, setNormalize] = useState(false)

    const [draggableSpacing, setDraggableSpacing] = useState(true)
    const dispatch = useDispatch()

    // 85 px
    function addNewDraggable(key, trackType, data, normalizedLength, color) {
        addNewBasicTrack(key, trackType, data, normalizedLength, color)

        dispatch(addDraggable({
            key: key
        }))
    }

    function addNewAlternateDraggable() {
        let data = determineRandomArray()
        let color = Math.floor((Math.random() * 360))
        addNewBasicTrack(testId, data, color)
        dispatch(addAlternateDraggable({
            key: testId,
            coordinateY: startY
        }))

        setTestId(id => id + 1)
        setStartY(startY => startY + 50)
    }

    function determineRandomArray() {
        let choice = Math.floor((Math.random() * 3))
        let chosenArray;
        switch (choice) {
            case 1:
                chosenArray = testing_array
                break
            case 2:
                chosenArray = testing_array2
                break
            default:
                chosenArray = testing_array3
        }

        return chosenArray
    }

    function addNewBasicTrack(id, trackType, data, normalizedLength, color, start, end) {

        dispatch(addBasicTrack({
            key: id,
            trackType,
            array: data,
            normalizedLength,
            color,
            start,
            end,
            zoom: 1.0,
            pastZoom: 1.0,
            offset: 0,
        }))
    }
    function removeADraggable() {
        let keys = draggableSelector
        let choice = keys[Math.floor((Math.random() * keys.length))]
        if (keys.length > 0) {
            dispatch(removeBasicTrack({
                key: choice
            }))
        }
        dispatch(removeDraggable({
            key: choice
        }))
        Object.entries(alternateDraggableSelector).forEach(item => {
            let adjustedLocation = item[1].coordinateY - 85
            dispatch(moveAlternateDraggable({
                key: item[0],
                coordinateY: adjustedLocation
            }))
        })

    }

    function changeMargins(e) {

        let gt = window.gt;
        if (gt) {
            gt.updateState({ Action: "changeMargins", Todo: e.target.checked })
        } setDraggableSpacing(e.target.checked)
    }

    function removeAnAlternateDraggable() {
        let keys = Object.keys(alternateDraggableSelector)
        let choice = keys[Math.floor((Math.random() * keys.length))]
        if (keys.length > 0) {
            dispatch(removeBasicTrack({
                key: choice
            }))
        }
        dispatch(removeAlternateDraggable({
            key: choice
        }))
        setStartY(startY => startY - 50)

    }

    // TODO - navigation?
    function handleClick(event) {
        if (event.type === 'contextmenu') {
            return
        }
        if (event.ctrlKey) {
            dispatch(removeComparison({
                target: event.target.id
            }))
        }
        else {
            let y = event.target.offsetTop
            dispatch(addComparison({
                key: testId,
                array: basicTrackSelector[previewSelector.linkedTrack].array,
                color: previewSelector.color,
                start: Math.round(previewSelector.center - 50000),
                end: Math.round(previewSelector.center + 50000),
                target: event.target.id,
                center: previewSelector.center,
                trackType: basicTrackSelector[previewSelector.linkedTrack].trackType,
                linkedTrack: previewSelector.linkedTrack
            }))

            setTestId(id => id + 1)
            setStartY(startY => startY + 50)
        }
    }


    let previewBackground = isDark ? 'grey' : 'whitesmoke'
    let [sliderHeight, setSliderHeight] = useState(75);

    //TODO fix some hacky stuff in here

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
${'' /* .track {
    width: 100%
    
} */}
.body {
    overflow: hidden;
}
.miniview {
  cursor: crosshair;
}
.draggableItem {
    height: 100%;
    width: 98%;
    float: left;
    margin: 0px;
    overflow: hidden;
  }
  .handle {
    width: 2%;
    float: left;
    height: 100%;
    margin: 0%;
    padding: 0%;
    cursor: grab;
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
.Container{
    border: 2px solid grey;
    margin-bottom: 1ch;
}`)

    let [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        dispatch(deleteAllBasicTracks({}))
        dispatch(deleteAllDraggables({}))
        parseGFF(demoFile, demoCollinearity).then(({ chromosomalData, dataset }) => {
            window.dataset = dataset
            let normalizedLength = 0;
            let color;
            let ColourScale = scaleOrdinal().domain([0, 9])
                .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"])
            normalizedLength = +_.maxBy(_.map(dataset), d => +d.end).end;
            chromosomalData.forEach((point, i) => {
                if (point.trackType === 'default') {
                    color = ColourScale(i % 10)
                }
                else {
                    color = ColourScale(3)
                }

                addNewDraggable(point.key.chromosome, point.trackType, point.data, normalizedLength, color)

            })
            dispatch(addDraggable({
                key: 'links'
            }))
            setLoading(false)
        })
        // })
        setLoading(true)
    }, [demoFile])





    let maxWidth = Math.round(document.querySelector('.draggable')?.getBoundingClientRect()?.width * 0.98);
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


    function changeNormalize(e) {

        let gt = window.gt;
        if (gt) {
            gt.updateState({ Action: "changeNormalize", Todo: e.target.checked })
        } setNormalize(e.target.checked)
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
                case "handleDragged":
                    dispatch(setDraggables({
                        order: payload.order
                    }))
                    break
            }

        })
    }


    function enableGT(e) {
        console.log(e.target.checked)

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


    function clearComparisonTracks() {
        dispatch(clearComparisons({

        }))
    }

    const handleSlider = (event, newValue) => {
        if (typeof newValue === 'number') {

            setSliderHeight(newValue)
        }
    }

    const [searchTerms, setSearchTerms] = useState()
    let testIndex = -1
    return (
        <>
            <div css={styling}>

                <Stack mt={5} direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                    <Button variant='outlined' onClick={() => {
                        clearComparisonTracks()
                        setDemoFile("files/bn_methylation_100k.bed")
                        setTitleState("Canola Methylation")
                        setDemoCollinearity()
                    }}>Canola Methylation</Button>
                    <Button variant='outlined' onClick={() => {
                        clearComparisonTracks()
                        setDemoFile("files/at_coordinate.gff")
                        setTitleState("Aradopsis thaliana")
                        setDemoCollinearity("files/at_vv_collinear.collinearity")
                    }}>Aradopsis thaliana</Button>
                    <Button variant='outlined' onClick={() => {
                        clearComparisonTracks()
                        setDemoFile("files/bn_coordinate.gff")
                        setTitleState("Brassica napus")
                        setDemoCollinearity()
                    }}>Brassica napus</Button>
                    <Button variant='outlined' onClick={() => {
                        clearComparisonTracks()
                        setDemoFile("files/ta_hb_coordinate.gff")
                        setTitleState("Triticum aestivum")
                        setDemoCollinearity()
                    }}>Triticum aestivum</Button>
                    <FormControlLabel control={<Switch onChange={changeMargins} checked={draggableSpacing} />} label={"Toggle Margins"} />
                    <FormControlLabel control={<Switch onChange={changeNormalize} checked={normalize} />} label={"Normalize"} />

                    <FormControlLabel control={<Switch onChange={enableGT} />} label={"Enable Collaboration"} />

                </Stack>
                <Stack mt={2} spacing={2}>
                    <Stack direction='row' justifyContent={"flex-start"}>
                        <Autocomplete sx={{ width: '80%' }}
                            multiple
                            size="small"
                            onChange={(event, newValue) => {
                                setSearchTerms(newValue)
                            }}
                            id="Gene Search"
                            options={Object.keys(window.dataset)}
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
                        />
                        <Button onClick={() => {
                            let gt = window.gt;


                            if (!searchTerms || searchTerms.length < 1) return
                            searchTerms.forEach(term => {
                                let gene = window.dataset[term]
                                let annotation = {
                                    key: gene.chromosome,
                                    note: gene.key,
                                    location: +gene.start
                                }
                                dispatch(addAnnotation(annotation))
                                if (gt) {
                                    gt.updateState({ Action: "handleAnnotation", annotation })
                                }
                            })
                        }

                        }>
                            Search
                        </Button>
                    </Stack>

                    <Slider
                        step={1}
                        min={75}
                        max={300}
                        valueLabelDisplay={"auto"}
                        onChange={handleSlider}
                    />
                </Stack>

                {previewSelector.visible && <Miniview
                    className={'preview'}
                    array={basicTrackSelector[previewSelector.linkedTrack].array}
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
                />}


                {previewSelector.visible && (Object.keys(comparableSelector).length !== 0 && Object.keys(comparableSelector).map((item, keyIndex) => {

                    if (comparableSelector[item]) {

                        return comparableSelector[item].map((current, index) => {
                            testIndex++
                            let parent = document.getElementById(current.target).getBoundingClientRect()
                            let padding = parseFloat(getComputedStyle(document.getElementById(current.target)).paddingLeft)
                            let verticalScroll = document.documentElement.scrollTop
                            let what = current.coordinateX - current.boxWidth / 2 > parent.x + padding && current.coordinateX + current.boxWidth - current.boxWidth / 2 < parent.x + parent.width - padding ? current.coordinateX : -1000
                            return <Miniview

                                className={'comparison preview'}
                                key={current.key}
                                id={current.key}
                                array={current.array}
                                color={current.color}
                                coordinateX={previewSelector.coordinateX}
                                coordinateY={previewSelector.coordinateY + 18 * (testIndex + 1)}
                                width={previewSelector.width}
                                height={previewSelector.height}
                                displayPreview={false}
                                beginning={current.start}
                                fin={current.end}
                                absolutePositioning={true}
                                preview={true}
                                boxLeft={what}
                                boxTop={parent.y + verticalScroll}
                                boxWidth={current.boxWidth}
                                grouped={groupSelector.includes(current.target)}
                                isDark={isDark}
                                trackType={basicTrackSelector[current.linkedTrack].trackType}
                                center={current.center}
                            />
                        })
                    }

                }))
                }

                {
                    loading ? <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 40 }}>
                        <CircularProgress size={75} />
                    </Box> :
                        <>
                            <Typography variant={'h5'} sx={{
                                WebkitUserSelect: 'none',
                            }}>{titleState}</Typography>
                            <CustomDragLayer groupID={groupSelector} />
                            <DragContainer startingList={draggableSelector}>
                                {draggableSelector.map(item => {

                                    return (
                                        <Draggable key={item} grouped={groupSelector.includes(item)} groupID={groupSelector} className={"draggable"} >
                                            {item !== 'links' && <BasicTrack
                                                array={basicTrackSelector[item].array}
                                                color={basicTrackSelector[item].color}
                                                normalizedLength={basicTrackSelector[item].normalizedLength}
                                                trackType={basicTrackSelector[item].trackType}
                                                title={item}
                                                doSomething={handleClick}
                                                id={item}
                                                zoom={basicTrackSelector[item].zoom}
                                                pastZoom={basicTrackSelector[item].pastZoom}
                                                offset={basicTrackSelector[item].offset}
                                                selection={basicTrackSelector[item].selection}
                                                isDark={isDark}
                                                normalize={normalize}
                                            />}
                                            {item === 'links' && <OrthologLinks key={item} id={item} index={draggableSelector.indexOf(item)} normalize={normalize}></OrthologLinks>}
                                        </Draggable>

                                    )
                                })}

                            </DragContainer>
                        </>
                }
            </div>
        </>
    );
}
