import Miniview from './features/miniview/Miniview'
import testing_array from './testing_array'
import Draggable from './Draggable';
import DragContainer from './DragContainer';
import { useState } from 'react';
import AlternateDraggable from './AlternateDraggable'
import { useDispatch, useSelector } from 'react-redux';
import { addMiniview, moveMiniview, selectMiniviews } from 'features/miniview/miniviewSlice';


function App() {

  // Demo of both draggable implementations

  const [number, setNumber] = useState(40)
  const [secondNumber, setSecondNumber] = useState(60)
  const [thirdNumber, setThirdNumber] = useState(90)
  const [test, setTest] = useState(50)
  const [secondTest, setSecondTest] = useState(700)

  // const testSelector = useSelector(selectMiniviews)

  const dispatch = useDispatch()

  dispatch(
    addMiniview({
      coordinateX: test,
      coordinateY: secondTest,
      key: 1234
    })
  )

  return (
    <div onMouseMove={(e)=> {
      setTest(e.clientX)
      setSecondTest(e.clientY)
      
      dispatch(
      moveMiniview({
      key:1234,
      coordinateX: test,
      coordinateY: secondTest
    }))}} onMouseDown={() => 
    dispatch(
    addMiniview({
      array: testing_array,
      chosen:{
        "chromosome": "at3",
        "start": "8497941",
        "end": "8498072",
        "key": "at3g23635"
      },
      color: number,
      coordinateX: test,
      coordinateY: secondTest,
      height: 50,
      width: '60%',
      key: 1234
    })
  )
    }>

<Miniview
            array={testing_array}
            chosen={{
              "chromosome": "at3",
              "start": "8497941",
              "end": "8498072",
              "key": "at3g23635"
            }}
            color={number}
            doSomething={() => setNumber(number => number + 20)}
            coordinateX={test}
            coordinateY={secondTest}
            height={50}
            width={'60%'}
            id={1234}

           
          />
      <DragContainer className='Container' >
        <Draggable key={0}>
          <Miniview
            array={testing_array}
            chosen={{
              "chromosome": "at3",
              "start": "8497941",
              "end": "8498072",
              "key": "at3g23635"
            }}
            average={true}
            color={number}
            doSomething={() => setNumber(number => number + 20)}
          />
        </Draggable>
        <Draggable key={1}>
          <Miniview
            array={testing_array}
            chosen={{
              "chromosome": "at3",
              "start": "1629658",
              "end": "1631766",
              "key": "at3g05620"
            }}
            color={secondNumber}
            doSomething={() => setSecondNumber(secondNumber => secondNumber + 30)}
          />
        </Draggable>
        <Draggable key={2}>
          <Miniview
            array={testing_array}
            chosen={{

              "chromosome": "at3",
              "start": "17256338",
              "end": "17259442",
              "key": "at3g46850"
            }}
            color={thirdNumber}
            doSomething={() => alert('Clicked the initial bottom view!')}
            coordinateX={500}
            width={'50%'}
          />
        </Draggable>
      </DragContainer>
      <AlternateDraggable initialY={450} top={300}>
        <Miniview
          array={testing_array}
          chosen={{
            "chromosome": "at3",
            "start": "1629658",
            "end": "1631766",
            "key": "at3g05620"
          }}
          color={secondNumber}
          doSomething={() => setSecondNumber(secondNumber => secondNumber + 30)}
          bars={100}
          
        />
      </AlternateDraggable>
    
     
 
    </div>
  );
}

export default App;
