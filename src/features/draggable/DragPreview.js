import { memo } from 'react'
import { useSelector } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit';
import BasicTrack from 'components/tracks/BasicTrack';
import { selectBasicTracks } from 'components/tracks/basicTrackSlice';
import { selectGenome } from 'components/tracks/genomeSlice';


/* Essentially just returns a smaller version of a basic track when dragging
TODO make work with the new histogram
*/
export const DragPreview = memo(function DragPreview({ item, groupID, width, height, className }) {

    const basicTrackSelector = useSelector(selectBasicTracks)
    const genomeSelector = useSelector(selectGenome)

        return (
            <div className={className}>
                <BasicTrack
                    array={item.length < 4 ? genomeSelector[item].array : genomeSelector[item.substring(0,3)].array}
                    color={basicTrackSelector[item].color}
                    id={nanoid() + "preview"}
                    zoom={basicTrackSelector[item].zoom}
                    pastZoom={basicTrackSelector[item].pastZoom}
                    offset={basicTrackSelector[item].offset}
                    height={height/2}
                    noScale={true}
                    trackType={basicTrackSelector[item].trackType}
                    // isDark={false}
                    // normalize={false}

                />
            </div>
        )
    

})