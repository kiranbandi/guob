import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import miniviewReducer from '../features/miniview/miniviewSlice';
import draggableReducer from '../features/draggable/draggableSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    miniview: miniviewReducer,
    draggable: draggableReducer
  },
});
