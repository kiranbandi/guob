
import { nanoid } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectComplicatedTracks, appendComplicatedTrack } from './complicatedTrackSlice'
import Track from './Track'
import BasicTrack from './BasicTrack'

function ComplicatedTrackContainer({array, trackType, id, color, isDark, zoom, offset, width, height}) {
  
    // 
    const dispatch = useDispatch()
    const arrays = useSelector(selectComplicatedTracks)
    // 
    const [ splitArray, setSplitArray ] = useState(false)
    const [ incrementingID, setIncrementingID ] = useState(0)
  // Need to create a series of sub-arrays - probably store in redux
  // Iterate through them to create Tracks in the return here
  // Tracks control whether or not they are actually rendered
  // Container controls the zoom and offset of each Track
  
// function densityCalculation(array, cap, numberOfBars){
//     let max = 0
//     let increment = cap / numberOfBars
//     let densityView = []
//     for (let i = 1; i <= numberOfBars; i++) {
//         let start = increment * (i - 1)
//         let end = increment * i
//         let value = array.filter(d => d.end >= start && d.start <= end).length
//         max = value > max ? value : max
//         var temp = {
//             start,
//             end,
//             key: Math.round(start) + '-' + Math.round(end),
//             value
//         }
//         densityView.push(temp)
//     }
//     return densityView
// }

//   useEffect(() => {

//     if(!splitArray){

//     // Proof of concept ONLY move out to be done with web workers for some
//     // semblence of asynchronocity
//     // ! First subarray can be spliced to 1000, subsequent arrays will require some math
//     // 
//     let cap = Math.max(...array.map(d => d.end))
    
//     for(let i = 1; i < 3; i++){
//         let subarray = densityCalculation(array, cap, 500 * i)
//         //TODO Will need logic around the zoom/offset as well
//         // TODO as well as logic around whether this is the bottom or not
//         dispatch(appendComplicatedTrack({
//             key: id,
//             array: subarray,
//         }))

//     }


//     // ! Should be split off to be done with web workers

//     // ! These blocks are actually smaller than the genes themselves,
//     // ! instead of using a density view here, this could be the actual array
//     // ! logic to use density views if the array is too large?
//     // ! First, proof of concept of moving from density view to actual view
//     // let numberOfSubarrays = Math.ceil(array.length/1000)
//     // increment = numberOfSubarrays * 1000
//     // let z = 1
//     // max = 0
//     // for (let x = 0; x < numberOfSubarrays; x++ ){
//     // // numberOfSubarrays.forEach(x => {
//     //     let subarray = []
//     //     for (let i = 1; i <= 1000; i++) {
//     //         let start = increment * (z - 1)
//     //         let end = increment * z
//     //         // This logic should be the same as the drawn genes logic, otherwise we may miss some
//     //         // if they straddle a border. Drawing a handful of genes twice shouldn't be a big deal
            

//     //         //##################################################################
//     //         // This would be used for a heatmap
//     //         // let value = array.filter(d => {
//     //         //     return (d.end >= start && d.start <= end) || (d.end >= start && d.start <= start) || (d.end >= end && d.start <= end)
//     //         // }).length
//     //         // max = value > max ? value : max
//     //         // var temp = {
//     //         //     start,
//     //         //     end,
//     //         //     key: Math.round(start) + '-' + Math.round(end),
//     //         //     value
//     //         // }
//     //         //##################################################################

//     //         subarray = array.filter(d => {
//     //             return (d.end >= start && d.start <= end) || (d.end >= start && d.start <= start) || (d.end >= end && d.start <= end)
//     //         })
          
//     //     }
//         // let subarray = densityView
//         // //TODO Will need logic around the zoom/offset as well
//         // // TODO as well as logic around whether this is the bottom or not
//         // dispatch(appendComplicatedTrack({
//         //     key: id,
//         //     array: subarray,
//         // }))

//     // }
//     // )

//     // dispatch(setMaxValue({
//     //     key, 
//     //     max
//     // }))
    
//     setSplitArray(true)
// }
// },[array, isDark])

function chooseArray() {
    if(!arrays[id]) return

   return arrays[id].zoom < 5 && arrays[id].subarrays ? ( 
        <Track
            array={arrays[id].subarrays[1]}
            key={id + "_" + incrementingID}
            id={id} 
            color={color}
            zoom={zoom}
            offset={offset}
            trackType='heatmap'
            width={width}
            height={height}
            />) :  (
        <Track 
            array={array}
            key={id + "_" + incrementingID}
            id={id} 
            color={color}
            zoom={zoom}
            offset={offset}
            width={width}
            height={height}
            />) 
        
}
    return (
    <>  
        {arrays[id] && chooseArray()}

    </>
  )
}

export default ComplicatedTrackContainer