import logo from './logo.svg';
import './App.css';
import Miniview from './Miniview'
import testing_array from './testing_array'


function App() {
  return (
    <Miniview
      array={testing_array}
      raw={true}
      chosen={{
        "chromosome": "at3",
        "start": "8497941",
        "end": "8498072",
        "key": "at3g23635"
  }}
    color={100}
    />
  );
}

export default App;
