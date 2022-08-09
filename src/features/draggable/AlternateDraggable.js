import React from "react"
import { useRef } from "react"
import { IoReorderFourSharp } from 'react-icons/io5'
import { useDrag, useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import './Draggable.css'
import { useDispatch } from "react-redux"
import { moveDraggable } from "./alternateDraggableSlice"

const AlternateDraggable = ({ children,  initialY, id, index, spacing, top, ...props }) => {
    
    // Two refs needed - one for handle, one for preview
    const ref = useRef(null)
    const previewRef = useRef(null)

    const dispatch = useDispatch()
    // function for changing the y-coordinate of the draggable
    const adjustY = (item, monitor) =>{

        let coordinate = monitor.getClientOffset()
       
        let gap;
        spacing == undefined ? gap = 4 : gap = spacing

        let ceiling;
        top == undefined ? ceiling = 0 : ceiling = top
        

        if(coordinate !== null){  

            let hoverBoundingRect = ref.current?.getBoundingClientRect();
            let hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            let height = hoverBoundingRect.bottom - hoverBoundingRect.top + gap
            let increment = Math.round((coordinate.y - hoverMiddleY)/height)
            
            let newLocation = Math.max(increment*height, ceiling)
  
            dispatch(moveDraggable({
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
        <div ref={previewRef} className='draggable' style={{position:'absolute', top: initialY, left: 0, width: '100%'}} {...props}>
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


export default AlternateDraggable;