function nameFunction(name: string, body: any) {
  return {
    [name](...args: any[]) {
      return body(...args)
    },
  }[name]
}

export interface AsyncObj<T> {
  isFetching: boolean
  data: T
  error: string
}

export const asyncState: AsyncObj<any> = {
  isFetching: false,
  data: null,
  error: '',
}

export type Action<State> = {
  type: string
  payload?: any
  meta?: (state: State, payload?: any) => Promise<any>
}

export type ActionCreator = <T>(payload?: T) => Action<T>

export const flowMiddleware = (store: any) => (next: any) => (
  action: Action<any>
) => {
  if (!action.meta) return next(action)

  const matches = /^\w*\/(\w*)_(REQUEST|SUCCESS|FAILED)$/gm.exec(action.type)
  if (!matches) return next(action)
  const [suffixedActionName, actionName, modifier] = matches

  if (modifier === 'REQUEST') {
    const asyncFunc = action.meta

    let promise = action.payload
      ? asyncFunc(store.getState(), action.payload)
      : asyncFunc(store.getState().user)

    const dispatch = (type: string, payload: any) =>
      store.dispatch({
        type: suffixedActionName.replace(modifier, type),
        payload,
      })

    promise
      .then((res: any) => dispatch('SUCCESS', res))
      .catch((err: any) => dispatch('FAILED', err.message))
  }

  return next(action)
}

export default function <State>(
  name: string,
  {
    initialState,
    mutations,
    actions,
  }: {
    initialState: State
    mutations: {
      [mutationName: string]: (state: State, payload?: any) => void
    }
    actions: {
      [actionName: string]: {
        selector: keyof State
        fn: (state: State, payload?: any) => Promise<any>
      }
    }
  }
) {
  const suffix = (key: string) => `${name}/${key}`

  const actionCreators: ActionCreator[] = []
  const actionToReducer: {
    [key: string]: (state: any, payload?: any) => State
  } = {}

  const insertAction = (
    actionType: string,
    name: string,
    meta?: (state: State, payload?: any) => Promise<any>
  ) => {
    actionCreators.push(
      nameFunction(name, (payload?: any) => {
        const action = { type: actionType }
        if (!meta) {
          return payload ? { ...action, payload } : action
        } else {
          return payload ? { ...action, payload, meta } : { ...action, meta }
        }
      })
    )
  }

  Object.entries(mutations).forEach(([mutationName, mutation]) => {
    const actionType = suffix(mutationName)
    insertAction(actionType, mutationName)
    actionToReducer[actionType] = (state: State, payload?: any) => {
      mutation(state, payload)
      return state
    }
  })

  Object.entries(actions).forEach(([actionName, { selector, fn }]) => {
    const actionType = suffix(actionName)

    const req = `${actionType}_REQUEST`
    insertAction(req, actionName, fn)
    const success = `${actionType}_SUCCESS`
    const fail = `${actionType}_FAILED`

    actionToReducer[req] = (state: State) => {
      return {
        ...state,
        [selector]: {
          ...state[selector],
          isFetching: true,
        },
      }
    }
    actionToReducer[success] = (state: State, payload: any) => {
      return {
        ...state,
        [selector]: {
          isFetching: false,
          error: '',
          data: payload,
        },
      }
    }
    actionToReducer[fail] = (state: State, payload: string) => {
      return {
        ...state,
        [selector]: {
          ...state[selector],
          isFetching: false,
          error: payload,
        },
      }
    }
  })

  const reducer = (
    state: State = initialState,
    action: Action<State>
  ): State => {
    // Only reduce on our action types
    if (!actionToReducer[action.type]) return state
    return actionToReducer[action.type](state, action.payload)
  }

  const actionObj: {
    [key: string]: ActionCreator
  } = {}

  actionCreators.forEach(fn => {
    actionObj[fn.name] = fn
  })

  return {
    reducer,
    actions: actionObj,
  }
}
