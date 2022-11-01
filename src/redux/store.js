import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import miniviewReducer from '../features/miniview/miniviewSlice';
import alternateDraggableReducer from '../features/draggable/alternateDraggableSlice';
import draggableReducer from '../features/draggable/draggableSlice';
import basicTrackReducer from '../components/tracks/basicTrackSlice';


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    miniview: miniviewReducer,
    alternateDraggable: alternateDraggableReducer,
    draggable: draggableReducer,
    basictrack : basicTrackReducer,

  },
});
