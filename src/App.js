import Miniview from './features/miniview/Miniview'
import testing_array from './testing_array'
import Draggable from './Draggable';
import DragContainer from './DragContainer';
import { useState } from 'react';
import AlternateDraggable from './AlternateDraggable'
import { useDispatch, useSelector } from 'react-redux';
import { addMiniview, moveMiniview, selectMiniviews } from 'features/miniview/miniviewSlice';


function App() {

  // Demo of redux miniview
  const testSelector = useSelector(selectMiniviews)['example']
  const [number, setNumber] = useState(testSelector.color)
  const [testX, setTestX] = useState(testSelector.coordinateX)
  const [testY, setTestY] = useState(testSelector.coordinateY)


  const dispatch = useDispatch()

  return (
    <>
      <div height={1000} width={2000} onMouseMove={(e)=> {
      setTestX(e.clientX)
      setTestY(e.clientY)
      
      dispatch(
      moveMiniview({
      key:'example',
      coordinateX: testX,
      coordinateY: testY
    }))}}>

   <Miniview 
        array={testSelector.array}
        coordinateX={testSelector.coordinateX}
        coordinateY={testSelector.coordinateY}
        width={testSelector.width}
        height={testSelector.height}
      />
 
    </div>
    </>
    
  );
}

export default App;
