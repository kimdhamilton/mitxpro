// @flow
import React from "react"
import { find } from "ramda"
import sinon from "sinon"
import { render as enzymeRender } from "enzyme"
import { assert } from "chai"
import casual from "casual-browserify"
// $FlowFixMe: Flow trips up with this library
import Select from "react-select"
import { Formik } from "formik"
import { Provider } from "react-redux"

import ProductSelector, {
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_OPTION_COURSERUN,
  PRODUCT_OPTION_PROGRAM,
  sortByStartDate
} from "./ProductSelector"

import { makeCourse } from "../../factories/course"
import {
  makeProgramProduct,
  makeProgramRun,
  makeCourseRunProduct
} from "../../factories/ecommerce"
import { PRODUCT_TYPE_COURSERUN, PRODUCT_TYPE_PROGRAM } from "../../constants"
import {
  findRunInProduct,
  formatCoursewareDate,
  formatRunTitle
} from "../../lib/ecommerce"
import { shouldIf } from "../../lib/test_utils"
import configureStoreMain from "../../store/configureStore"

import type {
  ProgramRunDetail,
  ProductType,
  CourseRunProduct
} from "../../flow/ecommerceTypes"
import type { FormikProps } from "formik"

// When a component with a <Select /> is rendered with shallow(), it appears as
// a <StateManager /> with className="select"
const SelectComponentSelector = "StateManager.select"
const initialValues = { product: { productId: null, programRunId: null } }

type Values = {
  product: { productId: ?string, programRunId: ?string }
}

const findProductTypeOption = (productType: ProductType) =>
  find(option => option.value === productType, PRODUCT_TYPE_OPTIONS)

