# redux-flow

[![npm version](https://img.shields.io/npm/v/redux-flow.svg)](https://www.npmjs.com/package/redux-flow)
[![npm](https://img.shields.io/npm/dm/redux-flow.svg)](https://www.npmjs.com/package/redux-flow)


`redux-flow` is an opinionated Redux library to manage your synhronous and asynchronous data flow, aiming to reduce the usual boilerplate as much as possible.

The mental model is a combination of the ["ducks" pattern](https://github.com/erikras/ducks-modular-redux) and the Unix philosophy of "Do One Thing and Do It Well". This library is probably not able to do _everything_ that Redux does (without excessive hacking), but in 90% of cases it does just enough. The last 10% will never be supported if it hinders usability and simplicity.

## Installation

```sh
$ npm install redux-flow
```

or 

```sh
$ yarn add redux-flow
```
## Usage

### Basic Usage Example

Suppose we have a simple synchronous counter in our application.

```javascript
const MyComponent: React.FC = () => {
  const dispatch = useDispatch()
  const count = useSelector(getCount)
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(incrementCount())}>Increment</button>
      <button onClick={() => dispatch(setCount(0))}>Reset count</button>
    </div>
  )
}
```

This component will display the count from our Redux store using the `getCount` selector. Furthermore we are able to increment and reset the count by dispatching the `incrementCount()` and `setCount()` actions, respectively. We'll now create a `counter` flow to represent our counter:

#### `flows/counter.ts`

```javascript
import Flow from 'redux-flow'

export type CounterState = {
  count: number
}

const initialState: CounterState = {
  count: 0
}

const { reducer, actions } = Flow('counter', {
  initialState: { ...initialState },
  mutations: {
    incrementCount(state) {
      state.count++
    },
    setCount(state, count: number) {
      state.count = count
    }
  },
  actions: { },
})

export { reducer }
```

To integrate this flow, we'll have to connect it to the Redux Store using the `redux-flow` middleware.

#### `store.ts`

```javascript
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './rootReducer'
import { flowMiddleware, setStore } from 'redux-flow'

const store = createStore(
  rootReducer,
  applyMiddleware(flowMiddleware)
)

setStore(store)

export default store
```

The reducer function returned from your flow must also be integrated in on of your connected reducers, this would possibly be done by including it in a `rootReducer` with `combineReducers()`

#### `rootReducer.ts`

```javascript
import { combineReducers } from 'redux'
import * as counter from './flows/counter'

export default combineReducers({
  counter: counter.reducer
})
```


### Actions

Actions are used for asynchronous state changes, i.e. if you want to populate your state with a response from your web server. Actions will produce a Redux action of the name `flowName/actionName_REQUEST` with `flowName` being the name of your current flow state, and `actionName` the name of your Action function. More importantly, on a response from your server, one of two Redux actions will be dispatched, `flowName/actionName_SUCCESS` if the call was succesful, and `flowName/actionName_FAILED` if unsuccesful (error was thrown).

Actions have the type as specified in the `AsyncObj<T>` type which should be used to easily generate types for your state object.:

```typescript
interface AsyncObj<T> {
  isFetching: boolean,
  error: string,
  data: T
}
```

The Actions object can be structured as such to simulate asynchronously getting a count from a server located at `API_URL`, and storing the response data in the `count` object:

```javascript
  actions: {
    fetchCount: {
      selector: 'count',
      fn: async state => {
        const res = await Axios.get(`${API_URL}/count`)
        return res.data
    }
  }
```

The Redux state that will result from dispatching this action is as follows on initial dispatch (no response yet):

```javascript
{
  isFetching: true,
  error: '',
  data: null
}
```

on successfull response from the server, it will be updated accordingly, with the structure of the data object being dictated by the returned object from the Action function, in our example, `res.data`.

```javascript
{
  isFetching: false,
  error: '',
  data: {
    count: 8
  }
}
```

on failure, the error message would be updated accordingly

```javascript
{
  isFetching: false,
  error: 'No counter initialized',
  data: null
}
```

### put and select

You can also utilize your created selectors and actions inside of your mutations/actions by using the `put` and `select` helper functions.

The below example shows how you might implement caching logic by using these helper functions.

```javascript
import Flow, { asyncState, AsyncObj, put, select } from 'redux-flow'

export type ThingsState = {
  things: AsyncObj<Thing[]>,
  lastFetched: Moment | null
}

const initialState: ThingsState = {
  things: asyncState,
  lastFetched: null,
}

const { reducer, actions } = Flow('myThings', {
  initialState: { ...initialState },
  mutations: {
    updateThingsLastFetched(state) {
      state.lastFetched = moment()
    },
  },
  actions: {
    fetchThings: {
      selector: 'things',
      fn: async state => {
        const cachedData = select(getThings).data
        const lastFetched = select(getThingsLastFetched)
        if (
          cachedData &&
          lastFetched &&
          moment(moment().diff(lastFetched)).minutes() < 30
        ) {
          return cachedData
        }

        const res = await Axios.get(`${API_URL}/things`)
        put(updateThingsLastFetched())
        return res.data
    },
  },
})

export const { getThings, getThingsLastFetched } = {
  getThings(state: RootState) {
    return state.myThings.things
  },
  getThingsLastFetched(state: RootState) {
    return state.myThings.lastFetched
  },
}

export { reducer }
```

## Tests

```
npm test
```

## Copyright

Copyright (c) 2019-2021 Alexander G. Nielsen. See [LICENSE](https://github.com/4lgn/redux-flow/blob/master/LICENSE) for details.
