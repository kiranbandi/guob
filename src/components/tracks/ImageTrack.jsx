import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectBasicTracks } from './basicTrackSlice'
import { Typography} from '@mui/material';


/**
 * Component for rendering bitmap tracks once passed an image file
 */
function ImageTrack({ image, offset, zoom, id, genome, cap, color, normalizedLength, normalize, height, width, orthologs }) {

    const imageRef = useRef()
    const trackSelector = useSelector(selectBasicTracks)

    let originalWidth = width ? width : (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
    if (normalize) originalWidth = originalWidth * cap/normalizedLength;
    let adjustedHeight = height ? height : document.querySelector('.draggable')?.getBoundingClientRect()?.height - 50

    
    function trackStyle(currentOffset, currentZoom, index) {
        if (currentOffset === undefined) {
            return {
                display: 'none',
            }
        }
      
        let x = currentOffset + (index * (originalWidth * zoom))
        let y = orthologs ? -index *(adjustedHeight - 18) : -index *(adjustedHeight + 2)

        const transform = `matrix(${currentZoom}, 0, 0,  ${1}, ${x}, ${y})`
        
        return ({
            width: originalWidth,
            height: orthologs || genome ? adjustedHeight - 25 : adjustedHeight - 5,
            transformOrigin: "top left",
            WebkitTransform: transform,
            WebkitUserDrag: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none",
            MozUserSelect: "none",
            cursor: "crosshair",
            pointerEvents: 'none',
            background: color,

        })
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

        return ({
            WebkitUserSelect: 'none',
            width: originalWidth ,
            height: 20,
            transformOrigin: "top left",
            WebkitTransform: transform,
            WebkitUserDrag: "none",
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
                    alt={`Track showing {id} chromosome ortholog locations.`}
                />}
                <div className={genome ? "genome_tracks" : "tracks"} style={{float: "left", display: "inline", height: orthologs || genome ? adjustedHeight -20 : adjustedHeight}}>

                {image.map((image, index) => {
                    return(<img
                        key={id + "imageTrack" + index}
                        src={image}
                        id={id + "imageTrack" + index}
                        style={trackStyle(offset, zoom, index)}
                        tabIndex={-1}
                        draggable={false}
                        alt={`Track showing {id} gene locations.`}
                    >
                    </img>)
                })}
                </div>
               
            </div>
        </>
    )
}

export default ImageTrack