import Flow from '../Flow'

/*

input:

name of flow (e.g. 'user')
initialState
actions: a list (object) of:
  func of [name] = (state, payload) => newState
asyncActions: a list (object) of:
  func of [name] = () => async data (data = what gets put into data)
  (optional) side-effect to allow to alter state somewhere else as well


output:

reducer
action(s), probably only request actions
selectors?


*/

const asyncState = {
  isFetching: false,
  data: null,
  error: '',
}

// const lol = Flow({
//   name: 'user',
//   initialState: {
//     authToken: '',
//     info: asyncState
//   },
//   actions: {
//     setAuthToken(state: any, payload: any) {
//       state.authToken = payload
//     }
//   },
//   asyncActions: {
//     async userInfo(state: any) {
//       const res = await fetch('https://reqres.in/api/users/2')
//       return await res.json()
//     }
//   }
// })

// const Flow2 = (name: string, initialState: {}, actions: {}, asyncActions?: {}) => ({})

// const lol2 = Flow2(
//   'user',
//   {
//     id: 0,
//     info: asyncState
//   },
//   {
//     setId: (state: any, payload: any) => {
//       state.id = payload
//     }
//   },
//   {
//     info: {
//       userInfo: async (state: any) => {
//         const res = await fetch(`https://reqres.in/api/users/${state.id}`)
//         return await res.json()
//       },
//     },
//   }
// )

// export const { reducer } = Flow(
//   'user',
//   {
//     id: {
//       init: 0,
//       mutations: {
//         setUserId: (current, payload) => {
//           return ''
//         },
//       },
//     },
//     info: {
//       init: asyncState,
//       fetcher: async (state: any) => {
//         const res = await fetch(`https://reqres.in/api/users/${state.id}`)
//         return await res.json()
//       },
//     },
//   },
//   {
//     setUserIdAndDoSomething: (state: any, payload: any) => {
//       return state
//     },
//   }
// )

// New proposal, have mutations (synchronous) and actions (asynchronous)

// TODO: Suggestion: maybe make it key'ed object like Vuex

export const { reducer } = Flow(
  'user',
  {
    id: 0,
    info: asyncState,
  },
  {
    setId: (state: any, payload: any) => {
      return { ...state, id: payload }
    },
  },
  {
    getInfo: async (state: any) => {
      const res = await fetch(`https://reqres.in/api/users/${state.id}`)
      return await res.json()
    },
  }
)
