import React from 'react'
import { useSelector } from 'react-redux'
import { selectAnnotations, selectSearch, selectOrthologs } from 'features/annotation/annotationSlice'
import Window from 'features/miniview/Window'
import { scaleLinear } from 'd3-scale'

function TrackMarkers({id, width, coordinateY, height, locationScale, offset, spacingLeft}) {
  
    const annotationSelector = useSelector(selectAnnotations)[id]
    const searchSelector = useSelector(selectSearch)[id]
    const orthologSelector = useSelector(selectOrthologs)[id]

    let maxHeight =  document.querySelector('.actualTrack')?.getBoundingClientRect()?.height
    return (
    <>
         {
                annotationSelector && annotationSelector.map(note => {
                    let x = locationScale(note.location) + offset + spacingLeft + 3
                    if (x > 0 && x < width) {
                        return (
                            <Window
                                coordinateX={x}
                                coordinateY={coordinateY}
                                width={2}
                                height={maxHeight + 2}
                                preview={true}
                                label={note.note}
                            />)

                    }
                })
            }
            {
                searchSelector && searchSelector.map(note => {
                    let x = locationScale(note.location) + offset + spacingLeft + 3
                    if (x > 0 && x < width) {
                        return (
                            <Window
                                coordinateX={x}
                                coordinateY={coordinateY}
                                width={2}
                                height={maxHeight + 2}
                                preview={true}
                                label={note.note}
                            />)

                    }
                })
            }
            {
                orthologSelector && orthologSelector.map(note => {
                    let x = locationScale(note.location) + offset + spacingLeft + 3
                    if (x > 0 && x < width) {
                        return (
                            <Window
                                coordinateX={x}
                                coordinateY={coordinateY}
                                width={2}
                                height={maxHeight + 2}
                                preview={true}
                                label={note.note}
                            />)

                    }
                })
            }
    </>
  )
}

export default TrackMarkers