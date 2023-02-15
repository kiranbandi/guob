import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'

function TrackScale({endOfTrack = 0, startOfTrack = 0, width = 100, paddingLeft = 0, paddingRight = 0}) {

    const [normalizer, setNormalizer] = useState([1, 1])

    useEffect(() => {

        let difference = endOfTrack - startOfTrack
        let basePairUnits = (difference / 1000000) > 1 ? [1000000, 'Mb'] : [1000, 'Kb']
        setNormalizer(basePairUnits)
    }, [endOfTrack, startOfTrack])

    return (
        <>

<div className='scale' style={{ width: width, paddingLeft: paddingLeft, paddingRight: paddingRight, float: "left", display: "block" }}>
                <div width={width - (paddingLeft + paddingRight)} style={{ border: 'solid 1px', marginTop: -5, }} />
                <Stack direction='row' justifyContent="space-between" className="scale" width={width - paddingLeft * 2}>
                    <div style={{ WebkitUserSelect: 'none', borderLeft: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(startOfTrack / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endOfTrack - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round((2 * (endOfTrack - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'right' }} >{Math.round((3 * (endOfTrack - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5, textAlign: 'left' }} >{Math.round((4 * (endOfTrack - startOfTrack) / 5 + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                    <div style={{ WebkitUserSelect: 'none', borderRight: 'solid 2px', marginTop: -4, height: 5 }} >{Math.round(((endOfTrack - startOfTrack) + startOfTrack) / normalizer[0]) + ' ' + normalizer[1]}</div>
                </Stack>
            </div>
        </>
    )
}

export default TrackScale