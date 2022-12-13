
import React from "react"
import { useDrag, useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import { useRef, useState } from "react"
import { IoReorderFourSharp } from 'react-icons/io5'
import { useDispatch } from "react-redux"
import { moveDraggable, switchDraggable, toggleGroup, clearGroup, insertDraggable, sortGroup, selectDraggables, setDraggables, removeDraggable } from "./draggableSlice"
import { toggleTrackType, removeBasicTrack } from "../../components/tracks/basicTrackSlice"
import { IconButton, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { teal, deepOrange } from '@mui/material/colors';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useSelector } from "react-redux"
import { GroupAddOutlined } from "@mui/icons-material"
import { countBy } from "lodash"

const Draggable = ({ children, id, index, grouped, groupID, className, showControls = false }) => {

    // One ref for handle, one for preview
    const ref = useRef(null)
    const secondRef = useRef(null)

    const dispatch = useDispatch()
    const draggableSelector = useSelector(selectDraggables)

    let [waiting, setWaiting] = useState()
    let [change, setChange] = useState()

    function updateTimer() {
        clearTimeout(waiting)
        setWaiting(window.setTimeout(() => {
            setChange(true)
        }, 500))
    }


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
                        if (x != item.id) {
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
                dispatch(sortGroup())
            }
            // Need to change the item's index or it can't be placed back in the original position due to the conditional
            item.index = hoverIndex
        },
    }), [index, groupID])

    // Drag function
    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: ItemTypes.BOUNDED,
            item: () => { return { id, index, grouped, groupID, ref, className } },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }), []
    )

    const opacity = isDragging ? 0.6 : 1
    const highlightGroup = grouped ? ".25rem solid" + teal[500] : undefined
    const borderGroup = grouped ? "outset" : "none"

    drag(drop(ref))

    //#############################
    // Used without CustomDragLayer
    // drop(preview(secondRef))

    // Used with CustomDragLayer
    drop((secondRef))
    //###################################


    if (window.gt && change) {
        window.gt.updateState({ Action: "handleDragged", order: draggableSelector, id: id })
        setChange()
    }

    if (window.gt) {
        window.gt.on('state_updated_reliable', (userID, payload) => {
            // TODO this feels like a hacky way of doing this
            if (userID === document.title) return
            if (payload.Action == "handleDragged") {
                if (payload.id !== id) return
                dispatch(setDraggables({
                    order: payload.order
                }))
            }
        })
    }
    return (
        <div ref={secondRef} className={className}>
            <div className={'draggableItem ' + (showControls ? "smaller" : '')} style=
                {{
                    opacity: opacity,
                    borderStyle: borderGroup,
                    border: highlightGroup,
                    // display: "flex"
                }}>
                {children}
            </div>
            {showControls && <div className='handle smaller' style={{ paddingTop: '1%' }}>

                <IconButton ref={ref} className='halfHandle' sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }} onClick={(e) => {
                    dispatch(toggleTrackType({ id }))
                }}
                >
                    <MultilineChartIcon fontSize="small" className="handle_image" />
                </IconButton>

                <IconButton ref={ref} className='halfHandle' sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }} onClick={(e) => {
                    dispatch(removeDraggable({ 'key': id }))
                    dispatch(removeBasicTrack({ 'key': id }))
                }}
                >
                    <RemoveCircleOutlineIcon fontSize="small" className="handle_image" />
                </IconButton>

            </div>
            }


            <IconButton ref={ref} className={'handle ' + (showControls ? "smaller" : '')} sx={{
                backgroundColor: teal[100],
                borderRadius: 1,
                '&:hover': {
                    backgroundColor: teal[500]
                }
            }}
                onClick={(e) => {
                    if (!e.ctrlKey && !grouped) {
                        dispatch(clearGroup())
                    }
                    else {
                        if (!e.ctrlKey) return
                        dispatch(toggleGroup({
                            id: id
                        }))
                        dispatch(sortGroup())
                    }

                }}
                onMouseDown={(e) => {
                    if (!e.ctrlKey && !grouped) {
                        dispatch(clearGroup())
                    }
                    if (window.gt) {
                        updateTimer()
                    }
                }}
            >
                <DragHandleIcon fontSize="small" className="handle_image" />
            </IconButton>
        </div >

    )
}

export default Draggable;