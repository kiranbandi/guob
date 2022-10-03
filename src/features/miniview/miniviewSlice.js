import { createSlice } from '@reduxjs/toolkit';
import testing_array from '../../data/testing_array';
import testing_array_dh1 from '../../data/testing_array_dh1';
import testing_array_dh2 from '../../data/testing_array_dh2';
import testing_array_dh3 from '../../data/testing_array_dh3';
import testing_array2 from '../../data/testing_array2';
import testing_array3 from '../../data/testing_array3';

const initialState = {
    // Currently just a placeholder 
    miniviews: {
        'preview': { 
             color: 0,
             coordinateX: 0,
             coordinateY: 0,
             height: "1rem",
             width: 400,
             id: 'preview',
             visible: false
         },
         'zero':{
             array: testing_array,
             color: 50
         },
         'one':{
             array: testing_array2,
             color: 150
         },
         'two':{
             array: testing_array3,
             color: 250
         },
         'dh1':{
            array: testing_array_dh1,
            color: 50
        },
        'dh2':{
            array: testing_array_dh2,
            color: 150
        },
        'dh3':{
            array: testing_array_dh3,
            color: 250
        },
         'test':{
             array: testing_array2,
             color: 200
         },
         'secondTest':{
             array: testing_array3,
             color: 300
         }
     },
     comparison: []
}


export const miniviewSlice = createSlice({
    name: 'miniview',
    initialState,

    reducers: {

        addMiniview: (state, action) =>{
            if(!state.miniviews[action.payload.key]){
                state.miniviews[action.payload.key] = action.payload
            }
        },
        removeMiniview: (state,action) =>{
            delete  state.miniviews[action.payload.key]
        },
        moveMiniview: (state, action) => {
            state.miniviews[action.payload.key].coordinateX = action.payload.coordinateX
            state.miniviews[action.payload.key].coordinateY = action.payload.coordinateY
        },
        updateData: (state, action) => {
            state.miniviews[action.payload.key].array = action.payload.array
            if(action.payload.start !== undefined){
                state.miniviews[action.payload.key].start = action.payload.start
            }
            if(action.payload.end !== undefined){
                state.miniviews[action.payload.key].end = action.payload.end
            }
        },
        changeMiniviewColor: (state, action) => {
            state.miniviews[action.payload.key].color = action.payload.color
        },
        changeMiniviewVisibility: (state, action) => {
            state.miniviews[action.payload.key].visible = action.payload.visible
        },
        addComparison: (state, action) =>{
                state.comparison.push(action.payload)

        },
        removeComparison: (state, action) =>{
            let test = state.comparison.pop()
        }
    }
})

export const {addMiniview, removeMiniview, moveMiniview, updateData, changeMiniviewColor, changeMiniviewVisibility, addComparison, removeComparison } = miniviewSlice.actions;

export const selectMiniviews = (state) => state.miniview.miniviews
export const selectComparison = (state) => state.miniview.comparison

export default miniviewSlice.reducer;