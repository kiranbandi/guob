import logo from './logo.svg';
import './App.css';
import Links from './Links';



function App() {

  let dataSet1 = [{type: "line", source: {x: 0, y:0}, target: {x:100, y:100}, color: "red"}, { type: "line", source: {x: 0, y:100}, target: {x:300, y:0}}, {type: "line", source: {x: 250, y:0}, target: {x:500, y:100}},{type: "polygon", source: {x: 150, x1: 180, y:0, y1: 0}, target: {x:400, x1: 440, y:100, y1: 100}}, {type: "polygon", source: {x:400, x1: 440,y:0, y1: 0}, target: {x: 90, x1: 160,  y:100, y1: 100}}];
  let dataSet2 = [{type: "line", source: {x: 0, y:0}, target: {x:100, y:100}}, { type: "line", source: {x: 0, y:100}, target: {x:300, y:0}}, {type: "line", source: {x: 250, y:0}, target: {x:500, y:100}},{type: "line", source: {x: 150, y:0}, target: {x:400, y:100}}, {type: "line", source: {x:400, y:0}, target: {x: 90,  y:100}}];
  let dataSet3 = [{type: "polygon", source: {x: 0,x1: 0,y1:0, y:0}, target: {x:100,x1: 200, y1: 100, y:100}}, { type: "polygon", source: {x: 0,x1:200, y1:0 , y:0}, target: {x:300, x1:900, y:0, y1:0}}, {type: "polygon", source: {x: 250,x1:300, y1:0, y:0}, target: {x:500,x1:750,y1:100, y:100}, color: "red"},{type: "polygon", source: {x: 150, x1: 180, y:0, y1: 0}, target: {x:400, x1: 440, y:100, y1: 100}}, {type: "polygon", source: {x:400, x1: 440,y:0, y1: 0}, target: {x: 90, x1: 160,  y:100, y1: 100}}]
  return (
    <div className="App">
      
      <p>SVG</p>

      <Links arrayCoordinates={dataSet1} type="canvas"/>
      <p>SVG</p>

      <Links arrayCoordinates={dataSet3} type="canvas"/>
      <p>Canvas</p>
      <Links arrayCoordinates={dataSet2} type="canvas"/>
   </div>
  );
}

export default App;
