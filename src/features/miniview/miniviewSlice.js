import { createSlice } from '@reduxjs/toolkit';
import testing_array from 'testing_array';

const initialState = {
    // Currently just a placeholder 
    miniviews: {
       'example': { array: testing_array,
            chosen: {
              "chromosome": "at3",
              "start": "8497941",
              "end": "8498072",
              "key": "at3g23635"
            },
            color: 0,
            coordinateX: 0,
            coordinateY: 0,
            height: 50,
            width: 400,
            id: 'example'
        }
    }
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
        }
    }
})

export const {addMiniview, removeMiniview, moveMiniview } = miniviewSlice.actions;

export const selectMiniviews = (state) => state.miniview.miniviews

export default miniviewSlice.reducer;