import React from 'react'
import TrackContainer from './TrackContainer'
import { useSelector } from 'react-redux'
import {selectBasicTracks} from './basicTrackSlice'
import {selectGenome} from './genomeSlice'

function Track({ id, renderTrack, isDark, normalize, usePreloadedImages }) {

    
    const basicTrackSelector = useSelector(selectBasicTracks)[id]
    let true_id = id.includes("_splitview") ? id.split("_splitview")[0] : id
    const splitTrackSelector = useSelector(selectBasicTracks)[true_id]
    // const genomeSelector = useSelector(selectGenome)[id]

    return (
        <TrackContainer
            key={id + "_container"}
            id={id}
            // array={genomeSelector.array}
            color={basicTrackSelector.color}
            isDark={isDark}
            offset={basicTrackSelector.offset}
            zoom={basicTrackSelector.zoom}
            pastZoom={basicTrackSelector.pastZoom}
            // normalizedLength={basicTrackSelector.normalizedLength}
            height={1}
            trackType={basicTrackSelector.trackType}
            renderTrack={renderTrack}
            normalize={normalize}
            cap={splitTrackSelector.end}
            usePreloadedImages={usePreloadedImages}
        />

    )
}

export default Track