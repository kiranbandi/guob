import { createSlice } from "@reduxjs/toolkit";

const initialState={
    // currently a placeholder
    draggables: {
        'test':{
            coordinateY:500,
            key: 'test'
        },
        'secondTest':{
            coordinateY: 600,
            key: 'secondTest'
        }
    }
}

export const alternateDraggableSlice = createSlice({
    name: 'alternateDraggable',
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

export const {moveDraggable, addDraggable, removeDraggable} = alternateDraggableSlice.actions

export const selectAlternateDraggables = (state) =>  state.alternateDraggable.draggables


export default alternateDraggableSlice.reducer
