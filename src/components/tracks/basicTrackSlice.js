import { createSlice } from '@reduxjs/toolkit';
import testing_array from '../../data/testing_array';
import testing_array2 from '../../data/testing_array2';
import testing_array3 from '../../data/testing_array3';


const initialState = {
    // Currently just a placeholder 
    BasicTracks: {
         'zero':{
             array: testing_array,
             color: 50,
             zoom: 1.0,
             pastZoom: 1.0,
             offset: 0,
         },
         'one':{
             array: testing_array2,
             color: 150,
             zoom: 1.0,
             pastZoom: 1.0,
             offset: 0,
         },
         'two':{
             array: testing_array3,
             color: 250,
             zoom: 1.0,
             pastZoom: 1.0,
             offset: 0,
         },
         'test':{
             array: testing_array2,
             color: 200,
             zoom: 1.0,
             pastZoom: 1.0,
             offset: 0,
         },
         'secondTest':{
             array: testing_array3,
             color: 300,
             zoom: 1.0,
             pastZoom: 1.0,
             offset: 0,
         },
     },
}


export const basicTrackSlice = createSlice({
    name: 'basictrack',
    initialState,

    reducers: {

        addBasicTrack: (state, action) =>{
            if(!state.BasicTracks[action.payload.key]){
                state.BasicTracks[action.payload.key] = action.payload
            }
        },
        removeBasicTrack: (state,action) =>{
            delete  state.BasicTracks[action.payload.key]
        },
        moveBasicTrack: (state, action) => {
            state.BasicTracks[action.payload.key].coordinateX = action.payload.coordinateX
            state.BasicTracks[action.payload.key].coordinateY = action.payload.coordinateY
            state.BasicTracks[action.payload.key].viewFinderY = action.payload.viewFinderY
            state.BasicTracks[action.payload.key].viewFinderX = action.payload.viewFinderX
        },
        updateData: (state, action) => {
            state.BasicTracks[action.payload.key].array = action.payload.array
            if(action.payload.start !== undefined){
                state.BasicTracks[action.payload.key].start = action.payload.start
            }
            if(action.payload.end !== undefined){
                state.BasicTracks[action.payload.key].end = action.payload.end
            }
            if(action.payload.boxWidth !== undefined){
                state.BasicTracks[action.payload.key].boxWidth = action.payload.boxWidth
            }
        },
        changeBasicTrackColor: (state, action) => {
            state.BasicTracks[action.payload.key].color = action.payload.color
        },
        changeZoom: (state, action) =>{
            state.BasicTracks[action.payload.key].zoom = action.payload.zoom
        },
        pan: (state, action) =>{
            state.BasicTracks[action.payload.key].offset = action.payload.offset
        },
        setSelection: (state, action) => {
            state.BasicTracks[action.payload.key].selection = action.payload.selection
        },
        clearSelection: (state, action) => {
            state.BasicTracks[action.payload.key].selection = undefined
        },
    }
})

export const {addBasicTrack, removeBasicTrack, moveBasicTrack, updateData, changeBasicTrackColor, changeZoom, pan, setSelection, clearSelection } = basicTrackSlice.actions;


export const selectBasicTracks = (state) => state.basictrack.BasicTracks

export default basicTrackSlice.reducer;