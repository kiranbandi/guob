import React from 'react'
import { useState } from 'react';

function Window({ coordinateX, coordinateY, width, height, preview, text }) {

        return (
            <>

           { preview && <div className={'comparison'} style={{position: 'absolute', border: 'solid black 2px', top: coordinateY - 1, left: coordinateX-(+width/2), width: width, }}>
            </div>} 
            </>
        )
    
    
}

export default Window