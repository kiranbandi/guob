import { memo } from 'react'
import Miniview from 'features/miniview/Miniview.js'
import { useSelector } from 'react-redux'
import { selectMiniviews } from 'features/miniview/miniviewSlice'
import { teal } from '@mui/material/colors';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { IconButton, Button } from "@mui/material"
import { nanoid } from '@reduxjs/toolkit';



export const DragPreview = memo(function DragPreview({ item, groupID, width, height }) {

    const miniviewSelector = useSelector(selectMiniviews)

        return (
            <div className='draggable' >
                <Miniview
                    array={miniviewSelector[item].array}
                    color={miniviewSelector[item].color}
                    id={nanoid()}
                />
            </div>
        )
    

})