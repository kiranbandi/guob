import { memo } from 'react'
import Miniview from 'features/miniview/Miniview.js'
import { useSelector } from 'react-redux'
import { selectMiniviews } from 'features/miniview/miniviewSlice'
import { teal } from '@mui/material/colors';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { IconButton, Button } from "@mui/material"
import { nanoid } from '@reduxjs/toolkit';
import BasicTrack from 'components/tracks/BasicTrack';
import { selectBasicTracks } from 'components/tracks/basicTrackSlice';



export const DragPreview = memo(function DragPreview({ item, groupID, width, height, className }) {

    
    const basicTrackSelector = useSelector(selectBasicTracks)

        return (
            <div className={className} >
                <BasicTrack
                    array={basicTrackSelector[item].array}
                    color={basicTrackSelector[item].color}
                    id={nanoid()}
                    zoom={basicTrackSelector[item].zoom}
                    pastZoom={basicTrackSelector[item].pastZoom}
                    offset={basicTrackSelector[item].offset}

                />
            </div>
        )
    

})