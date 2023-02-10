
import { nanoid } from '@reduxjs/toolkit'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectComplicatedTracks, appendComplicatedTrack } from './complicatedTrackSlice'
import Track from './Track'
import BasicTrack from './BasicTrack'
import ImageTrack from './ImageTrack'
import { selectBasicTracks, updateTrack } from './basicTrackSlice'
import { set } from 'lodash'
import { changePreviewVisibility } from '../../features/miniview/miniviewSlice';

import { selectGenome } from './genomeSlice'

function ComplicatedTrackContainer({ array, trackType, id, color, isDark, zoom, offset, width, height, pastZoom }) {

  // 
  const dispatch = useDispatch()
  const arrays = useSelector(selectComplicatedTracks)
  const basicTrackSelector = useSelector(selectBasicTracks)
  const genomeSelector = useSelector(selectGenome)
  // 
  const [splitArray, setSplitArray] = useState(false)
  const [incrementingID, setIncrementingID] = useState(0)
  const [chosenArray, setArray] = useState([])
  const [chosenTrackType, setTrackType] = useState("heatmap")
  const [titleState, setTitleState] = useState(id)
  const imageRef = useRef()
  const [ cap, setCap ] = useState()
  const [ totalWidth, setTotalWidth ] = useState(0)

  const [dragging, setDragging] = useState(true)

  let suffix = isDark ? "track_dark" : "track"
  let orthologSuffix = isDark ? "_orthologs_dark" : "_orthologs"
  let image = 'files/track_images/' + id + suffix + ".png"
  let orthologImage = 'files/track_images/' + id + orthologSuffix + ".png"

  let imageBunch = 'files/track_images/' + id + suffix
  function handleScroll(e) {

    if (e.altKey == true) {
      let factor = 0.8

      if (e.deltaY < 0) {
        factor = 1 / factor
      }

      dispatch(updateTrack({
        key: id,
        offset: offset,
        zoom: Math.max(zoom * factor, 1.0)
      }))
    }
  }


  function handlePan(e) {
    // if (genome) return
    // Finding important markers of the track, since it's often in a container

    // debugger

    // console.log(e)
    let maxWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 30) * zoom
    let trackBoundingRectangle = e.target.getBoundingClientRect()
    let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

    // Finding the offset
    let dx = e.movementX * (maxWidth / e.target.clientWidth)
    let offsetX = Math.max(Math.min(offset + dx, 0), -((maxWidth * zoom) - maxWidth))

    // Either end of the track
    let westEnd = trackBoundingRectangle.x
    let eastEnd = westEnd + maxWidth

    debugger
    // console.log(offsetX)
    dispatch(updateTrack({
      key: id,
      offset: offsetX,
      zoom: zoom
    }))
    // if (gt) updateTimer(id, offsetX / maxWidth, zoom)
    // dispatch(moveMiniview(
    //     {
    //         key: 'newPreview',
    //         coordinateX: Math.max(westEnd + 80, Math.min(eastEnd - previewSelector.width - 80, e.clientX - previewSelector.width / 2)),
    //         coordinateY: trackBoundingRectangle.y + trackBoundingRectangle.height + 5,
    //         viewFinderX: e.clientX
    //     }))


  }



  function chooseArray() {
    if (!arrays[id]) return

    return zoom < 5 && arrays[id].subarrays ? (
      <BasicTrack
        array={arrays[id].subarrays[0]}
        key={id + "_" + incrementingID}
        id={id}
        color={color}
        zoom={zoom}
        offset={offset}
        trackType='heatmap'
        width={width}
        height={height}
        title={id}
        pastZoom={pastZoom}
      />) : (
      <BasicTrack
        array={array}
        key={id + "_" + incrementingID}
        id={id}
        color={color}
        zoom={zoom}
        offset={offset}
        width={width}
        height={height}
        title={id}
        pastZoom={pastZoom}
      />)
  }

  useEffect(() => {
    if(!cap){
      setCap(Math.max(...genomeSelector[id].array.map(d => d.end)))
    }


    let testwidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width - 30
    setTotalWidth(testwidth * zoom)

    if (zoom < 10 && arrays[id] && arrays[id].subarrays) {

      if (chosenTrackType == "default") {
        dispatch(changePreviewVisibility(
          {
            visible: false
          }))

      }
      if (zoom < 6) {
        setArray(arrays[id].subarrays[0])
        setTrackType("heatmap")
        setTitleState(id + "-Subarray 1")
      }
      else {
        setArray(arrays[id].subarrays[1])
        setTrackType("heatmap")
        setTitleState(id + "-Subarray 2")
      }


    }
    else {
      setArray(array)
      setTrackType(trackType)
      setTitleState(id + "-Full Array")
    }
  }, [zoom, offset, isDark])


  function bunchOfTracks(){

    let numberOfImages = Math.ceil(cap/1000000)
    let fuck = []
    for (let x = 0; x < numberOfImages; x ++){
      fuck.push(<ImageTrack
          image={imageBunch + "_" + x +".png"}
          id={id}
          zoom={zoom/numberOfImages}
          pastZoom={pastZoom/numberOfImages}
          offset={offset}
          width={width}
          height={height}
          isDark={isDark}
          cap={cap}
          color={color}
          index={x}
          total={numberOfImages}
        />)
    }
    // return (numberOfImages.map(x => {
    //   return (
    //     <ImageTrack
    //       image={imageBunch + "_" + x +".png"}
    //       id={id}
    //       zoom={zoom/numberOfImages}
    //       pastZoom={pastZoom/numberOfImages}
    //       offset={offset}
    //       width={width}
    //       height={height}
    //       isDark={isDark}
    //       cap={cap}
    //       color={color}
    //       index={x}
    //       total={numberOfImages}
    //     />
    //   )

    // })
    // )
    return fuck
  }

  function trackStyle(currentOffset, zoom) {
    if (currentOffset == undefined) {
      return {
        display: 'none',
      }
    }

    let x = currentOffset


    // let width = document.getElementById(id) ? document.getElementById(id).getBoundingClientRect().width : 500
    let testwidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width - 30
    let testheight = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50

    let spacing = testwidth * pastZoom
    let newSpacing = testwidth * zoom

    let adjustment = (newSpacing - spacing) / 2


    // need to account for zooming from the center
    const transform = `matrix(${zoom}, 0, 0,  ${1}, ${offset}, 0)`
    const translate = `translate(${0}px, ${0}px)`;
    return ({
      width: testwidth,
      height: testheight,
      // translate,
      WebkitTransform: transform,
      // WebkitTransform: translate,
    })
  }




        // bunchOfTracks()

  /// Figure out the actual total width to consider
  return (
    <>
      {totalWidth > 120000 ? <BasicTrack
        array={chosenArray}
        key={id + "_" + incrementingID}
        id={id}
        color={color}
        zoom={zoom}
        offset={offset}
        trackType={chosenTrackType}
        width={width}
        height={height}
        title={titleState}
        pastZoom={pastZoom}
        isDark={isDark}
      /> :
                <ImageTrack
          image={image}
          orthologs={orthologImage}
          array={array}
          id={id}
          zoom={zoom}
          pastZoom={pastZoom}
          offset={offset}
          width={width}
          height={height}
          isDark={isDark}
          cap={cap}
          color={color}
          index={0}
          total={1}
        />

      }

    </>

  )
}

export default ComplicatedTrackContainer