import React, { useEffect, useRef } from "react"
import './Miniview.css'
import { scaleLinear } from "d3-scale"
import { useSelector } from "react-redux"
import Window from "./Window"
import { Typography} from '@mui/material';

import { selectMiniviews } from "./miniviewSlice"


const Miniview = ({ array, color, coordinateX, coordinateY, width, height, absolutePositioning, displayPreview, id, beginning, fin, preview, boxLeft, boxTop, boxWidth, grouped, isDark, ...props }) => {

    const canvasRef = useRef()

    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['preview']

    useEffect(() => {

        if (array == undefined) return

        let cap;
        fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

        let start;
        beginning ? start = beginning : start = Math.min(...array.map(d => d.start))

        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


        let xScale = scaleLinear().domain([start, cap]).range([0, ctx.canvas.width])
        let widthScale = scaleLinear().domain([0, cap - start]).range([0, ctx.canvas.width])
        ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'


        array.forEach(gene => {
            let x = xScale(gene.start)
            let rectWidth = widthScale(gene.end - gene.start)
            ctx.beginPath()
            ctx.rect(x, 0, rectWidth, ctx.canvas.height)
            ctx.fill()
        })


    }, [array, color])

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
        zIndex: 100,
    }


    return (
        <>
            <Window
                className={"comparison"}
                coordinateX={boxLeft}
                coordinateY={boxTop}
                width={boxWidth}
                preview={id == 'preview' ? false : true}
                text={Math.max(Math.round(beginning), 0)}
                grouped={grouped}
            />
            
                <Window
                    className={"test"}
                    coordinateX={previewSelector.viewFinderX}
                    coordinateY={previewSelector.viewFinderY}
                    width={previewSelector.boxWidth}
                    preview={id == 'preview' ? true : false}
                />
            
            <Typography style={scaleStyle} left={coordinateX - 80}>{Math.max(Math.round(beginning), 0)}</Typography>
            <canvas
                id={id}
                ref={canvasRef}
                className='miniview'
                width='2000'
                height='1000'
                style={style}
                {...props} />
            <Typography style={scaleStyle} left={coordinateX + width + 2}>{Math.round(fin)}</Typography>
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
