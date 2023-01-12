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
    BasicTracks: {
        'dh1': {
            array: testing_array_dh1,
            color: 50
        },
        'dh2': {
            array: testing_array_dh2,
            color: 150
        },
        'dh3': {
            array: testing_array_dh3,
            color: 250
        },
    },
}


export const basicTrackSlice = createSlice({
    name: 'basictrack',
    initialState,

    reducers: {

        addBasicTrack: (state, action) => {
            if (!state.BasicTracks[action.payload.key]) {
                state.BasicTracks[action.payload.key] = action.payload
            }
        },
        removeBasicTrack: (state, action) => {
            delete state.BasicTracks[action.payload.key]
        },
        moveBasicTrack: (state, action) => {
            state.BasicTracks[action.payload.key].coordinateX = action.payload.coordinateX
            state.BasicTracks[action.payload.key].coordinateY = action.payload.coordinateY
            state.BasicTracks[action.payload.key].viewFinderY = action.payload.viewFinderY
            state.BasicTracks[action.payload.key].viewFinderX = action.payload.viewFinderX
        },
        updateData: (state, action) => {
            state.BasicTracks[action.payload.key].array = action.payload.array
            if (action.payload.start !== undefined) {
                state.BasicTracks[action.payload.key].start = action.payload.start
            }
            if (action.payload.end !== undefined) {
                state.BasicTracks[action.payload.key].end = action.payload.end
            }
            if (action.payload.boxWidth !== undefined) {
                state.BasicTracks[action.payload.key].boxWidth = action.payload.boxWidth
            }
        },
        updateTrack: (state, action) => {
            if (action.payload.key === undefined) return
            // if (state.BasicTracks[action.payload.key].meta && state.BasicTracks[action.payload.key].zoom > 3) {
            //     let temp = state.BasicTracks[action.payload.key].complicated
            //     let tempMax = state.BasicTracks[action.payload.key].max
            //     state.BasicTracks[action.payload.key].complicated = state.BasicTracks[action.payload.key].complicatedZoomedFirst
            //     state.BasicTracks[action.payload.key].max = state.BasicTracks[action.payload.key].complicatedZoomedMax
            //     state.BasicTracks[action.payload.key].offset = 0
            //     state.BasicTracks[action.payload.key].zoom = 1
            //     return   
            // }
            state.BasicTracks[action.payload.key].offset = action.payload.offset
            state.BasicTracks[action.payload.key].zoom = action.payload.zoom

        },
        toggleTrackType: (state, action) => {
            if (action.payload.id === undefined) return
            let currentTrackType = state.BasicTracks[action.payload.id].trackType,
                currentTypeIndex = trackTypes.indexOf(currentTrackType);
            // push the track type to next in the array, if at end loop back to beginning
            state.BasicTracks[action.payload.id].trackType = trackTypes[currentTypeIndex + 1 >= 4 ? 0 : currentTypeIndex + 1]
        },
        updateBothTracks: (state, action) => {
            if (action.payload.topKey !== undefined) {
                state.BasicTracks[action.payload.topKey].offset = action.payload.topOffset
                state.BasicTracks[action.payload.topKey].zoom = action.payload.topZoom
            }
            if (action.payload.bottomKey !== undefined) {
                state.BasicTracks[action.payload.bottomKey].offset = action.payload.bottomOffset
                state.BasicTracks[action.payload.bottomKey].zoom = action.payload.bottomZoom
            }
        },
        changeBasicTrackColor: (state, action) => {
            state.BasicTracks[action.payload.key].color = action.payload.color
        },
        changeZoom: (state, action) => {
            state.BasicTracks[action.payload.key].zoom = action.payload.zoom
        },
        pan: (state, action) => {
            state.BasicTracks[action.payload.key].offset = action.payload.offset
        },
        setSelection: (state, action) => {
            state.BasicTracks[action.payload.key].selection = action.payload.selection
        },
        clearSelection: (state, action) => {
            state.BasicTracks[action.payload.key].selection = undefined
        },
        deleteAllBasicTracks: (state, action) => {
            state.BasicTracks = {}
        },
        deleteAllOrthologTracks: (state,action) => {
            Object.keys(state.BasicTracks).forEach(x =>{
                if(x.includes("ortholog")){
                    delete state.BasicTracks[x]
                }
            })
        },
        addComplicatedTrack: (state, action) => {
            if (!state.BasicTracks[action.payload.key]) {
                //! All of this SHOULD NOT BE HERE
                // Proof of concept ONLY move out to be done with web workers for some
                // semblence of asynchronocity
                let cap = Math.max(...action.payload.array.map(d => d.end))
                let increment = cap / 1000
                let max = 0
                let densityView = []
                for (let i = 1; i <= 1000; i++) {
                    let start = increment * (i - 1)
                    let end = increment * i
                    let value = action.payload.array.filter(d => d.end >= start && d.start <= end).length
                    max = value > max ? value : max
                    var temp = {
                        start,
                        end,
                        key: Math.round(start) + '-' + Math.round(end),
                        value
                    }
                    densityView.push(temp)
                } 
                
                state.BasicTracks[action.payload.key] = action.payload
                state.BasicTracks[action.payload.key].meta = true
                state.BasicTracks[action.payload.key].complicated = densityView
                state.BasicTracks[action.payload.key].max = max
                state.BasicTracks[action.payload.key].trackType = 'heatmap'
                increment = cap /3000
                max = 0
                densityView = []
                for (let i = 1; i <= 1500; i++) {
                    let start = increment * (i - 1)
                    let end = increment * i
                    let value = action.payload.array.filter(d => d.end >= start && d.start <= end).length
                    max = value > max ? value : max
                    var temp = {
                        start,
                        end,
                        key: Math.round(start) + '-' + Math.round(end),
                        value
                    }
                    densityView.push(temp)
                }
                state.BasicTracks[action.payload.key].complicatedZoomedFirst = densityView
                state.BasicTracks[action.payload.key].complicatedZoomedMax = max
                max = 0
                densityView = []
                for (let i = 1501; i <= 3000; i++) {
                    let start = increment * (i - 1)
                    let end = increment * i
                    let value = action.payload.array.filter(d => d.end >= start && d.start <= end).length
                    max = value > max ? value : max
                    var temp = {
                        start,
                        end,
                        key: Math.round(start) + '-' + Math.round(end),
                        value
                    }
                    densityView.push(temp)
                }
                state.BasicTracks[action.payload.key].complicatedZoomedSecond = densityView
                state.BasicTracks[action.payload.key].complicatedZoomedSecondMax = max
            }

        },
    }
})


export const { addComplicatedTrack, updateTrack, toggleTrackType, updateBothTracks, deleteAllOrthologTracks, deleteAllBasicTracks, addBasicTrack, removeBasicTrack, moveBasicTrack, updateData, changeBasicTrackColor, changeZoom, pan, setSelection, clearSelection } = basicTrackSlice.actions;


export const selectBasicTracks = (state) => state.basictrack.BasicTracks

export default basicTrackSlice.reducer;