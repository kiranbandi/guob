
import React from "react"
import { useDrag, useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import { useRef, useState } from "react"
import { IoReorderFourSharp } from 'react-icons/io5'
import './Draggable.css'
import { useDispatch } from "react-redux"
import { moveDraggable, switchDraggable, toggleGroup, clearGroup, insertDraggable, selectGroup } from "./draggableSlice"
import { IconButton, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { teal } from '@mui/material/colors';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useSelector } from "react-redux"
import { GroupAddOutlined } from "@mui/icons-material"

const Draggable = ({ children, id, index, grouped, groupID }) => {

    // One ref for handle, one for preview
    const ref = useRef(null)
    const secondRef = useRef(null)

    const dispatch = useDispatch()
    // const groupSelector = useSelector(selectGroup)
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.BOUNDED,
        hover(item, monitor) {

            if (!ref.current) return


            const dragIndex = item.index
            const hoverIndex = index

            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

            const clientOffset = monitor.getClientOffset()
            const hoverClientY = clientOffset.y - hoverBoundingRect.top

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }

            // Updating the redux store - using conditional to keep calls to a minimum
            if (dragIndex != hoverIndex) {
                dispatch(switchDraggable({
                        startKey: item.id,
                        switchKey: id
                    })
                    )

                if (!grouped) {
                    // If outside the group, the entire group needs to be moved as opposed to just switching two
                    let offset = 1;
                    groupID.forEach((x) => {
                        if(x != item.id){
                            dispatch(insertDraggable({
                            startKey: item.id,
                            id: x,
                            index: offset
                        })
                        )
                        offset += 1;
                        }
                    })
                }
                }
             // Need to change the item's index or it can't be placed back in the original position due to the conditional
            item.index = hoverIndex

        },
    }), [index, groupID])

    // Drag function
    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: ItemTypes.BOUNDED,
            item: () => { return { id, index, grouped, groupID } },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }), []
    )

    const opacity = isDragging ? 0.6 : 1
    const highlightGroup = grouped ? "5px solid" + teal[500] : undefined
    const borderGroup = grouped ? "outset" : "none"

    drag(drop(ref))
    drop(preview(secondRef))


    return (
        <div ref={secondRef} className='draggable'>
            <div className='draggableItem' style=
                {{
                    opacity: opacity,
                    borderStyle: borderGroup,
                    border: highlightGroup
                }}>
                {children}
            </div>
            <IconButton ref={ref} className='handle' sx={{
                backgroundColor: teal[100],
                borderRadius: 1,
                '&:hover': {
                    backgroundColor: teal[500]
                }
            }} onClick={(e) => {
                if (!e.ctrlKey && !grouped){
                    dispatch(clearGroup())
                }
                else{
                    if(!e.ctrlKey) return 
                     dispatch(toggleGroup({
                    id: id
                }))
                }
            }}
             onMouseDown={(e) =>{
                if (!e.ctrlKey && !grouped){
                    dispatch(clearGroup())
                }
             }}
               >
                <DragHandleIcon fontSize="small" className="handle_image" />
            </IconButton>
        </div>

    )
}

export default Draggable;