import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    // Currently just a placeholder 
    theme: {
        isDark: true,
}
}


export const themeSlice = createSlice({
    name: 'them',
    initialState,

    reducers: {

        toggleTheme: (state, action) => {
            state.isDark = !state.isDark
        }
    }
})


export const { toggleTheme } = themeSlice.actions;
export const selectTheme = (state) => state.isDark

export default themeSlice.reducer;