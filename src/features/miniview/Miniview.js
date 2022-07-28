import React, { useEffect, useRef, useState } from "react"
import './Miniview.css'
import { scaleLinear } from "d3-scale"
import { useDispatch } from "react-redux"
import { nanoid } from "@reduxjs/toolkit"


import { addMiniview, moveMiniview } from "./miniviewSlice"


const Miniview = ({ array, average, chosen, color, bars, doSomething, coordinateX, coordinateY, width, height, absolutePositioning }) => {

    const canvasRef = useRef()

    const dispatch = useDispatch()

    const [xLocation, setXLocation] = useState(coordinateX)
    const [yLocation, setYlocation] = useState(coordinateY)
    
    // Temporary, this almost certainly should not be here
    const [key, setKey] = useState(nanoid())

    dispatch(
        addMiniview({
            key:key,
            xLocation,
            yLocation,
            array
        })
    )
    

    const onMiniviewClicked = () => {
        
        setXLocation(200)
        setYlocation(100)
        
        dispatch(

            moveMiniview({
                key: key,
                xLocation,
                yLocation
            })
        )
    }

    useEffect(() => {

        let density;
        bars ?  density = bars : density = 60 

        let dataset;
        let cap = Math.max(...array.map(d => d.end))
        let start = Math.min(...array.map(d => d.start))
        let distance = cap - start
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // Checking if the array is already low resolution or not
        if (average) {

            let subset = array
            let increment = distance / density

            dataset = []
            if (subset.length > 0) {
                for (let i = 1; i <= density; i++) {
                    let startOfBar = +start + increment * (i - 1)
                    let endOfBar = +start + increment * i

                    let numberOfGenes = subset.filter(e => e.start >= startOfBar && e.start <= endOfBar).length
                    var temp = {
                        start: startOfBar,
                        end: endOfBar,
                        number: numberOfGenes,
                    }
                    dataset.push(temp)
                }
            } 
            

        let max = Math.max(...dataset.map(d => d.number))
        dataset.forEach((d, i) => {
            let opacity = (100 / +max) * +d.number
            ctx.fillStyle = 'hsl(' + color + ', 70%, 50%, ' + opacity + '%)'
            ctx.beginPath()

            // Determining whether to highlight chosen section
            let chosenLocation = !!chosen && chosen.start >= d.start && chosen.end <= d.end    
            ctx.strokeStyle = chosenLocation ? 'black' : 'white'
            ctx.lineWidth = chosenLocation ? '2' : '1'
           
            ctx.rect((i * 1.05 * ctx.canvas.width / (dataset.length * 1.05)), 2, ctx.canvas.width / (dataset.length * 1.05), ctx.canvas.height - 4)
            ctx.fill();
            ctx.stroke()
        })
        }

        else {
            dataset = array
            let xScale = scaleLinear().domain([start, cap]).range([0, ctx.canvas.width])
            ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'
            dataset.forEach(gene =>{
                let x = xScale(gene.start)
                let rectWidth = xScale(gene.start-gene.end)
                ctx.beginPath()
                ctx.rect(x, 0, rectWidth, ctx.canvas.height)
                ctx.fill()
            })
        }

       


    }, [array, chosen, color, canvasRef, xLocation, yLocation])

    let position = absolutePositioning ? 'absolute' : 'relative'

    let style = {
        position: position,
        top: yLocation,
        left: xLocation,
        width: width,
        height: height,
        margin: 0 
    }
    

    return <canvas ref={canvasRef} className='miniview' width='2000' height='1000' style={style} onClick={onMiniviewClicked}/> 
}

Miniview.defaultProps = {
    average: false,
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: '100%',
    height: '100%',
    absolutePositioning: false
}


export default Miniview
