import React, { useEffect, useRef, useState, focus } from "react"
import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import { Typography, Stack, Tooltip } from '@mui/material';
import { gene } from './gene.js'
import { panComparison, zoomComparison, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility, movePreview, changePreviewVisibility, updatePreview, selectComparison } from 'features/miniview/miniviewSlice.js'
import { changeZoom, pan, selectBasicTracks, setSelection, clearSelection, updateTrack, addBasicTrack, deleteAllOrthologTracks } from "./basicTrackSlice";
import { addAnnotation, selectAnnotations, selectSearch, removeAnnotation, addOrtholog, clearOrthologs, selectOrthologs } from "features/annotation/annotationSlice";
import { line } from 'd3-shape';
import Window from "features/miniview/Window.js";
import { selectDraggables, addDraggable, clearDraggables } from "features/draggable/draggableSlice.js";
import TrackControls from "./TrackControls.jsx";
import { selectGenome } from "./genomeSlice.js";
import TrackScale from "./track_components/TrackScale.jsx";
import TrackMarkers from "./track_components/TrackMarkers.jsx";

/* Information flows from the basicTrackSlice to here through props, adjusting the slice adjusts the track
*/
const BasicTrack = ({ array, genome = false, color = 0, trackType = 'default', normalizedLength = 0, doSomething, coordinateX, coordinateY, width, height, id, beginning, fin, grouped, zoom, pastZoom, offset, title, selection, noScale, isDark, normalize, max, ...props }) => {

    const canvasRef = useRef(null)
    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['newPreview']
    const collabPreviews = useSelector(selectMiniviews)
    const comparisonSelector = useSelector(selectComparison)[title]


    const [endCap, setEndCap] = useState(0)
    const [startOfTrack, setStartOfTrack] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [clickLocation, setClickLocation] = useState()
    const [drawnGenes, setDrawnGenes] = useState([])
    const [start, setStart] = useState(0)
    const [cap, setCap] = useState(0)
    const [hovered, setHovered] = useState()
    const [savedWidth, setSavedWidth] = useState()
    const [ savedHeight, setSavedHeight ] = useState(25)

    //! Needed for syncing multiple tracks
    const trackSelector = useSelector(selectBasicTracks)
    const genomeSelector = useSelector(selectGenome)
    const order = useSelector(selectDraggables)

    // If a parent wrapper exists get its dimensions and use 75% of that for the canvas height
    // the rest will be used for the scale 
    // If no height is present default to 100 pixel tall tracks
    // TODO the scale height needs to a static value and not 25% so the following calculation should be updated
    let parentWrapperHeight = height ? height : document.querySelector('.actualTrack')?.getBoundingClientRect()?.height,
        parentWrapperWidth = genome ? width : document.querySelector('.actualTrack')?.getBoundingClientRect()?.width;

    // Hacky fix for ortholog tracks rendering correctly
    // if(title.includes("ortholog")){

    //     parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width == document.querySelector('.draggableItem')?.getBoundingClientRect()?.width ? parentWrapperWidth : parentWrapperWidth * 2
    // }

    //! Really strongly dislike how cluttered this class has become
    const paddingRight = genome ? 10 : 30, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;

    let style = {
        position: 'relative',
        top: coordinateY,
        left: coordinateX
    }
    // const ctx = canvasRef.current.getContext('2d')
    const raw_width = parentWrapperWidth ? Math.round(parentWrapperWidth) : width,
        maxWidth = normalize && !genome ? raw_width * cap / normalizedLength - 20 : genome ? raw_width : raw_width - 20,
        maxHeight = trackType === 'default' ? 50 : (parentWrapperHeight)
        // maxHeight = parentWrapperHeight ? (parentWrapperHeight - 25 - 25) : height;


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

    const [annotationY, setAnnotationY] = useState()
    useEffect(() => {
        setAnnotationY(canvasRef.current.offsetTop)
    }, [order])


    // Hacky fix to trigger re-render when the color scheme changes - otherwise the drawn genes
    // keep the old palette
    // piling on another hack - clear draw genes when switching track type
    // and another - clear drawn genes when the array is changed

    useEffect(() => {
        setDrawnGenes([])
    }, [isDark, color, trackType, normalize, maxWidth, array, max])

    // Piling on another hack, when an ortholog is selected the parentwrapper width changes,
    // the offset needs to be adjusted or we lose our location
    useEffect(() => {
        if (!id.includes("preview")) {
            let raw_width = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width
            let updatedWidth = raw_width - 20
            let ratio = updatedWidth / maxWidth
            if (Math.abs(ratio - 1) > 0.001) {
                let offsetX = Math.max(Math.min(offset * ratio, 0), -((maxWidth * zoom) - maxWidth))
                
                dispatch(updateTrack({
                    key: id,
                    zoom,
                    offset: offsetX
                }))
            }
        }
    }, [parentWrapperWidth])

    useEffect(() => {
        if (!array) return
        setSavedWidth(maxWidth)
        normalize && !genome ? setCap(normalizedLength) : setCap(Math.max(...array.map(d => d.end)))

        setStart(Math.min(...array.map(d => d.start)))

       
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, maxWidth, maxHeight)


        let xScale = scaleLinear().domain([0, cap]).range([paddingLeft, (maxWidth * zoom) - paddingRight])

        let scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth * zoom])
        setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
        setEndCap(Math.min(scalingIncrements.invert(maxWidth - offset), cap))

        let widthScale = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])
        let minValue = 0, maxValue = max ? max : 100;

        maxValue = Math.max(...array.map(d => d.value));

        // Deal with color palette switch in dark mode;
        let zeroColor = isDark ? '#121212' : '#ffffff';

        let dynamicColorScale = ['heatmap', 'histogram', 'scatter'].indexOf(trackType) > -1 ? scaleLinear().domain([minValue, maxValue]).range([zeroColor, color]) : false;

        let yScale = ['histogram', 'scatter', 'line'].indexOf(trackType) > -1 ? scaleLinear().domain([0, maxValue]).range([5, maxHeight-5]) : () => maxHeight;

        setAnnotationY(canvasRef.current.offsetTop)
        // TODO Loops around to be negative?
        if (drawnGenes.length === 0) {
            if (trackType == 'line') {
                let pathArray = array.map(dataPoint => {
                    let x = ((xScale(dataPoint.start)) + offset),
                        y = maxHeight - yScale(dataPoint.value);
                        if(y < 0) debugger
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
                    
                    // Drawing only genes on the track -> also logic around having the genes get cut off if they begin or end beyond the track
                    if (x + rectWidth < paddingLeft || x > maxWidth - paddingRight) {
                        return
                    }
                    if (x < paddingLeft) {
                        let difference = -paddingLeft + x
                        rectWidth += difference
                        x = paddingLeft
                    }
                    else if (x + rectWidth > maxWidth - paddingRight) {
                        rectWidth = (maxWidth - paddingRight) - x 
                    }
                    if (hovered && drawGene.key === hovered.key) {
                        drawGene.highlight(ctx, x, maxHeight - yScale(drawGene.value), rectWidth, yScale(drawGene.value))
                    }
                    else {
                        if (drawGene.draw) {
                            drawGene.draw(ctx, x, maxHeight - yScale(drawGene.value), rectWidth, yScale(drawGene.value));
                        }

                    }
                })
            }

        }
    }, [trackType, color, zoom, offset, drawnGenes, hovered, selection, normalize, parentWrapperHeight])


    const gt = window.gt;
    const dispatch = useDispatch()

    let [waiting, setWaiting] = useState()
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

    function updateCollabPosition(info) {
        clearTimeout(waiting)
        setWaiting(window.setTimeout(() => {
            gt.updateState({ Action: "handlePreviewPosition", info })
        }, 80))
    }

    function handleScroll(e) {
        
        
        if (genome) return
        // TODO - Event not being prevented from bubbling
        // e.preventDefault();
        // e.stopPropagation()
        if (e.target.id !== id) {
            // console.log(genome)
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
            // console.log(dx)
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

        if (genome) return
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
        if (genome || trackType !== 'default') return
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
            track: id.includes("ortholog") ? id.substring(0, 3) : id,
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

        if (window.gt) {
            let info = {
                user: window.gt.id,
                track: id,
                trackType: trackType,
                center: center,
                cursorColor: window.gt.users[document.title].color
            }
            updateCollabPosition(info)
            gt.updateState({ Action: "handlePreviewPosition", info })
        }

    }


    function newAnnotation() {
        let note = prompt("Enter a message: ")
        if (!note) return
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

    function deleteAnnotation() {

        let annotation = {
            key: id,
            location: previewSelector.center
        }
        dispatch(removeAnnotation(annotation))

        if (gt) {
            gt.updateState({ Action: "handleDeleteAnnotation", annotation })
        }
    }

    function handleClick(e) {
        if (genome) return
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
                    if (e.ctrlKey) {
                        deleteAnnotation()
                        setClickLocation(null)
                        return
                    }
                    newAnnotation()
                    setClickLocation(null)
                    return

                }
                dispatch(clearDraggables({
                    dragGroup: "ortholog"
                }))
                let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * maxWidth



                let found = false
                if (!id.includes("ortholog")) {


                    drawnGenes.forEach(x => {
                        if (x.hovering(normalizedLocation)) {
                            setSelection(x)
                            dispatch(setSelection({
                                key: id,
                                selection: x.key,
                            }))
                            dispatch(clearOrthologs())
                            dispatch(deleteAllOrthologTracks())
                            // debugger
                            found = true;
                            //! Proof of concept following gene change this for the view later
                            //TODO pull this into a function
                            let index;
                            let trackID = [];
                            let orthologInformation = [];
                            let orthologChromosome = [];
                            let key;
                            index = []
                            let matched;
                            // Iterating through the tracks with an ortholog
                            if (x.siblings != 0 && x.siblings.length > 0) {
                                for (let sibling of x.siblings) {

                                    if (sibling) {
                                        key = sibling.toLowerCase().split("g")[0]
                                        index = genomeSelector[key].array.findIndex((d) => { return d.key.toLowerCase() == sibling.toLowerCase() })
                                        if (index > -1) {
                                            orthologInformation.push(genomeSelector[key].array[index])
                                            orthologChromosome.push(genomeSelector[key].array)
                                            trackID.push(key)
                                            matched = true
                                        }
                                    }

                                }
                                if (matched == true && index > -1) {

                                    for (let i = 0; i < orthologInformation.length; i++) {
                                        if (trackID !== id) {
                                            let orthologCap = Math.max(...orthologChromosome[i].map(d => d.end))

                                            // Location of the ortholog 
                                            let ratio = orthologInformation[i].start / orthologCap

                                            // Should almost certainly use a web worker for this
                                            let relatedWidthScale = scaleLinear().domain([0, orthologCap]).range([0, maxWidth])
                                            let calculatedZoom = x.width / relatedWidthScale(orthologInformation[i].end - orthologInformation[i].start) //the size of the ortholog
                                            let calculatedOffset = -(ratio * maxWidth * calculatedZoom) + x.coordinateX
                                            // Aligning related tracks with the selected block
                                            if (trackID[i] != id) {
                                                dispatch(updateTrack({
                                                    key: trackID[i],
                                                    zoom: calculatedZoom,
                                                    offset: calculatedOffset
                                                }))
                                                dispatch(setSelection({
                                                    key: trackID[i],
                                                    selection: orthologInformation[i].key
                                                }))
                                            }
                                            dispatch(addBasicTrack({
                                                key: trackID[i] + "ortholog",
                                                zoom: calculatedZoom,
                                                offset: calculatedOffset,
                                                trackType,
                                                color: trackSelector[trackID[i]].color,
                                                isDark,
                                                normalize,
                                                selection
                                            }))
                                            dispatch(addDraggable({
                                                key: trackID[i] + "ortholog",
                                                dragGroup: "ortholog"
                                            }))
                                            let annotation = {
                                                key: trackID[i],
                                                note: orthologInformation[i].key,
                                                location: +orthologInformation[i].start
                                            }
                                            let orthologAnnotation = {
                                                key: trackID[i] + "ortholog",
                                                note: orthologInformation[i].key,
                                                location: +orthologInformation[i].start
                                            }
                                            dispatch(addOrtholog(annotation))
                                            dispatch(addOrtholog(orthologAnnotation))



                                        }
                                    }

                                }
                            }
                        }
                    })
                }
                if (found == false) {

                    dispatch(clearSelection({
                        key: id,
                    }))
                }
            }
            setClickLocation(null)
        }
    }

    let viewFinderScale = () => 0
    let viewFinderWidth = () =>  0
    let x = 0
    let previewWidth = 0
    let difference = 0

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

    if (previewSelector.visible && canvasRef.current) {
        viewFinderScale = scaleLinear().domain([startOfTrack, endCap]).range([canvasRef.current.offsetLeft + paddingLeft, canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight])
        viewFinderWidth = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])
        x = viewFinderScale(previewSelector.center)
        previewWidth = viewFinderWidth(100000)

        if (x - previewWidth / 2 < canvasRef.current.offsetLeft + paddingLeft) {
            difference = -((x - previewWidth / 2) - (canvasRef.current.offsetLeft + paddingLeft))
            previewWidth -= difference
        }
        else if (x + previewWidth / 2 > canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight) {
            difference = canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight - (x + previewWidth / 2)
            previewWidth += difference
        }
    }

    let info

    //! TODO Changing length of text changes the location of ticks
    if (trackType === "default") {
        let orthologInfo = (hovered && hovered.siblings && hovered.siblings.length > 0) ? hovered.siblings : "No orthologs."
        info = hovered ? hovered.key.toUpperCase() + "\nStart Location: " + Math.round(hovered.start) + " bp\nOrthologs: " + orthologInfo : ''
    }
    else {
        info = hovered ? hovered.key.toUpperCase() + "\nStart Location: " + Math.round(hovered.start) + " bp\nEnd Location: " + Math.round(hovered.end) + "\nValue: " + hovered.value : ''
    }
    if (genome) info = ""



    let trackTitle = trackType === 'default' ? "Chromosome: " + title + ", GFF" : "Chromosome: " + title + ", BED"

    // ! This scale is a little bit off
    let locationScale = canvasRef.current ? scaleLinear().domain([0, cap]).range([canvasRef.current.offsetLeft + paddingLeft, canvasRef.current.offsetLeft + ((maxWidth) * zoom)  - paddingLeft]) : scaleLinear().domain([0, cap]).range([paddingLeft, paddingLeft + ((maxWidth) * zoom)])
    // let locationScale = scaleLinear().domain([0, cap]).range([0, ((maxWidth) * zoom)])
    // console.log(maxWidth)
    if(canvasRef.current){
        viewFinderScale = scaleLinear().domain([startOfTrack, endCap]).range([canvasRef.current.offsetLeft + paddingLeft, canvasRef.current.offsetLeft + canvasRef.current.offsetWidth - paddingRight])

    }
    let wScale = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])
    
    // if(id == "at3"){
    //     // console.log(cap)
    //     console.log("Track: " + Math.round(locationScale(0) + offset) + " " + Math.round(locationScale(cap) + offset))
    // }


    return (
        <div style={{ width: "100%", height: '100%', }}>
            {title && !genome &&
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
                >{trackTitle}</Typography>}

            {/* {previewSelector.visible && canvasRef.current && Object.keys(collabPreviews).map(item => {
                let collabX = viewFinderScale(collabPreviews[item].center)
                let collabWidth = trackType == 'default' ? previewWidth : 3

                if (collabX >= canvasRef.current.offsetLeft &&
                    collabX <= canvasRef.current.offsetLeft + maxWidth - paddingLeft)
                    return (
                        <Window
                            color={collabPreviews[item].cursorColor}
                            key={item}
                            coordinateX={collabX + difference / 2}
                            // coordinateX={x}
                            coordinateY={canvasRef.current.offsetTop}
                            height={canvasRef.current.offsetHeight}
                            width={collabWidth} // boxwidth
                            preview={id == 'preview' ? false : true}
                            text={Math.max(Math.round(beginning), 0)}
                            grouped={grouped}
                            isDark={isDark}
                            style={genome ? "genome" : undefined}
                        />
                    )
            })
            } */}

            {previewSelector.visible && canvasRef.current && comparisonSelector &&
                comparisonSelector.map(comparison => {
                    let x = locationScale(comparison.center) + offset + canvasRef.current.offsetLeft
                    let width = viewFinderWidth(comparison.end - comparison.start)
                    let start = viewFinderScale(comparison.start) + offset + canvasRef.current.offsetLeft

                    if (width > 0 && start + width < canvasRef.current.offsetLeft + maxWidth) {

                        return (
                            <Window
                                key={comparison.key}
                                coordinateX={x}
                                coordinateY={canvasRef.current.offsetTop}
                                height={canvasRef.current.offsetHeight}
                                width={width} // boxwidth
                                preview={true}
                                text={Math.max(Math.round(beginning), 0)}
                                grouped={grouped}
                                label={title.toUpperCase() + "-" + comparison.key}
                                isDark={isDark}
                            // style={"caret"}
                            />
                        )
                    }
                })
            }
                <TrackMarkers
                    id={id}
                    endOfTrack={endCap}
                    startOfTrack={startOfTrack}
                    width={maxWidth}
                    coordinateY={annotationY}
                    height={maxHeight}
                    locationScale={locationScale}
                    viewFinderWidth={viewFinderWidth}
                    viewFinderScale={viewFinderScale}
                    offset={offset}
                    paddingLeft={paddingLeft}
                    spacingLeft={canvasRef.current ? canvasRef.current.offsetLeft : paddingLeft}
                    paddingRight={paddingRight}
                    genome={genome}
                    isDark={isDark}

                />
           
            <Tooltip
                title={info.length > 0 ? <Typography
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
                    className={genome ? "genomeTrack" : "actualTrack"}
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
                            // console.log(e.clientX)
                            // console.log(e.target.offsetLeft)
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

            {!noScale && <TrackScale
                endOfTrack={endCap}
                startOfTrack={startOfTrack}
                width={maxWidth}
                paddingLeft={paddingLeft}
                paddingRight={paddingLeft}
            />}
            {!genome && <TrackControls id={id} height={parentWrapperHeight} gap={parentWrapperHeight} />}

        </div>

     )
    //gap={maxHeight + 25 + 5}
}

BasicTrack.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: 1000,
    zoom: 1.0,
    pastZoom: 1.0,
    offset: 0,
}


export default BasicTrack
