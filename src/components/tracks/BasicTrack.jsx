import React, { useEffect, useRef, useState, focus } from "react"

import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import Window from "features/miniview/Window";
import { Typography, Stack } from '@mui/material';
import { gene } from './gene.js'
import { panComparison, zoomComparison, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility } from 'features/miniview/miniviewSlice.js'
import { changeZoom, pan, selectBasicTracks, setSelection, clearSelection } from "./basicTrackSlice";
import { Tooltip } from "@mui/material";




const BasicTrack = ({ array, color, doSomething, coordinateX, coordinateY, width, height, id, beginning, fin, grouped, zoom, pastZoom, offset, title, selection, noScale, isDark, ...props }) => {

    const canvasRef = useRef(null)
    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['preview']

    const [endCap, setEndCap] = useState(0)
    const [startOfTrack, setStartOfTrack] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [clickLocation, setClickLocation] = useState()
    const [normalizer, setNormalizer] = useState([1, 1])
    const [drawnGenes, setDrawnGenes] = useState([])

    const [hovered, setHovered] = useState()



    //! Needed for syncing multiple tracks
    const trackSelector = useSelector(selectBasicTracks)

    const magicWidth = 2000;

    useEffect(() => {

        if (array == undefined) return

        let cap;
        fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

        let start;
        beginning ? start = beginning : start = Math.min(...array.map(d => d.start))

        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, magicWidth, ctx.canvas.height)

        let xScale = scaleLinear().domain([0, cap]).range([0, magicWidth * zoom])

        // TODO center the text, and leave a small buffer on each end
        let basePairUnits = (cap / 1000000) > 0 ? [1000000, 'Mb'] : [1000, 'Kb']

        setNormalizer(basePairUnits)

        let scalingIncrements = scaleLinear().domain([0, cap]).range([0, magicWidth * zoom])
        setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
        setEndCap(Math.min(scalingIncrements.invert(magicWidth - offset), cap))

        let widthScale = scaleLinear().domain([0, cap - start]).range([0, magicWidth * zoom])
        let lightnessScale = scaleLinear().domain([0, 100]).range([10, 90])
        ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'


        let holding = [];
        let hoverModifier = isDark ? 50 : -50;
        let density = array[0].value !== undefined


        if (drawnGenes.length === 0) {

            array.forEach(dataPoint => {
                let x = ((xScale(dataPoint.start)) + offset)
                let rectWidth = widthScale(dataPoint.end - dataPoint.start)
                let lightness = density ? lightnessScale(+dataPoint.value) : 50
                let drawGene = new gene(dataPoint, color, +lightness)
                drawGene.create(ctx, x, 0, rectWidth, ctx.canvas.height)
                holding.push(drawGene)
            })
            setDrawnGenes(holding)
        }
        else {
            if (!density) {

                drawnGenes.forEach(drawGene => {
                    let x = ((xScale(drawGene.start)) + offset)
                    let rectWidth = widthScale(drawGene.end - drawGene.start)
                    if (x + rectWidth < 0 || x > magicWidth) {
                        return
                    }
                    if (drawGene.key == selection) {
                        drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, 50 + hoverModifier)
                    }
                    else if (drawGene == hovered) {
                        if (hoverModifier < 0) {
                            drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, 20)
                        }
                        else {
                            drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, 70)
                        }

                    }
                    else {
                        drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, 50)
                    }

                })
            }
            else {

                //TODO change color when checking density
                drawnGenes.forEach(drawGene => {
                    let x = ((xScale(drawGene.start)) + offset)
                    let rectWidth = widthScale(drawGene.end - drawGene.start)
                    if (x + rectWidth < 0 || x > magicWidth) {
                        return
                    }
                    if (drawGene.key == selection) {
                        drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, 50 + hoverModifier)
                    }
                    else if (drawGene == hovered) {
                        if (hoverModifier < 0) {
                            drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, 20)
                        }
                        else {
                            drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, drawGene.lightness)
                        }

                    }
                    else {
                        drawGene.update(ctx, x, 0, rectWidth, ctx.canvas.height, drawGene.lightness)
                    }

                })
            }
        }

    }, [array, color, zoom, offset, drawnGenes, hovered, selection, isDark])

    let style = {
        position: 'relative',
        top: coordinateY,
        left: coordinateX,
        width: width,
        height: height,
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
    }

    // TODO -> does this need to be here?
    const dispatch = useDispatch()

    function handleScroll(e) {
        // e.preventDefault();
        // e.stopPropagation();
        let factor = 0.9
        if (e.deltaY < 0) {
            factor = 1 / factor
        }
        let trackBoundingRectangle = e.target.getBoundingClientRect()
        let padding = parseFloat(getComputedStyle(e.target).paddingLeft)
        let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * magicWidth
        // let normalizedLocation = (e.clientX - (trackBoundingRectangle.left +padding))

        if (previewSelector.boxWidth > magicWidth / 3 && factor > 1.0) {
            factor = 1.0
        }

        dispatch(changeZoom({
            key: id,
            zoom: Math.max(zoom * factor, 1.0)
        }))

        let dx = ((normalizedLocation - offset) * (factor - 1))
        let offsetX = Math.max(Math.min(offset - dx, 0), -((magicWidth * zoom * factor) - magicWidth))
        if (Math.max(zoom * factor, 1.0) == 1.0) offsetX = 0

        dispatch(pan({
            key: id,
            offset: offsetX
        }))
        dispatch(panComparison({
            key: id,
            offset: offsetX,
            zoom: Math.max(zoom * factor, 1.0),
            width: magicWidth,
            ratio: magicWidth / e.target.clientWidth,
            left: trackBoundingRectangle.left + padding,
            realWidth: trackBoundingRectangle.width - (2 * padding),
            factor: factor
        }))
        showPreview(e)
    }

    function handlePan(e) {

        //! Little off due to rounding error
        let trackBoundingRectangle = e.target.getBoundingClientRect()
        let padding = parseFloat(getComputedStyle(e.target).paddingLeft)
        let dx = e.movementX * (magicWidth / e.target.clientWidth)
        let offsetX = Math.max(Math.min(offset + e.movementX, 0), -((magicWidth * zoom) - magicWidth))

        let westEnd = trackBoundingRectangle.x
        let eastEnd = trackBoundingRectangle.width + westEnd

        dispatch(pan({
            key: id,
            offset: offsetX,
        }))
        dispatch(moveMiniview(
            {
                key: 'preview',
                coordinateX: Math.max(westEnd + 80, Math.min(eastEnd - previewSelector.width - 80, e.clientX - previewSelector.width / 2)),
                coordinateY: trackBoundingRectangle.y + trackBoundingRectangle.height + 5,
                // viewFinderY: boundingBox.y + verticalScroll,
                viewFinderX: e.clientX
            }))
        dx = (e.movementX / magicWidth) * trackBoundingRectangle.width
        offsetX = Math.max(Math.min(offset + dx, 0), -((magicWidth * zoom) - magicWidth))

        // Going to need to find the padding
        let testOffset = Math.max(-(magicWidth * zoom - magicWidth), Math.min(offset - dx, 0))

        dispatch(panComparison({
            key: id,
            offset: offsetX,
            zoom: Math.max(zoom, 1.0),
            width: magicWidth,
            ratio: magicWidth / e.target.clientWidth,
            left: trackBoundingRectangle.left + padding,
            realWidth: trackBoundingRectangle.width - (2 * padding),
            factor: 1.0
        }))
    }

    function showPreview(event) {

        let boundingBox = event.target.getBoundingClientRect()
        let verticalScroll = document.documentElement.scrollTop

        let westEnd = boundingBox.x
        let eastEnd = boundingBox.x + boundingBox.width


        let changedX = Math.min(Math.max(event.pageX, westEnd), eastEnd)
        let changedY = boundingBox.y + boundingBox.height + 5 + verticalScroll

        // Would give weird scaling if the array was movable
        let cap;
        fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

        let start;
        beginning ? start = beginning : start = Math.min(...array.map(d => d.start))


        let xScale = scaleLinear().domain([startOfTrack, endCap]).range([westEnd, eastEnd])
        let widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, eastEnd - westEnd])

        let center = xScale.invert(changedX)
        let head = Math.max(center - 50000, startOfTrack)
        let end = Math.min(center + 50000, endCap)
        if (head == startOfTrack) {
            changedX = xScale(startOfTrack + 50000)
            end = startOfTrack + 100000
        }
        else if (end == endCap) {
            changedX = xScale(endCap - 50000)
            head = endCap - 100000
        }

        let width = widthScale(end - head)

        let previewArray = array.filter(item => {
            return ((item.end >= head && item.start <= head) || (item.start >= head && item.end <= end) || (item.start <= end && item.end >= end))
        })

        // TODO This is a lot of events, no?
        dispatch(changeMiniviewColor({
            key: 'preview',
            color: color
        }))
        dispatch(updateData({
            key: 'preview',
            array: previewArray,
            start: head,
            end: end,
            boxWidth: width,
        }))
        dispatch(moveMiniview(
            {
                key: 'preview',
                coordinateX: Math.max(westEnd + 80, Math.min(eastEnd - previewSelector.width - 80, changedX - previewSelector.width / 2)),
                coordinateY: changedY,
                viewFinderY: boundingBox.y + verticalScroll,
                viewFinderX: changedX
            }))
        dispatch(changeMiniviewVisibility(
            {
                key: 'preview',
                visible: true
            }))

        Math.round(beginning)

    }


    function handleClick(e) {
        if (e.type == 'mousedown') {
            setDragging(true)
            setClickLocation(e.clientX - e.target.offsetLeft)
        }
        if (e.type == 'mouseup') {
            setDragging(false)
            if (e.clientX - e.target.offsetLeft == clickLocation) {
                if (e.altKey == true) {
                    doSomething(e)
                    setClickLocation(null)
                    return
                }
                let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * magicWidth

                let found = false
                drawnGenes.forEach(x => {
                    if (x.hovering(normalizedLocation)) {
                        setSelection(x)
                        console.log(x)
                        dispatch(setSelection({
                            key: id,
                            selection: x.key,
                        }))
                        found = true;
                        //! Proof of concept following gene
                        let index;
                        let trackID;
                        let details;
                        let chromosome;
                        let matched;
                        if (x.siblings != 0 && x.siblings.length > 0) {
                            for (const [key, value] of Object.entries(trackSelector)) {
                                index = value.array.findIndex((d) => { return d.key.toLowerCase() == x.siblings[0].toLowerCase() })
                                details = value.array[index]
                                chromosome = value.array
                                trackID = key
                                matched = true
                                break  // just finding the first ortholog as a proof of concept  
                            }

                            if (matched == true && index > -1) {

                                let cap = Math.max(...chromosome.map(d => d.end))

                                let ratio = details.start / cap

                                // Should almost certainly use a web worker for this
                                let relatedWidthScale = scaleLinear().domain([0, cap]).range([0, magicWidth])
                                let calculatedZoom = x.width / relatedWidthScale(details.end - details.start) //the size of the ortholog


                                // Aligning related tracks with the selected block
                                dispatch(changeZoom({
                                    key: trackID,
                                    zoom: calculatedZoom
                                }))
                                dispatch(setSelection({
                                    key: trackID,
                                    selection: details.key
                                }))
                                dispatch(pan({
                                    key: trackID,
                                    offset: -(ratio * magicWidth * calculatedZoom) + x.coordinateX
                                }))
                            }

                        }
                    }
                })
                if (found == false) {
                    dispatch(clearSelection({
                        key: id,
                    }))
                }

            }
            setClickLocation(null)
        }
    }

    let cap;
    fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

    // debugger


    //! TODO Changing length of text changes the location of ticks
    return (
        <div className="test" style={{ width: '100%', height: '100%' }}>
            {/* <Tooltip
                title={'hovered.key'}
                arrow
                placement='top'> */}
                {/*TODO  Calculate the actual width here*/}
            {title &&
                <Typography
                    className={"title"}
                    style={{
                        position: 'relative',
                        top: 0,
                        // left: 0,
                        marginLeft: 'auto',
                        marginRight: 0,
                        width: 40,
                        height: '0%',
                        zIndex: 2,
                        pointerEvents: 'none',
                        background: 'red',
                    }}
                >{title}</Typography>}
            <canvas
                tabIndex={-1}
                id={id}
                ref={canvasRef}
                className='miniview'
                width={magicWidth}
                height='1000'
                style={style}
                onContextMenu={doSomething}
                onMouseDown={(e) => handleClick(e)}
                onMouseUp={(e) => handleClick(e)}
                onMouseMove={(e) => {
                    if (dragging) {
                        handlePan(e)
                    }
                    else {
                        let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * magicWidth

                        let found = false
                        drawnGenes.forEach(x => {
                            if (x.hovering(normalizedLocation)) {
                                setHovered(x)
                                found = true
                            }
                        })
                        if (found == false) {
                            setHovered()
                        }
                        canvasRef.current.focus()
                        showPreview(e)
                    }

                }}
                onMouseLeave={() => {
                    dispatch(changeMiniviewVisibility({
                        key: 'preview',
                        visible: false
                    })
                    )
                    setHovered()
                }
                }
                onWheelCapture={(e) => handleScroll(e)}
                {...props} />
            {!noScale && <div className='scale' style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                <div width='2000' style={{ border: 'solid 1px', marginTop: -8, paddingLeft: '6 rem', paddingRight: '0.5rem', }} />
                <Stack direction='row' justifyContent="space-between" className="scale">
                    <div style={{ borderLeft: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(startOfTrack / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round((2 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'right' }} >{Math.round((3 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'left' }} >{Math.round((4 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endCap - startOfTrack) + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                </Stack>
            </div>
            }
            {/* </Tooltip> */}

        </div>
    )
}

BasicTrack.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: '100%',
    height: '75%',
    zoom: 1.0,
    pastZoom: 1.0,
    offset: 0,
}


export default BasicTrack
