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

function nameFunction(name: string, body: any) {
  return {[name](...args: any[]) {return body(...args)}}[name]
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
      [key: string]: (state: State, payload?: any) => State
    }
    actions: {
      [key: string]: (state: State, payload?: any) => Promise<any>
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
    meta?: (state: State, payload?: any) => Promise<any>
  ) => {
    actionCreators.push(nameFunction((payload?: any) {
      const action = { type: actionType }
      if (!meta) {
        return payload ? { ...action, payload } : action
      } else {
        return payload ? { ...action, payload, meta } : { ...action, meta }
      }
    })
  }

  Object.entries(mutations).forEach(([key, value]) => {
    const actionType = suffix(key)
    insertAction(actionType)
    actionToReducer[actionType] = value
  })

  Object.entries(actions).forEach(([key, value]) => {
    const actionType = suffix(key)

    const req = `${actionType}_REQUEST`
    insertAction(req, value)
    const success = `${actionType}_SUCCESS`
    const fail = `${actionType}_FAILED`

    actionToReducer[req] = (state: any, payload?: any) => {
      return {
        ...state,
        [key]: {
          ...state[key],
          isFetching: true,
        },
      }
    }
    actionToReducer[success] = (state: any, payload: any) => {
      return {
        ...state,
        [key]: {
          isFetching: false,
          error: '',
          data: payload,
        },
      }
    }
    actionToReducer[fail] = (state: any, payload: any) => {
      return {
        ...state,
        [key]: {
          ...state[key],
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

    // TODO: Can maybe do this more concise
    if (action.payload) {
      return actionToReducer[action.type](state, action.payload)
    } else {
      return actionToReducer[action.type](state)
    }
  }

  console.log(actionCreators)

  return {
    reducer,
    actions: actionCreators,
  }
}
