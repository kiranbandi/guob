import { nanoid } from '@reduxjs/toolkit'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectComplicatedTracks, appendComplicatedTrack } from './complicatedTrackSlice'
import Track from './Track'
import BasicTrack from './BasicTrack'
import { selectBasicTracks, updateTrack } from './basicTrackSlice'
import { Typography, Stack, Tooltip } from '@mui/material';
import TrackControls from './TrackControls'
import TrackScale from '../tracks/track_components/TrackScale'
import { scaleLinear } from 'd3-scale'
import { HuePicker } from 'react-color'
import { selectMiniviews, changePreviewVisibility, movePreview } from 'features/miniview/miniviewSlice.js'

function ImageTrack({ image, array, offset, zoom, pastZoom, id, isDark, cap, color, index, total, orthologs }) {

    const dispatch = useDispatch()
    const imageRef = useRef()
    const [dragging, setDragging] = useState(false)
    const previewSelector = useSelector(selectMiniviews)['newPreview']

    let maxWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60) * zoom
    let originalWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
    let height = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50

    const [startOfTrack, setStartOfTrack] = useState()
    const [endCap, setEndCap] = useState()

    const [pixelMap, setPixelMap] = useState()
    const [geneMap, setGeneMap] = useState()
    const [hoverStyle, setHoverStyle] = useState({ display: "none" })
    const [cursorStyle, setCursorStyle] = useState({ display: "none" })
    const [hoverName, setHoverName] = useState()
    const [ info, setInfo ] = useState("")

    const positionRef = React.useRef({
        x: 0,
        y: 0,
    });
    const popperRef = React.useRef(null);

    function buildPixelMapping(array) {
        let geneMap = {}
        let pixelMap = {}


        array.forEach(gene => {
            geneMap[gene.key] = gene
            if (!gene) console.log("Huh?")
            for (let i = gene.start; i++; i < gene.end) {
                // console.log(i + " " + gene.key)
                pixelMap[i] = gene.key
            }

        })


    }

    useEffect(() => {

        // let xScale = scaleLinear().domain([0, cap]).range([paddingLeft, (maxWidth * zoom) - paddingRight])
        // buildPixelMapping(array)
        imageRef.current.addEventListener('wheel', preventScroll, { passive: false });
        // if alt key is pressed then stop the event 

        function preventScroll(e) {
            if (e.altKey == true) {
                e.preventDefault();
                // e.stopPropagation();
                return false;
            }
        }
    }, [])

    useEffect(() => {
        let scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth])
        setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
        setEndCap(Math.min(scalingIncrements.invert(originalWidth - offset), cap))

    }, [zoom, offset, cap])


    //! May need this for cursor positions
    useEffect(() => {

        // // use for cursor positions on multiple tracks
        // let verticalScroll = document.documentElement.scrollTop
        // let trackBoundingRectangle = e.target.getBoundingClientRect()

        // // probably need some sort of zoom calculation as well? Offset is clearly fucking this up
        // let adjustedPos = (e.clientX - trackBoundingRectangle.left)
        // // + offset

        // let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])
        // let widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, originalWidth])
        // let bpPosition = xScale.invert(adjustedPos)
        // // div.style.top = height
        // // div.style.left = adjustedPos

        // // need to convert to bp
        // for (let i = 0; i < array.length; i++) {
        //     if (bpPosition > array[i].start && bpPosition < array[i].end) {
        //         let width = widthScale(array[i].end - array[i].start)

        //         setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left, width: width, top: trackBoundingRectangle.top + verticalScroll, height: trackBoundingRectangle.height, backgroundColor: "red" })
        //         return
        //     }
        // }

        setHoverStyle({ display: "none" })
    }, [])



    function handleScroll(e) {

        if (e.altKey == true) {
            let factor = 0.8

            if (e.deltaY < 0) {
                factor = 1 / factor
            }

            // Finding important markers of the track, since it's often in a container
            let trackBoundingRectangle = e.target.getBoundingClientRect()
            let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

            // Finding the location of the mouse on the track, the rendered track is adjusted with css,
            // so the mouse location needs to be normalized to the canvas
            let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * originalWidth

            //  // Arbitrarily decided that if the preview window is 1/3 of the entire track, it's likely zoomed in enough
            //  if (previewSelector.boxWidth > maxWidth / 3 && factor > 1.0) {
            //      factor = 1.0
            //  }

            //  Needs to be panned so that the zoom location remains the same
            let dx = ((normalizedLocation - offset) * (factor - 1))
            let offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
            if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0


            dispatch(updateTrack({
                key: id,
                offset: offsetX,
                zoom: Math.max(zoom * factor, 1.0)
            }))
        }
    }


    function handlePan(e) {
        // if (genome) return
        // Finding important markers of the track, since it's often in a container

        // debugger

        // console.log(e)
        // let maxWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 30) * zoom
        let trackBoundingRectangle = e.target.getBoundingClientRect()
        let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

        // Finding the offset
        let dx = e.movementX
        let offsetX = Math.max(Math.min(offset + dx, 0), -(maxWidth - originalWidth))

        // Either end of the track
        let westEnd = trackBoundingRectangle.x
        let eastEnd = westEnd + maxWidth


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

    function handleClick(e) {
        if (e.type == 'mousedown') {

            // let comparisonImage = document.getElementById("at2imageTrack")
            // let canvas = document.createElement('canvas')

            // let ctx = canvas.getContext('2d')

            // let width = comparisonImage.width
            // let height = comparisonImage.height

            // let x = e.clientX - e.target.offsetLeft
            // let y = e.clientY - e.target.offsetTop

            // ctx.drawImage(comparisonImage, 0, 0, width, height)

            // let pixelColours = ctx.getImageData(0, 0, width, height).data

            // let redValue = 0
            // let greenValue = 1
            // let blueValue = 2
            // let alphaValue = 3

            // const i = (y * width + x) * 4
            // debugger
            // console.log(pixelColours[redValue] === 255 && pixelColours[blueValue] === 255 && pixelColours[greenValue] === 255)
            setDragging(true)
        }
        if (e.type == 'mouseup') {
            setDragging(false)
        }
    }
    function hover(e) {

        let verticalScroll = document.documentElement.scrollTop
        // console.log(e.target.getBoundingClientRect())
        let trackBoundingRectangle = e.target.getBoundingClientRect()

        // probably need some sort of zoom calculation as well? Offset is clearly fucking this up
        let adjustedPos = (e.clientX - trackBoundingRectangle.left)


        let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])
        let widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, originalWidth])
        let bpPosition = xScale.invert(adjustedPos)

        // dispatch()

        // need to convert to bp
        // ! Should have a conditional on this to not shoot off a million events
        dispatch(changePreviewVisibility({
            visible: true
        }))
        dispatch(movePreview({
            center: bpPosition 
        })
        )
        for (let i = 0; i < array.length; i++) {
            if (bpPosition > array[i].start && bpPosition < array[i].end) {
                let width = widthScale(array[i].end - array[i].start)
                setHoverName(array[i].key)
                setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings : 'No Orthologs'}`)
                setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left, width: width, top: trackBoundingRectangle.top + verticalScroll, height: trackBoundingRectangle.height, backgroundColor: "red" })
                return
            }
        }
        setHoverStyle({ display: "none" })

    }

    function trackStyle(currentOffset, currentZoom) {
        if (currentOffset == undefined) {
            return {
                display: 'none',
            }
        }

        let x = currentOffset

        // let width = document.getElementById(id) ? document.getElementById(id).getBoundingClientRect().width : 500
        let testwidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width - 30
        let testheight = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 75

        let deg = 0
        let lightness = 100
        let saturation = 100

        // + (originalWidth * index) / total)
        const transform = `matrix(${currentZoom}, 0, 0,  ${1}, ${x}, ${0})`
        const hue = `hue-rotate(${deg}deg)`
        // brightness(${lightness}%) saturate(${saturation}%)
        //TODO going to need the padding on the left and right
        return ({
            width: originalWidth,
            height: testheight,
            // paddingLeft: 10,
            transformOrigin: "top left",
            // translate,
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            filter: hue,
            // WebkitMask: `url(${image}) center/contain`,
            // mask:`url(${image}) center/contain`,
            background: color,
            // WebkitTransform: translate,
        })
    }

    function orthologStyle(currentOffset, currentZoom) {
        if (currentOffset == undefined) {
            return {
                display: 'none',
            }
        }

        let x = currentOffset

        // let width = document.getElementById(id) ? document.getElementById(id).getBoundingClientRect().width : 500
        let testwidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width - 30
        let testheight = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50

        let deg = 0
        let lightness = 100
        let saturation = 100

        // + (originalWidth * index) / total)
        const transform = `matrix(${currentZoom}, 0, 0,  ${1}, ${offset}, ${0})`
        const hue = `hue-rotate(${deg}deg)`
        // brightness(${lightness}%) saturate(${saturation}%)
        //TODO going to need the padding on the left and right
        return ({
            width: originalWidth,
            height: 20,
            // paddingLeft: 10,
            transformOrigin: "top left",
            // translate,
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            filter: hue,
            marginBottom: -6,
            // WebkitMask: `url(${image}) center/contain`,
            // mask:`url(${image}) center/contain`,
            // background: color,
            // WebkitTransform: translate,
        })
    }

    function bunchOfTracks() {

        let numberOfImages = Math.ceil(cap / 1000000)
        let suffix = isDark ? "track_dark" : "track"
        let image = 'files/track_images/' + id + suffix + ".png"
        let imageBunch = 'files/track_images/' + id + suffix
        let fuck = []
        for (let x = 0; x < numberOfImages; x++) {
            fuck.push(
                <img
                    key={id + x + "testing"}
                    src={imageBunch + "_" + x + ".png"}
                    // ref={imageRef}
                    id={id + "imageTrack"}
                    style={trackStyle(offset + ((originalWidth * x) / numberOfImages), zoom / numberOfImages, x)}
                    // className={"actualTrack"}
                    tabIndex={-1}
                    onMouseMove={(e) => {

                        // imageRef.current.focus()
                    }}
                    onWheel={handleScroll}
                    onMouseMove={(e) => {
                        if (dragging) {
                            handlePan(e)
                        }
                        else {
                            hover()
                        }
                    }
                    }
                    onMouseDown={(e) => handleClick(e)}
                    onMouseUp={(e) => handleClick(e)}

                />
            )
        }
        debugger
        return fuck
    }

    function leaveTrack() {
        setHoverName()
        setHoverStyle({ display: "none" })
        setDragging(undefined)
        dispatch(changePreviewVisibility({
            visible: false
        }))
        setCursorStyle({display: "none"})
    }

    let testCursor = {display: "none"}
    if(previewSelector.visible && imageRef.current){
        let left = imageRef.current.x
        let top = imageRef.current.y
        let height = imageRef.current.height
        let verticalScroll = document.documentElement.scrollTop
        let width = imageRef.current.width

        let bpPosition = previewSelector.center

        let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])

        // debugger
        if(xScale(bpPosition) + left + offset < left + width){

            testCursor = {pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + verticalScroll, height: height, backgroundColor: "blue" }
        }
    }


    const handleTooltip = (event) => {
        positionRef.current = { x: event.clientX, y: event.clientY };

        if (popperRef.current != null) {
            popperRef.current.update();
        }
    };
 



    return (
        <>
            <div style={hoverStyle}>{hoverName}</div>
            <div style={testCursor}></div>
            <div style={{ width: '100%', paddingRight: 10 }}>
                {id &&
                    <Typography
                        variant="body1"
                        className={"title"}
                        style={{
                            WebkitUserSelect: 'none',
                            position: 'relative',
                            top: 0,
                            fontWeight: 100,
                            textAlign: 'center',
                            marginLeft: 'auto',
                            marginRight: 0,
                            height: 25,
                            zIndex: 1,
                            pointerEvents: 'none',

                        }}
                    >{"Chromosome: " + id + "-bitmap"}</Typography>}
                <img
                    src={orthologs}
                    id={id + "ortholog_imageTrack"}
                    style={orthologStyle(offset, zoom)}
                />
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
                                imageRef.current.getBoundingClientRect().y,
                                0,
                                0,
                            );
                        },
                    },
                }}
            >

                <img
                    src={image}
                    ref={imageRef}
                    id={id + "imageTrack"}
                    style={trackStyle(offset, zoom)}
                    // className={"actualTrack"}
                    tabIndex={-1}
                    onWheel={handleScroll}
                    onMouseMove={(e) => {
                        if (dragging) {
                            handlePan(e)
                        }
                        else {
                            hover(e)
                            handleTooltip(e)
                        }
                    }
                    }
                    onMouseDown={(e) => handleClick(e)}
                    onMouseUp={(e) => handleClick(e)}
                    onMouseLeave={leaveTrack}

                >
                </img>
            </Tooltip>
                <TrackScale
                    endOfTrack={endCap}
                    startOfTrack={startOfTrack}
                    width={originalWidth}
                    paddingLeft={10}
                    paddingRight={0} />
            </div>
            <TrackControls id={id} height={height} gap={height} />
        </>
    )
}

export default ImageTrack