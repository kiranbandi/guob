/** @jsxImportSource @emotion/react */
import Miniview from '../features/miniview/Miniview';
import testing_array from '../data/testing_array';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import AlternateDraggable from '../features/draggable/AlternateDraggable'
import { useSelector, useDispatch } from 'react-redux';
import { addComparison, selectMiniviews, clearComparisons } from '../features/miniview/miniviewSlice';
import { moveAlternateDraggable, selectAlternateDraggables } from '../features/draggable/alternateDraggableSlice';
import { deleteAllDraggables, selectDraggables, selectGroup } from '../features/draggable/draggableSlice';
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
import { selectBasicTracks, addBasicTrack, removeBasicTrack, deleteAllBasicTracks } from 'components/tracks/basicTrackSlice';
// import { pullInfo } from 'features/parsers/gffParser'; 
import { text } from "d3-request"
import { scaleOrdinal } from 'd3-scale';
import { useEffect, useRef } from "react"
import { useFetch } from '../hooks/useFetch';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LinkContainer from 'components/tracks/LinkContainer'
import parseGFF from 'features/parsers/gffParser';
import { CopyAll } from '@mui/icons-material';
import _ from 'lodash'; 
import OrthologLinks from 'components/tracks/OrthologLinks';
// import './canola.gff'

// import 'canola.gff';

export default function Demo({ isDark }) {


    // Demo of redux miniview
    const previewSelector = useSelector(selectMiniviews)['preview']
    const miniviewSelector = useSelector(selectMiniviews)
    const draggableSelector = useSelector(selectDraggables)
    const alternateDraggableSelector = useSelector(selectAlternateDraggables)
    const comparableSelector = useSelector(selectComparison)
    const groupSelector = useSelector(selectGroup)
    const basicTrackSelector = useSelector(selectBasicTracks)


    const [testId, setTestId] = useState(5)
    const [startY, setStartY] = useState(900)

    const [demoFile, setDemoFile] = useState("files/at_coordinate.gff")
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
        setDraggableSpacing(e.target.checked)   
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
            dispatch(removeComparison())
        }
        else {
            let y = event.target.offsetTop
            dispatch(addComparison({
                key: testId,
                array: previewSelector.array,
                color: previewSelector.color,
                start: Math.round(previewSelector.start),
                end: Math.round(previewSelector.end),
                coordinateX: event.pageX,
                coordinateY: y,
                head: Math.round(previewSelector.start + (previewSelector.end - previewSelector.start) / 2),
                target: event.target.id,
                offset: basicTrackSelector[event.target.id].offset,
                boxWidth: previewSelector.boxWidth,
                originalBoxWidth: previewSelector.boxWidth,
                beginning: Math.min(...basicTrackSelector[event.target.id].array.map(d => d.start)),
                fin: Math.max(...basicTrackSelector[event.target.id].array.map(d => d.end)),
            }))

            setTestId(id => id + 1)
            setStartY(startY => startY + 50)

        }
    }


    let previewBackground = isDark ? 'grey' : 'whitesmoke'
    let [sliderHeight, setSliderHeight] = useState(50);

    //TODO fix some hacky stuff in here

    let styling = css(css`.example {
    width: 500px;
    height: 700px;
    border: 1px solid black;
}
.draggable {
    /* cursor: crosshair; */
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
        parseGFF(demoFile).then(({chromosomalData, dataset}) => {
          let  normalizedLength = 0;
          let color;
          let ColourScale = scaleOrdinal().domain([0,9])
          .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"])
          
          
          normalizedLength = +_.maxBy(_.map(dataset), d => +d.end).end;
          chromosomalData.forEach((point, i) => {
              if(point.trackType === 'default'){
                color = ColourScale(i % 10)
              }
              else{
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

function changeNormalize(e) { setNormalize(e.target.checked) }

function clearComparisonTracks() {
    dispatch(clearComparisons({

    }))
}

const handleSlider = (event, newValue) => {
    if (typeof newValue === 'number') {

        setSliderHeight(newValue)
    }
}

return (
    <>
        <div css={styling}>

            <Stack mt={5} direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                <Button variant='outlined' onClick={() => {
                    clearComparisonTracks()
                    setDemoFile("files/bn_methylation.bed")
                    setTitleState("Methylation test")
                }}>Methylation Test</Button>
                <Button variant='outlined' onClick={() => {
                    clearComparisonTracks()
                    setDemoFile("files/at_coordinate.gff")
                    setTitleState("Aradopsis thaliana")
                }}>Aradopsis thaliana</Button>
                <Button variant='outlined' onClick={() => {
                    clearComparisonTracks()
                    setDemoFile("files/bn_coordinate.gff")
                    setTitleState("Brassica napus")
                }}>Brassica napus</Button>
                <Button variant='outlined' onClick={() => {
                    clearComparisonTracks()
                    setDemoFile("files/ta_hb_coordinate.gff")
                    setTitleState("Triticum aestivum")
                }}>Triticum aestivum</Button>
                <FormControlLabel control={<Switch onChange={changeMargins} />} label={"Toggle Margins"} />
                <FormControlLabel control={<Switch onChange={changeNormalize} />} label={"Normalize"} />

            </Stack>
            <Slider
                step={1}
                min={35}
                max={200}
                valueLabelDisplay={"auto"}
                onChange={handleSlider}

            />

            {previewSelector.visible && <Miniview
                className={'preview'}
                array={previewSelector.array}
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
            />}


            {previewSelector.visible && (Object.keys(comparableSelector).length !== 0 && Object.keys(comparableSelector).map((item, index) => {
                let current = comparableSelector[item]
                let parent = document.getElementById(current.target).getBoundingClientRect()
                let padding = parseFloat(getComputedStyle(document.getElementById(current.target)).paddingLeft)
                let verticalScroll = document.documentElement.scrollTop
                let what = current.coordinateX - current.boxWidth / 2 > parent.x + padding && current.coordinateX + current.boxWidth - current.boxWidth / 2 < parent.x + parent.width - padding ? current.coordinateX : -1000
                return <Miniview

                    className={'comparison preview'}
                    key={item}
                    array={current.array}
                    color={current.color}
                    coordinateX={previewSelector.coordinateX}
                    coordinateY={previewSelector.coordinateY + 18 * (index + 1)}
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
                    grouped={groupSelector.includes(comparableSelector[item].target)}
                    isDark={isDark}
                />
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
                                        {item === 'links' && <LinkContainer key={item} id={item} index={draggableSelector.indexOf(item) }></LinkContainer>}
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
