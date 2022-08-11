import React, { useEffect } from "react"
import { useRef } from "react"
import { IoReorderFourSharp } from 'react-icons/io5'
import { useDrag, useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import './Draggable.css'
import { useDispatch } from "react-redux"
import { moveAlternateDraggable } from "./alternateDraggableSlice"
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { IconButton, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { teal } from '@mui/material/colors';


const AlternateDraggable = ({ children,  initialY, id, index, spacing, top, width, ...props }) => {
    
    // Two refs needed - one for handle, one for preview
    const ref = useRef(null)
    const previewRef = useRef(null)

    const dispatch = useDispatch()
    
    // function for changing the y-coordinate of the draggable
    const adjustY = (item, monitor) =>{

        let coordinate = monitor.getClientOffset()
       
        let delta = monitor.getDifferenceFromInitialOffset()

        let gap;
        spacing == undefined ? gap = 4 : gap = spacing

        let ceiling;
        top == undefined ? ceiling = 0 : ceiling = top
        

        if(coordinate !== null){  

            //! Increment currently not working quiiiite right
            let reference = ref.current.offsetParent
            let top = reference.offsetTop
            let bottom = top + reference.offsetHeight
            let hoverBoundingRect = ref.current?.getBoundingClientRect();

            let hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            let height = hoverBoundingRect.bottom - hoverBoundingRect.top + gap
            console.log(height)
            let increment = Math.round((top + delta.y - hoverMiddleY)/height)
            
            let newLocation = Math.max(increment*height, ceiling)
            console.log(coordinate)
            console.log(monitor)
            console.log(top)
            console.log(newLocation)
            dispatch(moveAlternateDraggable({
                key: id,
                coordinateY: newLocation,
            }))

        }
    }

    // Drag function
 const [{ isDragging }, drag, preview] = useDrag(
    () => ({
        type: ItemTypes.FREE,
        item: () => { return { id, index} },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => (
            adjustY(item, monitor)
        ),
    }), []
)

// Empty drop function -> prevents another draggable from being placed on top
const [, drop] = useDrop(
    ()=>({
        accept: ItemTypes.FREE,
        drop(_item,monitor){},
    })
)
    let opacity = isDragging ? 0.5 : 1

    drag(ref)
    drop(preview(previewRef))



    return (
    <div ref={previewRef} className='alternateDraggable' style={{position:'absolute', top: initialY}} {...props}>
        <div className='draggableItem' style=
            {{
                opacity: opacity,
            }}>
            {children}
        </div>
        <IconButton ref={ref} className='handle' sx={{
        backgroundColor: teal[100],
        borderRadius: 1,
        '&:hover':{
            backgroundColor: teal[500]
        }
    }} >
        <DragHandleIcon fontSize="small" className="handle_image" />
    </IconButton>
    </div>

    )
}


export default AlternateDraggable;