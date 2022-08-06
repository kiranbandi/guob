
import React from "react"
import { useDrag, useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import { useRef, useState } from "react"
import { IoReorderFourSharp } from 'react-icons/io5'
import './Draggable.css'
import { useDispatch } from "react-redux"
import { moveDraggable, switchDraggable } from "./draggableSlice"

const Draggable = ({ children, id, index }) => {

    // One ref for handle, one for preview
    const ref = useRef(null)
    const secondRef = useRef(null)

    const dispatch = useDispatch()

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.BOUNDED,
        hover(item, monitor) {

            if (!ref.current) {
                return
            }

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
                    switchIndex: hoverIndex
                })
                )
                // Need to change the item's index or it can't be placed back in the original position due to the conditional
                item.index = hoverIndex
            }
        },
        }), [index])

    // Drag function
    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: ItemTypes.BOUNDED,
            item: () => { return { id, index } },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }), []
    )

    const opacity = isDragging ? 0.6 : 1

    drag(drop(ref))
    drop(preview(secondRef))

    return (
        <div ref={secondRef} className='draggable'>
            <div className='draggableItem' style=
                {{
                    opacity: opacity,
                }}>
                {children}
            </div>
            <button ref={ref} className='handle'>
                <IoReorderFourSharp className="handle_image" />
            </button>
        </div>

    )
}

export default Draggable;