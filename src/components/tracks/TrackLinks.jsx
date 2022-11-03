import { selectDraggables } from "features/draggable/draggableSlice"
import { useDispatch, useSelector } from "react-redux"
import { selectBasicTracks } from "./basicTrackSlice"


const TrackLinks = ({index, id,...props}) =>{
    
    const trackSelector =  useSelector(selectBasicTracks)
    const indexSelector = useSelector(selectDraggables)

    // These should have all the information from the tracks, including zoom level + offset
    let aboveData = trackSelector[indexSelector[index - 1]]
    let belowData = trackSelector[indexSelector[index + 1]]

    // Just finding these values for the returned example div below
    let aboveArray = trackSelector[indexSelector[index - 1]] ? trackSelector[indexSelector[index - 1]].array : []
    let belowArray =  trackSelector[indexSelector[index + 1]] ? trackSelector[indexSelector[index + 1]].array : []
    let aboveLength = aboveArray.length 
    let aboveCap = aboveLength > 0 ?  Math.max(...aboveArray.map(d=> d.end)) : 0
    let belowLength = belowArray.length
    let belowCap = belowLength > 0 ? Math.max(...belowArray.map(d=> d.end)) : 0

    return(
    <>
        <div id={id}>
            <a>The track above this is {indexSelector[index - 1]}, it has {aboveLength} items in the datataset, with the end being {aboveCap}</a>
            <br/>
            <a>The track below this is {indexSelector[index + 1]}, it has {belowLength} items in the datataset, with the end being {belowCap}</a>
        </div>
    </>
    )
}

export default TrackLinks