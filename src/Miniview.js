import React, { useEffect, useRef, useState } from "react"
import './Miniview.css'

const Miniview = ({ array, raw, chosen, color, bars, doSomething }) => {

    const canvasRef = useRef()

    useEffect(() => {

       
        let density;
        bars == null ? density = 60 : density = bars 

        let dataset;

        // Checking if the array is already low resolution or not
        if (raw) {
            let subset = array
            let cap = Math.max(...subset.map(d => d.end))
            let start = Math.min(...subset.map(d => d.start))
            let distance = cap - start

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
        }
        else {
            dataset = array
        }

        let max = Math.max(...dataset.map(d => d.number))
        const ctx = canvasRef.current.getContext('2d')

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        dataset.forEach((d, i) => {
            let opacity = (100 / +max) * +d.number
            ctx.fillStyle = 'hsl(' + color + ', 70%, 50%, ' + opacity + '%)'
            ctx.beginPath()

            // Determining whether to highlight chosen section
            let chosenLocation = chosen !== undefined && chosen.start >= d.start && chosen.end <= d.end    
            ctx.strokeStyle = chosenLocation ? 'black' : 'white'
            ctx.lineWidth = chosenLocation ? '2' : '1'
           
            ctx.rect((i * 1.05 * ctx.canvas.width / (dataset.length * 1.05)), 2, ctx.canvas.width / (dataset.length * 1.05), ctx.canvas.height - 4)
            ctx.fill();
            ctx.stroke()
        })


    }, [array, chosen, color, canvasRef])

    return <canvas ref={canvasRef} className='miniview' width='1000' height='100' onClick={doSomething}/> 
}

Miniview.defaultProps = {
    raw: true,
    color: 0
}


export default Miniview
