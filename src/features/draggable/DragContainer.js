import React from 'react'




function DragContainer({ children, starting }) {


    const renderChild = (child, index, id) => {
        return (
            <child.type
                {...child.props}
                index={index}
                id={id}
                key={id}
            />
        )
    }
    
    return(
        <div className='Container'>
            {starting.map((item, index) => renderChild(children[children.findIndex(child => child.key == item)], index, item ))}
        </div>
    )
}

export default DragContainer