import { createStore, Store, Action } from 'redux'
import rootReducer from './rootReducer'
import { composeWithDevTools } from 'redux-devtools-extension'

const store: Store<{}, Action<any>> = createStore(
  rootReducer,
  composeWithDevTools()
)

export default store
