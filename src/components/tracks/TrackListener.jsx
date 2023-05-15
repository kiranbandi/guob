/** @jsxImportSource @emotion/react */
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectBasicTracks, removeBasicTrack, toggleTrackType, changeBasicTrackColor } from './basicTrackSlice'
import { removeDraggable } from 'features/draggable/draggableSlice'
import { useState } from 'react'
import { ChromePicker } from 'react-color'
import { css } from '@emotion/react';
import Select from 'react-select'

/**
 * Listens for events from the "TrackControls" component - not very React-ful - but when generating
 * a lot of tracks the event handlers get out of hand
 */

const TrackListener = ({ children, style }) => {

    const basicTrackSelector = useSelector(selectBasicTracks)
    const dispatch = useDispatch()

    const [showTypeOptions, setshowTypeOptions] = useState(false)
    const [showTypeLocation, setshowTypeLocation] = useState({x: 0, y: 0})
    const [showTypeSelection, setshowTypeSelection] = useState()
    const [showColorPicker, setColorPickerVisibility] = useState(false)
    const [colorPickerColor, setColorPickerColor] = useState()
    const [colorPickerSelection, setColorPickerSelection] = useState()
    const [colorPickerLocation, setColorPickerLocation] = useState({x: 0, y: 0})
    const trackTypes = ['heatmap', 'histogram', 'scatter', 'line']
    let options = trackTypes.map( d => ({
        "value" : d,
        "label" : d
    }))
    function handleChange(e){
        dispatch(toggleTrackType({ 'id': showTypeSelection, 'type' : e.value }))
        setshowTypeOptions(false)
    }
    function handleClick(e) {
        let goal = e.target
        while (goal) {
            if (goal.id === 'eventListener') return
            else if (goal.type === 'button') {
                break
            }
            goal = goal.parentElement
        }
        let buttonInfo = goal.id.split(/_(.*)/s)
        // console.log(buttonInfo)
        switch (buttonInfo[0]) {
            case "deleteTrack":
                dispatch(removeDraggable({ 'key': buttonInfo[1] }))
                dispatch(removeBasicTrack({ 'key': buttonInfo[1] }))
                break
            case "toggleTrackType":
                setshowTypeOptions(true)
                setshowTypeSelection(buttonInfo[1])
                let buttonsLocation = goal.getBoundingClientRect()
                setshowTypeLocation({ x: buttonsLocation.x, y: buttonsLocation.y + document.documentElement.scrollTop })
                // dispatch(toggleTrackType({ 'id': buttonInfo[1] }))
                break
            case "pickColor":
                setColorPickerVisibility(true)
                setColorPickerColor(basicTrackSelector[buttonInfo[1]].color)
                setColorPickerSelection(buttonInfo[1])
                let buttonLocation = goal.getBoundingClientRect()
                setColorPickerLocation({ x: buttonLocation.x, y: buttonLocation.y + document.documentElement.scrollTop })
                break
            
        }
    }


let styling = css(css`
    .popover {
            position: absolute;
            z-index: 2;
            left: ${colorPickerLocation ? colorPickerLocation.x - 200 + 'px' : 0};
            top: ${colorPickerLocation ? colorPickerLocation.y - 200 + 'px' : 0};
        }
    .Typepopover {
        position: absolute;
        z-index: 2;
        left: ${showTypeLocation ? showTypeLocation.x - 10+ 'px' : 0};
        top: ${showTypeLocation ? showTypeLocation.y + 'px' : 0};
    }
    }`)



    const cover = {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }

    let x = colorPickerLocation ? colorPickerLocation.x - 200 + 'px' : 0
    let y = colorPickerLocation ? colorPickerLocation.y - 200 + 'px' : 0

    return (
        <div css={styling} style={style} onClick={handleClick} id="eventListener" >
            {showColorPicker ? <div className="popover">
                <div style={cover} onClick={(e) => { setColorPickerVisibility(false) }} />
                <ChromePicker disableAlpha={true} color={{ 'hex': colorPickerColor }}  onChangeComplete={(c) => {
                    dispatch(changeBasicTrackColor({ 'key': colorPickerSelection, 'color': c.hex }))
                    setColorPickerColor(c.hex)
                }} />
            </div> : null}
            {showTypeOptions ? <div className="Typepopover">
                <div style={cover} onClick={(e) => { setshowTypeOptions(false) }} />
                <Select options={options} onChange={handleChange} />

            </div> : null}
            {children}
        </div>
    )
}

export default TrackListener