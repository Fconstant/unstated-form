import '../../__setupTests'
import test from 'ava';
import { FormContainer } from '../FormContainer';
import { FormField } from "../FormField";
import { once } from 'lodash'

const ERROR_MSG = 'ERROR_MSG'
const NOW = new Date()

class TestFormContainer extends FormContainer {
    simpleField = new FormField({
        initial: 'some_field',
        validator: (v) => v.length > 5 ? void 0 : ERROR_MSG
    })

    complexField = new FormField<Date>({
        initial: new Date(NOW.getTime() - 50000),
        validator: (v) => v.getTime() > NOW.getTime() ? ERROR_MSG : void 0
    })
}

const newForm = () => new TestFormContainer({ initialize: false })

test('form isValid', async t => {
    const form = newForm()
    await form.initialize()

    t.true(form.isFormValid)
})

test('form isInvalid', async t => {
    const form = newForm()
    await form.initialize()

    await form.simpleField.setValue("1")

    let errors = form.state.errors
    t.false(form.isFormValid)
    t.is(errors.simpleField && errors.simpleField[0], ERROR_MSG)

    await form.setValues(
        [ form.simpleField, "some_field" ],
        [ form.complexField, new Date(NOW.getTime() + 100000) ]
    )
    
    errors = form.state.errors
    t.false(form.isFormValid)
    t.is(errors.complexField && errors.complexField[0], ERROR_MSG)
    t.falsy(errors.simpleField)
})

test('add field and reset', async t => {
    const form = newForm()
    await form.initialize()

    t.true(form.isFormValid)
    t.is(form.fieldCount, 2);

    (<any> form).errorField = new FormField({
        validator: () => Promise.resolve(ERROR_MSG)
    })
    await form.reset()

    t.false(form.isFormValid)
    t.is(form.fieldCount, 3)
})

test('change field and reset', async t => {
    const form = newForm()
    await form.initialize()

    t.true(form.isFormValid)

    form.simpleField = new FormField({
        validator: () => Promise.resolve(ERROR_MSG)
    })
    await form.reset()

    t.false(form.isFormValid)
})