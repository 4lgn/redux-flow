import { createStore, Store, Action, applyMiddleware } from 'redux'
import rootReducer from './rootReducer'
import { composeWithDevTools } from 'redux-devtools-extension'
import { flowMiddleware } from './Flow'

const store: Store<{}, Action<any>> = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(flowMiddleware))
)

export default store
