import { createSlice } from '@reduxjs/toolkit';
import at1_array from '../../data/at1_array';
import at2_array from '../../data/at2_array';
import at3_array from '../../data/at3_array';
import at4_array from '../../data/at4_array';
import at5_array from '../../data/at5_array';
import bn13_array from '../../data/bn13_array'


const initialState = {
    // Currently just a placeholder 
    genome: {
        'at1': {
            key: 'at1',
            array: at1_array,
        },
        'at2': {
            key: 'at2',
            array: at2_array,
        },
        'at3': {
            key: 'at3',
            array: at3_array,
        },
        'at4': {
            key: 'at4',
            array: at4_array,
        },
        'at5': {
            key: 'at5',
            array: at5_array,
        },
        'bn13': {
            key: 'bn13',
            array: bn13_array,
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