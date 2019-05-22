// @flow
import React from "react"
import * as yup from "yup"

import { Formik, Field, Form, ErrorMessage } from "formik"

import FormError from "./elements/FormError"
import { EmailInput } from "./elements/inputs"
import { emailValidationShape } from "../../lib/form"

const emailValidation = yup.object().shape({
  email: emailValidationShape
})

type EmailFormProps = {
  onSubmit: Function
}

const EmailForm = ({ onSubmit }: EmailFormProps) => (
  <Formik
    onSubmit={onSubmit}
    validationSchema={emailValidation}
    initialValues={{ email: "" }}
    render={({ isSubmitting }) => (
      <Form>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <Field name="email" className="form-control" component={EmailInput} />
          <ErrorMessage name="email" component={FormError} />
        </div>
        <div className="row submit-row no-gutters justify-content-end">
          <button
            type="submit"
            className="btn btn-primary btn-light-blue"
            disabled={isSubmitting}
          >
            Submit
          </button>
        </div>
      </Form>
    )}
  />
)

export default EmailForm