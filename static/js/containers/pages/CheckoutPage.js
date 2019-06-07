// @flow
import React from "react"
import { curry } from "ramda"
import { connect } from "react-redux"
import { mutateAsync, requestAsync } from "redux-query"
import { compose } from "redux"
import queryString from "query-string"

import queries from "../../lib/queries"
import {
  calculateDiscount,
  calculatePrice,
  formatPrice,
  formatRunTitle
} from "../../lib/ecommerce"
import { createCyberSourceForm, formatErrors } from "../../lib/form"

import type { Response } from "redux-query"
import type { Location } from "react-router"
import type {
  BasketResponse,
  BasketPayload,
  CheckoutResponse,
  BasketItem
} from "../../flow/ecommerceTypes"

export const calcSelectedRunIds = (item: BasketItem): { [number]: number } => {
  if (item.type === "courserun") {
    const course = item.courses[0]
    return {
      [course.id]: item.object_id
    }
  }

  const courseLookup = {}
  for (const course of item.courses) {
    for (const run of course.courseruns) {
      courseLookup[run.id] = course.id
    }
  }

  const selectedRunIds = {}
  for (const runId of item.run_ids) {
    const courseId = courseLookup[runId]

    // there should only be one run selected for a course
    selectedRunIds[courseId] = runId
  }
  return selectedRunIds
}

type Props = {
  basket: ?BasketResponse,
  checkout: () => Promise<Response<CheckoutResponse>>,
  fetchBasket: () => Promise<*>,
  location: Location,
  updateBasket: (payload: BasketPayload) => Promise<*>
}
type State = {
  couponCode: string | null,
  errors: string | Array<string> | null,
  selectedRuns: { [number]: { [number]: number } } | null
}
export class CheckoutPage extends React.Component<Props, State> {
  state = {
    couponCode:   null,
    selectedRuns: null,
    errors:       null
  }

  componentDidMount = async () => {
    const {
      fetchBasket,
      location: { search }
    } = this.props
    const params = queryString.parse(search)
    const productId = parseInt(params.product)
    if (!productId) {
      await fetchBasket()
      return
    }

    try {
      await this.updateBasket({ items: [{ id: productId }] })

      const couponCode = params.code
      if (couponCode) {
        await this.updateBasket({ coupons: [{ code: couponCode }] })
      }
    } catch (_) {
      // prevent complaints about unresolved promises
    }
  }

  handleErrors = async (responsePromise: Promise<*>) => {
    const response = await responsePromise
    if (response.body.errors) {
      this.setState({ errors: response.body.errors })
      throw new Error("Received error from request")
    }

    // clear state so the state from the basket is used
    this.setState({
      couponCode:   null,
      selectedRuns: null,
      errors:       null
    })

    return response
  }

  getSelectedRunIds = (item: BasketItem): { [number]: number } => {
    return {
      ...calcSelectedRunIds(item),
      ...this.state.selectedRuns
    }
  }

  submit = async () => {
    const { basket } = this.props

    if (!basket) {
      // if there is no basket there shouldn't be any submit button rendered
      throw new Error("Expected basket to exist")
    }

    // update basket with selected runs
    await this.updateBasket({
      items: basket.items.map(item => ({
        id:      item.product_id,
        // $FlowFixMe: flow doesn't understand that Object.values will return an array of number here
        run_ids: Object.values(this.getSelectedRunIds(item))
      }))
    })

    const {
      body: { url, payload, method }
    } = await this.checkout()

    if (method === "GET") {
      window.location = url
    } else {
      const form = createCyberSourceForm(url, payload)
      const body: HTMLElement = (document.querySelector("body"): any)
      body.appendChild(form)
      form.submit()
    }
  }

  updateCouponCode = (event: any) => {
    this.setState({
      couponCode: event.target.value
    })
  }

  updateSelectedRun = curry((courseId: number, event: any) => {
    const { selectedRuns } = this.state
    const runId = parseInt(event.target.value)
    this.setState({
      selectedRuns: {
        ...selectedRuns,
        [courseId]: runId
      }
    })
  })

  getCouponCode = (): string => {
    const { basket } = this.props
    const { couponCode } = this.state

    if (couponCode !== null) {
      return couponCode
    }
    if (!basket) {
      return ""
    }

    const item = basket.items[0]
    if (!item) {
      return ""
    }

    const coupon = basket.coupons.find(coupon =>
      coupon.targets.includes(item.id)
    )
    return (coupon && coupon.code) || ""
  }

