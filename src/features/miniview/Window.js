import { Typography } from '@mui/material'
import React from 'react'


/* Used to make the viewfinder boxes
TODO make labels, there's currently no way to match viewfinder to track
*/
function Window({ coordinateX, coordinateY, width, height, preview, text, grouped, label=undefined }) {


        let className = grouped ? 'groupedComparison' : 'comparison'
        return (
            <>
            {label && <Typography variant="caption" style={{  WebkitUserSelect: 'none',position: "absolute", top: coordinateY - 1, left: coordinateX+(+width/2)}}>{label}</Typography>}
           { preview && <div className={className} style={{position: 'absolute', borderStyle: 'solid', borderColor: 'inherit', borderWidth: 2, top: coordinateY - 1, left: coordinateX-(+width/2), width: width, height: height, zIndex: 1, pointerEvents: 'none' }}>
            </div>} 
            </>
        )
    
    
}

export default Window