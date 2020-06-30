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

export const flowMiddleware = (store: any) => (next: any) => (action: any) => {
  if (!action.meta) return next(action)

  const regex = /^\w*\/(\w*)_(REQUEST|SUCCESS|FAILED)$/gm
  const str = action.type
  let matches: string[] = []
  let m
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++
    m.forEach((match, groupIndex) => (matches[groupIndex] = match))
  }

  if (matches.length > 0 && matches[2] === 'REQUEST') {
    const asyncFunc = action.meta

    let promise = action.payload
      ? asyncFunc(store.getState(), action.payload)
      : asyncFunc(store.getState().user)

    const dispatch = (type: string, payload: any) =>
      store.dispatch({ type: matches[0].replace(matches[2], type), payload })

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
        // selector: (state: State) => AsyncObj<any>
        selector: string
        fn: (state: State, payload?: any) => Promise<any>
      }
    }
  }
) {
  type Action<T> = {
    type: string
    payload?: T
  }
  type ActionCreator = <T>(payload?: T) => Action<T>

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
    actionToReducer[actionType] = (state: any, payload?: any) => {
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

    actionToReducer[req] = (state: any) => {
      return {
        ...state,
        [selector]: {
          ...state[selector],
          isFetching: true,
        },
      }
    }
    actionToReducer[success] = (state: any, payload: any) => {
      return {
        ...state,
        [selector]: {
          isFetching: false,
          error: '',
          data: payload,
        },
      }
    }
    actionToReducer[fail] = (state: any, payload: any) => {
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

  const reducer = (state: State = initialState, action: any): State => {
    // Only reduce on our action types
    if (!actionToReducer[action.type]) return state

    // TODO: Can maybe do this more concise
    const regex = /^\w*\/(\w*)_(REQUEST|SUCCESS|FAILED)$/gm
    const str = action.type
    let matches: string[] = []
    let m
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) regex.lastIndex++
      m.forEach((match, groupIndex) => (matches[groupIndex] = match))
    }

    return actionToReducer[action.type](state, action.payload)
  }

  console.log(actionCreators)

  return {
    reducer,
    actions: actionCreators,
  }
}
