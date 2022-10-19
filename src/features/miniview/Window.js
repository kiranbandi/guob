import React, { useEffect } from 'react'
import { useState } from 'react';

function Window({ coordinateX, coordinateY, width, height, preview, text, grouped }) {

        let className = grouped ? 'groupedComparison' : 'comparison'
        // useEffect(()=>{

        // },[width])
        return (
            <>

           { preview && <div className={className} style={{position: 'absolute', border: 'solid black 2px', top: coordinateY - 1, left: coordinateX-(+width/2), width: width, }}>
            </div>} 
            </>
        )
    
    
}

export default Window