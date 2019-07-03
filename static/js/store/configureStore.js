/* global require:false, module:false */
import { prop, compose, map, split } from "ramda"
import { createStore, applyMiddleware } from "redux"
import { createLogger } from "redux-logger"
import { queryMiddlewareAdvanced } from "redux-query/advanced"
import persistState from "redux-sessionstorage"
import rootReducer from "../reducers"

import { makeRequest } from "./network_interface"
import { pickPaths } from "../lib/util"

const isDev = process.env.NODE_ENV !== "production" && !global.TESTING

const sessionStorageEnhancer = persistState(["ui.userNotifications"], {
  slicer: compose(
    pickPaths,
    map(split("."))
  )
})

// Setup middleware
export default function configureStore(initialState: Object) {
  const middlewares = [
    queryMiddlewareAdvanced(makeRequest)(prop("queries"), prop("entities"))
  ]

  if (isDev) {
    middlewares.push(createLogger())
  }

  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, sessionStorageEnhancer]

  if (isDev && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__())
  }

  const composedEnhancers = compose(...enhancers)

  const store = createStore(rootReducer, initialState, composedEnhancers)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("../reducers", () => {
      const nextRootReducer = require("../reducers")

      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
