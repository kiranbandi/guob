export const handleZoomCanvas = (targetRef, sourceRef, arrayCoordinates, curvature) => {
    return{
      type: "Canvas",
      payload: {"targetRef": targetRef, "sourceRef": sourceRef, "arrayCoordinates": arrayCoordinates,"curvature": curvature }
  
    }
  }
  export const handleZoomSVG = (targetRef, sourceRef)  =>{
    return {
      type: "SVG",
      payload: {targetRef, sourceRef}
    }
  }