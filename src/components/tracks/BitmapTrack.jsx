import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@mui/material'




function BitmapTrack({ id, array, length, color }) {

    const canvasRef = useRef(null)
    const height = 1
    
    // Maximum canvas size is 32767, most chromosomes will have more base pairs than this
    const width = 32767
    const ratio = width / length 
 
    useEffect(() => {
        
        const ctx = canvasRef.current.getContext('2d')


           
    // Parsing rgb values
    const r = parseInt(color.slice(1,3), 16)
    const g = parseInt(color.slice(3,5), 16)
    const b = parseInt(color.slice(5,7), 16)


        // Building a boolean array for which pixels should be coloured
        let buildingBitmap = Array(Math.round(length * ratio)).fill(false)
        array.forEach(x => {
            for(let p = Math.round(x.start * ratio) - 1; p < Math.round(x.end * ratio); p++){
                buildingBitmap[p] = true
            }
        })

        // Allocating the required number of bytes
        let buffer = new Uint8ClampedArray(width * height * 4); 

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var pos = (y * width + x) * 4; // position in buffer based on x and y
                if(buildingBitmap[x]){
                    buffer[pos] = r;           
                    buffer[pos + 1] = g;          
                    buffer[pos + 2] = b;          
                    buffer[pos + 3] = 255;    // set alpha channel

                }
                else{
                    buffer[pos] = 255;           
                    buffer[pos + 1] = 255;      
                    buffer[pos + 2] = 255;          
                    buffer[pos + 3] = 0;           

                }
            }
        }

        canvasRef.width = width;
        canvasRef.height = height;

        let imageData = ctx.createImageData(width, height);
        imageData.data.set(buffer);

        // update canvas 
        ctx.putImageData(imageData, 0, 0);

    }, [])

   
let handleDownload = () => {
    const canvas = document.getElementById(id+"_bitmap")
    if(canvas){
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a")
        link.download = id + "bitmap.png"
        link.href = url
        link.click()
    }
}


    return (
<>
        <canvas
            id={id + '_bitmap'}
            ref={canvasRef}
            width={32767}
            height={height}
        />
        <Button onClick={() => handleDownload()}>
           Download
        </Button>

</>
    )
}



export default BitmapTrack