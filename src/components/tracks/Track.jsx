import React from 'react'
import TrackContainer from './TrackContainer'
import { useSelector } from 'react-redux'
import {selectBasicTracks} from './basicTrackSlice'
import {selectGenome} from './genomeSlice'

function Track({ id, renderTrack, isDark, resolution, normalize }) {

    const basicTrackSelector = useSelector(selectBasicTracks)[id]
    const genomeSelector = useSelector(selectGenome)[id]


    return (
        <TrackContainer
            key={genomeSelector.key + "_container"}
            id={genomeSelector.key}
            array={genomeSelector.array}
            color={basicTrackSelector.color}
            isDark={isDark}
            offset={basicTrackSelector.offset}
            zoom={basicTrackSelector.zoom}
            pastZoom={basicTrackSelector.pastZoom}
            normalizedLength={basicTrackSelector.normalizedLength}
            height={1}
            trackType={basicTrackSelector.trackType}
            renderTrack={renderTrack}
            normalize={normalize}
            cap={basicTrackSelector.end}
            resolution={resolution}
        />

    )
}

export default Track