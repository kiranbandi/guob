import Miniview from '../features/miniview/Miniview'
import testing_array from '../data/testing_array'
import testing_array2 from '../data/testing_array2'
import testing_array3 from '../data/testing_array3';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import AlternateDraggable from '../features/draggable/AlternateDraggable'
import { useSelector } from 'react-redux';
import { selectMiniviews } from '../features/miniview/miniviewSlice';
import { selectAlternateDraggables } from '../features/draggable/alternateDraggableSlice';
import { selectDraggables } from '../features/draggable/draggableSlice';
import { css } from '@emotion/react';

export default function Demo() {

  // Demo of redux miniview
  const testSelector = useSelector(selectMiniviews)['preview']
  const draggableSelector = useSelector(selectDraggables)
  let alternateDraggableSelector = useSelector(selectAlternateDraggables)


  return (
    <>
      <div
        css={css`.example {
        width: 500px;
        height: 700px;
        border: 1px solid black;
    }
    .draggable {
        /* cursor: crosshair; */
        border: 2px solid pink;
    }
    .preview {
        border: 1px solid black;
        background-color: whitesmoke;
        z-index: 10;
    }
    .Container{
        border: 1px solid black;
        margin-bottom: 1ch;
    }`}>
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
        <DragContainer starting={draggableSelector}>
          <Draggable key={'zero'}>
            <Miniview
              array={testing_array}
              color={50}
            // id={3}
            />
          </Draggable>
          <Draggable key={'one'}>
            <Miniview
              array={testing_array2}
              color={150}
            // id={4}
            />
          </Draggable>
          <Draggable key={'two'}>
            <Miniview
              array={testing_array3}
              color={250}
            // id={5}
            />
          </Draggable>
        </DragContainer>
      </div>
      <h2>Miniview Component:</h2>
      <AlternateDraggable initialY={alternateDraggableSelector['secondTest'].coordinateY} id={alternateDraggableSelector['secondTest'].key}>
        <Miniview
          array={testing_array2}
          coordinateX={0}
          coordinateY={0}
          color={300}
          id={1}
        />
      </AlternateDraggable>
      <AlternateDraggable initialY={alternateDraggableSelector['test'].coordinateY} id={alternateDraggableSelector['test'].key}>
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

