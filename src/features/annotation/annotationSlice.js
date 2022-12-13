import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    annotations: {

    },
    searches: {

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
            else {
                if (state.annotations[action.payload.key].some(x => {
                    return x.note == action.payload.note && x.location == action.payload.location
                })) {
                    return
                }
                state.annotations[action.payload.key].push(action.payload)
            }

        },
        removeAnnotation: (state, action) => {
            if(state.annotations[action.payload.key]){
                let index = state.annotations[action.payload.key].findIndex(x => {
                    return Math.abs(x.location - action.payload.location) < 100000
                })
                state.annotations[action.payload.key].splice(index,1)
            }
            // let trash = state.annotations[action.payload.key].pop()
        },
        addSearch: (state, action) => {
            if (!state.searches[action.payload.key]) {
                state.searches[action.payload.key] = [action.payload]
            }
            else {
                if (state.searches[action.payload.key].some(x => {
                    return x.note == action.payload.note && x.location == action.payload.location
                })) {
                    return
                }
                state.searches[action.payload.key].push(action.payload)
            }
        },
        clearSearches: (state, action) => {
            state.searches = {}
        },
    }
})

export const { addAnnotation, removeAnnotation, addSearch, clearSearches } = annotationSlice.actions;

export const selectAnnotations = (state) => state.annotation.annotations
export const selectSearch = (state) => state.annotation.searches
export default annotationSlice.reducer;