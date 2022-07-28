import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
    miniviews: {}
}

export const miniviewSlice = createSlice({
    name: 'miniview',
    initialState,

    reducers: {
        addMiniview: (state, action) =>{
            state.miniviews[action.payload.key] = action.payload
        },
        removeMiniview: (state,action) =>{
            delete  state.miniviews[action.payload.key]
        },
        moveMiniview: (state, action) => {
            state.miniviews[action.payload.key].xLocation = action.xLocation
            state.miniviews[action.payload.key].yLocation = action.yLocation
        }
    }
})

export const {addMiniview, removeMiniview, moveMiniview } = miniviewSlice.actions;

export const selectMiniviews = (state) => state.miniviews

export default miniviewSlice.reducer;