import { selectDraggables } from "features/draggable/draggableSlice"
import { useDispatch, useSelector } from "react-redux"
import { selectBasicTracks } from "./basicTrackSlice"
import OrthologLinks from "./OrthologLinks"


const LinkContainer = ({index, id,...props}) =>{
    
    const trackSelector =  useSelector(selectBasicTracks)
    const indexSelector = useSelector(selectDraggables)

    // These should have all the information from the tracks, including zoom level + offset
    let aboveData = trackSelector[indexSelector[index - 1]]
    let belowData = trackSelector[indexSelector[index + 1]]

    return(
        <OrthologLinks id={id} topTrack={aboveData} bottomTrack={belowData} ></OrthologLinks>
    )
}

export default LinkContainer