import React, { useEffect, useRef, useState, focus } from "react"
import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import { Typography, Stack, Tooltip } from '@mui/material';
import { gene } from './gene.js'
import { panComparison, zoomComparison, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility, movePreview, changePreviewVisibility, updatePreview, selectComparison } from 'features/miniview/miniviewSlice.js'
import { changeZoom, pan, selectBasicTracks, setSelection, clearSelection, updateTrack } from "./basicTrackSlice";
import { addAnnotation, selectAnnotations, selectSearch } from "features/annotation/annotationSlice";
import { line } from 'd3-shape';
import Window from "features/miniview/Window.js";
import { selectDraggables } from "features/draggable/draggableSlice.js";

/* Information flows from the basicTrackSlice to here through props, adjusting the slice adjusts the track
*/
const BasicTrack = ({ array, color, trackType = 'default', normalizedLength = 0, doSomething, coordinateX, coordinateY, width, height, id, beginning, fin, grouped, zoom, pastZoom, offset, title, selection, noScale, isDark, normalize, ...props }) => {

    const canvasRef = useRef(null)
    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['newPreview']
    const collabPreviews = useSelector(selectMiniviews)
    const comparisonSelector = useSelector(selectComparison)[title]

    const [endCap, setEndCap] = useState(0)
    const [startOfTrack, setStartOfTrack] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [clickLocation, setClickLocation] = useState()
    const [normalizer, setNormalizer] = useState([1, 1])
    const [drawnGenes, setDrawnGenes] = useState([])
    const [start, setStart] = useState(0)
    const [cap, setCap] = useState(0)
    const [hovered, setHovered] = useState()


    //! Needed for syncing multiple tracks
    const trackSelector = useSelector(selectBasicTracks)
    const order = useSelector(selectDraggables)
    const annotationSelector = useSelector(selectAnnotations)[id]
    const searchSelector = useSelector(selectSearch)[id]


    // If a parent wrapper exists get its dimensions and use 75% of that for the canvas height
    // the rest will be used for the scale 
    // If no height is present default to 100 pixel tall tracks
    // TODO the scale height needs to a static value and not 25% so the following calculation should be updated
    let parentWrapperHeight = document.querySelector('.draggableItem')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width;

    const paddingRight = 10, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;

    let style = {
        position: 'relative',
        top: coordinateY,
        left: coordinateX
    }

    const maxWidth = parentWrapperWidth ? Math.round(parentWrapperWidth) : width,
        maxHeight = parentWrapperHeight ? (parentWrapperHeight - 25 - 25) : height;


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

    const [ annotationY, setAnnotationY ] = useState()
    useEffect(() => {
        setAnnotationY(canvasRef.current.offsetTop)
    }, [order])

    // Hacky fix to trigger re-render when the color scheme changes - otherwise the drawn genes
    // keep the old palette
    useEffect(() => {
        setDrawnGenes([])
    }, [isDark, normalize, maxWidth])

    useEffect(() => {

        if (!array) return

        normalize ? setCap(normalizedLength) : setCap(Math.max(...array.map(d => d.end)))

        setStart(Math.min(...array.map(d => d.start)))

        const ctx = canvasRef.current.getContext('2d')

        ctx.clearRect(0, 0, maxWidth, maxHeight)


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

        setAnnotationY(canvasRef.current.offsetTop)
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
                    if (x + rectWidth < 10 || x > maxWidth - 10) {
                        return
                    }
                    if (hovered && drawGene.key === hovered.key) {
                        drawGene.highlight(ctx, x, maxHeight - yScale(drawGene.value), rectWidth, yScale(drawGene.value))
                    }
                    else {
                        drawGene.draw(ctx, x, maxHeight - yScale(drawGene.value), rectWidth, yScale(drawGene.value));
                    }
                })
            }

        }
    }, [array, color, zoom, offset, drawnGenes, hovered, selection, normalize, parentWrapperHeight])


    const gt = window.gt;
    const dispatch = useDispatch()

    let [waiting, setWaiting] = useState()
    function updateTimer(id, ratio, zoom) {
        clearTimeout(waiting)
        setWaiting(window.setTimeout(() => {
            let trackInfo = {
                id: id,
                ratio: ratio,
                zoom: zoom
            }
            gt.updateState({ Action: "handleTrackUpdate", trackInfo })
        }, 80))
    }

    function handleScroll(e) {

        // TODO - Event not being prevented from bubbling
        // e.preventDefault();
        // e.stopPropagation()
        if (e.target.id !== id) {
            return
        }
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
            let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * maxWidth

            // Arbitrarily decided that if the preview window is 1/3 of the entire track, it's likely zoomed in enough
            if (previewSelector.boxWidth > maxWidth / 3 && factor > 1.0) {
                factor = 1.0
            }

            //  Needs to be panned so that the zoom location remains the same
            let dx = ((normalizedLocation - offset) * (factor - 1))
            let offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * zoom * factor) - maxWidth))
            if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0


            dispatch(updateTrack({
                key: id,
                offset: offsetX,
                zoom: Math.max(zoom * factor, 1.0)
            }))


            if (gt) updateTimer(id, offsetX / maxWidth, Math.max(zoom * factor, 1.0))
            showPreview(e)
        }
    }


    //TODO Normalizing the tracks leads to the ability to pan off the edge of the track - need to fix
    function handlePan(e) {

        // Finding important markers of the track, since it's often in a container
        let trackBoundingRectangle = e.target.getBoundingClientRect()
        let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

        // Finding the offset
        let dx = e.movementX * (maxWidth / e.targetClientWidth)
        let offsetX = Math.max(Math.min(offset + e.movementX, 0), -((maxWidth * zoom) - maxWidth))

        // Either end of the track
        let westEnd = trackBoundingRectangle.x
        let eastEnd = westEnd + maxWidth

        dispatch(updateTrack({
            key: id,
            offset: offsetX,
            zoom: zoom
        }))
        if (gt) updateTimer(id, offsetX / maxWidth, zoom)
        dispatch(moveMiniview(
            {
                key: 'newPreview',
                coordinateX: Math.max(westEnd + 80, Math.min(eastEnd - previewSelector.width - 80, e.clientX - previewSelector.width / 2)),
                coordinateY: trackBoundingRectangle.y + trackBoundingRectangle.height + 5,
                viewFinderX: e.clientX
            }))


    }



    function showPreview(event) {
       
        let boundingBox = event.target.getBoundingClientRect()
        let verticalScroll = document.documentElement.scrollTop

        let westEnd = boundingBox.x + paddingLeft
        let eastEnd = boundingBox.x + boundingBox.width - paddingRight
        if (event.pageX < westEnd || event.pageX > eastEnd) {
            dispatch(changePreviewVisibility(
                {
                    visible: false
                }))
            return
        }

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
        let coordinateX = trackType === "default" ? Math.max(westEnd + 80, Math.min(eastEnd - previewSelector.width - 80, changedX - previewSelector.width / 2)) : changedX - previewSelector.width / 2

        // TODO This is a lot of events, no?
        dispatch(changeMiniviewColor({
            key: 'newPreview',
            color: color
        }))

        dispatch(updatePreview({
            track: id,
            trackType: trackType,
            cap: cap,
        }))
        dispatch(movePreview(
            {
                coordinateX: coordinateX,
                coordinateY: changedY,
                viewFinderY: boundingBox.y + verticalScroll,
                viewFinderX: changedX,
                viewFinderWidth: width,
                center: center
            }))
        dispatch(changePreviewVisibility(
            {
                visible: true
            }))

        Math.round(beginning)

    }


    function newAnnotation() {
        let note = prompt("Enter a message: ")

        let annotation = {
            key: id,
            note,
            location: previewSelector.center
        }

        dispatch(addAnnotation(annotation))

        if (gt) {
            gt.updateState({ Action: "handleAnnotation", annotation })
        }
    }

    function handleClick(e) {
        if (e.type == 'mousedown') {
            setDragging(true)
            setClickLocation(e.clientX - e.target.offsetLeft)
        }
        if (e.type == 'mouseup') {
            setDragging(false)
            if (e.clientX - e.target.offsetLeft == clickLocation) {
                if (e.altKey) {
                    doSomething(e)
                    setClickLocation(null)
                    return
                }
                if (e.shiftKey) {
                    newAnnotation()
                    setClickLocation(null)
                    return
                }
                let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * maxWidth


                let found = false
                drawnGenes.forEach(x => {
                    if (x.hovering(normalizedLocation)) {
                        setSelection(x)
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

    let viewFinderScale = undefined
    let viewFinderWidth = undefined
    let x = 0
    let previewWidth = 0

    if (previewSelector.visible) {

        viewFinderScale = scaleLinear().domain([startOfTrack, endCap]).range([canvasRef.current.offsetLeft + paddingLeft, canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight])
        viewFinderWidth = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])
        x = viewFinderScale(previewSelector.center)
        previewWidth = viewFinderWidth(100000)

        if (x - previewWidth / 2 < canvasRef.current.offsetLeft + paddingLeft) {
            let difference = (x - previewWidth / 2) - (canvasRef.current.offsetLeft + paddingLeft)
            previewWidth += difference * 2
        }
        else if (x + previewWidth / 2 > canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight) {
            let difference = canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight - (x + previewWidth / 2)
            previewWidth += difference * 2
        }

    }


    let info

    //! TODO Changing length of text changes the location of ticks
    if (trackType === "default") {
        let orthologInfo = (hovered && hovered.siblings.length > 0) ? hovered.siblings : "No orthologs."
        info = hovered ? hovered.key.toUpperCase() + "\nStart Location: " + hovered.start + " bp\nOrhologs: " + orthologInfo : ''
    }
    else {
        info = hovered ? hovered.key.toUpperCase() + "\nStart Location: " + hovered.start + " bp\nEnd Location: " + hovered.end + "\nValue: " + hovered.value : ''
    }

    const positionRef = React.useRef({
        x: 0,
        y: 0,
    });
    const popperRef = React.useRef(null);

    const handleMouseMove = (event) => {
        positionRef.current = { x: event.clientX, y: event.clientY };

        if (popperRef.current != null) {
            popperRef.current.update();
        }
    };


    let trackTitle = trackType === 'default' ? "Chromosome: " + title + ", Gene Density Track" : "Chromosome: " + title.toUpperCase() + ", Methylation Track"

    let locationScale = scaleLinear().domain([0, cap]).range([paddingLeft, (maxWidth * zoom) - paddingRight])
    let wScale = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {title &&
                <Typography
                    variant="h6"
                    alignJustify
                    className={"title"}
                    style={{
                        WebkitUserSelect: 'none',
                        position: 'relative',
                        top: 0,
                        // justify: 'center',
                        marginLeft: 'auto',
                        marginRight: 0,
                        width: '60%',
                        height: 25,
                        zIndex: 1,
                        pointerEvents: 'none',

                    }}
                >{trackTitle}</Typography>}

            {previewSelector.visible && Object.keys(collabPreviews).map(item => {
                let collabX = viewFinderScale(collabPreviews[item].center)
                
                let collabWidth = trackType == 'default' ? viewFinderWidth(100000) : 1

                if(collabX >= canvasRef.current.offsetLeft &&
                    previewWidth > 0) 
                    return(
                    <Window
                        key={item}
                        coordinateX={collabX}
                        coordinateY={canvasRef.current.offsetTop}
                        height={canvasRef.current.offsetHeight + 2}
                        width={collabWidth} // boxwidth
                        preview={id == 'preview' ? false : true}
                        text={Math.max(Math.round(beginning), 0)}
                        grouped={grouped}
                    />
                    )
            })
            }

            {previewSelector.visible && comparisonSelector &&
                comparisonSelector.map(comparison => {
                    let x = locationScale(comparison.center) + offset + canvasRef.current.offsetLeft + 3
                    let width = viewFinderWidth(comparison.end - comparison.start)
                    let start = viewFinderScale(comparison.start) + offset + canvasRef.current.offsetLeft

                    if (width > 0 && start + width < canvasRef.current.offsetLeft + maxWidth) {

                        return (
                            <Window
                                key={comparison.key}
                                coordinateX={x}
                                coordinateY={canvasRef.current.offsetTop}
                                height={canvasRef.current.offsetHeight + 2}
                                width={width} // boxwidth
                                preview={true}
                                text={Math.max(Math.round(beginning), 0)}
                                grouped={grouped}
                                label={title.toUpperCase() + "-" + comparison.key}
                            />
                        )
                    }
                })
            }
            {
                annotationSelector && annotationSelector.map(note => {
                    let x = locationScale(note.location) + offset + canvasRef.current.offsetLeft + 3
                    if (x > canvasRef.current.offsetLeft && x < canvasRef.current.offsetLeft + maxWidth) {
                        return (
                            <Window
                                coordinateX={x}
                                coordinateY={annotationY}
                                height={canvasRef.current.offsetHeight + 2}
                                width={2} // boxwidth
                                preview={true}
                                text={Math.max(Math.round(beginning), 0)}
                                grouped={grouped}
                                label={note.note}
                            />)

                    }
                })
            }

            {
                searchSelector && searchSelector.map(note => {
                    let x = locationScale(note.location) + offset + canvasRef.current.offsetLeft + 3
                    if (x > canvasRef.current.offsetLeft && x < canvasRef.current.offsetLeft + maxWidth) {
                        return (
                            <Window
                                key={note.id + x}
                                coordinateX={x}
                                coordinateY={annotationY}
                                height={canvasRef.current.offsetHeight + 2}
                                width={2} // boxwidth
                                preview={true}
                                text={Math.max(Math.round(beginning), 0)}
                                grouped={grouped}
                                label={note.note}
                            />)

                    }
                })
            }

            <Tooltip
                title={info.length > 0 ? <Typography
                    variant="caption"
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {info}
                </Typography> : ''}
                arrow
                placement='top'
                zoom
                PopperProps={{
                    popperRef,
                    anchorEl: {
                        getBoundingClientRect: () => {
                            return new DOMRect(
                                positionRef.current.x,
                                canvasRef.current.getBoundingClientRect().y,
                                0,
                                0,
                            );
                        },
                    },
                }}
            >
                <canvas
                    tabIndex={-1}
                    id={id}
                    ref={canvasRef}
                    height={maxHeight}
                    width={maxWidth}
                    className='track'
                    style={style}
                    onContextMenu={doSomething}
                    onMouseDown={(e) => handleClick(e)}
                    onMouseUp={(e) => handleClick(e)}
                    onMouseMove={(e) => {
                        if (dragging) {
                            handlePan(e)
                        }
                        else {
                            // if(trackType !== "default") return
                            let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * maxWidth

                            let found = false
                            if (trackType !== "line") {

                                drawnGenes.forEach(x => {
                                    if (x.hovering(normalizedLocation)) {
                                        setHovered(x)
                                        found = true
                                    }
                                })
                                if (found == false) {
                                    setHovered()
                                }
                            }
                            canvasRef.current.focus()
                            showPreview(e)
                            handleMouseMove(e)
                        }

                    }}
                    onMouseLeave={() => {
                        setHovered(undefined)
                        dispatch(changePreviewVisibility({
                            visible: false
                        })
                        )
                        setDragging(false)
                    }
                    }
                    onWheel={handleScroll}
                    {...props} />
            </Tooltip>

            {!noScale && <div className='scale' style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                <div width='2000' style={{ border: 'solid 1px', marginTop: -5 }} />
                <Stack direction='row' justifyContent="space-between" className="scale">
                    <div style={{ WebkitUserSelect: 'none', borderLeft: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(startOfTrack / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round((2 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'right' }} >{Math.round((3 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'left' }} >{Math.round((4 * (endCap - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endCap - startOfTrack) + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
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
