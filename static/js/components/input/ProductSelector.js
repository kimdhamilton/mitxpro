// @flow
import React, { useState, useEffect } from "react"
// $FlowFixMe: Flow trips up with this library
import Select, { OptionProps } from "react-select"
import { sort, pipe, when, prop, filter, map } from "ramda"
import { connect, useSelector } from "react-redux"
import { compose } from "redux"
import { useField } from "formik"
import { useRequest } from "redux-query-react"

import {
  formatCourseware,
  formatCoursewareDate,
  isProgramProduct,
  isCourseRunProduct
} from "../../lib/ecommerce"
import { PRODUCT_TYPE_COURSERUN, PRODUCT_TYPE_PROGRAM } from "../../constants"
import {} from "../../lib/util"

import type {
  Product,
  ProgramRunDetail,
  CourseRunProduct,
  ProgramProduct,
  ProductType
} from "../../flow/ecommerceTypes"
import type { Course } from "../../flow/courseTypes"
import { emptyOrNil } from "../../lib/util"
import queries from "../../lib/queries"

type Props = {
  products: Array<Product>
}

const defaultSelectComponentsProp = { IndicatorSeparator: null }

export const PRODUCT_OPTION_COURSERUN = {
  value: PRODUCT_TYPE_COURSERUN,
  label: "Course"
}
export const PRODUCT_OPTION_PROGRAM = {
  value: PRODUCT_TYPE_PROGRAM,
  label: "Program"
}
export const PRODUCT_TYPE_OPTIONS: Array<OptionProps> = [
  PRODUCT_OPTION_COURSERUN,
  PRODUCT_OPTION_PROGRAM
]

export const sortByStartDate = sort((first: ?Moment, second: ?Moment) => {
  if (!first) {
    return 1
  }
  if (!second) {
    return -1
  }
  return first.diff(second)
})

const buildProgramOption = (product: ProgramProduct): OptionProps => ({
  value: product.id,
  label: product.latest_version.content_title
})

const buildCourseOption = (product: CourseRunProduct): OptionProps => ({
  value: product.content_object.course.id || "",
  label: product.content_object.course.title || ""
})

const buildCourseDateOption = (product: CourseRunProduct): OptionProps => ({
  value: product.id,
  label: `${formatCoursewareDate(product.start_date)} - ${formatCoursewareDate(
    product.end_date
  )}`
})

const buildProgramDateOption = (run: ProgramRunDetail): OptionProps => ({
  value: run.id,
  label: `${formatCoursewareDate(run.start_date)} - ${formatCoursewareDate(
    run.end_date
  )}`
})

const buildProductOptions = map(
  when(isProgramProduct, buildProgramOption),
  when(isCourseRunProduct, buildCourseOption)
)

const buildCourseRunDateOptions = pipe(
  map(buildProgramDateOption),
  sort(
    pipe(
      sortByStartDate,
      prop("content_object")
    )
  ),
  filter(
    (product: CourseRunProduct, coursewareOption: OptionProps) =>
      product.content_object.course.id === coursewareOption.value
  )
)

const buildProgramDateOptions = pipe(
  map(buildProgramDateOption),
  sort(sortByStartDate)
)

const buildProductDateOptions = map(
  when(isProgramProduct, buildProgramDateOptions),
  when(isCourseRunProduct, buildCourseRunDateOptions)
)

const shouldShowDateSelector = (
  productType: ProductType,
  programRuns: Array<ProgramRunDetail>
): boolean =>
  productType === PRODUCT_TYPE_COURSERUN ||
  (productType === PRODUCT_TYPE_PROGRAM && emptyOrNil(programRuns))

const ProductSelector = ({ products, ...props }: Props) => {
  const [productTypeOption, setProductTypeOption] = useState(
    PRODUCT_TYPE_OPTIONS[0]
  )
  const [coursewareOption, setCoursewareOption] = useState(null)
  const [coursewareDateOption, setCoursewareDateOption] = useState(null)
  const [field, { value }, { setValue }] = useField(props)
  const [{ isPending }] = useRequest(
    value.productId
      ? queries.ecommerce.productProgramRunsByIdSelector(value.productId)
      : null
  )
  const programRuns = isPending
    ? []
    : useSelector(queries.ecommerce.programRunsSelector)
  const productType = productTypeOption.value
  const filteredProducts: Array<BaseProduct> = products.filter(
    product => product.product_type === productType
  )

  useEffect(() => {
    setCoursewareOption(null)
  }, [productTypeOption])

  useEffect(() => {
    setCoursewareDateOption(null)
  }, [coursewareOption])

  useEffect(() => {
    if (
      !coursewareOption ||
      (productType === PRODUCT_TYPE_COURSERUN && !coursewareDateOption)
    ) {
      setValue({ productId: null, programRunId: null })
    } else if (productType === PRODUCT_TYPE_PROGRAM) {
      // This is a dirty hack to support program run tags. Refer to `B2bPurchasePage.onSubmit` for further info.
      setValue({
        productId:    coursewareOption.value,
        programRunId: coursewareDateOption ? coursewareDateOption.value : null
      })
    } else {
      setValue({ productId: coursewareDateOption.value, programRunId: null })
    }
  }, [productTypeOption, coursewareOption, coursewareDateOption])

  return (
    <div className="product-selector">
      <div className="row course-row">
        <div className="col-12">
          <span className="description">
            Select to view available courses or programs:
          </span>
          <Select
            className="select"
            options={PRODUCT_TYPE_OPTIONS}
            components={defaultSelectComponentsProp}
            onChange={setProductTypeOption}
            value={productTypeOption}
          />
        </div>
      </div>

      <div className="row product-row">
        <div className="col-12">
          <span className="description">Select {productTypeOption.label}:</span>
          <Select
            className="select"
            components={defaultSelectComponentsProp}
            options={buildProductOptions(productType, programRuns)}
            value={coursewareOption}
            onChange={setCoursewareOption}
          />
        </div>
      </div>
      {productType === PRODUCT_TYPE_PROGRAM && coursewareOption ? (
        isPending ? (
          <img
            src="/static/images/loader.gif"
            className="mx-auto d-block"
            alt="Loading..."
          />
        ) : shouldShowDateSelector(productType, programRuns) ? (
          <div className="row course-date-row">
            <div className="col-12">
              <span className="description">Select start date:</span>
              <Select
                className="select"
                components={defaultSelectComponentsProp}
                options={buildProductDateOptions(
                  filteredProducts,
                  coursewareOption
                )}
                value={coursewareDateOption}
                onChange={setCoursewareDateOption}
              />
            </div>
          </div>
        ) : null
      ) : null}
    </div>
  )
}

export default ProductSelector
