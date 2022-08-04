import Miniview from './features/miniview/Miniview'
import testing_array from './testing_array'
import testing_array2 from './testing_array2'
import testing_array3 from 'testing_array3';
import Draggable from './features/draggable/Draggable';
import DragContainer from './features/draggable/DragContainer';
import { useState } from 'react';
import AlternateDraggable from './features/draggable/AlternateDraggable'
import { useDispatch, useSelector } from 'react-redux';
import { addMiniview, moveMiniview, selectMiniviews } from 'features/miniview/miniviewSlice';
import './example.css'
import { moveDraggable, addDraggable, removeDraggable, selectDraggables } from 'features/draggable/draggableSlice';


function App() {

  // Demo of redux miniview
  const testSelector = useSelector(selectMiniviews)['preview']

  let draggableSelector = useSelector(selectDraggables)




  return (
    <>

<div>
{testSelector.visible && <Miniview 
        className={'preview'}
        array={testSelector.array}
        coordinateX={testSelector.coordinateX}
        coordinateY={testSelector.coordinateY}
        width={testSelector.width}
        height={testSelector.height}
        beginning={testSelector.start}
        fin={testSelector.end}
        color={testSelector.color}
        id={testSelector.id}
        absolutePositioning={true}
      />}
      <h2>Draggable Containter: Items reorder themselves</h2>
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
    <h2>Miniview Component:</h2>
      <AlternateDraggable initialY={draggableSelector['secondTest'].coordinateY} id={draggableSelector['secondTest'].key}>
        <Miniview
          array={testing_array2}
          coordinateX={0}
          coordinateY={0}
          color={300}
          id={1}
        />
      </AlternateDraggable>

      <AlternateDraggable initialY={draggableSelector['test'].coordinateY} id={draggableSelector['test'].key}>
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
      <h2>Alternate Draggable - Absolute positioning with the nearest Y-coordinate multiple:</h2>


 

    </>
    

  );
}

export default App;
