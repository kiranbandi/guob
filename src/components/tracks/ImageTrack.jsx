/** @jsxImportSource @emotion/react */
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectBasicTracks } from './basicTrackSlice'
import { Typography } from '@mui/material';
import { css, keyframes } from "@emotion/react";


/**
 * Component for rendering bitmap tracks once passed an image file
 */
function ImageTrack({ image, offset, zoom, id, genome = false, cap, color, normalizedLength, normalize, height, width, orthologs, isHighDef = false }) {

    const imageRef = useRef()
    const canvasRef = useRef(null)
    const trackSelector = useSelector(selectBasicTracks)

    let originalWidth = width ? width : (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
    if (normalize) originalWidth = originalWidth * cap / normalizedLength;
    let adjustedHeight = height ? height : document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50




    function trackStyle(currentOffset, currentZoom, index) {
        if (currentOffset === undefined) {
            return {
                display: 'none',
            }
        }

        let x = currentOffset + (index * (originalWidth * currentZoom))
        let y = orthologs ? -index * (adjustedHeight - 18) : -index * (adjustedHeight + 2)


        const transform = `matrix(${currentZoom}, 0, 0,  ${1}, ${x}, ${y})`
        const imageRender = image.length > 1 || id.includes("METHYL") || id.includes("all") || id.includes("seed") || id.includes("leaf") ? "pixelated" : "auto"
        // console.log(currentZoom)
        // scale: `{currentZoom}`,
        // translate: `{x} {y}`,
        // left: x,

        const myEffect = keyframes`
            0% {
                background: transparent;
            }
            100% {
            background: ${color};
            }
            `;

        let calculated_height
        if (genome){
            calculated_height = "40px"
        }
        else{
            calculated_height = orthologs ? adjustedHeight - 25 + "px" : adjustedHeight - 5 + "px"
        }

        let style = css(css`
            width: ${originalWidth + "px"};
            height: ${calculated_height};
            transform-origin: top left;
            -webkit-user-drag: none;
            user-select: none;
            msUserSelect: none;
            MozUserSelect: none;
            cursor: crosshair;
            pointer-events: none;
            content: "";
            image-rendering: ${imageRender};
            -webkit-transform: ${transform};
            background: ${color};
            animation: ${myEffect} 300ms ease-in;
            
            `)

        return (style)

    }

    function orthologStyle(currentOffset, currentZoom) {
        if (currentOffset === undefined) {
            return {
                display: 'none',
            }
        }

        let x = trackSelector[id] ? trackSelector[id].offset : 0
        let scale = trackSelector[id] ? trackSelector[id].zoom : 1

        const transform = `matrix(${scale}, 0, 0,  ${1}, ${x}, ${0})`

        const imageRender = image.length > 1 ? "pixelated" : "auto"

        return ({
            WebkitUserSelect: 'none',
            width: originalWidth,
            height: 20,
            transformOrigin: "top left",
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            marginBottom: -6,
            imageRendering: imageRender,

        })
    }

    let dynamicID = id + "imageTrack" + (isHighDef ? "highDef" : "-")
    return (
        <>
            <div style={{ width: '100%', paddingRight: 10 }} ref={imageRef}>
                {id && !genome &&
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
                    alt={`Track showing {id} chromosome ortholog locations.`}
                    loading="lazy"
                />}
                <div className={genome ? "genome_tracks" : "tracks"} style={{ float: "left", display: "inline", height: orthologs || genome ? adjustedHeight - 20 : adjustedHeight }}>
                    {image.map((image, index) => {
                        return (<img
                            className='imageTrack'
                            key={dynamicID + index}
                            src={image}
                            id={dynamicID + index}
                            css={trackStyle(offset, zoom, index)}
                            tabIndex={-1}
                            draggable={false}
                            alt={`Track showing {id} gene locations.`}
                            loading="lazy"
                        >
                        </img>)
                    })}

                </div>

            </div>
        </>
    )
}

export default ImageTrack