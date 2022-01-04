import React, { useState } from 'react'

export const Checkbox = React.forwardRef(({ indeterminate, ...rest }, props, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])
    console.log(' rest is : ', rest);
    return (

        <div className="d-flex justify-content-around">
            {
                rest.checked
                    //i check if res.Valide is true or false (res.Valide is one of my row column's value which takes a boolean)
                    ? <><input type='checkbox' ref={resolvedRef} {...rest} className="mx-auto" /></>
                    : <><input type='checkbox' ref={resolvedRef} {...rest} className="mx-auto" disabled /></>
            }
        </div>
    )
})