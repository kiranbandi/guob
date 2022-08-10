/** @jsxImportSource @emotion/react */
import Miniview from '../features/miniview/Miniview';
import testing_array from '../data/testing_array';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import AlternateDraggable from '../features/draggable/AlternateDraggable'
import { useSelector, useDispatch } from 'react-redux';
import { selectMiniviews } from '../features/miniview/miniviewSlice';
import { selectAlternateDraggables } from '../features/draggable/alternateDraggableSlice';
import { selectDraggables } from '../features/draggable/draggableSlice';
import { css } from '@emotion/react';
import { useState } from 'react';
import { addDraggable, removeDraggable } from '../features/draggable/draggableSlice';
import { addAlternateDraggable, removeAlternateDraggable } from '../features/draggable/alternateDraggableSlice';
import { addMiniview, removeMiniview } from '../features/miniview/miniviewSlice';

export default function Demo() {

  // Demo of redux miniview
  const testSelector = useSelector(selectMiniviews)['preview']
  const miniviewSelector = useSelector(selectMiniviews)
  const draggableSelector = useSelector(selectDraggables)
  const alternateDraggableSelector = useSelector(selectAlternateDraggables)

  const [testId, setTestId] = useState(5)

  const dispatch = useDispatch()


  function addNewDraggable() {
    addNewMiniview(testId)
    dispatch(addDraggable({
      key: testId
    }))

    setTestId(id => id + 1)
  }

  function addNewAlternateDraggable() {
    addNewMiniview(testId)
    dispatch(addAlternateDraggable({
      key: testId,
      coordinateY: 800
    }))

    setTestId(id => id + 1)
  }

  function addNewMiniview(id) {
    dispatch(addMiniview({
      key: id,
      array: testing_array
    }))
  }

  function removeADraggable() {
    let keys = draggableSelector
    let choice = keys[Math.floor((Math.random() * keys.length))]
    if (keys.length > 0) {
      dispatch(removeMiniview({
        key: choice
      }))
    }
    dispatch(removeDraggable({
      key: choice
    }))

  }

  function removeAnAlternateDraggable() {
    let keys = Object.keys(alternateDraggableSelector)
    let choice = keys[Math.floor((Math.random() * keys.length))]
    if (keys.length > 0) {
      dispatch(removeMiniview({
        key: choice
      }))
    }
    dispatch(removeAlternateDraggable({
      key: choice
    }))

  }

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
    .alternateDraggable{
      height: 50px;
      width: 96%;
      margin-bottom: 35px;
      border:solid black 1px;
      flex-direction: row;
      left: 2%;
      
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

        <button onClick={addNewDraggable}>Add a Draggable</button>
        <button onClick={addNewAlternateDraggable}>Add an Alternate Draggable</button>
        <button onClick={removeADraggable}>Remove a Draggable</button>
        <button onClick={removeAnAlternateDraggable}>Remove an Alternate Draggable</button>

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


        <h2>Draggable Container: Items re-order themselves</h2>

        <DragContainer starting={draggableSelector}>
          {draggableSelector.map(item => {
            return (
              <Draggable key={item}>
                <Miniview
                  array={miniviewSelector[item].array}
                  color={miniviewSelector[item].color} />
              </Draggable>
            )
          })}
        </DragContainer>

        <h2>Miniview Component:</h2>

        {Object.entries(alternateDraggableSelector).map(item => {
          return (<AlternateDraggable initialY={item[1].coordinateY} id={item[0]} key={item[0]}>
            <Miniview
              key={item[0]}
              array={miniviewSelector[item[0]].array}
              color={miniviewSelector[item[0]].color}
            />
          </AlternateDraggable>)
        })}

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

      </div>
    </>
  );
}

