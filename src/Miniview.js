import React, { useEffect, useRef } from "react"
import './Miniview.css'

const Miniview = ({ array, raw, chosen, color }) => {

    const canvasRef = useRef()

    useEffect(() => {

        // MAGIC NUMBER, 60 is the current number of bars
        let density = 60
        let dataset;

        // Checking if the array is already low resolution or not
        if (raw) {
            let subset = array
            let cap = Math.max.apply(Math, subset.map(d => { return d.end }))
            let start = subset[0].start
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
        
        // If a color hasn't been passed, default to red
        if (color === undefined) {
            color = 0
        }

        dataset.forEach((d, i) => {
            let opacity = (100 / +max) * +d.number
            ctx.fillStyle = 'hsl(' + color + ', 70%, 50%, ' + opacity + '%)'
            ctx.beginPath()

            if (chosen !== undefined && chosen.start >= d.start && chosen.end <= d.end) {
                ctx.strokeStyle = 'black'
                ctx.lineWidth = "2"
            }
            else {
                ctx.strokeStyle = 'white'
                ctx.lineWidth = "1"
            }

            ctx.rect((i * 1.05 * ctx.canvas.width / (dataset.length * 1.05)), 2, ctx.canvas.width / (dataset.length * 1.05), ctx.canvas.height - 4)
            ctx.fill();
            ctx.stroke()
        })


    }, [array, chosen])

    return <canvas ref={canvasRef} className='miniview' width='1000' height='100' />
}

export default Miniview
