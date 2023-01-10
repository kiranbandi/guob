import { createSlice } from "@reduxjs/toolkit";
import _ from 'lodash';

const initialState = {
    // currently a placeholder
    draggables: ['dh1', 'dh2', 'dh3'],
    ortholog: [],
    group: [],
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

            if(action.payload.draggable == "draggable"){
                // Switch Index is passed in, but the index of the item being dragged is... fuzzier. Better to take it from the store
                let switchIndex = state.draggables.indexOf(action.payload.switchKey)
                let startIndex = state.draggables.indexOf(action.payload.startKey)
                let startKey = action.payload.startKey
                state.draggables.splice(startIndex, 1)
                state.draggables.splice(switchIndex,0, startKey)
    
                if(state.group.length > 1){
                    state.group.sort((a,b)=> state.draggables.indexOf(a) - state.draggables.indexOf(b))
                }

            }
        },
        insertDraggable: (state, action) => {

            if(action.payload.draggable == "draggable"){
            let moving = state.draggables.indexOf(action.payload.id)
            let reference = state.draggables.indexOf(action.payload.startKey)
            let index = reference > moving ? -1 : action.payload.index
            state.draggables.splice(moving,1)
            state.draggables.splice(reference + index, 0, action.payload.id)
            }
        }
        ,
        toggleGroup: (state, action) => {
            let index = state.group.indexOf(action.payload.id);
        
            index > -1 ? state.group.splice(index, 1) : state.group.push(action.payload.id);
        },
        clearGroup: (state, action) => {
            state.group.length = 0;
        },
        sortGroup: (state, action) => {
            if(state.group.length > 1){
                state.group.sort((a,b)=> state.draggables.indexOf(a) - state.draggables.indexOf(b))
            }
        },
        deleteAllDraggables: (state, action) => {
            state.draggables.length = 0
            state.group.length = 0
        },
        setDraggables: (state, action) => {
            state.draggables.length = 0
            state.draggables = action.payload.order
        },
        addSecond: (state, action) => {
            state.ortholog.push(action.payload.key)
        },
        clearSeconds: (state, action) => {
            state.ortholog.length = 0
        }

    }
})

export const { deleteAllDraggables, moveDraggable, addSecond, clearSeconds, addDraggable, removeDraggable, switchDraggable, insertDraggable, toggleGroup, clearGroup, sortGroup, setDraggables } = draggableSlice.actions

export const selectDraggables = (state) => state.draggable.draggables
export const selectSecondDraggables = (state) => state.draggable.ortholog
export const selectAll = (state) => state.draggable
export const selectGroup = (state) => state.draggable.group



export default draggableSlice.reducer
