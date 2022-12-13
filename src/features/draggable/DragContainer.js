import React from 'react'
import { IconButton, Button } from "@mui/material"
import { teal, deepOrange } from '@mui/material/colors';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CenterFocusStrong } from '@mui/icons-material';

function DragContainer({ children, startingList }) {

    const renderChild = (child, index, id) => {
        if (child != undefined) {
            return (
                <child.type
                    {...child.props}
                    index={index}
                    id={id}
                    key={id}
                />
            )
        }
    }

    return (
        <div className='Container'>
            {children !== undefined && startingList.map((item, index) => {
                return renderChild(children[children.findIndex(child => child !== undefined && child.key == item)], index, item)
            })}

            {/* <div style={{ textAlign: 'center', marginBottom: '1%', marginTop: '-0.75rem' }}>
                <IconButton sx={{
                    backgroundColor: deepOrange[100],
                    borderRadius: 1,
                    '&:hover': {
                        backgroundColor: deepOrange[500]
                    }
                }}
                >
                    <AddCircleOutlineIcon fontSize="large" className="handle_image" />
                </IconButton>
            </div> */}
        </div>
    )
}

export default DragContainer