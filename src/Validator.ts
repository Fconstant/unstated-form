export type ValidatorReturn = string | undefined

export interface Validator<V = string> {
    (value: V): Promise<ValidatorReturn> | ValidatorReturn
}