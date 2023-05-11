

import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RenderTrack from './RenderTrack'
import ImageTrack from './ImageTrack'
import { updateTrack, selectBasicTracks, addBasicTrack, updateMatchingTracks } from './basicTrackSlice'
import { changePreviewVisibility, selectMiniviews, movePreview } from '../../features/miniview/miniviewSlice';
import { scaleLinear } from 'd3-scale'
import { selectGenome } from './genomeSlice'
import { addDraggable, clearDraggables } from '../../features/draggable/draggableSlice'
import { Typography, Tooltip } from '@mui/material';
import TrackControls from './TrackControls'
import TrackScale from './track_components/TrackScale'
import { addAnnotation, removeAnnotation, selectAnnotations, selectSearch, addOrtholog, selectOrthologs,  } from '../../features/annotation/annotationSlice'
import { nanoid } from '@reduxjs/toolkit'

function TrackContainer({ trackType, id, color, isDark, zoom, offset, width, cap, height, pastZoom, normalize, renderTrack, genome, usePreloadedImages }) {

  //! This is intended to hold the different tracktypes. Use it to modify any information that needs
  //! to be passed from the slice to the track. In the return statement, check the "renderTrack" prop
  //! to return a given track type. The scale and track buttons are rendered by this container,
  //! if you'd like them removed feel free to add a conditional, if you want them, there shouldn't be 
  //! any extra that needs to be done.

  //! This is also still in the process of refactoring - for example, the gt still needs to be added
  // const array = useSelector(selectGenome)[id].array
  let array, normalizedLength
  let true_id = id.includes("_splitview") ? id.split("_splitview")[0] : id
  // console.log(window.chromosomalData)
  if (window.chromosomalData) {
    // debugger

    let info = window.chromosomalData.find(x => x.key.chromosome == true_id)
    if (info) {
      array = info.data
      normalizedLength = info.normalizedLength
    }
    else {
      array = []
      normalizedLength = 0
    }

  }
  else {
    array = []
  }
  const dispatch = useDispatch()
  const annotationSelector = useSelector(selectAnnotations)[true_id]
  const allAnnotations = useSelector(selectAnnotations)
  const allSearches = useSelector(selectSearch)
  const allOrthologs = useSelector(selectOrthologs)
  const trackSelector = useSelector(selectBasicTracks)

  const trackRef = useRef()
  const [numberOfImages, setNumberOfImages] = useState(0)

  const [dragging, setDragging] = useState(false)

  let designation, pixelWidth, image
  let directoryName, fileName
  pixelWidth = 16383 * 60

  let suffix = isDark ? "_track_dark" : "_track"
  let orthologSuffix = isDark ? "_orthologs_dark" : "_orthologs"
  // let location = 'files/track_images/'
  let location = 'http://localhost:3010/static/'

  // debugger

  //! Split into a function, and make better
  let split_id = id.split("_")
  if (split_id.length === 1) {
    split_id = id
  }
  if (split_id[1].includes("at")) {
    designation = "at_coordinate/" + split_id[1]
    directoryName = "at_coordinate"
    fileName = split_id[1]
  }
  else if (split_id[0].includes("bn")) {
    designation = `${split_id[0].replace("-", "_")}/${split_id[1]}`
    directoryName = `${split_id[0].replaceAll("-", "_")}`
    fileName = split_id[1]

    let darkModifier = isDark ? "_dark" : ""
    suffix = trackType === "default" || trackType == "heatmap" ? "_heatmap" + darkModifier : "_histogram" + darkModifier

  }
  else if (split_id[1].includes("hb")) {
    directoryName = `ta_hb_coordinate`
    // debugger
    // directoryName = `${split_id[0].replace("-", "_")}`
    fileName = split_id[0] + split_id[2].split("coordinate")[1]
  }
  else if (split_id[0].includes("all") || split_id[0].includes("leaf") || split_id[0].includes("seed")) {
   
    directoryName = `topas/${split_id[0].replaceAll("-", "_")}`
    fileName = split_id[1]

  }
  else if (id.includes("N-METHYL")) {

    designation = "bn_methylation_100k/" + split_id[1]

    directoryName = "bn_methylation_100k"
    fileName =  split_id[1]

    let darkModifier = isDark ? "_dark" : ""
    suffix = trackType === "default" || trackType == "heatmap" ? "_heatmap" + darkModifier : "_histogram" + darkModifier
  }
  else if (id.includes("rna")) {
    designation = `bn_${split_id[0]}_100k/${split_id[1]}`
    directoryName = `bn_${split_id[0]}_100k`
    fileName = split_id[1]
    let darkModifier = isDark ? "_dark" : ""
    suffix = trackType === "default" || trackType == "heatmap" ? "_heatmap" + darkModifier : "_histogram" + darkModifier
  }

  let darkModifier = isDark ? "_dark" : ""
  switch (trackType){
    case "heatmap":
      suffix = "_heatmap"
      break
    case "histogram":
      suffix = "_histogram"
      break
    default:
      suffix = "_track"
  }
  suffix += darkModifier



  // image = location + directoryName + fileName + suffix + ".webp"
  image = `${location}${directoryName}/${fileName}${suffix}.webp`

  let orthologImage = `${location}${directoryName}_orthologs/${fileName}${suffix}.webp`
  // console.log(orthologImage)
  // let imageBunch = location + designation + suffix
  let imageBunch = `${location}${directoryName}/${fileName}`
  let originalWidth = width ? width : (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
  let maxWidth = originalWidth * zoom
  let adjustedHeight = genome ? 50 : (document.querySelector('.draggable')?.getBoundingClientRect()?.height - 75)
  const previewSelector = useSelector(selectMiniviews)['newPreview']
  const [hoverStyle, setHoverStyle] = useState({ display: "none" })
  const [info, setInfo] = useState("")
  const [startOfTrack, setStartOfTrack] = useState()
  const [endCap, setEndCap] = useState()
  const [renderOrthologs, setRenderOrthologs] = useState()
  const [clickLocation, setClickLocation] = useState()
  const searchSelector = useSelector(selectSearch)[true_id]

  const [chosenImages, setChosenImages] = useState()

  const gt = window.gt;

  // let pixelWidth = resolution ? 1000000 * 60: 50000 * 60

  let [posWaiting, setPosWaiting] = useState()

  function updateTimer(id, ratio, zoom) {
    clearTimeout(posWaiting)
    setPosWaiting(window.setTimeout(() => {
      let trackInfo = {
        id: id,
        ratio: ratio,
        zoom: zoom
      }
      gt.updateState({ Action: "handleTrackUpdate", trackInfo })
    }, 80))
  }



  function generateImage() {
    return fetch('http://localhost:8080', {
      method: 'POST',
      headers: {
        'Accept': 'image/png',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chromosome: id,
        data: array,
        isDark: isDark,
        end: cap
      })
    })
      .then(response => {
        return response.blob()
      })
      .then(blob => {
        const imageObjectURL = URL.createObjectURL(blob);
        return imageObjectURL
      })

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




  }



  let imageExists = () => {
  
    if (renderOrthologs !== undefined) return
    const img = new Image()
    img.onload = () => setRenderOrthologs(true)
    img.onerror = () => setRenderOrthologs(false)
    img.src = orthologImage
    img.remove()
  }

  // 1000000
  const positionRef = React.useRef({
    x: 0,
    y: 0,
  });
  const popperRef = React.useRef(null);

  // Quick and dirty speed hover implementation
  const [bpMapping, setBPMapping] = useState()
  useEffect(() => {
    if (array.length < 1) return
    if (bpMapping) return
    imageExists()

    let info = window.chromosomalData.find(x => x.key.chromosome == true_id)
    // let endBP = Math.max(...array.map(d => d.end))
    let endBP = info.end
    setNumberOfImages(Math.ceil((endBP) / pixelWidth))

    let number = 1000
    let entries = array.length
    let spacing = Math.floor(entries / number)
    let mapping = {}

    for (let x = 0; x < number; x++) {
      // debugger
      mapping[+array[x * spacing].start] = {
        firstIndex: x * spacing,
        lastIndex: x + 1 === number ? entries - 1 : (x + 1) * spacing
      }
    }
    setBPMapping(mapping)


  }, [array])



  useEffect(() => {
    setNumberOfImages(Math.ceil((cap) / pixelWidth))
  }, [])

  useEffect(() => {

    trackRef.current.addEventListener('wheel', preventScroll, { passive: false });
    // if alt key is pressed then stop the event 

    function preventScroll(e) {
      if (e.altKey === true) {
        e.preventDefault();
        // e.stopPropagation();
        return false;
      }
    }

  }, [])




  useEffect(() => {
  }, [isDark])

  useEffect(() => {
    let scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth])
    setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
    setEndCap(Math.min(scalingIncrements.invert(originalWidth - offset), cap))
    if (!usePreloadedImages) {
      generateImage().then(url => {
        setChosenImages(url)
        // console.log(url)
      })
    }
  }, [zoom, offset, cap, usePreloadedImages])

  function handleScroll(e) {
    if (genome) return
    if (e.altKey === true) {
      setHoverStyle({ display: "none", pointerEvents: "none" })
      let factor = 0.8

      if (e.deltaY < 0) {
        factor = 1 / factor
      }

      // Finding the location of the mouse on the track, the rendered track is adjusted with css,
      // so the mouse location needs to be normalized to the canvas
      let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * originalWidth

      //  Needs to be panned so that the zoom location remains the same
      let dx = ((normalizedLocation - offset) * (factor - 1))
      let offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
      if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0
      dispatch(updateMatchingTracks({
        key: id,
        offset: offsetX,
        zoom: Math.max(zoom * factor, 1.0)
      }))
      if (gt) updateTimer(id, offsetX / originalWidth, Math.max(zoom * factor, 1.0))
    }
  }


  function handlePan(e) {
    if (genome) return

    setHoverStyle({ display: "none", pointerEvents: "none" })

    // Finding the offset
    let dx = e.movementX

    let offsetX = Math.max(Math.min(offset + dx, 0), -(maxWidth - originalWidth))
    // let offsetX = offset + dx

    dispatch(updateTrack({
      key: id,
      offset: offsetX,
      zoom: zoom
    }))
    if (gt) updateTimer(id, offsetX / originalWidth, zoom)
  }




  function bunchOfTracks(currentZoom, currentOffset) {

    // Used to determine which images to pass as a prop to imageTracks, as well as to adjust the offset/zoom
    // once those multiple images are sent.

    let bunch = []

    let currentImageScale = scaleLinear().domain([0, cap]).range([0, maxWidth])

    let ratio = (cap) / pixelWidth
    let adjustedZoom = currentZoom / ratio

    let bpLocation = Math.round(currentImageScale.invert(Math.abs(offset)))

    let correctImage = Math.floor((bpLocation) / pixelWidth)
    let startOfImage = correctImage * pixelWidth + 1

    let newImageScale = scaleLinear().domain([startOfImage, startOfImage + pixelWidth]).range([0, originalWidth * adjustedZoom])
    let adjustedOffset = newImageScale(bpLocation)

    let darkModifier = isDark ? "_dark" : ""

    // As each image is at least 50,000 pixels wide, no more than two will ever be needed
    for (let x = 0; x < 3; x++) {
      let imageChoice = correctImage + x
      if (imageChoice > -1 && imageChoice < numberOfImages) {
          bunch.push(imageBunch + "_" + imageChoice + darkModifier + ".webp")
        }
      }
    
    return (<ImageTrack
      image={bunch}
      orthologs={renderOrthologs ? orthologImage : renderOrthologs}
      genome={genome}
      isHighDef={true}
      id={id}
      zoom={adjustedZoom}
      offset={-adjustedOffset}
      cap={cap}
      color={color}
      normalize={genome ? false : normalize}
      normalizedLength={normalizedLength}
      width={width}
    />
    )
  }

  function newAnnotation(x) {
    let note = prompt("Enter an annotation: ")
    if (!note) return
    let location = getXLocation(x)
    let annotation = {
      key: id,
      note,
      location
    }

    dispatch(addAnnotation(annotation))

    if (gt) {
      gt.updateState({ Action: "handleAnnotation", annotation })
    }

  }

  function deleteAnnotation(x) {
    let annotation = {
      key: true_id,
      location: previewSelector.center
    }
    dispatch(removeAnnotation(annotation))

    if (gt) {
      gt.updateState({ Action: "handleDeleteAnnotation", annotation })
    }
  }


  function getXLocation(x) {
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()
    let left = trackBoundingRectangle.x
    let xScale = normalize ? scaleLinear().domain([0, cap]).range([0, maxWidth * cap / normalizedLength]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    return xScale.invert(x - left)
  }


  function handleClick(e) {
    if (genome) return
    if (e.type === 'mousedown') {
      setClickLocation(e.clientX)
      setDragging(true)
    }
    if (e.type === 'mouseup') {
      setDragging(false)
      if (e.clientX === clickLocation) {
        if (e.shiftKey) {
          newAnnotation(e.clientX - offset)
        }
        if (e.ctrlKey) {
          deleteAnnotation(e.clientX - offset)
        }
        let gene = findGene(getBasePairPosition(e))
        //! Will need logic to align tracks
        console.log(gene)
        if (gene && gene.siblings.length > 0) {
          console.log("There's siblings")
          dispatch(clearDraggables({ dragGroup: "ortholog" }))
          gene.siblings.forEach(sibling => {
            console.log(sibling)
            dispatch(addBasicTrack({
              key: sibling.chromosome + "_splitview",
              zoom: 1,
              offset: 0,
              trackType,
              color: trackSelector[sibling.chromosome].color,
              isDark,
              normalize,
            }))
            dispatch(addDraggable({
              key: sibling.chromosome + "_splitview",
              dragGroup: "ortholog"
            }))
            let annotation = {
              key: id,
              note: gene.key,
              location: gene.start
            }
            let orthologAnnotation = {
              key: sibling.chromosome + "_splitview",
              note: sibling.key,
              location: window.dataset[sibling.key.toLowerCase()].start
            }
            console.log(window.dataset[sibling.key.toLowerCase()].start)
            dispatch(addOrtholog(annotation))
            dispatch(addOrtholog(orthologAnnotation))
          })

        }
      }
      setClickLocation(null)
    }
  }


  function leaveTrack() {
    setHoverStyle({ display: "none" })
    setDragging(undefined)
    dispatch(changePreviewVisibility({
      visible: false
    }))
    // setCursorStyle({display: "none"})
  }


  function displayRelatedMarkers(selector) {
    let chromosomeNumber = id.split("_")[1].replace(/^\D+/g, '')
    let related = []
    Object.keys(selector).forEach(x => {
      // debugger
      // if (x === true) return
      selector[x].forEach(z => {
        if (z.key.split("_")[1].replace(/^\D+/g, '') === chromosomeNumber) {
          related.push(z)
        }
      })
    })
    // console.log(chromosomeNumber)
    // console.log(related)
    if (related.length < 1) return
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()
    let left = trackBoundingRectangle.x
    let top = trackBoundingRectangle.y + 27
    let verticalScroll = document.documentElement.scrollTop

    let xScale = normalize ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    // let cursorColor = isDark ? "white" : "black"
    let cursorColor = "grey"

    return related.map(x => {
      return (
        <>
          <div key={nanoid()} 
          style={{
            pointerEvents: "none", zIndex: 2, borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderBottom: "5px solid transparent", borderTop: `5px solid ${cursorColor}`, position: "absolute",
            left: xScale(x.location) + left + offset - 2, width: 4, top: top + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24,
          }}>
          </div>
          {!genome && <div
          key={nanoid()} 
           style={{
            pointerEvents: "none", zIndex: 2, position: "absolute", WebkitUserSelect: "none",
            left: xScale(x.location) + left + offset - 2, top: top + verticalScroll - 20, height: genome ? adjustedHeight : adjustedHeight + 24,
          }}>
            {x.note}
          </div>

          }
        </>
      )
    })
  }

  function displayTrackMarker(selector) {
    // debugger
    if (!trackRef.current) return
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()
    let left = trackBoundingRectangle.x
    let top = trackBoundingRectangle.y + 27
    let verticalScroll = document.documentElement.scrollTop

    let xScale = normalize ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    let cursorColor = isDark ? "white" : "black"

    // debugger
    if (selector) {

      return selector.map(x => {
        console.log(xScale(x.location))
        return (
          <>
            <div key={nanoid()}
              style={{
                pointerEvents: "none", zIndex: 2, borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                borderBottom: "5px solid transparent", borderTop: `5px solid ${cursorColor}`, position: "absolute",
                left: xScale(x.location) + left + offset - 2, width: 4, top: top + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24,
              }}>
            </div>
            {!genome && <div
              key={nanoid()}
              style={{
                pointerEvents: "none", zIndex: 2, position: "absolute", WebkitUserSelect: "none",
                left: xScale(x.location) + left + offset - 2, top: top + verticalScroll - 20, height: genome ? adjustedHeight : adjustedHeight + 24,
              }}>
              {x.note}
            </div>

            }
          </>
        )
      })
    }
  }

  function handleMouseMove(e) {
    if (dragging) {
      handlePan(e)
    }
    else {
      hover(e)
      handleTooltip(e)
    }
  }

  function generateAnnotations() {
    if (annotationSelector) {
      return displayTrackMarker(annotationSelector)
    }
  }

  function generateOrthologMarkers() {
    if (allOrthologs[id]) {
      return displayTrackMarker(allOrthologs[id])
    }
  }

  function findGene(bpPosition) {
    if (bpMapping) {
      let keys = Object.keys(bpMapping)
      let numberOfKeys = 1000
      let firstIndex, lastIndex
      for (let x = 0; x < numberOfKeys; x++) {
        if (bpPosition < +keys[x]) break
        firstIndex = bpMapping[keys[x]].firstIndex
        lastIndex = bpMapping[keys[x]].lastIndex
      }
      console.log(bpPosition)
      for (let i = +firstIndex; i < +lastIndex; i++) {
        if (bpPosition > array[i].start && bpPosition < array[i].end) {
          return array[i]
        }
      }
    }
  }

  function getBasePairPosition(e) {
    let verticalScroll = document.documentElement.scrollTop
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()

    let adjustedPos = (e.clientX) - offset

    let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])
    let widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, originalWidth])
    let bpPosition = getXLocation(adjustedPos)
    return bpPosition
  }

  function hover(e) {
    if (genome) return
    if (e.target.id.includes('ortholog')) {
      setHoverStyle({ display: "none" })
      return
    }

    let verticalScroll = document.documentElement.scrollTop
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()

    let adjustedPos = (e.clientX) - offset

    let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])
    let widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, originalWidth])
    let bpPosition = getXLocation(adjustedPos)

    if (!previewSelector.visible) {
      dispatch(changePreviewVisibility({
        visible: true
      }))
    }
    dispatch(movePreview({
      center: bpPosition
    })
    )

    if (bpMapping) {
      let keys = Object.keys(bpMapping)
      let numberOfKeys = 1000
      let firstIndex, lastIndex
      for (let x = 0; x < numberOfKeys; x++) {
        if (bpPosition < +keys[x]) break
        firstIndex = bpMapping[keys[x]].firstIndex
        lastIndex = bpMapping[keys[x]].lastIndex
      }
      // debugger
      for (let i = +firstIndex; i < +lastIndex; i++) {
        if (bpPosition > array[i].start && bpPosition < array[i].end) {
          let width = widthScale(array[i].end - array[i].start)
          if (renderTrack === "bitmap") {
            setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings.map(x => x.key) : 'No Orthologs'}`)
            setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left + offset, width: width, top: renderOrthologs ? trackBoundingRectangle.top + verticalScroll + 50 : trackBoundingRectangle.top + verticalScroll + 25, height: renderOrthologs ? adjustedHeight : adjustedHeight + 25, backgroundColor: "red" })
          }
          else if (renderTrack === "basic") {
            setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings.map(x => x.key) : 'No Orthologs'}`)
            setHoverStyle({
              pointerEvents: "none", zIndex: 2,
              position: "absolute",
              left: xScale(array[i].start) + trackBoundingRectangle.left + offset,
              width: width,
              top: renderOrthologs ? trackBoundingRectangle.top + verticalScroll + 50 : trackBoundingRectangle.top + verticalScroll + 25,
              height: renderOrthologs ? adjustedHeight : adjustedHeight + 25,
              backgroundColor: "red"
            })
          }
          // console.log(info)
          return
        }
      }

    }
    setHoverStyle({ display: "none", pointerEvents: "none" })
    setInfo("")
  }


  function handleTooltip(event) {
    positionRef.current = { x: event.clientX, y: event.clientY };

    if (popperRef.current != null) {
      popperRef.current.update();
    }
  };


  let cursorStyle = { display: "none", pointerEvents: "none" }


  if (previewSelector.visible && trackRef.current) {

    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()
    let left = trackBoundingRectangle.x
    let top = trackBoundingRectangle.y + 27
    let verticalScroll = document.documentElement.scrollTop

    let bpPosition = previewSelector.center


    let xScale = normalize ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    if (xScale(bpPosition) + left + offset < trackRef.current.offsetLeft + maxWidth) {
      let cursorColor = isDark ? "white" : "black"
      if (genome) {
        cursorStyle = { pointerEvents: "none", zIndex: 2, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid transparent", borderBottom: `5px solid ${cursorColor}`, position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24, }
      }
      else {
        cursorStyle = { pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24, backgroundColor: cursorColor, opacity: 0.4 }
      }
    }
  }

  return (
    <>
      <div style={cursorStyle}></div>
      <div style={hoverStyle}></div>
      {previewSelector.visible && generateAnnotations()}
      {previewSelector.visible && displayRelatedMarkers(allAnnotations)}
      {previewSelector.visible && displayRelatedMarkers(allSearches)}
      {searchSelector && displayTrackMarker(searchSelector)}
      {allOrthologs[id] && generateOrthologMarkers()}

      <Tooltip
        title={info ? <Typography
          variant="caption"
          style={{ whiteSpace: 'pre-line' }}
        >
          {info}
        </Typography> : ''}
        arrow
        placement='top'
        PopperProps={{
          popperRef,
          anchorEl: {
            getBoundingClientRect: () => {
              return new DOMRect(
                positionRef.current.x,
                trackRef.current.getBoundingClientRect().y + 50,
                0,
                0,
              );
            },
          },
        }}
      >
        <div
          className={"parent"}
          id={genome ? id + "_genome_view" : id}
          // style={{pointerEvents: "none"}}
          ref={trackRef}
          onWheel={handleScroll}
          onMouseMove={handleMouseMove}
          onMouseDown={handleClick}
          onMouseUp={handleClick}
          onMouseLeave={leaveTrack}
          onDragStart={(e) => e.preventDefault()}
          style={{ marginLeft: "10px" }}
        >

          {((renderTrack === "bitmap") &&
            (zoom > numberOfImages && numberOfImages > 0 ?
              bunchOfTracks(zoom, offset)
              :
              <ImageTrack
                image={usePreloadedImages ? [image] : [chosenImages]}
                orthologs={renderOrthologs ? orthologImage : renderOrthologs}
                genome={genome}
                id={id}
                zoom={zoom}
                offset={offset}
                cap={cap}
                color={color}
                normalize={genome ? false : normalize}
                height={genome ? height - 25 : undefined}
                normalizedLength={normalizedLength}
                width={width}
              />))
            ||
            (renderTrack === "basic" &&
              <RenderTrack
                title={id}
                key={id}
                id={id}
                array={array}
                color={color}
                isDark={isDark}
                offset={offset}
                zoom={zoom}
                pastZoom={pastZoom}
                height={1}
                trackType={trackType}
                normalize={genome ? false : normalize}
                normalizedLength={normalizedLength}
                width={genome ? width : undefined}
              />)
          }

          {(!genome) && (<TrackScale
            endOfTrack={normalize ? normalizedLength : endCap}
            startOfTrack={startOfTrack}
            width={originalWidth}
            paddingLeft={0}
            paddingRight={0} />)}
          {(!genome) &&
            (<TrackControls id={id} height={adjustedHeight} gap={adjustedHeight + 25} isDark={isDark} />)}
        </div>
      </Tooltip>

    </>

  )
}

export default TrackContainer