describe.only("ProductSelector", () => {
  let products,
    onChangeStub,
    runProduct2Course1,
    runProduct1Course1,
    runProduct2,
    programProduct,
    store

  beforeEach(() => {
    onChangeStub = sinon.stub()
    runProduct1Course1 = makeCourseRunProduct()
    runProduct2Course1 = makeCourseRunProduct()
    runProduct2 = makeCourseRunProduct()
    programProduct = makeProgramProduct("test+Aug_2016")
    store = configureStoreMain({})

    products = [
      runProduct2,
      programProduct,
      runProduct1Course1,
      runProduct2Course1
    ]
  })

  const render = () => {
    let injected: FormikProps<Values>
    const wrapper = enzymeRender(
      <Provider store={store}>
        <Formik onSubmit={() => {}} initialValues={initialValues}>
          {(formikProps: FormikProps<Values>) =>
            (injected = formikProps) && (
              <ProductSelector name="product" products={products} />
            )
          }
        </Formik>
      </Provider>
    )
    const getSelectors = () => wrapper.find(SelectComponentSelector)

    const getProductTypeSelectWrapper = () => getSelectors().at(0)
    const getCoursewareSelectWrapper = () => getSelectors().at(1)
    const getCoursewareDateSelectWrapper = () => getSelectors().at(2)

    return {
      getProductTypeSelectWrapper,
      getCoursewareSelectWrapper,
      getCoursewareDateSelectWrapper,
      getInjectedProps:  (): FormikProps<Values> => injected,
      selectProductType: (productType: ProductType) => {
        const wrapper = getProductTypeSelectWrapper()
        const { onChange, options } = wrapper.props()

        onChange(find(option => option.value === productType, options))
      },
      selectCourseware: (product: Product) => {
        const wrapper = getCoursewareSelectWrapper()
        const { onChange, options } = wrapper.props()

        onChange(find(option => option.value === product.id, options))
      },
      selectCoursewareDate: (item: ProgramRunDetail | CourseRunProduct) => {
        const wrapper = getCoursewareDateSelectWrapper()
        const { onChange, options } = wrapper.props()

        onChange(find(option => option.value === item.id, options))
      },
      wrapper
    }
  }

  it("renders controls with defaults", () => {
    const {
      wrapper,
      getProductTypeSelectWrapper,
      getCoursewareSelectWrapper
    } = render()
    console.log(wrapper.debug())
    assert.deepEqual(
      getProductTypeSelectWrapper().prop("options"),
      PRODUCT_TYPE_OPTIONS
    )
    assert.equal(
      wrapper.find(".product-row .description").text(),
      `Select ${PRODUCT_TYPE_OPTIONS[0]}:`
    )
    assert.isNull(getCoursewareSelectWrapper().prop("value"))
  })

  PRODUCT_TYPE_OPTIONS.forEach(option => {
    describe(`for productType ${option.value}`, () => {
      it("should update the state when the product type Select option is changed", () => {
        const { wrapper, selectProductType } = render()
        selectProductType(option)
        assert.equal(
          wrapper.find(".product-row .description").text(),
          `Select ${option.label}:`
        )

        const opposite = find(
          o => o.value !== option.value,
          PRODUCT_TYPE_OPTIONS
        )
        selectProductType(opposite)
        assert.equal(
          wrapper.find(".product-row .description").text(),
          `Select ${opposite.label}:`
        )
      })
    })
  })

  it("renders a list of programs", () => {
    const { wrapper, selectProductType, getCoursewareSelectWrapper } = render()
    selectProductType(PRODUCT_TYPE_COURSERUN)
    assert.deepEqual(getCoursewareSelectWrapper().prop("options"), [
      {
        label: programProduct.latest_version.content_title,
        value: programProduct.id
      }
    ])
  })

  it("renders a list of unique courses", () => {
    const { wrapper, selectProductType, getCoursewareSelectWrapper } = render()
    selectProductType(PRODUCT_TYPE_COURSERUN)
    const courseProducts = products.filter(
      product => product.product_type === PRODUCT_TYPE_COURSERUN
    )
    // If multiple runs belong to the same course, that course should only show up once in the options
    const expectedOptions = [
      {
        label: runProduct2.parent.title,
        value: runProduct2.parent.id
      },
      {
        label: runProduct1Course1.parent.title,
        value: runProduct1Course1.parent.id
      }
    ]
    assert.deepEqual(
      getCoursewareSelectWrapper().prop("options"),
      expectedOptions
    )
    assert.isAbove(courseProducts.length, expectedOptions.length)
  })

  it("preselects a course product when selectedProduct is passed in", () => {
    const selectedProduct = runProduct1Course1
    const {
      wrapper,
      selectProductType,
      selectCourseware,
      getCoursewareSelectWrapper
    } = render()
    selectProductType(PRODUCT_TYPE_COURSERUN)
    selectCourseware(selectedProduct)

    const selectWrapper = getCoursewareSelectWrapper()
    assert.deepEqual(selectWrapper.prop("value"), {
      value: selectedProduct.parent.id,
      label: selectedProduct.parent.title
    })
  })

  it("doesn't render a list of course run dates if the program type is selected", () => {
    const {
      wrapper,
      selectProductType,
      getCoursewareDateSelectWrapper
    } = render()
    selectProductType(PRODUCT_TYPE_PROGRAM)
    assert.isFalse(getCoursewareDateSelectWrapper.exists())
  })

  it("renders a list of course run dates if the course type is selected", () => {
    const {
      wrapper,
      selectProductType,
      selectCourseware,
      getCoursewareDateSelectWrapper
    } = render()
    selectProductType(PRODUCT_TYPE_COURSERUN)
    selectCourseware(runProduct2Course1)

    const expectedProducts = [runProduct1Course1, runProduct2Course1]
    assert.deepEqual(
      getCoursewareDateSelectWrapper().prop("options"),
      expectedProducts.sort(sortByStartDate).map(product => ({
        label: `${formatCoursewareDate(
          product.start_date
        )} - ${formatCoursewareDate(product.end_date)}`,
        value: product.id
      }))
    )
  })

  it("sets the selected product when a program is selected", () => {
    const {
      wrapper,
      selectProductType,
      selectCourseware,
      getInjectedProps
    } = render()
    selectProductType(PRODUCT_TYPE_PROGRAM)

    let props = getInjectedProps()
    console.log(props)

    assert.deepEquals(props.values, initialValues)
    selectCourseware(programProduct)
    props = getInjectedProps()
    assert.deepEquals(props.values, {
      product: { productId: programProduct.id, programRunId: null }
    })
  })

  it("renders a list of available program runs when a program is selected", () => {
    const productProgramRuns = [
      makeProgramRun(programProduct.latest_version),
      makeProgramRun(programProduct.latest_version)
    ]
    const { wrapper } = render({ productProgramRuns })
    wrapper.setState({
      productType:           PRODUCT_TYPE_PROGRAM,
      selectedCoursewareObj: {
        label: programProduct.latest_version.content_title,
        value: programProduct.id
      }
    })
    const selectWrapper = wrapper.find(SelectComponentSelector).at(2)
    assert.deepEqual(
      selectWrapper.prop("options"),
      productProgramRuns.sort(sortByStartDate).map(programRun => ({
        label: `${formatCoursewareDate(
          programRun.start_date
        )} - ${formatCoursewareDate(programRun.end_date)}`,
        value: programRun.id
      }))
    )
  })

  it("sets the selected program run when one is selected", () => {
    const productProgramRuns = [
      makeProgramRun(programProduct.latest_version),
      makeProgramRun(programProduct.latest_version)
    ]
    const { wrapper } = render({ productProgramRuns })
    wrapper.setState({
      productType:           PRODUCT_TYPE_PROGRAM,
      selectedCoursewareObj: {
        label: programProduct.latest_version.content_title,
        value: programProduct.id
      },
      selectedCourseDate: null
    })
    sinon.assert.calledWith(onChangeStub, {
      target: {
        name:  defaultProps.field.name,
        value: { productId: programProduct.id, programRunId: null }
      }
    })
    const dateSelectWrapper = wrapper.find(SelectComponentSelector).at(2)
    const option = dateSelectWrapper.prop("options")[0]
    dateSelectWrapper.prop("onChange")(option)
    sinon.assert.calledWith(onChangeStub, {
      target: {
        name:  defaultProps.field.name,
        value: { productId: programProduct.id, programRunId: option.value }
      }
    })
  })

  it("sets the selected product when a course date is selected", () => {
    const { wrapper } = render()
    const product = runProduct1Course1
    wrapper.setState({
      productType:           PRODUCT_TYPE_COURSERUN,
      selectedCoursewareObj: {
        label: product.parent.title,
        value: product.parent.id
      }
    })
    sinon.assert.calledWith(onChangeStub, {
      target: {
        name:  defaultProps.field.name,
        value: { productId: null, programRunId: null }
      }
    })
    const dateSelectWrapper = wrapper.find(SelectComponentSelector).at(2)
    const option = dateSelectWrapper.prop("options")[0]
    dateSelectWrapper.prop("onChange")(option)
    sinon.assert.calledWith(onChangeStub, {
      target: {
        name:  defaultProps.field.name,
        value: { productId: option.value, programRunId: null }
      }
    })
  })
})
