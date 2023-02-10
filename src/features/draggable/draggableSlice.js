import { createSlice } from "@reduxjs/toolkit";
import _ from 'lodash';

const initialState = {
    // currently a placeholder
    draggables: ['at1', 'at2', 'at3', 'at4', 'at5', 'links'],
    ortholog: [],
    group: [],
}

export const draggableSlice = createSlice({
    name: 'draggable',
    initialState,

    reducers: {
        moveDraggable: (state, action) => {
            state[action.payload.dragGroup][action.payload.key].index = action.payload.index

        },
        addDraggable: (state, action) => {
            state[action.payload.dragGroup].push(action.payload.key)
        },

        removeDraggable: (state, action) => {
            Object.keys(state).forEach(x => {
                let index = state[x].indexOf(action.payload.key)
                if(index > -1){
                    state[x].splice(index, 1)
                }
            })
        },
        switchDraggable: (state, action) => {
                // Switch Index is passed in, but the index of the item being dragged is... fuzzier. Better to take it from the store
                let switchIndex = state[action.payload.dragGroup].indexOf(action.payload.switchKey)
                let startIndex = state[action.payload.dragGroup].indexOf(action.payload.startKey)
                let startKey = action.payload.startKey
                state[action.payload.dragGroup].splice(startIndex, 1)
                state[action.payload.dragGroup].splice(switchIndex,0, startKey)
    
                if(state.group.length > 1){
                    state.group.sort((a,b)=> state[action.payload.dragGroup].indexOf(a) - state[action.payload.dragGroup].indexOf(b))
                }
        },
        insertDraggable: (state, action) => {
            let moving = state[action.payload.dragGroup].indexOf(action.payload.id)
            let reference = state[action.payload.dragGroup].indexOf(action.payload.startKey)
            let index = reference > moving ? -1 : action.payload.index
            state[action.payload.dragGroup].splice(moving,1)
            state[action.payload.dragGroup].splice(reference + index, 0, action.payload.id)
            
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
                state.group.sort((a,b)=> state[action.payload.dragGroup].indexOf(a) - state[action.payload.dragGroup].indexOf(b))
            }
        },
        deleteAllDraggables: (state, action) => {
            state[action.payload.dragGroup].length = 0
            state.group.length = 0
        },
        setDraggables: (state, action) => {
            state[action.payload.dragGroup].length = 0
            state[action.payload.dragGroup] = action.payload.order
        },
        clearDraggables: (state, action) => {
            state[action.payload.dragGroup].length = 0

        }

    }
})

export const { deleteAllDraggables, clearDraggables, moveDraggable, addDraggable, removeDraggable, switchDraggable, insertDraggable, toggleGroup, clearGroup, sortGroup, setDraggables } = draggableSlice.actions

export const selectDraggables = (state) => state.draggable
export const selectGroup = (state) => state.draggable.group



export default draggableSlice.reducer
