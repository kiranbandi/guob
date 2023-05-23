

import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RenderTrack from './RenderTrack'
import ImageTrack from './ImageTrack'
import { updateTrack, selectBasicTracks, addBasicTrack, updateMatchingTracks } from './basicTrackSlice'
import _ from 'lodash';
import { set } from 'lodash'
import { changePreviewVisibility, selectMiniviews, movePreview } from '../../features/miniview/miniviewSlice';
import { scaleLinear } from 'd3-scale'
import StackedTrack from './StackedTrack';
import { selectGenome } from './genomeSlice'
import { addDraggable, clearDraggables } from '../../features/draggable/draggableSlice'
import { Typography, Tooltip } from '@mui/material';
import TrackControls from './TrackControls'
import TrackScale from './track_components/TrackScale'
import { addAnnotation, removeAnnotation, selectAnnotations, selectSearch, addOrtholog, selectOrthologs, } from '../../features/annotation/annotationSlice'
import { nanoid } from '@reduxjs/toolkit'
import { ContentPasteOffSharp, EditNotificationsOutlined } from '@mui/icons-material'


function indexTopixel(index, zoom, array, maxWidth) {
  let pixel = scaleLinear().domain([0, array.length]).range([0, maxWidth * zoom])
  return pixel(index)
}

