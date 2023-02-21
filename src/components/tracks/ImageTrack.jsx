import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectBasicTracks, updateTrack } from './basicTrackSlice'
import { Typography, Stack, Tooltip } from '@mui/material';
import { scaleLinear } from 'd3-scale'
import { resolveConfig } from 'prettier';


function ImageTrack({ image, offset, zoom, id, genome, cap, color, normalizedLength, normalize, height, width, orthologs }) {

    const imageRef = useRef()
    const trackSelector = useSelector(selectBasicTracks)

    let originalWidth = width ? width : (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
    if (normalize) originalWidth = originalWidth * cap/normalizedLength;
    let maxWidth = originalWidth * zoom
    let adjustedHeight = height ? height : document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50


    useEffect(() => {

        imageRef.current.addEventListener('wheel', preventScroll, { passive: false });
        // if alt key is pressed then stop the event 

        function preventScroll(e) {
            if (e.altKey == true) {
                e.preventDefault();
                // e.stopPropagation();
                return false;
            }
        }

    }, [])

    function trackStyle(currentOffset, currentZoom, index) {
        if (currentOffset == undefined) {
            return {
                display: 'none',
            }
        }

        let queryHeight = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 75
        
        let x = currentOffset + (index * (originalWidth * zoom))
        let y = orthologs ? -index *(adjustedHeight - 18) : -index *(adjustedHeight + 2)

        let deg = 0
        let lightness = 100
        let saturation = 100

        const transform = `matrix(${currentZoom}, 0, 0,  ${1}, ${x}, ${y})`
        const hue = `hue-rotate(${deg}deg)`
        // brightness(${lightness}%) saturate(${saturation}%)
        //TODO going to need the padding on the left and right

        //! Following conditional used for demo purposes
        if(image[index] == "files/track_images/at1track_2.png"){
            color = "red"
        }
        return ({
            width: originalWidth,
            height: orthologs || genome ? adjustedHeight - 25 : adjustedHeight - 5,
            transformOrigin: "top left",
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none",
            MozUserSelect: "none",
            filter: hue,
            cursor: "crosshair",
            pointerEvents: 'none',
            // marginLeft: index == 1 ? "-15px" : "0px",
            // marginRight: index == 0 ? "-5px" : "0px",

            background: color,

        })
    }

    function orthologStyle(currentOffset, currentZoom) {
        if (currentOffset == undefined) {
            return {
                display: 'none',
            }
        }

        let x = trackSelector[id] ? trackSelector[id].offset : 0
        let scale = trackSelector[id] ? trackSelector[id].zoom : 1

        let deg = 0
        let lightness = 100
        let saturation = 100

        const transform = `matrix(${scale}, 0, 0,  ${1}, ${x}, ${0})`
        const hue = `hue-rotate(${deg}deg)`
        // brightness(${lightness}%) saturate(${saturation}%)
        //TODO going to need the padding on the left and right

        return ({
            width: originalWidth ,
            height: 20,
            transformOrigin: "top left",
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            filter: hue,
            marginBottom: -6,

        })
    }

    return (
        <>
            <div style={{ width: '100%', paddingRight: 10 }} ref={imageRef}>
                {id &&
                    <Typography
                        variant="body1"
                        className={"title"}
                        style={{
                            WebkitUserSelect: 'none',
                            position: 'relative',
                            top: 0,
                            fontWeight: 100,
                            textAlign: 'center',
                            marginLeft: 'auto',
                            marginRight: 0,
                            height: 25,
                            zIndex: 1,
                            pointerEvents: 'none',

                        }}
                    >{"Chromosome: " + id + "-bitmap"}</Typography>}
                {!genome && orthologs && <img
                    src={orthologs}
                    id={id + "ortholog_imageTrack"}
                    style={orthologStyle(offset, zoom, 0)}
                />}
                <div className={"tracks"} style={{float: "left", display: "inline", height: orthologs || genome ? adjustedHeight -20 : adjustedHeight}}>

                {image.map((image, index) => {
                    return(<img
                        key={id + "imageTrack" + index}
                        src={image}
                        id={id + "imageTrack" + index}
                        style={trackStyle(offset, zoom, index)}
                        tabIndex={-1}
                        draggable={false}
                    >
                    </img>)
                })}
                </div>
               
            </div>
        </>
    )
}

export default ImageTrack