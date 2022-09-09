import { memo } from 'react'
import Miniview from 'features/miniview/Miniview.js'
import { useSelector } from 'react-redux'
import { selectMiniviews } from 'features/miniview/miniviewSlice'


export const DragPreview = memo(function DragPreview({ item, groupID }) {

    const miniviewSelector = useSelector(selectMiniviews)
    // TODO Preview the group when outside of it, just the track when inside

    return (

        <div className='dragPreview'>
            {(groupID.map(item => {

                return (
           
                    <div className='draggable'>
                        <div className='draggableItem'>

                            <Miniview
                                height={50}
                                array={miniviewSelector[item].array}
                                color={miniviewSelector[item].color}
                                id={item}
                            />
                        </div>
                    </div>
                )
            })
            )}
        </div>


    )
})