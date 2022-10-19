import React, { useEffect, useRef, useState, focus } from "react"
import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import Window from "features/miniview/Window";
import { Typography, Stack } from '@mui/material';

import { addMiniview, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility } from 'features/miniview/miniviewSlice.js'
import { increaseZoom, decreaseZoom, pan } from "./basicTrackSlice";




const BasicTrack = ({ array, color, doSomething, coordinateX, coordinateY, width, height, id, beginning, fin, grouped, zoom, pastZoom, offset, title, ...props }) => {

    const canvasRef = useRef(null)

    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['preview']

    const [ endCap, setEndCap ] = useState(0)
    const [ startOfTrack, setStartOfTrack ] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [ clickLocation, setClickLocation ] = useState()
    const [ normalizer, setNormalizer ] = useState([1,1])

    const magicWidth = 2000;

    useEffect(() => {

        if (array == undefined) return

        let cap;
        fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

        let start;
        beginning ? start = beginning : start = Math.min(...array.map(d => d.start))

        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, magicWidth, ctx.canvas.height)

        let xScale = scaleLinear().domain([0, cap]).range([0, magicWidth*zoom])

       
      
        // TODO center the text, and leave a small buffer on each end
        let basePairUnits = (cap/1000000) > 0 ? [1000000, 'Mb'] : [1000, 'Kb']
  
        setNormalizer(basePairUnits)

        let scalingIncrements = scaleLinear().domain([0, cap]).range([0, magicWidth*zoom])
        setStartOfTrack(Math.max(0,scalingIncrements.invert(0 - offset))) 
        setEndCap(Math.min(scalingIncrements.invert(magicWidth-offset), cap))

        let widthScale = scaleLinear().domain([0, cap - start]).range([0, magicWidth*zoom])
        ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'

        array.forEach(gene => {
            let x = ((xScale(gene.start)) + offset)
            let rectWidth = widthScale(gene.end - gene.start)
            ctx.beginPath()
            ctx.rect(x, 0, rectWidth, ctx.canvas.height)
            ctx.fill()
        })
    }, [array, color, zoom, offset])

    let style = {
        position: 'relative',
        top: coordinateY,
        left: coordinateX,
        width: width,
        height: height,
        margin: 0
    }

    // TODO -> does this need to be here?
    const dispatch = useDispatch()

    function handleScroll(e){
        
        let normalizedLocation = (e.clientX/e.target.offsetWidth) * magicWidth

        let scaleChange = zoom - pastZoom;
        if(e.deltaY < 0){
            dispatch(increaseZoom({
                key: id,
            }))
            dispatch(pan({
                key: id,
                offset: Math.max(-(magicWidth * zoom - magicWidth), Math.min(offset - normalizedLocation*scaleChange, 0))
            }))
        }
        else{
            if( zoom > 1.0){
                 dispatch(decreaseZoom({
                key: id,
            }))
        }
            if( zoom == 1.1){
                dispatch(pan({
                    key: id,
                    offset: 0
                }))
                return
            }  
            // TODO I really don't like the magic-ness of this
            scaleChange = (zoom/1.1 - zoom)
             dispatch(pan({
                key: id,
                offset: Math.max(-(magicWidth * zoom - magicWidth), Math.min(offset - normalizedLocation*scaleChange, 0))
            }))
        }
    }

    function handlePan(e){
       dispatch(pan({
            key:id, 
            offset: Math.max(-(magicWidth * zoom - magicWidth), Math.min(offset + e.movementX, 0))
        }))
 
       
    }

    function showPreview(event) {

        let boundingBox = event.target.getBoundingClientRect()
        let verticalScroll = document.documentElement.scrollTop

        let westEnd = boundingBox.x
        let eastEnd = boundingBox.x + boundingBox.width


        let changedX = event.pageX
        let changedY = boundingBox.y + boundingBox.height + 5 + verticalScroll

        // Would give weird scaling if the array was movable
        let cap;
        fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

        let start;
        beginning ? start = beginning : start = Math.min(...array.map(d => d.start))


        let xScale = scaleLinear().domain([startOfTrack, endCap]).range([westEnd, eastEnd])
        let widthScale = scaleLinear().domain([0, endCap- startOfTrack]).range([0, eastEnd - westEnd])

        let center = xScale.invert(changedX)
        let head = center - 50000
        let end = center + 50000

        let previewArray = array.filter(item => {
            return ((item.end >= head && item.start <= head) || (item.start >= head && item.end <= end) || (item.start <= end && item.end >= end))
        })

        // TODO these are placeholders + hacky fixes
        dispatch(changeMiniviewColor({
            key: 'preview',
            color: color
        }))
        dispatch(updateData({
            key: 'preview',
            array: previewArray,
            start: head,
            end: end,
            boxWidth: widthScale(end - head),
        }))
        dispatch(moveMiniview(
            {
                key: 'preview',
                coordinateX: Math.max(westEnd + 80, Math.min(eastEnd - previewSelector.width - 80, changedX - previewSelector.width / 2)),
                coordinateY: changedY,
                viewFinderY: boundingBox.y + verticalScroll,
                viewFinderX: changedX
            }))
        dispatch(changeMiniviewVisibility(
            {
                key: 'preview',
                visible: true
            }))

        Math.round(beginning)

    }


    function handleClick(e){
        if(e.type =='mousedown'){
            setDragging(true)
            setClickLocation(e.clientX)
        }
        if(e.type == 'mouseup'){
            setDragging(false)
            if(e.clientX == clickLocation) doSomething(e)
            setClickLocation(null)
        }
    }
    
    let cap;
    fin ? cap = fin : cap = Math.max(...array.map(d => d.end))


    //! Changing length of text changes the location of ticks
    return (
        <div className="test" style={{width: '100%', height: '100%'}}>
        {title && 
        <Typography
            className={"title"}
            style={{position: 'relative',
            top: 0,
            left: 0, 
            width: '0%', 
            height: '0%',
            zIndex: 2,
            pointerEvents: 'none',}}
        >{title}</Typography>}
            <canvas
            tabIndex={-1}
                id={id}
                ref={canvasRef}
                className='miniview'
                width='2000'
                height='1000'
                style={style}
                onContextMenu={doSomething}
                onMouseDown={(e) => handleClick(e)}
                onMouseUp={(e) => handleClick(e)}
                onMouseMove={(e) => {
                    if(dragging) handlePan(e)
                    canvasRef.current.focus()
                    showPreview(e)
                    }}
                onMouseLeave={() => dispatch(
                    changeMiniviewVisibility({
                        key: 'preview',
                        visible: false
                    })
                )}
                onWheel={(e) => handleScroll(e)}
                {...props} />
            <div className='scale'>
                <div width='2000' style={{ border: 'solid black 1px', marginTop: -8 }} />
                <Stack direction='row' justifyContent="space-between" className="scale">
                    <div id={'findme'} style={{ borderLeft: 'solid black 2px', marginTop: -4, height: 15 }} >{Math.round(startOfTrack/ normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid black 2px', marginTop: -4, height: 15 }} >{Math.round(((endCap-startOfTrack) / 5+startOfTrack)/ normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid black 2px', marginTop: -4, height: 15 }} >{Math.round((2 * (endCap-startOfTrack) / 5+startOfTrack)/ normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid black 2px', marginTop: -4, height: 15, textAlign: 'right' }} >{Math.round((3 * (endCap-startOfTrack) / 5+startOfTrack)/ normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid black 2px', marginTop: -4, height: 15, textAlign:'left' }} >{Math.round((4 * (endCap-startOfTrack) / 5+startOfTrack)/ normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ borderRight: 'solid black 2px', marginTop: -4, height: 15 }} >{Math.round(((endCap-startOfTrack)+startOfTrack)/ normalizer[0]) + ' ' + normalizer[1]}</div>
                </Stack>
            </div>

        </div>
    )
}

BasicTrack.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: '100%',
    height: '75%',
    zoom: 1.0,
    pastZoom: 1.0,
    offset: 0,
}


export default BasicTrack
