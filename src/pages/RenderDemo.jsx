/** @jsxImportSource @emotion/react */
import { addComplicatedTrack, selectComplicatedTracks, appendComplicatedTrack } from 'components/tracks/complicatedTrackSlice'
import { selectDraggables, addDraggable, deleteAllDraggables, selectGroup } from 'features/draggable/draggableSlice'
import React from 'react'
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ComplicatedTrackContainer from 'components/tracks/ComplicatedTrackContainer'
import parseGFF from 'features/parsers/gffParser';
import { addGenome, deleteAllGenome, selectGenome } from 'components/tracks/genomeSlice';
import _, { reject } from 'lodash';
import { scaleOrdinal } from 'd3-scale';
import { css } from '@emotion/react';
import DragContainer from 'features/draggable/DragContainer';
import Draggable from 'features/draggable/Draggable';


function RenderDemo({ isDark }) {

    const trackSelector = useSelector(selectComplicatedTracks)
    const draggableSelector = useSelector(selectDraggables)['draggables']
    const genomeSelector = useSelector(selectGenome)
    const [demoFile, setDemoFile] = useState("files/at_coordinate.gff")
    let [sliderHeight, setSliderHeight] = useState(75);
    const [draggableSpacing, setDraggableSpacing] = useState(true)
    const groupSelector = useSelector(selectGroup)

    const dispatch = useDispatch()
    const ColourScale = scaleOrdinal().domain([0, 9])
        .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"])

    let previewBackground = isDark ? 'grey' : 'whitesmoke'
    useEffect(() => {
        if (demoFile) {
            parseGFF(demoFile).then(({ chromosomalData, dataset }) => {
                buildDemo(chromosomalData, dataset)
            })
        }

    }, [demoFile])


    function densityCalculation(array, cap, numberOfBars){
        let max = 0
        let increment = cap / numberOfBars
        let densityView = []
        for (let i = 1; i <= numberOfBars; i++) {
            let start = increment * (i - 1)
            let end = increment * i
            let value = array.filter(d => d.end >= start && d.start <= end).length
            max = value > max ? value : max
            var temp = {
                start,
                end,
                key: Math.round(start) + '-' + Math.round(end),
                value
            }
            densityView.push(temp)
        }
        return densityView
    }
    



    const buildDemo = (chromosomalData, dataset) => {
        dispatch(deleteAllGenome({}))
        // dispatch(deleteAllBasicTracks({}))
        dispatch(deleteAllDraggables({
            dragGroup: "draggables"
        }))
        // debugger
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
                array: point.data,
                zoom: 1,
                pastZoom: 1,
                offset: 0,
                color,
            }))
            for(let i = 1; i < 3; i++){
                let subarray = densityCalculation(point.data, end, 500 * i)
                //TODO Will need logic around the zoom/offset as well
                // TODO as well as logic around whether this is the bottom or not
                dispatch(appendComplicatedTrack({
                    key: point.key.chromosome,
                    array: subarray,
                }))
        
            }
            dispatch(addDraggable({
                key: point.key.chromosome,
                dragGroup: "draggables"
            }))
            window.maximumLength += end;
        })
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
        padding-right: 20px;
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
        width: "100%";
    }
    `)

    return (
        <div css={styling}>
            <DragContainer startingList={draggableSelector}>
                {draggableSelector.map((x, i) => {
                    return (
                        <Draggable key={x} grouped={groupSelector.includes(x)} groupID={groupSelector} className={"draggable"} dragGroup={"draggables"}>
                            <ComplicatedTrackContainer
                                key={genomeSelector[x].key + "_container"}
                                id={genomeSelector[x].key}
                                array={genomeSelector[x].array}
                                color={trackSelector[x].color}
                                isDark={isDark}
                                offset={trackSelector[x].offset}
                                zoom={trackSelector[x].zoom}
                                pastZoom={trackSelector.pastZoom}
                                height={100}
                                width={800}
                            />
                        </Draggable>
                    )
                })}
            </DragContainer>
        </div>
    )
}

export default RenderDemo