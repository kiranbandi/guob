import { useDragLayer } from 'react-dnd'
import { ItemTypes } from './ItemTypes.js'
import { DragPreview } from './DragPreview.js'


const layerStyle = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
}


export const CustomDragLayer = (props) => {
    const { isDragging, item,  itemType, initialOffset, currentOffset } = 
        useDragLayer((monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            isDragging: monitor.isDragging(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
        }))

        function renderItem() {
            switch (itemType) {
                case ItemTypes.BOUNDED:
                    return <DragPreview item={item} groupID={props.groupID} />
                default:
                    return null
            }
        }

        function moveThePreview(currentOffset){
            if(!currentOffset){
                return{
                    display:'none',
                }
            }
            let { x, y } = currentOffset
            x -= document.getElementById(item.id).getBoundingClientRect().width
            const transform = `translate(${x}px, ${y}px)`
            return {
                transform,
                WebkitTransform: transform,
            }
        }

        if(!isDragging){
            return null
        }
        return (
            <div style={layerStyle}>
                <div style={moveThePreview(currentOffset)}>
                    {renderItem()}
                </div>
            </div>
        )
}