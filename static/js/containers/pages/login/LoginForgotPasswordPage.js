// @flow
/* global SETTINGS: false */
import React from "react"
import DocumentTitle from "react-document-title"
import { FORGOT_PASSWORD_PAGE_TITLE } from "../../../constants"
import { compose } from "redux"
import { connect } from "react-redux"
import { mutateAsync } from "redux-query"
import { Link } from "react-router-dom";

import { addUserNotification } from "../../../actions"
import auth from "../../../lib/queries/auth"
import { routes } from "../../../lib/urls"
import { ALERT_TYPE_TEXT } from "../../../constants"

import EmailForm from "../../../components/forms/EmailForm"

import type { RouterHistory } from "react-router"
import type { EmailFormValues } from "../../../components/forms/EmailForm"

type Props = {
  history: RouterHistory,
  forgotPassword: (email: string) => Promise<any>,
  addUserNotification: Function
}

const passwordResetText = (email: string) =>
  `If an account with the email "${email}" exists, an email has been sent with a password reset link.`

export class LoginForgotPasswordPage extends React.Component<Props> {
  async onSubmit({ email }: EmailFormValues, { setSubmitting }: any) {
    const { addUserNotification, forgotPassword, history } = this.props;

    try {
      await forgotPassword(email);
      this.forgotEmailSent = true;
      this.setState((state, props) => {
        return {
          text: passwordResetText(email)
        };
      });

      history.push(routes.login.forgot)

    } finally {
      setSubmitting(false)
    }
  }

  resetEmailLinkSent() {
    this.forgotEmailSent = false;
  }

  render() {
    return (
      <DocumentTitle
        title={`${SETTINGS.site_name} | ${FORGOT_PASSWORD_PAGE_TITLE}`}
      >
        <div className="container auth-page">
          <div className="row auth-header">
            <h1 className="col-12">Forgot Password</h1>
          </div>
          {this.forgotEmailSent ? (
            <div className="row auth-card card-shadow">
              <div className="col-12">
                <h3 className="text-center">Thank You!</h3>
              </div>
              <div className="col-12">
                <p>{this.state.text}</p>
              </div>
              <div className="col-12">
                <p><b>If you do NOT receive your password reset email, here's what to do:</b></p>
              </div>
              <div className="col-12">
                <ol>
                  <li><b>Wait a few moments.</b> It might take several minutes to receive your password reset email.</li>
                  <li><b>Check your spam folder.</b>  It might be there.</li>
                  <li><b>Is your email correct?</b> If you made a typo, no problem, just try to <Link to="/signin/forgot-password" onClick={this.resetEmailLinkSent.bind(this)}>reset your password</Link> again.</li>
                </ol>
              </div>
              <div className="col-12">
                <b>Still no password reset email?</b> Please contact our MIT xPRO <a href="mailto:xpro@mit.edu">Customer Support Center</a>.
              </div>
            </div>
          ) : (
            <div className="row auth-card card-shadow auth-form">
              <div className="col-12">
                <p>Enter your email to receive a password reset link.</p>
              </div>
              <div className="col-12">
                <EmailForm onSubmit={this.onSubmit.bind(this)} />
              </div>
            </div>
            )}
        </div>
      </DocumentTitle>
    )
  }
}

const forgotPassword = (email: string) =>
  mutateAsync(auth.forgotPasswordMutation(email))

const mapDispatchToProps = {
  forgotPassword,
  addUserNotification
}

export default compose(
  connect(
    null,
    mapDispatchToProps
  )
)(LoginForgotPasswordPage)
