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

  const actionCreators: ActionCreator[] = []
  const actionToReducer: {
    [key: string]: (state: any, payload?: any) => State
  } = {}

  const insertAction = (key: string) => {
    actionCreators.push((payload?: any) => {
      const action = { type: `${name}/${key}` }
      return payload ? { ...action, payload } : action
    })
  }
  const mapReducer = (
    key: string,
    func: (state: State, payload?: any) => any
  ) => {
    actionToReducer[key] = func
  }

  Object.entries(mutations).forEach(([key, value]) => {
    insertAction(key)
    mapReducer(key, value)
  })

  Object.entries(actions).forEach(([key, value]) => {
    insertAction(key)
  })

  const reducer = (state: any = initialState, action: any): State => {
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
