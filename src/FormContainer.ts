// @ts-ignore
import { defer, filter, isEmpty } from './deps/lodash';
import shallowEq from 'shallow-equal/objects';
import { Container } from 'unstated';

import { FormField } from './FormField';
import { debounce } from './util/fns';

type SetValuesTuple<R> = [FormField<R>, R]

export type Errors = {
    [P in keyof any]?: string[]
}

export interface FormState {
    values: any,
    errors: Errors,
    dirties: Set<FormField['name']>,
    initializing: boolean,
    validating: boolean
}

export interface FormChangePayload {
    stateChange: {
        oldState: FormState,
        newState: FormState
    },
    isInitialized: boolean,
    isFormValid: boolean
}

const INITIAL_STATE: FormState = Object.freeze({
    values: {},
    errors: {},
    dirties: new Set(),
    initializing: true,
    validating: false
})

export abstract class FormContainer extends Container<FormState> {

    readonly state: FormState = INITIAL_STATE

    private _formFields!: FormField[]

    constructor({ initialize } = {
        initialize: true
    }) {
        super()
        if (initialize) {
            defer(this.initialize)
        }
    }

    reset = async () => {
        await this.setState(INITIAL_STATE)
        await this.initialize()
    }

    initialize = async () => {
        const initials = this.refreshFields()
            .filter(f => !!f.initial)
            .reduce((acc, v) => ({
                ...acc,
                [v.name]: v.initial
            }), {})

        await this.setState({
            values: initials,
            initializing: false
        })
    }

    refreshFields = () => {
        const self = this
        this._formFields = filter(this, (v, k) => {
            const isFormField = v instanceof FormField
            if (isFormField) {
                (v as unknown as any)._init(k, self)
            }
            return isFormField
        }) as unknown as FormField[]
        return this._formFields
    }

    setValues = async (
        ...whichValues: SetValuesTuple<any>[]
    ) => {
        const oldValues = this.state.values
        const newValues = whichValues.reduce((acc, v) => {
            const [ field, val ] = v
            return {
                ...acc,
                [field.name]: val
            }
        }, {})
        await this.setState({
            values: {
                ...oldValues,
                ...newValues
            }
        })

        // Only revalidates on 'values' changes
        if (
            newValues &&
            !shallowEq(newValues, oldValues)
        ) {
            await this.validate()
        }
    }

    setDirty = async (field: FormField<any>, dirty = true) => {
        const { dirties } = this.state
        const newDirties = new Set(dirties)
        newDirties[dirty ? 'add' : 'delete'](field.name)
        await this.setState({
            dirties: newDirties
        })
    }

    validate = debounce(async () => {
        await this.setState({ validating: true })
        const mapped = this._formFields.map((field) => ({
            field,
            validationParcel: field.validate(this.state.values[field.name])
        }))
        const errorsResults = await Promise.all(
            mapped.map(v => v.validationParcel)
        )
        const errors = errorsResults.reduce((acc, ret, i) => {
            const field = mapped[i].field
            const errors = ret.filter(v => !!v)
            return errors.length > 0 ? {
                ...acc,
                [field.name]: errors
            } : acc
        }, {})
        await this.setState({
            errors,
            validating: false
        })
    }, 100)

    get isFormValid() {
        return !this.state.initializing && !this.state.validating && isEmpty(this.state.errors)
    }

    get fieldCount() {
        return this._formFields.length
    }

}