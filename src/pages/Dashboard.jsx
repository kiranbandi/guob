import React, { useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Miniview from '../features/miniview/Miniview';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import { css } from '@emotion/react';
import { useSelector, useDispatch } from 'react-redux';
import { addComparison, selectMiniviews } from '../features/miniview/miniviewSlice';
import { selectDraggables } from '../features/draggable/draggableSlice';
import { useState } from 'react';
import {selectComparison, removeComparison } from '../features/miniview/miniviewSlice';

export default function Dashboard() {

  const isComponentMounted = useRef(true);

  const { data, loading, error } = useFetch("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json", isComponentMounted, false);

  if (error) {
    console.log(error);
  }

  // Demo of redux miniview
  const previewSelector = useSelector(selectMiniviews)['preview']
  const miniviewSelector = useSelector(selectMiniviews)
  const draggableSelector = useSelector(selectDraggables)

  const comparableSelector = useSelector(selectComparison)
  const [testId, setTestId] = useState(5)
  const [startY, setStartY] = useState(900)

  const dispatch = useDispatch()

  // TODO - navigation?
  function takePreviewSnapshot(event) {
    if (event.ctrlKey) {
      dispatch(removeComparison())
    }
    else {
      dispatch(addComparison({
        key: testId,
        array: previewSelector.array,
        color: previewSelector.color,
        start: previewSelector.start,
        end: previewSelector.end
      }))


      setTestId(id => id + 1)
      setStartY(startY => startY + 50)

      // TODO add a box for highlighting selected region

    }
  }

  let styling = css(css`
    .draggable {
        cursor: crosshair;
        border: 1px solid grey;
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
        border: 2px solid grey;
        margin-bottom: 1ch;
    }`)

  return (
    <div css={styling}>
      <h2>Dashboard</h2>
      {loading ?
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 40 }}>
          <CircularProgress size={75} />
        </Box> :

        <div>

          {previewSelector.visible && <Miniview
            className={'preview'}
            array={previewSelector.array}
            coordinateX={previewSelector.coordinateX}
            coordinateY={previewSelector.coordinateY}
            width={previewSelector.width}
            height={previewSelector.height}
            beginning={previewSelector.start}
            fin={previewSelector.end}
            color={previewSelector.color}
            id={previewSelector.id}
            absolutePositioning={true}
          />}

          {previewSelector.visible && (Object.keys(comparableSelector).length !== 0 && Object.keys(comparableSelector).map((item, index) => {
            return <Miniview
              className={'preview'}
              key={item}
              array={comparableSelector[item].array}
              color={comparableSelector[item].color}
              coordinateX={previewSelector.coordinateX}
              coordinateY={previewSelector.coordinateY + 18 * (index + 1)}
              width={previewSelector.width}
              height={previewSelector.height}
              displayPreview={false}
              beginning={comparableSelector[item].start}
              fin={comparableSelector[item].end}
              absolutePositioning={true}
            />
          }))
          }

          <DragContainer starting={draggableSelector}>
            {draggableSelector.map(item => {
              return (
                <Draggable key={item}>
                  <Miniview
                    array={miniviewSelector[item].array}
                    color={miniviewSelector[item].color}
                    doSomething={takePreviewSnapshot}
                  />
                </Draggable>
              )
            })}
          </DragContainer>

        </div>}
    </div>
  );
}
