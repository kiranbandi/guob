/** @jsxImportSource @emotion/react */
import Miniview from '../features/miniview/Miniview';
import testing_array from '../data/testing_array';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import AlternateDraggable from '../features/draggable/AlternateDraggable'
import { useSelector, useDispatch } from 'react-redux';
import { addComparison, selectMiniviews } from '../features/miniview/miniviewSlice';
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
import { Typography } from '@mui/material';
import { CustomDragLayer } from 'features/draggable/CustomDragLayer';
import BasicTrack from 'components/tracks/BasicTrack';
import { selectBasicTracks, addBasicTrack, removeBasicTrack, deleteAllBasicTracks } from 'components/tracks/basicTrackSlice';
// import { pullInfo } from 'features/parsers/gffParser'; 
import { text } from "d3-request"
import { useEffect, useRef } from "react"
import { useFetch } from '../hooks/useFetch';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// import './canola.gff'

// import 'canola.gff';

export default function AgricultureDemo({isDark}) {


    // Demo of redux miniview
    const previewSelector = useSelector(selectMiniviews)['preview']
    const miniviewSelector = useSelector(selectMiniviews)
    const draggableSelector = useSelector(selectDraggables)
    const alternateDraggableSelector = useSelector(selectAlternateDraggables)
    const comparableSelector = useSelector(selectComparison)
    const groupSelector = useSelector(selectGroup)
    const basicTrackSelector = useSelector(selectBasicTracks)


    const [testId, setTestId] = useState(5)
    const [ lock, setLock ] = useState(false) 
    const [startY, setStartY] = useState(900)

    const [ demoFile, setDemoFile ] = useState("files/at_coordinate.gff")
    const [ titleState, setTitleState ] = useState("Aradopsis thaliana")

    const [comparisonSpacing, setComparisonSpacing] = useState(1)
    const [draggableSpacing, setDraggableSpacing] = useState("draggable")

    const dispatch = useDispatch()

    // 85 px
    function addNewDraggable(key, data, color) {
        addNewBasicTrack(key, data, color)

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

    function addNewBasicTrack(id, data, color, start, end) {

        dispatch(addBasicTrack({
            key: id,
            array: data,
            color: color,
            start: start,
            end: end,
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
        e.target.checked ? setDraggableSpacing("noMarginDraggable ") : setDraggableSpacing('draggable')
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

    let styling = css(css`.example {
    width: 500px;
    height: 700px;
    border: 1px solid black;
}
.draggable {
    /* cursor: crosshair; */
    border: 1px solid grey;
    margin-bottom: 1.5rem;
    height: 6rem;
    border:solid black 1px;
    flex-direction: row;
}
.noMarginDraggable {
      /* cursor: crosshair; */
      border: 1px solid grey;
    margin-bottom: 0;
    height: 6rem;
    border:solid black 1px;
    flex-direction: row;
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
${'' /* .dragPreview{
  height: 2rem;
} */}
.preview {
    border: 1px solid black;
    background-color: ${previewBackground};
    z-index: 2;
    height: 1rem;
}
.comparison {
  height: 4.5rem;
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
        text(demoFile, (error, data) => {

            console.log("???")
            let temporary = data.split(/\n/)
            let dataset = {}
            temporary.forEach(d => {
                let info = d.split('\t')
                if (info.length > 1) {
                    let key = info[1].toLowerCase()
                    var stats = {
                        chromosome: info[0],
                        start: info[2],
                        end: info[3],
                        key: key,
                        ortholog: false,
                        siblings: [],
                    }

                    dataset[key] = stats
                }

            })


            // Building up the different chromosomes
            let chromosomeNameList = []
            let chromosomalData = []
            let ignore = "Scaffold"
            for (let item in dataset) {
                // this.dataset.forEach((item) => {
                if (!chromosomeNameList.some((x) => x.chromosome == dataset[item].chromosome) && !dataset[item].chromosome.includes(ignore)) {
                    var check = item
                    var temp = {
                        chromosome: dataset[item].chromosome,
                        designation: check.slice(0, check.indexOf('g'))
                    }
                    // Building a list of the chromosome names, used for later finding information on that dataset
                    chromosomeNameList.push(temp)
                }
            }
            // )

            // Changing the default lexicographical order, since chromosome11 should come after chromosome2 
            // additional logic so that all chromosomes from the same line should be grouped   
            chromosomeNameList.sort((a, b) => {
                if (a.chromosome[0].localeCompare(b.chromosome[0]) == 0) {
                    return a.chromosome.length - b.chromosome.length
                }
                else {
                    return a.chromosome[0].localeCompare(b.chromosome[0])
                }
            })

            chromosomeNameList.forEach((chr) => {
                var subset = Object.entries(dataset).filter(d => {
                    return d[1].chromosome == chr.chromosome
                }).map(x => x[1])

                var temp = {
                    key: chr,
                    data: subset,
                }
                chromosomalData.push(temp)
            })

            let color = 360 / chromosomalData.length
            let tick = -1
            chromosomalData.forEach(point => {
                // console.log(draggableSelector.includes(point.key.chromosome))
                // console.log(hackyFix)
                // console.log(point.key.chromosome)
                tick += 1
                addNewDraggable(point.key.chromosome, point.data, color * tick)
    
        })
        setLoading(false)
    })
}, [demoFile])


// const isComponentMounted = useRef(true);

// const { data, loading, error } = useFetch("", isComponentMounted, false);

// if (error) {
//   console.log(error);
// }


return (
    <>
        <div css={styling}>
        
            <Stack mt={5} direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                <Button variant='outlined' onClick={() => {
                setDemoFile("files/at_coordinate.gff")
                setTitleState("Aradopsis thaliana")
                }}>Aradopsis thaliana</Button>
                <Button variant='outlined' onClick={() => {setDemoFile("files/bn_coordinate.gff")

                 setTitleState("Brassica napus")}}>Brassica napus</Button>
                <Button variant='outlined' onClick={() => {setDemoFile("files/ta_hb_coordinate.gff")
                 setTitleState("Triticum aestivum")}}>Triticum aestivum</Button> 
                <FormControlLabel control={<Switch onChange={changeMargins} />} label={"Toggle Margins"} />

            </Stack>
      
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
                let verticalScroll = document.documentElement.scrollTop
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
                    boxLeft={current.coordinateX}
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
            <DragContainer starting={draggableSelector}>
                {draggableSelector.map(item => {
                    return (
                        <Draggable key={item} grouped={groupSelector.includes(item)} groupID={groupSelector} className={draggableSpacing} >
                            <BasicTrack
                                array={basicTrackSelector[item].array}
                                color={basicTrackSelector[item].color}
                                title={item}
                                doSomething={handleClick}
                                id={item}
                                zoom={basicTrackSelector[item].zoom}
                                pastZoom={basicTrackSelector[item].pastZoom}
                                offset={basicTrackSelector[item].offset}
                                selection={basicTrackSelector[item].selection}
                                isDark={isDark}
                            />
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

