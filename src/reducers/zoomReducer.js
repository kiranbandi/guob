import {draw} from "../Links";
import * as d3 from 'd3';


const zoomReducer = (state, action) => {
    switch (action.type){
        case 'Canvas':
            var payload  = action.payload;
            console.log(action.payload)
            var ctx = payload.targetRef.current.getContext('2d')
            var zoomBehavior = d3.zoom().scaleExtent([1, 1000]).on("zoom", handleZoom);

            d3.select(payload.sourceRef.current).call(d3.zoom()

            .on("zoom", (handlerZoom)));

        function handlerZoom(e) {

            var transform = e.transform;

            ctx.save();
            ctx.clearRect(0, 0, payload.targetRef.current.width, payload.targetRef.current.height);
            ctx.translate(transform.x,0)

            // console.log(transform.k)
            ctx.scale(transform.k,1)
            draw(payload.arrayCoordinates, ctx, payload.curvature);
            ctx.restore();

        }
        break;
        case 'SVG':
            var payload  = action.payload;
            function handleZoom(e) {
                var transform = e.transform;
                var transformString = 'translate(' + transform.x + ',' + '0) scale(' + transform.k + ',1)';
                d3.select(payload.targetRef.current).attr("transform", transformString);
            };
            var zoomBehavior = d3.zoom().scaleExtent([1, 1000]).on("zoom", handleZoom);
            console.log(payload.sourceRef.current)
            d3.select(payload.sourceRef.current)
                .call(zoomBehavior);
                break;

    }

}

export default zoomReducer;