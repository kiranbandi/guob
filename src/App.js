import logo from './logo.svg';
import './App.css';
import Miniview from './Miniview'
import testing_array from './testing_array'
import Draggable from './Draggable';
import DragContainer from './DragContainer';
import { useState } from 'react';
import AlternateDraggable from './AlternateDraggable'


function App() {

  // Demo of both draggable implementations

  const [number, setNumber] = useState(40)
  const [secondNumber, setSecondNumber] = useState(60)
  const [thirdNumber, setThirdNumber] = useState(90)



  return (
    <>
      <DragContainer className='Container'>
        <Draggable key={0}>
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
      <AlternateDraggable initialY={300} top={300}            index={57}
            id={"TESTING"}>
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

           
          />
      </AlternateDraggable>
    </>
  );
}

export default App;
