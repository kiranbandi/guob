import { createSlice } from "@reduxjs/toolkit";
import update from 'immutability-helper'

const initialState = {
    // currently a placeholder
    draggables: ['dh1', 'dh2', 'dh3']

}

export const draggableSlice = createSlice({
    name: 'draggable',
    initialState,

    reducers: {
        moveDraggable: (state, action) => {
            state.draggables[action.payload.key].index = action.payload.index

        },
        addDraggable: (state, action) => {
            state.draggables.push(action.payload.key)
        },

        removeDraggable: (state, action) => {
            let index = state.draggables.indexOf(action.payload.key)
            state.draggables.splice(index, 1)
        },
        switchDraggable: (state, action) => {

            // Switch Index is passed in, but the index of the item being dragged is... fuzzier. Better to take it from the store
            let switchIndex = state.draggables.indexOf(action.payload.switchKey)
            let startIndex = state.draggables.indexOf(action.payload.startKey)
            let startKey = action.payload.startKey
            state.draggables.splice(startIndex, 1)
            state.draggables.splice(switchIndex,0, startKey)
        }
    }
})

export const { moveDraggable, addDraggable, removeDraggable, switchDraggable } = draggableSlice.actions

export const selectDraggables = (state) => state.draggable.draggables


export default draggableSlice.reducer
