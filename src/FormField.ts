import { Validator } from './Validator';
import { FormContainer } from './FormContainer';
import { get, hasIn, isEmpty } from 'lodash';

export type FormFieldInit<V> = {
    initial?: V,
    validator?: Validator<V>[] | Validator<V>
}

export class FormField<V = string> {

    private readonly _initial?: V;
    private readonly _validators: Validator<V>[];

    private _name!: string;
    private _formContainer?: FormContainer;

    constructor({ validator, initial }: FormFieldInit<V> = {}) {
        this._validators = !validator ? [] : (typeof validator === 'function' ?
            [validator] : validator);
        this._initial = initial;
    }

    get initialized() {
        return !!this._formContainer && !!this._name
    }

    get name(): string {
        return this._name
    }

    get initial(): V | undefined {
        return this._initial
    }

    get formContainer(): FormContainer | undefined {
        return this._formContainer
    }

    get value(): V | undefined {
        return get(this.formContainer, ['state', 'values', this._name])
    }

    get isDirty(): boolean {
        return hasIn(this.formContainer, ['state', 'dirties', this._name])
    }

    get errors(): string[] | undefined {
        return get(this.formContainer, ['state', 'errors', this._name])
    }

    get hasErrors(): boolean {
        return !isEmpty(this.errors)
    }

    setValue = (value: V | undefined) => this.formContainer && this.formContainer.setValues([ this, value ]);

    setDirty = (dirty = true) => this.formContainer && this.formContainer.setDirty(this, dirty)

    validate = (value: V) => Promise.all(
        this._validators.map(v => v(value))
    )

    _init = (name: string, formContainer: FormContainer) => {
        this._formContainer = formContainer;
        this._name = name;
    }
}
