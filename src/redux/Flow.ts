import { Store, Action as ReduxAction } from 'redux'
import { CLIENT_RENEG_LIMIT } from 'tls'

// export const { reducer } = Flow(
//   'user',
//   {
//     id: {
//       init: 0,
//       mutations: {
//         setId: (current, payload) => {
//           return ''
//         }
//       }
//     },
//     info: {
//       init: asyncState,
//       fetcher: async (state: any) => {
//         const res = await fetch(`https://reqres.in/api/users/${state.id}`)
//         return await res.json()
//       }
//     }
//   },
//   {
//     setIdAndDoSomething: (state: any, payload: any) => {
//       return state
//     }
//   }
// )

// export default function (
//   name: string,
//   options: {
//     [key: string]: {
//       init: any
//       // TODO: Should return same type as in init
//       mutations?: {
//         [key: string]: (current: any, payload: any) => any
//       }
//       fetcher?: (state: any) => Promise<any>
//     }
//   },
//   actions: any
// ) {
//   const initialState = Object.fromEntries(
//     Object.entries(options).map(([key, value]) => {
//       return [key, value.init]
//     })
//   )

//   const allActions: [string, () => void][] = []

//   Object.entries(options).forEach(([key, value]) => {
//     if (value.mutations) {
//       Object.entries(value.mutations).forEach(([actionTitle, actionFunc]) => {
//         allActions.push({})
//       })
//     }
//   })

//   const reducer = (state: any, action: any) => {
//     return state
//   }

//   return {
//     reducer,
//   }
// }

// export const boi = Flow4(
//   'user',
//   {
//     id: 0,
//     info: asyncState,
//   },
//   {
//     setId: (state: any, payload: any) => {
//       return { ...state, id: payload }
//     },
//   },
//   {
//     getInfo: async (state: any) => {
//       const res = await fetch(`https://reqres.in/api/users/${state.id}`)
//       return await res.json()
//     },
//   }
// )

// function hasPayload(object: any): object is (state: any, payload: any) => void {
//   return object instanceof ((state: any, payload: any) => void)
// }

export const flowMiddleware = (store: any) => (next: any) => (action: any) => {
  if (!action.meta) return next(action)

  console.log('from middleware')
  console.log(action)
  // TODO: Handle async (on request, run async and dispatch success/error)
  const regex = /^\w*\/(\w*)_(REQUEST|SUCCESS|FAILED)$/gm
  const str = action.type
  let matches: string[] = []
  let m
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++
    m.forEach((match, groupIndex) => (matches[groupIndex] = match))
  }

  if (matches.length > 0 && matches[2] === 'REQUEST') {
    console.log('right?')
    // find async to run
    const asyncFunc = action.meta

    // run with state (is in reducer params, and optionally action payload (if exists))
    let promise = action.payload
      ? asyncFunc(store.getState(), action.payload)
      : asyncFunc(store.getState().user)

    // when async is done and successful, dispatch success with data as payload
    // if failed, dispatch failed with error as payload (maybe check if error is empty or null, and generically type 'Error!' as payload)

    const dispatch = (type: string, payload: any) =>
      // store.dispatch({ type: `user/${matches[1]}_${type}`, payload })
      store.dispatch({ type: matches[0].replace(matches[2], type), payload })
    promise
      .then((res: any) => dispatch('SUCCESS', res))
      .catch((err: any) => dispatch('FAILED', err))
  }

  return next(action)
}

export default function <State>(
  // store: Store<{}, ReduxAction<any>>,
  name: string,
  initialState: State,
  mutations: {
    [key: string]: (state: State, payload?: any) => State
  },
  actions: {
    [key: string]: (state: State, payload?: any) => Promise<any>
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
    actionCreators.push((payload?: any) => {
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
        // TODO: VERY TEMPORARY (NEEDS RE-DO IN MAKING SURE TO GET LINK BETWEEN ACTION NAME AND STATE NAME)
        // [actionType]: {
        //   ...state[actionType],
        info: {
          ...state.info,
          isFetching: true,
        },
      }
    }
    actionToReducer[success] = (state: any, payload: any) => {
      return {
        ...state,
        // TODO: ALSO THIS
        // [actionType]: {
        info: {
          isFetching: false,
          error: '',
          data: payload,
        },
      }
    }
    actionToReducer[fail] = (state: any, payload: any) => {
      return {
        ...state,
        // TODO: AND THIS
        // [actionType]: {
        //   ...state[actionType],
        info: {
          ...state.info,
          isFetching: false,
          error: payload,
        },
      }
    }
  })

  const reducer = (state: any = initialState, action: any): State => {
    // Only reduce on our action types
    if (!actionToReducer[action.type]) return state

    // TODO: Handle async (on request, run async and dispatch success/error)
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
      // console.log(action.type)
      return actionToReducer[action.type](state)
    }
  }

  return {
    reducer,
    actions: actionCreators,
  }
}
