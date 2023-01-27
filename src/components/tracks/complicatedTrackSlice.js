import { createSlice } from '@reduxjs/toolkit';
import testing_array from '../../data/testing_array';
import testing_array2 from '../../data/testing_array2';
import testing_array3 from '../../data/testing_array3';
import testing_array_dh1 from '../../data/testing_array_dh1';
import testing_array_dh2 from '../../data/testing_array_dh2';
import testing_array_dh3 from '../../data/testing_array_dh3';

const trackTypes = ['heatmap', 'histogram', 'scatter', 'line']

const initialState = {
    // Currently just a placeholder 
    ComplicatedTracks: {
        'dh1': {
            key: 'dh1',
            array: testing_array_dh1,
            color: 50
        },
        'dh2': {
            key: 'dh2',
            array: testing_array_dh2,
            color: 150
        },
        'dh3': {
            key: 'dh3',
            array: testing_array_dh3,
            color: 250
        },
    },
}


export const complicatedTrackSlice = createSlice({
    name: 'complicatedtrack',
    initialState,

    reducers: {

        addComplicatedTrack: (state, action) => {
            if (!state.ComplicatedTracks[action.payload.key]) {
                state.ComplicatedTracks[action.payload.key] = action.payload
                state.ComplicatedTracks[action.payload.key].subarrays = []
            }
        },
        appendComplicatedTrack: (state, action) => {
            if (!state.ComplicatedTracks[action.payload.key]){
                state.ComplicatedTracks[action.payload.key] = {
                    zoom: 1,
                    offset: 0,
                    subarrays: [action.payload.array]
                }
            }
            else{
                if (!state.ComplicatedTracks[action.payload.key].subarrays) {
                    state.ComplicatedTracks[action.payload.key].subarrays = [action.payload.array]
                }
                else{
                    state.ComplicatedTracks[action.payload.key].subarrays.push(action.payload.array)
                    
                }

            }
        },
        removeComplicatedTrack: (state, action) => {
            delete state.ComplicatedTracks[action.payload.key]
        },
        moveComplicatedTrack: (state, action) => {
            state.ComplicatedTracks[action.payload.key].coordinateX = action.payload.coordinateX
            state.ComplicatedTracks[action.payload.key].coordinateY = action.payload.coordinateY
            state.ComplicatedTracks[action.payload.key].viewFinderY = action.payload.viewFinderY
            state.ComplicatedTracks[action.payload.key].viewFinderX = action.payload.viewFinderX
        },
        updateData: (state, action) => {
            state.ComplicatedTracks[action.payload.key].array = action.payload.array
            if (action.payload.start !== undefined) {
                state.ComplicatedTracks[action.payload.key].start = action.payload.start
            }
            if (action.payload.end !== undefined) {
                state.ComplicatedTracks[action.payload.key].end = action.payload.end
            }
            if (action.payload.boxWidth !== undefined) {
                state.ComplicatedTracks[action.payload.key].boxWidth = action.payload.boxWidth
            }
        },
        updateTrack: (state, action) => {
            if (action.payload.key === undefined) return
            if (state.ComplicatedTracks[action.payload.key].meta && state.ComplicatedTracks[action.payload.key].zoom > 3) {
                let temp = state.ComplicatedTracks[action.payload.key].complicated
                let tempMax = state.ComplicatedTracks[action.payload.key].max
                state.ComplicatedTracks[action.payload.key].complicated = state.ComplicatedTracks[action.payload.key].complicatedZoomedFirst
                state.ComplicatedTracks[action.payload.key].max = state.ComplicatedTracks[action.payload.key].complicatedZoomedMax
                state.ComplicatedTracks[action.payload.key].offset = 0
                state.ComplicatedTracks[action.payload.key].zoom = 1
                return   
            }
            state.ComplicatedTracks[action.payload.key].offset = action.payload.offset
            state.ComplicatedTracks[action.payload.key].zoom = action.payload.zoom

        },
        toggleTrackType: (state, action) => {
            if (action.payload.id === undefined) return
            let currentTrackType = state.ComplicatedTracks[action.payload.id].trackType,
                currentTypeIndex = trackTypes.indexOf(currentTrackType);
            // push the track type to next in the array, if at end loop back to beginning
            state.ComplicatedTracks[action.payload.id].trackType = trackTypes[currentTypeIndex + 1 >= 4 ? 0 : currentTypeIndex + 1]
        },
        updateBothTracks: (state, action) => {
            if (action.payload.topKey !== undefined) {
                state.ComplicatedTracks[action.payload.topKey].offset = action.payload.topOffset
                state.ComplicatedTracks[action.payload.topKey].zoom = action.payload.topZoom
            }
            if (action.payload.bottomKey !== undefined) {
                state.ComplicatedTracks[action.payload.bottomKey].offset = action.payload.bottomOffset
                state.ComplicatedTracks[action.payload.bottomKey].zoom = action.payload.bottomZoom
            }
        },
        changeComplicatedTrackColor: (state, action) => {
            state.ComplicatedTracks[action.payload.key].color = action.payload.color
        },
        changeZoom: (state, action) => {
            state.ComplicatedTracks[action.payload.key].zoom = action.payload.zoom
        },
        pan: (state, action) => {
            state.ComplicatedTracks[action.payload.key].offset = action.payload.offset
        },
        setSelection: (state, action) => {
            state.ComplicatedTracks[action.payload.key].selection = action.payload.selection
        },
        clearSelection: (state, action) => {
            state.ComplicatedTracks[action.payload.key].selection = undefined
        },
        deleteAllComplicatedTracks: (state, action) => {
            state.ComplicatedTracks = {}
        },
    }
})

export const { appendComplicatedTrack, addComplicatedTrack, updateTrack, toggleTrackType, updateBothTracks, deleteAllComplicatedTracks, removeComplicatedTrack, moveComplicatedTrack, updateData, changeComplicatedTrackColor, changeZoom, pan, setSelection, clearSelection } = complicatedTrackSlice.actions;

export const selectComplicatedTracks = (state) => state.complicatedtrack.ComplicatedTracks

export default complicatedTrackSlice.reducer;