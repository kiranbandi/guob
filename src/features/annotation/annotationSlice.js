import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    annotations: {
        
    },
}


export const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        addAnnotation: (state, action) => {
            if (!state.annotations[action.payload.key]) {
                state.annotations[action.payload.key] = [action.payload]
            }
            else{
                if(state.annotations[action.payload.key].some(x => {
                    return x.note == action.payload.note && x.location == action.payload.location
                })){
                    return
                }
                state.annotations[action.payload.key].push(action.payload)
            }

        },
        removeAnnotation: (state, action) => {
           let trash = state.annotations[action.payload.key].pop()
        }
        
    }
})

export const { addAnnotation, removeAnnotation} = annotationSlice.actions;

export const selectAnnotations = (state) => state.annotation.annotations
export default annotationSlice.reducer;