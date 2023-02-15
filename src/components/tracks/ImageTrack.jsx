import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectBasicTracks, updateTrack } from './basicTrackSlice'
import { Typography, Stack, Tooltip } from '@mui/material';
import { scaleLinear } from 'd3-scale'


function ImageTrack({ image, offset, zoom, id, cap, color, orthologs }) {


    const imageRef = useRef()
    const trackSelector = useSelector(selectBasicTracks)

    let maxWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60) * zoom
    let originalWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
    let height = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50

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

    useEffect(() => {


    }, [])

    function trackStyle(currentOffset, currentZoom, index) {
        if (currentOffset == undefined) {
            return {
                display: 'none',
            }
        }

        let queryHeight = document.querySelector('.draggable')?.getBoundingClientRect()?.height - 75
        
        let x = currentOffset + (index * (originalWidth * zoom))
        let y = -index *(height - 18)

        let deg = 0
        let lightness = 100
        let saturation = 100

        // + (originalWidth * index) / total)
        const transform = `matrix(${currentZoom}, 0, 0,  ${1}, ${x}, ${y})`
        const hue = `hue-rotate(${deg}deg)`
        // brightness(${lightness}%) saturate(${saturation}%)
        //TODO going to need the padding on the left and right
        if(image[index] == "files/track_images/at1track_2.png"){
            color = "red"
        }
        return ({
            width: originalWidth,
            height: queryHeight,
            transformOrigin: "top left",
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none",
            MozUserSelect: "none",
            filter: hue,
            cursor: "crosshair",
            pointerEvents: 'none',

            background: color,

        })
    }

    function orthologStyle(currentOffset, currentZoom) {
        if (currentOffset == undefined) {
            return {
                display: 'none',
            }
        }

        let x = trackSelector[id].offset
        let scale = trackSelector[id].zoom


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
                <img
                    src={orthologs}
                    id={id + "ortholog_imageTrack"}
                    style={orthologStyle(offset, zoom, 0)}
                />
                <div className={"tracks"} style={{float: "left", display: "inline", height: height -20}}>

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