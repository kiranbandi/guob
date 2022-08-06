import React, { useCallback, useEffect, useState } from 'react'
import update from 'immutability-helper'
import { useSelector, useDispatch } from 'react-redux'
import { selectDraggables, addDraggable, moveDraggable } from './draggableSlice';



function DragContainer({ children, starting }) {


    const dispatch = useDispatch()

    const moveDraggable = useCallback((dragIndex, hoverIndex, item) =>{

        dispatch(moveDraggable({
            startIndex:dragIndex, switchIndex: hoverIndex, startKey: item
        }
        ))
    }, [])

    const renderChild = (child, index, id) => {
        // console.log(index)
        return (
            <child.type
                {...child.props}
                index={index}
                id={id}
                key={id}
            />
        )
    }

    
    return(
        <div className='Container'>
            {starting.map((item, index) => {
              
                return renderChild(children[children.findIndex(child => child.key == item)], index, item )
                
                })}
        </div>
    )
}

export default DragContainer