  submitCoupon = async (e: Event) => {
    const couponCode = this.getCouponCode()

    e.preventDefault()

    await this.updateBasket({
      coupons: couponCode
        ? [
          {
            code: couponCode
          }
        ]
        : []
    })
  }

  // $FlowFixMe
  updateBasket = (...args) =>
    this.handleErrors(this.props.updateBasket(...args))
  // $FlowFixMe
  checkout = (...args) => this.handleErrors(this.props.checkout(...args))

  renderBasketItem = (item: BasketItem) => {
    const selectedRunIds = this.getSelectedRunIds(item)
    if (item.type === "program") {
      return (
        <React.Fragment>
          {item.courses.map(course => (
            <div className="flex-row item-row" key={course.id}>
              <div className="flex-row item-column">
                <img src={course.thumbnail_url} alt={course.title} />
              </div>
              <div className="title-column">
                <div className="title">{course.title}</div>
                <select
                  className="run-selector"
                  onChange={this.updateSelectedRun(course.id)}
                  value={selectedRunIds[course.id] || ""}
                >
                  <option value={null} key={"null"}>
                    Select a course run
                  </option>
                  {course.courseruns.map(run => (
                    <option value={run.id} key={run.id}>
                      {formatRunTitle(run)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </React.Fragment>
      )
    } else {
      return (
        <div className="flex-row item-row">
          <div className="flex-row item-column">
            <img src={item.thumbnail_url} alt={item.description} />
          </div>
          <div className="title-column">
            <div className="title">{item.description}</div>
          </div>
        </div>
      )
    }
  }

  render() {
    const { basket } = this.props
    const { errors } = this.state

    const item = basket && basket.items[0]
    if (!basket || !item) {
      return (
        <div className="checkout-page">
          No item in basket
          {formatErrors(errors)}
        </div>
      )
    }

    const coupon = basket.coupons.find(coupon =>
      coupon.targets.includes(item.id)
    )

    return (
      <div className="checkout-page container">
        <div className="row header">
          <div className="col-12">
            <div className="page-title">Checkout</div>
            <div className="purchase-text">
              You are about to purchase the following:
            </div>
            <div className="item-type">
              {item.type === "program" ? "Program" : "Course"}
            </div>
            <hr />
            {item.type === "program" ? (
              <span className="description">{item.description}</span>
            ) : null}
          </div>
        </div>
        <div className="row">
          <div className="col-lg-7">
            {this.renderBasketItem(item)}
            <div className="enrollment-input">
              <div className="enrollment-row">
                Enrollment / Promotional Code
              </div>
              <form onSubmit={this.submitCoupon}>
                <div className="flex-row coupon-code-row">
                  <input
                    type="text"
                    className={errors ? "error-border" : ""}
                    value={this.getCouponCode()}
                    onChange={this.updateCouponCode}
                  />
                  <button
                    className="apply-button"
                    type="button"
                    onClick={this.submitCoupon}
                  >
                    Apply
                  </button>
                </div>
                {formatErrors(errors)}
              </form>
            </div>
          </div>
          <div className="col-lg-5 order-summary-container">
            <div className="order-summary">
              <div className="title">Order Summary</div>
              <div className="flex-row price-row">
                <span>Price:</span>
                <span>{formatPrice(item.price)}</span>
              </div>
              {coupon ? (
                <div className="flex-row discount-row">
                  <span>Discount:</span>
                  <span>{formatPrice(calculateDiscount(item, coupon))}</span>
                </div>
              ) : null}
              <div className="bar" />
              <div className="flex-row total-row">
                <span>Total:</span>
                <span>{formatPrice(calculatePrice(item, coupon))}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-7" />
          <div className="col-lg-5">
            <button className="checkout-button" onClick={this.submit}>
              Place your order
            </button>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  basket: state.entities.basket
})
const mapDispatchToProps = dispatch => ({
  checkout:     () => dispatch(mutateAsync(queries.ecommerce.checkoutMutation())),
  fetchBasket:  () => dispatch(requestAsync(queries.ecommerce.basketQuery())),
  updateBasket: payload =>
    dispatch(mutateAsync(queries.ecommerce.basketMutation(payload)))
})

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(CheckoutPage)
