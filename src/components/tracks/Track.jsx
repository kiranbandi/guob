import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { scaleLinear } from 'd3'
import { gene } from './gene.js'
import { line } from 'd3-shape';
import { updateTrack } from './complicatedTrackSlice.js';
import { useDispatch } from 'react-redux';


// This really just needs to draw boxes, no extra events needed
function Track({array, trackType, zoom, offset, isDark, color, id, width, height, ...props}) {
  
    const canvasRef = useRef(null)
    // TODO Not a huge fan of using this here


    const [endCap, setEndCap] = useState(0)
    const [startOfTrack, setStartOfTrack] = useState(0)
    const [normalizer, setNormalizer] = useState([1, 1])
    const [drawnGenes, setDrawnGenes] = useState([])
    const [start, setStart] = useState(0)
    const [cap, setCap] = useState(0)
    const [hovered, setHovered] = useState()
    const dispatch = useDispatch()




    // If a parent wrapper exists get its dimensions and use 75% of that for the canvas height
    // the rest will be used for the scale 
    // If no height is present default to 100 pixel tall tracks
    // TODO the scale height needs to a static value and not 25% so the following calculation should be updated
    let parentWrapperHeight = height ?  height : document.querySelector('.draggableItem')?.getBoundingClientRect()?.height,
        parentWrapperWidth = width ? width :  document.querySelector('.draggableItem')?.getBoundingClientRect()?.width

    const paddingRight = 10, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;

    // let style = {
    //     position: 'relative',
    //     top: coordinateY,
    //     left: coordinateX
    // }

    const raw_width = Math.round(parentWrapperWidth),
        maxWidth = raw_width - 20,
        maxHeight = (parentWrapperHeight - 25 - 25);

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
    // piling on another hack - clear draw genes when switching track type
    // and another - clear drawn genes when the array is changed
    useEffect(() => {
        setDrawnGenes([])
    }, [isDark, color, trackType, maxWidth, array])

    useEffect(() => {

        if (!array) return
        setCap(Math.max(...array.map(d => d.end)))

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
        let minValue = 0, maxValue = Math.max(...array.map(d => d.value));

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
                    if (x + rectWidth < 10 || x > maxWidth - 10) {
                        return
                    }
                    if(x < 10){
                        let difference = -10 + x
                        rectWidth += difference
                        x = 10
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
    }, [array, trackType, color, zoom, offset, drawnGenes, hovered, parentWrapperHeight])

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

            //  Needs to be panned so that the zoom location remains the same
            let dx = ((normalizedLocation - offset) * (factor - 1))
            let offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * zoom * factor) - maxWidth))
            if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0
            // debugger

            dispatch(updateTrack({
                key: id,
                offset: offsetX,
                zoom: Math.max(zoom * factor, 1.0)
            }))
        }
    }
  
    return (
        <canvas
        tabIndex={-1}
        id={id}
        ref={canvasRef}
        height={maxHeight}
        width={maxWidth}
        className='track'
        onWheel={handleScroll}
        onMouseMove={(e) => canvasRef.current.focus()}
        onClick={(e) => console.log(e)}
        // style={style}
        {...props} />
  )
}

export default Track