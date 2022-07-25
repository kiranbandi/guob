import React, { useCallback, useEffect, useState } from 'react'
import update from 'immutability-helper'
import Draggable from './Draggable'
import Miniview from './Miniview'
import testing_array from './testing_array'

function DragContainer({ children }) {

    // Requires use of key in props to maintain state once moved
    let arrayOfChildren = Array.isArray(children) ? children : [children]
    let i = 0;
    const [draggables, setDraggables] = useState(
        arrayOfChildren.map(child => {
            let temp = {
                index: i,
                component: child,
                key: child.key
            }
            i++
            return temp
        })
    )

    // Need to update state to pass any changes made to the children
    useEffect(() => {
        let x = 0
        let differentArray = arrayOfChildren.map(child => {
            let temp = {
                index: x,
                component: child,
                key: child.key
            }
            x++
            return temp
        })

        let newState = draggables.map(child => {
            return differentArray[child.index]
        })
        setDraggables(newState)

    }, [children])

    // Hook to re-order the draggables in the container
    const moveDraggable = useCallback((dragIndex, hoverIndex) => {
        setDraggables((prevDraggables) =>
            update(prevDraggables, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevDraggables[dragIndex]],
                ],
            }),
        )
    }, [])

    const renderChild = useCallback((child, index) => {
        return (
            <child.type
                {...child.props}
                index={index}
                key={index}
                moveDraggable={moveDraggable}
            />
        )
    }, [])

    return (
        <div className='Container'>{draggables.map((child, index) => renderChild(child.component, index))}</div>
    )
}

export default DragContainer