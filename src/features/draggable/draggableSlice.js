import { createSlice } from "@reduxjs/toolkit";

const initialState={
    // currently a placeholder
    draggables: {
        'test':{
            coordinateY:300,
            key: 'test'
        },
        'secondTest':{
            coordinateY: 400,
            key: 'secondTest'
        }
    }
}

export const draggableSlice = createSlice({
    name: 'draggable',
    initialState,

    reducers: {
        moveDraggable: (state, action) =>{
            state.draggables[action.payload.key].coordinateY = action.payload.coordinateY
        },
        addDraggable: (state, action) => {
            state.draggables[action.payload.key] = action.payload
        },
        removeDraggable: (state, action) =>{
            delete state.draggables[action.payload.key]
        }
    }
})

export const {moveDraggable, addDraggable, removeDraggable} = draggableSlice.actions

export const selectDraggables = (state) => state.draggable.draggables


export default draggableSlice.reducer
