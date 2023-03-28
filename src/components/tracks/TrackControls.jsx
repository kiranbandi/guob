
import React from 'react'
import { Stack } from '@mui/material'
import { IconButton, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { teal, deepOrange } from '@mui/material/colors';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function TrackControls(props) {
    
    // const buttonHeight = props.height/3
    

    return (
        <Stack marginTop={-props.gap+ "px"} marginBottom={ "0px"} alignItems={"flex-end"} style={{float: "right"}}>
                <IconButton className='trackButtons' id={"toggleTrackType_" + props.id} sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    // height: buttonHeight,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}
                >
                    <MultilineChartIcon fontSize="small" className="handle_image" />
                </IconButton>

                <IconButton className='trackButtons'id={"deleteTrack_" + props.id} sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    // height: buttonHeight,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}
                >
                    <RemoveCircleOutlineIcon fontSize="small" className="handle_image" />
                </IconButton>
                <IconButton className='trackButtons' id={"pickColor_" + props.id} sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    // height: buttonHeight,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}>
                    <ColorLensIcon fontSize="small" className="handle_image" />
                </IconButton>

        </Stack>
    )
}

export default TrackControls