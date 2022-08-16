import React from 'react'




function DragContainer({ children, starting }) {


    const renderChild = (child, index, id) => {
        if(child != undefined){
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
    
    return(
        <div className='Container'>
            {children !== undefined && starting.map((item, index) => {
                return renderChild(children[children.findIndex(child => child !== undefined && child.key == item)], index, item )
                })}
        </div>
    )
}

export default DragContainer