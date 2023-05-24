import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    trial: ['testGene'],
}

export const trialSlice = createSlice({
    name: 'trial',
    initialState,

    reducers: {
        incrementTrial: (state) => {
            if(state["trial"].length > 0){
                state["trial"].splice(0,1)
            }
        }
    }
})

export const { incrementTrial } = trialSlice.actions

export const selectTrial= (state) => state.trial

export default trialSlice.reducer
