
import React from "react"
import { useDrag, useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import { useRef, useState } from "react"
import { IoReorderFourSharp } from 'react-icons/io5'
import './Draggable.css'

const Draggable = ({ children, id, index, moveDraggable }) => {

    // One ref for handle, one for preview
    const ref = useRef(null)
    const secondRef = useRef(null)

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
            // Time to actually perform the action
            moveDraggable(dragIndex, hoverIndex)
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        }

    }))

    // Drag function
    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: ItemTypes.BOUNDED,
            item: () => { return { id, index } },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            })
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