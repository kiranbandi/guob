import React, { useEffect, useRef, useState, focus } from "react"
import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import { Typography, Stack } from '@mui/material';
import { gene } from './gene.js'
import { panComparison, zoomComparison, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility } from 'features/miniview/miniviewSlice.js'
import { changeZoom, pan, selectBasicTracks, setSelection, clearSelection } from "./basicTrackSlice";
import { line } from 'd3-shape';


/* Information flows from the basicTrackSlice to here through props, adjusting the slice adjusts the track
*/
const BasicTrack = ({ array, color, trackType = 'default', normalizedLength = 0, doSomething, coordinateX, coordinateY, width, height, id, beginning, fin, grouped, zoom, pastZoom, offset, title, selection, noScale, isDark, normalize, ...props }) => {

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

    // If a parent wrapper exists get its dimensions and use 75% of that for the canvas height
    // the rest will be used for the scale 
    // If no height is present default to 100 pixel tall tracks
    // TODO the scale height needs to a static value and not 25% so the following calculation should be updated
    let parentWrapperHeight = document.querySelector('.draggable')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width;

    let style = {
        position: 'relative',
        top: coordinateY,
        left: coordinateX
    }

    const maxWidth = parentWrapperWidth ? Math.round(parentWrapperWidth * 0.98) : width,
        maxHeight = parentWrapperHeight ? parentWrapperHeight - 25 : height;


    useEffect(() => {
        canvasRef.current.addEventListener('wheel', preventScroll, { passive: false });
        // if alt key is pressed then stop the event 
        function preventScroll(e) {
            if (e.altKey == true) {
                e.preventDefault();
                // e.stopPropagation();
                return false;
            }
        }
    }, [])

    // Hacky fix to trigger re-render when the color scheme changes - otherwise the drawn genes
    // keep the old palette
    useEffect(() => {
        setDrawnGenes([])
    }, [isDark])

    useEffect(() => {

        if (!array) return

        let cap = normalize ? normalizedLength : Math.max(...array.map(d => d.end))

        let start = Math.min(...array.map(d => d.start))

        const ctx = canvasRef.current.getContext('2d')

        ctx.clearRect(0, 0, maxWidth, maxHeight)

        const paddingRight = 10, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;
        let xScale = scaleLinear().domain([0, cap]).range([paddingLeft, (maxWidth * zoom) - paddingRight])

        // TODO center the text, and leave a small buffer on each end
        let basePairUnits = (cap / 1000000) > 0 ? [1000000, 'Mb'] : [1000, 'Kb']

        setNormalizer(basePairUnits)

        let scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth * zoom])
        setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
        setEndCap(Math.min(scalingIncrements.invert(maxWidth - offset), cap))

        let widthScale = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])
        let minValue = 0, maxValue = 100;

        // Deal with color palette switch in dark mode;
        let zeroColor = isDark ? '#121212' : '#ffffff';

        let dynamicColorScale = ['heatmap', 'histogram', 'scatter'].indexOf(trackType) > -1 ? scaleLinear().domain([minValue, maxValue]).range([zeroColor, color]) : false;
        let yScale = ['histogram', 'scatter', 'line'].indexOf(trackType) > -1 ? scaleLinear().domain([0, maxValue]).range([paddingTop, maxHeight - paddingBottom]) : () => maxHeight;

        if (drawnGenes.length === 0) {

            if (trackType == 'line') {
                let pathArray = array.map(dataPoint => {
                    let x = ((xScale(dataPoint.start)) + offset),
                        y = maxHeight - yScale(dataPoint.value);
                    return [x, y];
                });
                let lineFunction = line().context(ctx);
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.fillStyle = zeroColor;
                lineFunction(pathArray);
                ctx.fill();
                ctx.stroke();
                setDrawnGenes([...array]);
            }

            else {
                let holding = array.map(dataPoint => {
                    let x = ((xScale(dataPoint.start)) + offset)
                    let adjustedColor = dynamicColorScale ? dynamicColorScale(dataPoint.value) : color
                    let rectWidth = widthScale(dataPoint.end - dataPoint.start)
                    let drawGene = new gene(dataPoint, adjustedColor, trackType)
                    drawGene.draw(ctx, x, maxHeight - yScale(dataPoint.value), rectWidth, yScale(dataPoint.value))
                    return drawGene;
                })
                setDrawnGenes(holding)
            }

        }
        else {

            if (trackType == 'line') {

                let pathArray = [];
                array.map(dataPoint => {
                    let x = ((xScale(dataPoint.start)) + offset),
                        y = maxHeight - yScale(dataPoint.value);

                    let rectWidth = widthScale(dataPoint.end - dataPoint.start)

                    if (x + rectWidth < 0 || x > maxWidth) {
                        return
                    }
                    pathArray.push([x, y]);
                });

                let lineFunction = line().context(ctx);
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.fillStyle = "rgba(255,255,255, 0)"
                lineFunction(pathArray);
                ctx.fill();
                ctx.stroke();
            }

            else {
                drawnGenes.forEach(drawGene => {
                    let x = ((xScale(drawGene.start)) + offset)
                    let rectWidth = widthScale(drawGene.end - drawGene.start)
                    if (x + rectWidth < 0 || x > maxWidth) {
                        return
                    }
                    drawGene.draw(ctx, x, maxHeight - yScale(drawGene.value), rectWidth, yScale(drawGene.value));
                })
            }

        }

    }, [array, color, zoom, offset, drawnGenes, hovered, selection, normalize, parentWrapperHeight])



    const dispatch = useDispatch()



    function buildGTEvent(e) {
        let altKey = e.altKey;
        let deltaY = e.deltaY;
        let trackBoundingRectangle = e.target.getBoundingClientRect()
        let padding = parseFloat(getComputedStyle(e.target).paddingLeft)
        let clientX = e.clientX
        let targetOffsetLeft = e.target.offsetLeft;
        let targetOffsetWidth = e.target.offsetWidth;
        let pageX = e.pageX;

        let left = e.target.offsetLeft
        let width = e.target.offsetWidth
        let event = {
            altKey,
            deltaY,
            trackBoundingRectangle,
            padding,
            clientX,
            target: {
                offsetLeft: left,
                offsetWidth: width,
                id: e.target.id
            },
            pageX
        };
        return event
    }


    let [waiting, setWaiting] = useState()
    function updateTimer() {
        let gt = window.gt;
        clearTimeout(waiting)
        setWaiting(window.setTimeout(() => {
            let trackInfo = {
                id: id,
                ratio: trackSelector[id].offset / maxWidth,
                zoom: trackSelector[id].zoom
            }
            gt.updateState({ Action: "handleTrackUpdate", trackInfo })
        }, 200))
    }

    function handleScroll(e) {

        // TODO - Event not being prevented from bubbling
        // e.preventDefault();
        // e.stopPropagation()
        if (e.target.id !== id) {
            return
        }
        if (e.altKey == true) {

            if(window.gt) updateTimer()

            let factor = 0.9
            if (e.deltaY < 0) {
                factor = 1 / factor
            }

              // Finding important markers of the track, since it's often in a container
              let trackBoundingRectangle = e.target.getBoundingClientRect()
              let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

            // Finding the location of the mouse on the track, the rendered track is adjusted with css,
            // so the mouse location needs to be normalized to the canvas
            let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * maxWidth

            // Arbitrarily decided that if the preview window is 1/3 of the entire track, it's likely zoomed in enough
            if (previewSelector.boxWidth > maxWidth / 3 && factor > 1.0) {
                factor = 1.0
            }

            dispatch(changeZoom({
                key: id,
                zoom: Math.max(zoom * factor, 1.0)
            }))

            //  Needs to be panned so that the zoom location remains the same
            let dx = ((normalizedLocation - offset) * (factor - 1))
            let offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * zoom * factor) - maxWidth))
            if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0

            dispatch(pan({
                key: id,
                offset: offsetX
            }))
            dispatch(panComparison({
                key: id,
                offset: offsetX + trackBoundingRectangle.x,
                zoom: Math.max(zoom * factor, 1.0),
                width: maxWidth,
                ratio: maxWidth / e.target.clientWidth,
                left: trackBoundingRectangle.left,
                realWidth: trackBoundingRectangle.width - (2 * 10),
                factor: factor
            }))


            showPreview(e)
        }
    }


    //TODO Normalizing the tracks leads to the ability to pan off the edge of the track - need to fix
    function handlePan(e) {
        // debugger

        if(window.gt) updateTimer()
        // Finding important markers of the track, since it's often in a container
        debugger
        
        // Finding important markers of the track, since it's often in a container
        let trackBoundingRectangle = e.target.getBoundingClientRect()
        let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

        // Finding the offset
        let dx = e.movementX * (maxWidth / e.targetClientWidth)
        let offsetX = Math.max(Math.min(offset + e.movementX, 0), -((maxWidth * zoom) - maxWidth))

        // Either end of the track
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
                viewFinderX: e.clientX
            }))

        /* Re-declaring these, because the track is adjusted from 2000px to the screen by css,
        but comparison windows use absolute values. So the dx and offset need to be adjust to whatever
        the css has made the track, not the maxWidth that the rest of the track can use.
        */
        dx = (e.movementX / maxWidth) * trackBoundingRectangle.width
        offsetX = Math.max(Math.min(offset + dx, 0), -((maxWidth * zoom) - maxWidth))

        // debugger
        //! The comparison window location is a slightly off due to rounding error(?) or bad math
        dispatch(panComparison({
            key: id,
            offset: offsetX,
            zoom: Math.max(zoom, 1.0),
            width: maxWidth,
            ratio: 1.0,
            left: trackBoundingRectangle.left + padding,
            realWidth: trackBoundingRectangle.width - (2 * padding),
            factor: 1.0
        }))
    }

    

    function showPreview(event) {
        if (trackType !== "default") return
        let boundingBox = event.target.getBoundingClientRect()
        let verticalScroll = document.documentElement.scrollTop

        let westEnd = boundingBox.x
        let eastEnd = boundingBox.x + boundingBox.width

        let changedX = Math.min(Math.max(event.pageX, westEnd), eastEnd)
        let changedY = boundingBox.y + boundingBox.height + 5 + verticalScroll

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
            setClickLocation(e.clientX - e.targetOffsetLeft)
        }
        if (e.type == 'mouseup') {
            setDragging(false)
            if (e.clientX - e.targetOffsetLeft == clickLocation) {
                if (e.altKey == true) {
                    doSomething(e)
                    setClickLocation(null)
                    return
                }
                let normalizedLocation = ((e.clientX - e.targetOffsetLeft) / e.targetOffsetWidth) * maxWidth

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
                        let orthologInformation;
                        let orthologChromosome;
                        let matched;
                        // Iterating through the tracks with an ortholog
                        if (x.siblings != 0 && x.siblings.length > 0) {
                            for (const [key, value] of Object.entries(trackSelector)) {
                                index = value.array.findIndex((d) => { return d.key.toLowerCase() == x.siblings[0].toLowerCase() })
                                orthologInformation = value.array[index]
                                orthologChromosome = value.array
                                trackID = key
                                matched = true
                                break  // just finding the first ortholog as a proof of concept  
                            }

                            if (matched == true && index > -1) {


                                let orthologCap = Math.max(...orthologChromosome.map(d => d.end))

                                // Location of the ortholog 
                                let ratio = orthologInformation.start / orthologCap

                                // Should almost certainly use a web worker for this
                                let relatedWidthScale = scaleLinear().domain([0, orthologCap]).range([0, maxWidth])
                                let calculatedZoom = x.width / relatedWidthScale(orthologInformation.end - orthologInformation.start) //the size of the ortholog

                                // Aligning related tracks with the selected block
                                dispatch(changeZoom({
                                    key: trackID,
                                    zoom: calculatedZoom
                                }))
                                dispatch(setSelection({
                                    key: trackID,
                                    selection: orthologInformation.key
                                }))
                                dispatch(pan({
                                    key: trackID,
                                    offset: -(ratio * maxWidth * calculatedZoom) + x.coordinateX
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


    function updateTrack(event) {
        dispatch(changeZoom({
            key: event.id,
            zoom: event.zoom
        }))

        dispatch(pan({
            key: event.id,
            offset: event.ratio * maxWidth
        }))
    }

    if (window.gt) {
        window.gt.on('state_updated_reliable', (userID, payload) => {

            // TODO this feels like a hacky way of doing this
            if (userID === document.title) return
            // if (payload.Action == "handleBTClick") {
            //     handleClick(payload.event)
            // }
            if (payload.Action == "handleTrackUpdate") {
                if (payload.trackInfo.id !== id) return
                updateTrack(payload.trackInfo)
            }


        })


    }


    //! TODO Changing length of text changes the location of ticks
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {title &&
                <Typography
                    className={"title"}
                    style={{
                        position: 'relative',
                        top: 0,
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
                height={maxHeight}
                width={maxWidth}
                className='miniview'
                style={style}
                onContextMenu={doSomething}
                onMouseDown={(e) => handleClick(e)}
                onMouseUp={(e) => handleClick(e)}
                onMouseMove={(e) => {
                    if (dragging) {
                        handlePan(e)
                    }
                    else {
                        if (trackType !== "default") return
                        let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * maxWidth

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
                    setDragging()
                }
                }
                onWheel={handleScroll}
                {...props} />
            {!noScale && <div className='scale' style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                <div width='2000' style={{ border: 'solid 1px', marginTop: -5 }} />
                <Stack direction='row' justifyContent="space-between" className="scale">
                    <div style={{ borderLeft: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(startOfTrack / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round((2 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'right' }} >{Math.round((3 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'left' }} >{Math.round((4 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endCap - startOfTrack) + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                </Stack>
            </div>}

        </div>
    )
}

BasicTrack.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: 500,
    height: 100,
    zoom: 1.0,
    pastZoom: 1.0,
    offset: 0,
}


export default BasicTrack
