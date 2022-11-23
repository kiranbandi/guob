import React, { useEffect, useRef, useState } from "react"
import { scaleLinear } from "d3-scale"
import { useSelector } from "react-redux"
import Window from "./Window"
import { Typography } from '@mui/material';
import { selectMiniviews } from "./miniviewSlice"

/*
This is the small preview that appears on mouse-over. 
TODO make work with the histogram
*/

const Miniview = ({ array, color, coordinateX, coordinateY, width, height, absolutePositioning, displayPreview, id, beginning, fin, preview, boxLeft, boxTop, boxWidth, grouped, isDark, trackType, zoom, offset, ...props }) => {

    const canvasRef = useRef()
    const previewSelector = useSelector(selectMiniviews)['newPreview']
    let [cap, setCap] = useState()
    let [start, setStart] = useState()
    let [testWidth, setTestWidth] = useState()

    useEffect(() => {
        if (array == undefined) return
        if (trackType !== "default") return
        fin ? setCap(fin) : setCap(Math.max(...array.map(d => d.end)))
        beginning ? setStart(beginning) : setStart(Math.min(...array.map(d => d.start)))
    }, [array, color])

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


        let xScale = scaleLinear().domain([start, cap]).range([0, ctx.canvas.width * zoom])
        let widthScale = scaleLinear().domain([0, cap - start]).range([0, ctx.canvas.width * zoom])

        let parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width;
        const maxWidth = parentWrapperWidth ? Math.round(parentWrapperWidth * 0.98) - 10 : width

        let testScale = scaleLinear().domain([0, cap - start]).range([0,maxWidth * previewSelector.parentZoom])
        setTestWidth(testScale(100000))
        ctx.fillStyle = color


        array.forEach(gene => {
            let x = xScale(gene.start) - (offset * ctx.canvas.width * zoom)
            let rectWidth = widthScale(gene.end - gene.start)
            if (x + rectWidth < 0 || x > ctx.canvas.width) {
                return
            }
            ctx.beginPath()
            ctx.rect(x, 0, rectWidth, ctx.canvas.height)
            ctx.fill()
        })


    }, [cap, start, offset, previewSelector.viewFinderX])

    let position = absolutePositioning ? 'absolute' : 'relative'

    let style = {
        position: position,
        top: coordinateY,
        left: coordinateX,
        width: width,
        height: height,
        margin: 0,
    }

    let scaleBackground = isDark ? 'grey' : "whitesmoke"
    let scaleStyle = {
        position: position,
        top: coordinateY,
        height: height + 5,
        margin: 0,
        background: scaleBackground,
        zIndex: 2,
    }

    return (

        <>
            {(trackType === "default") && <Window
                className={"comparison"}
                coordinateX={boxLeft}
                coordinateY={boxTop}
                width={testWidth} // boxwidth
                preview={id == 'preview' ? false : true}
                text={Math.max(Math.round(beginning), 0)}
                grouped={grouped}
            />
            }
            {(trackType === "default") && <Window
                className={"comparison"}
                coordinateX={previewSelector.viewFinderX}
                coordinateY={previewSelector.viewFinderY}
                width={10}
                preview={id == 'preview' ? true : false}
            />}

            {(trackType === "default") && <Typography style={scaleStyle} left={coordinateX - 80}>{Math.max(Math.round(start), 0)}</Typography>
            }     {(trackType === "default") && <canvas
                id={id}
                ref={canvasRef}
                className='miniview'
                width='2000'
                height='1000'
                style={style}
                {...props} />}
            {(trackType === "default") && <Typography style={scaleStyle} left={coordinateX + width + 2}>{Math.round(cap)}</Typography>}
            {(trackType !== "default") && <Typography style={scaleStyle} left={coordinateX + width / 2}>{Math.round(start + (cap - start) / 2)}</Typography>}
            {(trackType !== "default") && <Window
                className={"test"}
                coordinateX={previewSelector.viewFinderX}
                coordinateY={previewSelector.viewFinderY}
                width={10}
                preview={id == 'preview' ? true : false}
            />}
        </>
    )
}

Miniview.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: '100%',
    height: '75%',
    absolutePositioning: false,
    displayPreview: true,
}


export default Miniview
