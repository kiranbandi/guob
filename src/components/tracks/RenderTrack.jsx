import React, { useEffect, useRef, useState } from "react"
import { scaleLinear } from "d3-scale"
import { useDispatch } from "react-redux"
import { Typography } from '@mui/material';
import { gene } from './gene.js'
import { updateTrack } from "./basicTrackSlice";
import { line } from 'd3-shape';

/**
 * Updated version of the BasicTrack - renders bars based on the information passed through the "array" prop
 */
const RenderTrack = ({ array, genome = false, color = 0, trackType = 'default', normalizedLength = 0, coordinateX, coordinateY, width, height, id, beginning, fin, grouped, zoom, pastZoom, offset, title, selection, noScale, isDark, normalize, max, ...props }) => {

    const canvasRef = useRef(null)

    const [drawnGenes, setDrawnGenes] = useState([])
    const [start, setStart] = useState(0)
    const [cap, setCap] = useState(0)
    const dispatch = useDispatch()
    let trackTitle = trackType === 'default' ? "Chromosome: " + title + ", GFF" : "Chromosome: " + title + ", BED"



    // If a parent wrapper exists get its dimensions and use 75% of that for the canvas height
    // the rest will be used for the scale 
    // If no height is present default to 100 pixel tall tracks
    // TODO the scale height needs to a static value and not 25% so the following calculation should be updated
    let parentWrapperHeight = height ? height : document.querySelector('.actualTrack')?.getBoundingClientRect()?.height,
        parentWrapperWidth = genome ? width : document.querySelector('.actualTrack')?.getBoundingClientRect()?.width;


    // const paddingRight = genome ? 10 : 30, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;
    const paddingRight = genome ? 0 : 30, paddingLeft = 0
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
            if (e.altKey === true) {
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
    }, [isDark, color, trackType, normalize, maxWidth, array, max])

    // Piling on another hack, when an ortholog is selected the parentwrapper width changes,
    // the offset needs to be adjusted or we lose our location
    useEffect(() => {
        if (genome) return
        if (!id.includes("preview")) {
            let raw_width = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width
            let updatedWidth = raw_width - 20
            let ratio = updatedWidth / maxWidth
            //! This is probably where the linkages are going wrong 
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
        normalize && !genome ? setCap(normalizedLength) : setCap(Math.max(...array.map(d => d.end)))

        setStart(Math.min(...array.map(d => d.start)))


        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, maxWidth, maxHeight)


        let xScale = scaleLinear().domain([0, cap]).range([paddingLeft, (maxWidth * zoom) - paddingRight])
        let widthScale = scaleLinear().domain([0, cap - start]).range([0, maxWidth * zoom])
        let minValue = 0, maxValue = max ? max : 100;

        maxValue = Math.max(...array.map(d => d.value));

        // Deal with color palette switch in dark mode;
        let zeroColor = isDark ? '#121212' : '#ffffff';

        let dynamicColorScale = ['heatmap', 'histogram', 'scatter'].indexOf(trackType) > -1 ? scaleLinear().domain([minValue, maxValue]).range([zeroColor, color]) : false;

        let yScale = ['histogram', 'scatter', 'line'].indexOf(trackType) > -1 ? scaleLinear().domain([0, maxValue]).range([5, maxHeight - 5]) : () => maxHeight;

        // TODO Loops around to be negative?
        if (drawnGenes.length === 0) {
            if (trackType === 'line') {
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

            if (trackType === 'line') {

                let pathArray = [];
                array.map(dataPoint => {
                    let x = ((xScale(dataPoint.start)) + offset),
                        y = maxHeight - yScale(dataPoint.value);

                    let rectWidth = widthScale(dataPoint.end - dataPoint.start)

                    if (x + rectWidth < 0 || x > maxWidth) {
                        return 0
                    }
                    pathArray.push([x, y]);
                    return 0
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

                    if (drawGene.draw) {
                        drawGene.draw(ctx, x, maxHeight - yScale(drawGene.value), rectWidth, yScale(drawGene.value));
                    }


                })
            }

        }
    }, [trackType, color, zoom, offset, drawnGenes, selection, normalize, parentWrapperHeight])



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
            <canvas
                tabIndex={-1}
                id={id}
                ref={canvasRef}
                height={maxHeight}
                width={maxWidth}
                className={genome ? "genomeTrack" : "actualTrack"}
                style={style}
                {...props} />
        </div>

    )

}

RenderTrack.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: 1000,
    zoom: 1.0,
    pastZoom: 1.0,
    offset: 0,
}


export default RenderTrack
