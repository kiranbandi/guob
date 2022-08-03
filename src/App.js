import Miniview from './features/miniview/Miniview'
import testing_array from './testing_array'
import testing_array2 from './testing_array2'
import testing_array3 from 'testing_array3';
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



  return (
    <>

<div>

<DragContainer>
    <Draggable>
      <Miniview
        array={testing_array}
        color={50}
        id={3}
      />
    </Draggable>
    <Draggable>
      <Miniview
            array={testing_array2}
        color={150}
        id={4}
      />
    </Draggable>
    <Draggable>
      <Miniview
            array={testing_array3}
        color={250}
        id={5}
      />
    </Draggable>

</DragContainer>
   
    </div>
      <AlternateDraggable initialY={150}>
        <Miniview
          array={testing_array2}
          coordinateX={0}
          coordinateY={0}
          color={300}
          id={1}
        />
      </AlternateDraggable>

      <AlternateDraggable initialY={300}>
        <Miniview
          array={testing_array3}
          coordinateX={0}
          coordinateY={0}
          color={200}
          id={2}
        />
      </AlternateDraggable>
      <Miniview
        array={testing_array}
        color={350}
        id={5}
        chosen={
          {
        "chromosome": "at3",
        "start": "9541483",
        "end": "9542114",
        "key": "at3g26110"
    }
        }
        height={50}
        
      />

{testSelector.visible && <Miniview 
        className={'zoom'}
        array={testSelector.array}
        coordinateX={testSelector.coordinateX}
        coordinateY={testSelector.coordinateY}
        width={testSelector.width}
        height={testSelector.height}
        beginning={testSelector.start}
        fin={testSelector.end}
        color={testSelector.color}
      />}
 

    </>
    

  );
}

export default App;
