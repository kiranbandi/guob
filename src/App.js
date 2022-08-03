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


  const dispatch = useDispatch()
  let width = 800
  let height = 400


  // I don't need this up here. Can put in the miniview for a zoom function
  // function showZoom(event) {
  //   let horizontalOffset = event.target.clientLeft
  //   let verticalOffset = event.target.clientTop
  //   let coordinateX = event.pageX - horizontalOffset
  //   let coordinateY = event.pageY - verticalOffset + 50

  //   setTestX(coordinateX)
  //   setTestY(coordinateY)

  //   dispatch(
  //     moveMiniview({
  //       key: 'example',
  //       coordinateX: coordinateX,
  //       coordinateY: coordinateY
  //     })
  //   )

  // }



  return (
    <>
      {/* <div className='example' height={height} width={width} onMouseMove={(e)=> {
      
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
*/}
<div>
   <Miniview 
        className={'zoom'}
        array={testSelector.array}
        coordinateX={testSelector.coordinateX}
        coordinateY={testSelector.coordinateY}
        width={testSelector.width}
        height={testSelector.height}
      />
 
    </div>
      <AlternateDraggable initialY={150}>
        <Miniview
          array={testing_array2}
          coordinateX={0}
          coordinateY={0}
          color={300}
          onMouseOver={(e) => console.log(e.pageX)}
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

    </>

  );
}

export default App;
