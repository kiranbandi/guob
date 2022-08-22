import React, { useEffect, useRef, useState } from "react"
import './Miniview.css'
import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import Window from "./Window"

import { addMiniview, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility } from "./miniviewSlice"


const Miniview = ({ array, average, chosen, color, bars, doSomething, coordinateX, coordinateY, width, height, absolutePositioning, displayPreview, id, beginning, fin, preview, boxLeft, boxTop, boxWidth, ...props }) => {

    const canvasRef = useRef()

    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['preview']

    let testWidth = 0;

    useEffect(() => {

        if (array !== undefined) {

            let cap;
            fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

            let start;
            beginning ? start = beginning : start = Math.min(...array.map(d => d.start))

            let distance = cap - start
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

            // Checking if the array is intended as low resolution - if it is, build a new array with
            // number of genes in a specific area to build the heatmap
            if (average) {

                let density;
                bars ? density = bars : density = 60

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
                let widthScale = scaleLinear().domain([0, cap - start]).range([0, ctx.canvas.width])
                ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'


                array.forEach(gene => {
                    let x = xScale(gene.start)
                    let rectWidth = widthScale(gene.end - gene.start)
                    ctx.beginPath()
                    ctx.rect(x, 0, rectWidth, ctx.canvas.height)
                    ctx.fill()
                })
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

    function showPreview(event) {

        if (displayPreview) {
            // Ternary operators for if the view is in a container or not
            let horizontalOffset = event.target.offsetParent.localName == 'body' ? event.target.offsetLeft : event.target.offsetParent.offsetLeft
            let verticalOffset = event.target.offsetParent.localName == 'body' ? event.target.offsetTop : event.target.offsetParent.offsetTop

            let coordinateX = event.pageX

            let coordinateY = verticalOffset + event.target.clientHeight + 5

            let eastEnd = event.target.clientWidth + horizontalOffset

            // Would give weird scaling if the array was movable
            let cap = Math.max(...array.map(d => d.end))
            let start = Math.min(...array.map(d => d.start))


            let testScale = scaleLinear().domain([start, cap]).range([horizontalOffset, eastEnd])
            let center = testScale.invert(coordinateX)
            let beginning = center - 50000
            let end = center + 50000
            testWidth = (testScale(end - beginning))
            let testArray = array.filter(item => {
                return ((item.end >= beginning && item.start <= beginning) || (item.start >= beginning && item.end <= end) || (item.start <= end && item.end >= end))
            })

            // TODO these are placeholders + hacky fixes
            if (!preview) {
                dispatch(changeMiniviewColor({
                    key: 'preview',
                    color: color
                }))
                dispatch(updateData({
                    key: 'preview',
                    array: testArray,
                    start: beginning,
                    end: end,
                    boxWidth: testScale(end - beginning),
                }))
                dispatch(moveMiniview(
                    {
                        key: 'preview',
                        coordinateX: Math.max(horizontalOffset, Math.min(eastEnd - previewSelector.width, coordinateX - previewSelector.width / 2)),
                        coordinateY: coordinateY,
                    }))
                dispatch(changeMiniviewVisibility(
                    {
                        key: 'preview',
                        visible: true
                    }))

            }
        }
    }

    return (
    <>
    { preview && <Window 
        className={"comparison"}
        coordinateX={boxLeft}
        coordinateY={boxTop}
        width={boxWidth}
        preview={id =='preview' ? false : true}
        text={Math.round(beginning)}
        />}
    <canvas
        ref={canvasRef}
        className='miniview'
        width='2000'
        height='1000'
        style={style}
        onClick={doSomething}
        onMouseMove={(e) => showPreview(e)}
        onMouseLeave={() => dispatch(
            changeMiniviewVisibility({
                key: 'preview',
                visible: false
            })
        )}
        {...props} />
    </>
)
}

Miniview.defaultProps = {
    average: false,
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: '100%',
    height: '100%',
    absolutePositioning: false,
    displayPreview: true,
}


export default Miniview
