import React, { Children, useEffect, useMemo, useRef } from 'react';
import { Subscribe } from 'unstated';

import { FormContainer } from './FormContainer';

export type UseFormPayload<F extends FormContainer> = [ F, React.ComponentType ]

export const useForm = <F extends FormContainer>(form: Class<F>) => {
    const formRef = useRef<F>(null)
    const Subscriber = useMemo((): React.FunctionComponent => ({ children }) => (
        <Subscribe to={[ form ]}>
            { (form: F) => {
                (formRef.current as any) = form
                const child = Children.only(children)
                return <>{ child }</>
            }}
        </Subscribe>
    ), [form])
    return [ formRef.current, Subscriber ] as UseFormPayload<F>
}