function pixelToindex(pixel, zoom, array, maxWidth) {
  let index = scaleLinear().domain([0, maxWidth * zoom]).range([0, array.length])
  return index(pixel)

}
function TrackContainer({ trackType, id, color, isDark, zoom, offset, width, cap, height, pastZoom, normalize, renderTrack, genome, usePreloadedImages, subGenomes }) {

  //! This is intended to hold the different tracktypes. Use it to modify any information that needs
  //! to be passed from the slice to the track. In the return statement, check the "renderTrack" prop
  //! to return a given track type. The scale and track buttons are rendered by this container,
  //! if you'd like them removed feel free to add a conditional, if you want them, there shouldn't be 
  //! any extra that needs to be done.

  //! This is also still in the process of refactoring - for example, the gt still needs to be added
  // const array = useSelector(selectGenome)[id].array
  let array, normalizedLength
  let true_id = id.includes("_splitview") ? id.split("_splitview")[0] : id
  true_id = true_id.includes("_genome") ? true_id.split("_genome")[0] : true_id

  offset = genome ? 0 : offset
  zoom = genome ? 1 : zoom
  if (window.chromosomalData) {
    let chromInfo = window.chromosomalData.find(x => x.key.chromosome == true_id)
    if (chromInfo) {
      array = chromInfo.data
      normalizedLength = chromInfo.normalizedLength
    }
    else {
      array = []
      normalizedLength = 0
    }
  }

  const dispatch = useDispatch()

  const annotationSelector = useSelector(selectAnnotations)[true_id]
  const allAnnotations = useSelector(selectAnnotations)
  const allSearches = useSelector(selectSearch)
  const allOrthologs = useSelector(selectOrthologs)
  const trackSelector = useSelector(selectBasicTracks)

  const trackRef = useRef()

  const genomeSelector = useSelector(selectGenome)

  const [activeSubGenome, setActiveSubGenome] = useState("N/A")
  const [numChange, setNumChange] = useState(0)
  const [SGThreshold, setSGThreshold] = useState()

  const [numberOfImages, setNumberOfImages] = useState(0)

  const [dragging, setDragging] = useState(false)

  let designation, pixelWidth, image
  let directoryName, fileName
  pixelWidth = 16383 * 60

  let suffix = isDark ? "_track_dark" : "_track"
  let orthologSuffix = isDark ? "_orthologs_dark" : "_orthologs"
  let location = 'http://hci-sandbox.usask.ca:3010/static/'

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
    fileName = split_id[1]

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
  switch (trackType) {
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

  image = `${location}${directoryName}/${fileName}${suffix}.webp`

  let orthologImage = `${location}${directoryName}_orthologs/${fileName}${suffix}.webp`
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

  // const [activeSubGenome, setActiveSubGenome] =  useState("N/A")
  // const [dataArray, setDataArray] = useState([...array])
  const [dataArray, setDataArray] = useState([])

  const updateActiveSubgenome = (SG) => {
    // console.log("YESSS"


    setActiveSubGenome(SG);

    // console.log(activeSubGenome)
  };


  function generateImage() {
    return fetch('http://hci-sandbox.usask.ca:3010', {
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
  }

  const updateSGThreshold = (data) => {
    // console.log("YESSS"
    setSGThreshold(data);
    // console.log(activeSubGenome)
  };


  let imageExists = () => {

    // This could probably have more function than it does
    if (renderOrthologs !== undefined) return
    const img = new Image()
    img.onload = () => setRenderOrthologs(true)
    img.onerror = () => setRenderOrthologs(false)
    img.src = orthologImage
    img.remove()
  }

  const positionRef = React.useRef({
    x: 0,
    y: 0,
  });
  const popperRef = React.useRef(null);

  // Quick and dirty speed hover implementation
  const [bpMapping, setBPMapping] = useState()
  useEffect(() => {
    if (!array || array.length < 1) return
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
    let scalingIncrements
    if (renderTrack == "stackedTrack" && array.length != 0) {
      let scalingIncrements = scaleLinear().domain([0, array.length]).range([0, maxWidth])

      if (zoom == 1) {
        setDataArray(array)
      }

      else {
        const requiredData = array.slice(Math.round(startOfTrack), Math.round(endCap))
        const subgenomeSortedData = _.sortBy(requiredData, (d) => d[activeSubGenome]);
        setDataArray(subgenomeSortedData)
      }
    }
    else {
      scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth])
    }
    setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
    setEndCap(Math.min(scalingIncrements.invert(originalWidth - offset), cap))
    if (!usePreloadedImages) {
      generateImage().then(url => {
        setChosenImages(url)
      })
    }
  }, [zoom, offset, cap, usePreloadedImages])

  useEffect(() => {
    const subgenomeSortedData = _.sortBy(dataArray, (d) => d[activeSubGenome]);


    setDataArray(subgenomeSortedData);
    setNumChange(numChange + 1);
  }, [activeSubGenome])

  useEffect(() => {

  }, [SGThreshold])


  function handleScroll(e) {
    if (genome) return
    if (e.altKey === true) {
      setHoverStyle({ display: "none", pointerEvents: "none" })
      let factor = 0.8

      if (e.deltaY < 0) {
        factor = 1 / factor
      }

      //! Needs to handle normalized tracks
      let ratio = normalize ? cap/normalizedLength : 1.0
      let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * originalWidth*ratio
      // debugger
      //  Needs to be panned so that the  location remains the same
      let dx = ((normalizedLocation - offset) * (factor - 1))

      let parentWrapperHeight = document.querySelector('.draggableItem')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width;

      const raw_width = parentWrapperWidth ? Math.round(parentWrapperWidth) : width;

      let offsetX = 0;
      if (renderTrack == "stackedTrack") {
        offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
      }
      else {
        offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
      }

      if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0

      dispatch(updateMatchingTracks({
        key: id,
        offset: offsetX,
        zoom: Math.max(zoom * factor, 1.0)
      }))
    }
  }


  function handlePan(e) {

    if (genome) return

    setHoverStyle({ display: "none", pointerEvents: "none" })

    // Finding the offset
    let dx = e.movementX

    let offsetX = Math.max(Math.min(offset + dx, 0), -(maxWidth - originalWidth))

    dispatch(updateMatchingTracks({
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
    let xScale = normalize ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
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
        if (gene && gene.siblings.length > 0) {
          dispatch(clearDraggables({ dragGroup: "ortholog" }))
          gene.siblings.forEach(sibling => {
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
    if (related.length < 1) return
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()
    let left = trackBoundingRectangle.x
    let top = trackBoundingRectangle.y + 27
    let verticalScroll = document.documentElement.scrollTop

    let xScale = normalize ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    // let cursorColor = isDark ? "white" : "black"
    let cursorColor = "grey"

    let yCoordinate = genome ? 0 : top + verticalScroll
    return related.map(x => {
      return (
        <>
          <div key={nanoid()}
            style={{
              pointerEvents: "none", zIndex: 2, borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
              borderBottom: "5px solid transparent", borderTop: `5px solid ${cursorColor}`, position: "absolute",
              left: xScale(x.location) + left + offset - 2, width: 4, top: yCoordinate, height: genome ? 42 : adjustedHeight + 24,
            }}>
          </div>
          {!genome && <div
            key={nanoid()}
            style={{
              pointerEvents: "none", zIndex: 2, position: "absolute", WebkitUserSelect: "none",
              left: xScale(x.location) + left + offset - 2, top: top + verticalScroll - 20, height: genome ? 42 : adjustedHeight + 24,
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

      let yCoordinate = genome ? 0 : top + verticalScroll
      return selector.map(x => {

        return (
          <>
            <div key={nanoid()}
              style={{
                pointerEvents: "none", zIndex: 2, borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                borderBottom: "5px solid transparent", borderTop: `5px solid ${cursorColor}`, position: "absolute",
                left: xScale(x.location) + left + offset - 2, width: 4, top: yCoordinate, height: genome ? 42 : adjustedHeight + 24,
              }}>
            </div>
            {!genome && <div
              key={nanoid()}
              style={{
                pointerEvents: "none", zIndex: 2, position: "absolute", WebkitUserSelect: "none",
                left: xScale(x.location) + left + offset - 2, top: top + verticalScroll - 20, height: genome ? 42 : adjustedHeight + 24,
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
    let verticalScroll = document.documentElement.scrollTop;
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect();
    let xScale, widthScale, bpPosition;

    if (renderTrack == "stackedTrack" && array.length != 0) {
      let parentWrapperHeight = document.querySelector('.draggableItem')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width;

      const raw_width = parentWrapperWidth ? Math.round(parentWrapperWidth) : width;


      let adjustedPos = (e.clientX - trackBoundingRectangle.left)

      xScale = scaleLinear().domain([0, dataArray.length]).range([0, raw_width - 20])
      widthScale = scaleLinear().domain([0, dataArray.length]).range([0, originalWidth])
      bpPosition = xScale.invert(adjustedPos)

      let num = Math.round(bpPosition)
      setInfo(`${JSON.stringify(dataArray[num])}\n}`)
      setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(num) + trackBoundingRectangle.left, width: width, top: trackBoundingRectangle.top + verticalScroll + 50, height: adjustedHeight, backgroundColor: "red" })
      return

    }

    let adjustedPos = (e.clientX) - offset

    xScale = normalize && !genome ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, originalWidth])
    bpPosition = getXLocation(adjustedPos)

    if (!previewSelector.visible) {
      dispatch(changePreviewVisibility({
        visible: true
      }))
    }
    dispatch(movePreview({
      center: bpPosition
    })
    )

    if (renderTrack === "stackedTrack") {
      for (let i = 0; i < array.length; i++) {

        if (bpPosition > array[i].start && bpPosition < array[i].end) {
          let width = widthScale(array[i].end - array[i].start)
          setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings : 'No Orthologs'}`)
          setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left + offset, width: width, top: trackBoundingRectangle.top + verticalScroll + 50, height: adjustedHeight, backgroundColor: "red" })

          return
        }
      }
    }


    if (bpMapping) {
      let keys = Object.keys(bpMapping)
      let numberOfKeys = keys.length
      let firstIndex, lastIndex
      for (let x = 0; x < numberOfKeys; x++) {
        if (bpPosition < +keys[x]) break
        firstIndex = bpMapping[keys[x]].firstIndex
        lastIndex = bpMapping[keys[x]].lastIndex
      }
      for (let i = +firstIndex; i < +lastIndex; i++) {
        if (bpPosition > array[i].start && bpPosition < array[i].end) {
          let width = widthScale(array[i].end - array[i].start)
          if (renderTrack === "bitmap") {
            setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings.map(x => x.key) : 'No Orthologs'}`)
            setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left + offset, width: width, top: renderOrthologs ? trackBoundingRectangle.top + verticalScroll + 50 : trackBoundingRectangle.top + verticalScroll + 25, height: renderOrthologs ? adjustedHeight : adjustedHeight + 25, backgroundColor: "red" })
            return
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
            return
          }
        }
      }

    }
    setInfo("")
    setHoverStyle({ display: "none", pointerEvents: "none" })
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
    let top = trackBoundingRectangle.y
    let verticalScroll = document.documentElement.scrollTop
    let trackWidth = trackBoundingRectangle.width

    let bpPosition = previewSelector.center



    let xScale = normalize && !genome ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])
    let current_location = xScale(bpPosition) + trackRef.current.offsetLeft + offset
    if (current_location < trackRef.current.offsetLeft + trackWidth && current_location > trackRef.current.offsetLeft) {
      let cursorColor = isDark ? "white" : "black"
      if (genome) {
        let genome_position = top == 0 ? top : top + verticalScroll
        cursorStyle = { pointerEvents: "none", zIndex: 2, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid transparent", borderBottom: `5px solid ${cursorColor}`, position: "absolute", left: current_location - 5, width: 4, top: { genome_position }, height: genome ? 42 : adjustedHeight + 24, }
      }
      else {
        cursorStyle = { pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + 27 + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24, backgroundColor: cursorColor, opacity: 0.4 }
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
          style={!genome ? {width: '100%', height: '100%'} : {width}}
          ref={trackRef}
          onWheel={handleScroll}
          onMouseMove={handleMouseMove}
          onMouseDown={handleClick}
          onMouseUp={handleClick}
          onMouseLeave={leaveTrack}
          onDragStart={(e) => e.preventDefault()}
        >


          {renderTrack == "stackedTrack" ?
            <StackedTrack width={maxWidth} height={adjustedHeight} activeSubGenome={activeSubGenome} array={dataArray} subGenomes={subGenomes}></StackedTrack>
            :
            ((renderTrack === "bitmap" && trackType !== "line" && trackType !== "scatter") &&
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
            ((renderTrack === "basic" || trackType === "line" || trackType === "scatter") &&
              <RenderTrack
                title={id}
                key={id}
                id={id}
                array={array}
                color={color}
                isDark={isDark}
                offset={offset}
                genome={genome}
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

export default TrackContainer;