import React from 'react'
import { FormContainer } from "./FormContainer"
import { Subscribe } from "unstated"

export type WithFormProps<F extends FormContainer> = {
    formContainer: F
}

export type FormContainerInput<F extends FormContainer> = F | Class<F>

export type WithFormParams<F extends FormContainer, O> = FormContainerInput<F> | {
    inject: FormContainerInput<F>
    loadable?: React.ComponentType<O> | ((props: O & WithFormProps<F>) => JSX.Element)
}

export const withForm = <O extends {}, F extends FormContainer = FormContainer>(params: WithFormParams<F, O>) => {
    let formContainer: FormContainerInput<F>
    let Loadable: React.ComponentType<O> | ((props: O & WithFormProps<F>) => JSX.Element) | undefined
    if ('inject' in params) {
        formContainer = params.inject
        Loadable = params.loadable
    } else {
        formContainer = params
    }
    return (BaseComponent: React.ComponentType<any>) => ((props: O) => {
        return (
            <Subscribe to={[formContainer]}>
                {(injected: F) => Loadable && injected.state.initializing ? (
                    <Loadable {...props} formContainer={injected} />
                ) :
                    <BaseComponent {...props} formContainer={injected} />
                }
            </Subscribe>
        )
    }) as React.ComponentType<O>
}

withForm.decorate = withForm as <O extends {}, F extends FormContainer>(params: WithFormParams<F, O>) => ClassDecorator