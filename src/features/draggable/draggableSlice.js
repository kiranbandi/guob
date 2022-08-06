import { createSlice } from "@reduxjs/toolkit";
import update from 'immutability-helper'

const initialState = {
    // currently a placeholder
    // Should be re-ordering the things
    // THIS SHOULD JUST BE A LIST OF IDS
    draggables: ['zero', 'one', 'two']

}

export const draggableSlice = createSlice({
    name: 'draggable',
    initialState,

    reducers: {
        moveDraggable: (state, action) => {
            state.draggables[action.payload.key].index = action.payload.index

        },
        addDraggable: (state, action) => {
            // state.draggables[action.payload.key] = action.payload
            state.draggables.push(action.payload.key)
        },
        removeDraggable: (state, action) => {
            delete state.draggables[action.payload.key]
        },
        switchDraggable: (state, action) => {

            let switchIndex = action.payload.switchIndex
            let startIndex = state.draggables.indexOf(action.payload.startKey)

            let switchKey = action.payload.switchKey
            let startKey = action.payload.startKey

            state.draggables.splice(startIndex, 1)
            state.draggables.splice(switchIndex,0, startKey)

        }
    }
})

export const { moveDraggable, addDraggable, removeDraggable, switchDraggable } = draggableSlice.actions

export const selectDraggables = (state) => state.draggable.draggables


export default draggableSlice.reducer
