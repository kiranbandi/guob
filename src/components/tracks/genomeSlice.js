import { createSlice } from '@reduxjs/toolkit';
import testing_array_dh1 from '../../data/testing_array_dh1';
import testing_array_dh2 from '../../data/testing_array_dh2';
import testing_array_dh3 from '../../data/testing_array_dh3';


const initialState = {
    // Currently just a placeholder 
    genome: {
        'dh1': {
            key: 'dh1',
            array: testing_array_dh1,
        },
        'dh2': {
            key: 'dh2',
            array: testing_array_dh2,
        },
        'dh3': {
            key: 'dh3',
            array: testing_array_dh3,
        },
    },
}


export const genomeSlice = createSlice({
    name: 'genome',
    initialState,

    reducers: {

        addGenome: (state, action) => {
            if (!state.genome[action.payload.key]) {
                state.genome[action.payload.key] = action.payload
            }
        },
        removeGenome: (state, action) => {
            delete state.genome[action.payload.key]
        },
        setSelection: (state, action) => {
            state.genome[action.payload.key].selection = action.payload.selection
        },
        clearSelection: (state, action) => {
            state.genome[action.payload.key].selection = undefined
        },
        deleteAllGenome: (state, action) => {
            state.genome = {}
        },
    }
})


export const { addGenome, removeGenome, setSelection, clearSelection, deleteAllGenome } = genomeSlice.actions;


export const selectGenome = (state) => state.genome.genome

export default genomeSlice.reducer;