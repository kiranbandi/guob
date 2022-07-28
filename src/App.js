import Miniview from './features/miniview/Miniview'
import testing_array from './testing_array'
import Draggable from './Draggable';
import DragContainer from './DragContainer';
import { useState } from 'react';
import AlternateDraggable from './AlternateDraggable'
import { useDispatch, useSelector } from 'react-redux';
import { addMiniview, moveMiniview, selectMiniviews } from 'features/miniview/miniviewSlice';
import './example.css'


function App() {

  // Demo of redux miniview
  const testSelector = useSelector(selectMiniviews)['example']
  const [number, setNumber] = useState(testSelector.color)
  const [testX, setTestX] = useState(testSelector.coordinateX)
  const [testY, setTestY] = useState(testSelector.coordinateY)


  const dispatch = useDispatch()
  let width = 900
  let height = 700

  return (
    <>
      <div className='example' height={height} width={width} onMouseMove={(e)=> {
      
      let coordinateX = e.clientX
      let coordinateY = e.clientY

      coordinateX = Math.min((width - testSelector.width), coordinateX - testSelector.width/2)
      coordinateY = Math.min((height - testSelector.height), coordinateY+ 10)

      setTestX(coordinateX)
      setTestY(coordinateY)
      
      dispatch(
      moveMiniview({
      key:'example',
      coordinateX: coordinateX,
      coordinateY: coordinateY
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
