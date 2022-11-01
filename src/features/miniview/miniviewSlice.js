import { OfflineShareTwoTone } from '@mui/icons-material';
import { createSlice } from '@reduxjs/toolkit';
import { scaleLinear } from 'd3-scale';


const initialState = {
    // Currently just a placeholder 
    miniviews: {
        'preview': {
            color: 0,
            coordinateX: 0,
            coordinateY: 0,
            height: "1rem",
            width: 400,
            id: 'preview',
            visible: false
        },

    },
    comparison: []
}


export const miniviewSlice = createSlice({
    name: 'miniview',
    initialState,

    reducers: {

        addMiniview: (state, action) => {
            if (!state.miniviews[action.payload.key]) {
                state.miniviews[action.payload.key] = action.payload
            }
        },
        removeMiniview: (state, action) => {
            delete state.miniviews[action.payload.key]
        },
        moveMiniview: (state, action) => {
            state.miniviews[action.payload.key].coordinateX = action.payload.coordinateX
            state.miniviews[action.payload.key].coordinateY = action.payload.coordinateY
            state.miniviews[action.payload.key].viewFinderY = action.payload.viewFinderY
            state.miniviews[action.payload.key].viewFinderX = action.payload.viewFinderX
        },
        updateData: (state, action) => {
            state.miniviews[action.payload.key].array = action.payload.array
            if (action.payload.start !== undefined) {
                state.miniviews[action.payload.key].start = action.payload.start
            }
            if (action.payload.end !== undefined) {
                state.miniviews[action.payload.key].end = action.payload.end
            }
            if (action.payload.boxWidth !== undefined) {
                state.miniviews[action.payload.key].boxWidth = action.payload.boxWidth
            }
        },
        changeMiniviewColor: (state, action) => {
            state.miniviews[action.payload.key].color = action.payload.color
        },
        changeMiniviewVisibility: (state, action) => {
            state.miniviews[action.payload.key].visible = action.payload.visible
        },
        addComparison: (state, action) => {
            state.comparison.push(action.payload)

        },
        removeComparison: (state, action) => {
            let popped = state.comparison.pop()
        },
        panComparison: (state, action) => {
            for (const [key, value] of Object.entries(state.comparison)) {
                if (value.target == action.payload.key) {

                    // The offset is throwing it off? It shouldn't though.
                    // Original box width
                    
                    // console.log(value.coordinateX)
                    // console.log(action.payload.offset)
                    // When zooming at 1.0, it's actually less than it should be
                    //  ! Close - off by a little
                    value.boxWidth *= action.payload.factor
                    let location = scaleLinear().domain([0, +value.fin]).range([0,(action.payload.realWidth * action.payload.zoom)])
                    value.coordinateX = location(value.start) + (action.payload.left + action.payload.offset) * action.payload.realWidth/action.payload.width
                    // console.log(location(value.start))
                }
            }
        },
        zoomComparison: (state, action) =>{
            
         // })//
         // Zooming correctly, offset is wrong - also shoots down to zero when moved to a different track?
         for (const [key, value] of Object.entries(state.comparison)) {
            if (value.target == action.payload.key) {

                value.boxWidth *= action.payload.factor
                
            }
        }
        }
    }
})

export const { addMiniview, removeMiniview, moveMiniview, updateData, changeMiniviewColor, changeMiniviewVisibility, addComparison, removeComparison, increaseZoom, decreaseZoom, pan, panComparison, zoomComparison } = miniviewSlice.actions;

export const selectMiniviews = (state) => state.miniview.miniviews
export const selectComparison = (state) => state.miniview.comparison

export default miniviewSlice.reducer;