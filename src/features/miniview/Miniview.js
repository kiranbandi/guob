import React, { useEffect, useRef, useState } from "react"
import './Miniview.css'
import { scaleLinear } from "d3-scale"
import { useDispatch } from "react-redux"

import { addMiniview, moveMiniview, selectMiniviews, updateData } from "./miniviewSlice"


const Miniview = ({ array, average, chosen, color, bars, doSomething, coordinateX, coordinateY, width, height, absolutePositioning, id, beginning, fin, ...props }) => {

    const canvasRef = useRef()

    useEffect(() => {
        // console.log("Array length: " + array.length)
        if(array != undefined){

        
        let density;
        bars ? density = bars : density = 60


        let cap
        fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

        // console.log("\nUSeEffect cap: " + cap)
       
        let start;
        beginning ? start = beginning : start = Math.min(...array.map(d => d.start))
        let distance = cap - start
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // Checking if the array is low resolution or not
        if (average) {

            let subset = array
            let increment = distance / density

            let demo = []
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
                    demo.push(temp)
                }
            }

    

            let max = Math.max(...demo.map(d => d.number))
            demo.forEach((d, i) => {
                let opacity = (100 / +max) * +d.number
                ctx.fillStyle = 'hsl(' + color + ', 70%, 50%, ' + opacity + '%)'
                ctx.beginPath()

                // Determining whether to highlight chosen section
                let chosenLocation = !!chosen && chosen.start >= d.start && chosen.end <= d.end
                ctx.strokeStyle = chosenLocation ? 'black' : 'white'
                ctx.lineWidth = chosenLocation ? '2' : '1'

                ctx.rect((i * 1.05 * ctx.canvas.width / (demo.length * 1.05)), 2, ctx.canvas.width / (demo.length * 1.05), ctx.canvas.height - 4)
                ctx.fill();
                ctx.stroke()
            })
        }

        // If not low resolution, we draw everything in the array
        else {

            let xScale = scaleLinear().domain([start, cap]).range([0, ctx.canvas.width])
            let widthScale = scaleLinear().domain([0, cap-start]).range([0, ctx.canvas.width])
            ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'
            
            // Potential yikes
            // if(array.length > 1 ){
            array.forEach(gene => {
                let x = xScale(gene.start)
                let rectWidth = widthScale(gene.end-gene.start)   
                ctx.beginPath()
                ctx.rect(x, 0, rectWidth, ctx.canvas.height)
                ctx.fill()
            })
            // }

           
        }
    }
    
    }, [array, color])

    let position = absolutePositioning ? 'absolute' : 'relative'

    let style = {
        position: position,
        top: coordinateY,
        left: coordinateX,
        width: width,
        height: height,
        margin: 0
    }

    const dispatch = useDispatch()


    // Scaling weird because using the wrong width
    function showZoom(event) {
        let horizontalOffset = event.target.clientLeft
        let verticalOffset = event.target.clientTop
        let coordinateX = event.pageX - horizontalOffset
        let yLoc = event.target.offsetParent.offsetTop + event.target.clientHeight + 10

        let westEnd =  event.target.offsetParent.clientWidth

        let cap = Math.max(...array.map(d => d.end))
        let start = Math.min(...array.map(d => d.start))
        let testScale = scaleLinear().domain([start, cap]).range([0, westEnd])
        let center = testScale.invert(coordinateX)
        let beginning = center - 100000
        let end = center + 100000
        let testArray = array.filter(item => {
            return (item.end >= beginning && item.start <= end)
        })

        // TODO these are placeholders
        let modifier = 200
        if (id) {
            dispatch(updateData({
                key: 'example',
                array: testArray,
                start: beginning,
                end: end
            }))
            dispatch(moveMiniview({
                key: 'example',
                coordinateX: Math.max(0, Math.min(westEnd - 420, coordinateX - modifier)),
                coordinateY: yLoc,
            }))

        }
    }

    return <canvas ref={canvasRef} className='miniview' width='2000' height='1000' style={style} onClick={doSomething} onMouseMove={(e) => showZoom(e)} {...props}/>
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
