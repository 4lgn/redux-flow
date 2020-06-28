import { Store, Action as ReduxAction } from 'redux'

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

export default function <State>(
  store: Store<{}, ReduxAction<any>>,
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

  const insertAction = (actionType: string) => {
    actionCreators.push((payload?: any) => {
      const action = { type: actionType }
      return payload ? { ...action, payload } : action
    })
  }

  Object.entries(mutations).forEach(([key, value]) => {
    const actionType = suffix(key)
    insertAction(actionType)
    actionToReducer[actionType] = value
  })

  Object.entries(actions).forEach(([key, value]) => {
    const actionType = suffix(key)
    insertAction(actionType)

    const req = `${actionType}_REQUEST`
    const success = `${actionType}_SUCCESS`
    const fail = `${actionType}_FAILED`

    actionToReducer[req] = (state: any, payload?: any) => {
      return {
        ...state,
        [actionType]: {
          ...state[actionType],
          isFetching: true,
        },
      }
    }
    actionToReducer[success] = (state: any, payload: any) => {
      return {
        ...state,
        [actionType]: {
          isFetching: false,
          error: '',
          data: payload,
        },
      }
    }
    actionToReducer[fail] = (state: any, payload: any) => {
      return {
        ...state,
        [actionType]: {
          ...state[actionType],
          isFetching: false,
          error: payload,
        },
      }
    }
  })

  const reducer = (state: any = initialState, action: any): State => {
    // TODO: Handle async (on request, run async and dispatch success/error)
    // const regex = /^(.*)\_(REQUEST|SUCCESS|FAILED)$/gm
    const regex = /^\w*\/(\w*)\_(REQUEST|SUCCESS|FAILED)$/gm
    const str = action.type
    let matches: string[] = []
    let m
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) regex.lastIndex++
      m.forEach((match, groupIndex) => (matches[groupIndex] = match))
    }

    if (matches.length > 0 && matches[2] === 'REQUEST') {
      // find async to run
      const asyncFunc = actions[matches[1]]

      // run with state (is in reducer params, and optionally action payload (if exists))
      let promise = action.payload
        ? asyncFunc(state, action.payload)
        : asyncFunc(state)

      // when async is done and successful, dispatch success with data as payload
      // if failed, dispatch failed with error as payload (maybe check if error is empty or null, and generically type 'Error!' as payload)
      const dispatch = (type: string, payload: any) =>
        store.dispatch({ type: `${name}/${matches[1]}_${type}`, payload })

      promise
        .then(res => dispatch('SUCCESS', res))
        .catch(err => dispatch('FAILED', err))
    }

    // TODO: Can maybe do this more concise
    if (action.payload) {
      return actionToReducer[action.type](state, action.payload)
    } else {
      return actionToReducer[action.type](state)
    }
  }

  return {
    reducer,
    actions: actionCreators,
  }
}
