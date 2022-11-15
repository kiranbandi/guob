import { selectDraggables } from "features/draggable/draggableSlice"
import { useDispatch, useSelector } from "react-redux"
import { selectBasicTracks, changeZoom, pan } from "./basicTrackSlice"
import OrthologLinks from "./OrthologLinks"
import { useRef, useEffect, useState } from "react"


const LinkContainer = ({ index, id, normalize, ...props }) => {

    const trackSelector = useSelector(selectBasicTracks)
    const indexSelector = useSelector(selectDraggables)
    const linkRef = useRef(1)

    const dispatch = useDispatch()

    const [clickLocation, setClickLocation] = useState()
    const [dragging, setDragging] = useState()

    // These should have all the information from the tracks, including zoom level + offset
    let aboveData = trackSelector[indexSelector[index - 1]]
    let belowData = trackSelector[indexSelector[index + 1]]

    const parentWrapperWidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width;
    const maxWidth = Math.round(parentWrapperWidth * 0.98)

    useEffect(() => {
        linkRef.current.addEventListener('wheel', preventScroll, { passive: false });
        // if alt key is pressed then stop the event 
        function preventScroll(e) {
            if (e.altKey == true) {
                e.preventDefault();
                // e.stopPropagation();
                return false;
            }
        }
    }, [])

    function handleScroll(e) {
        if (e.altKey == true) {
            let factor = 0.9
            if (e.deltaY < 0) {
                factor = 1 / factor
            }

            let boundingBox = e.target.getBoundingClientRect()
            let normalizedLocation = ((e.clientX - boundingBox.x) / boundingBox.width) * maxWidth
            let dx = ((normalizedLocation - aboveData.offset) * (factor - 1))
            let offsetX = Math.max(Math.min(aboveData.offset - dx, 0), -((maxWidth * aboveData.zoom * factor) - maxWidth))
            if (Math.max(aboveData.zoom * factor, 1.0) === 1.0) offsetX = 0

            dispatch(pan({
                key: aboveData.key,
                offset: offsetX
            }))

            dx = ((normalizedLocation - belowData.offset) * (factor - 1))
            offsetX = Math.max(Math.min(belowData.offset - dx, 0), -((maxWidth * belowData.zoom * factor) - maxWidth))
            if (Math.max(belowData.zoom * factor, 1.0) === 1.0) offsetX = 0

            dispatch(pan({
                key: belowData.key,
                offset: offsetX
            }))

            dispatch(changeZoom({
                key: aboveData.key,
                zoom: Math.max(aboveData.zoom * factor, 1.0)
            }))
            dispatch(changeZoom({
                key: belowData.key,
                zoom: Math.max(belowData.zoom * factor, 1.0)
            }))
        }
    }

    function handleClick(e) {
        if (e.type == 'mousedown') {
            setDragging(true)
            setClickLocation(e.clientX)
        }
        if (e.type == 'mouseup') {
            setDragging(false)
            setClickLocation(null)
        }
    }

    function handlePan(e) {
        // Panning both tracks
        if (dragging === true) {

            let offsetX = Math.max(Math.min(aboveData.offset + e.movementX, 0), -((maxWidth * aboveData.zoom) - maxWidth))
            dispatch(pan({
                key: aboveData.key,
                offset: offsetX,
            }))

            offsetX = Math.max(Math.min(belowData.offset + e.movementX, 0), -((maxWidth * belowData.zoom) - maxWidth))
            dispatch(pan({
                key: belowData.key,
                offset: offsetX,
            }))
        }
    }

    return (
        <div ref={linkRef} onWheel={handleScroll} onMouseDown={handleClick} onMouseUp={handleClick} onMouseMove={handlePan}>
            <OrthologLinks id={id} topTrack={aboveData} bottomTrack={belowData} normalize={normalize} ></OrthologLinks>
        </div>
    )

    }
    export default LinkContainer