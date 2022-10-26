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
        updateComparison: (state, action) => {

            // !ORRRRR
            
            for (const [key, value] of Object.entries(state.comparison)) {
                if (value.target == action.payload.key) {

                    let location = scaleLinear().domain([+value.beginning, +value.fin]).range([0, 2000 * +value.zoom])
                    let test = scaleLinear().domain([0,5]).range([2,7])
                    console.log(test(3))
                    console.log(location(+value.head))
                    console.log(value.head)
                    console.log(value.beginning)
                    console.log(value.fin)
                    value.coordinateX = location(value.head) + action.payload.offset
                    
                    
                    // value.coordinateX += action.payload.offset 
                    // value.boxWidth *= action.payload.zoom
                    
                }
            }
        },
        zoomComparison: (state, action) =>{
            
         // })
         for (const [key, value] of Object.entries(state.comparison)) {
            if (value.target == action.payload.key) {

                value.coordinateX += action.payload.offset+ action.payload.offset
                value.boxWidth *= action.payload.zoom
                
            }
        }
        }
    }
})

export const { addMiniview, removeMiniview, moveMiniview, updateData, changeMiniviewColor, changeMiniviewVisibility, addComparison, removeComparison, increaseZoom, decreaseZoom, pan, updateComparison } = miniviewSlice.actions;

export const selectMiniviews = (state) => state.miniview.miniviews
export const selectComparison = (state) => state.miniview.comparison

export default miniviewSlice.reducer;