import Flow, { asyncState, AsyncObj } from '../Flow'

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

// TODO: Suggestion: maybe make it key'ed object like Vuex

interface UserInfo {
  id: number
}

type State = {
  id: number
  info: AsyncObj<UserInfo | null>
}

export const { reducer, actions } = Flow('user', {
  initialState: {
    id: 0,
    info: asyncState,
  } as State,
  mutations: {
    setId(state: State, payload: number) {
      return { ...state, id: payload }
    },
  },
  actions: {
    fetchUserInfo: {
      selector: (state: State) => state.info,
      fn: async (state: State) => {
        const res = await fetch(`https://reqres.in/api/users/${state.id}`)
        // const res = await fetch(
        //   `http://slowwly.robertomurray.co.uk/delay/3000/url/https://reqres.in/api/users/${state.id}`
        // )
        if (res.status !== 200) throw Error('Error ' + res.status)
        return await res.json()
      },
    },
  },
})

// export const { reducer, actions } = Flow('user', {
//   options: {
//     id: {
//       initialState: 0,
//       mutations: {
//         setUserId (current: any, payload: any) {
//           return payload
//         }
//       }
//     },
//     info: {
//       initialState: asyncState,
//       actions: {
//         async info(state: any) {
//           const res = await fetch(`https://reqres.in/api/users/${state.id}`)
//           // const res = await fetch(
//           //   `http://slowwly.robertomurray.co.uk/delay/3000/url/https://reqres.in/api/users/${state.id}`
//           // )
//           if (res.status !== 200) throw Error('Error ' + res.status)
//           return await res.json()
//         }
//       }
//   }
// })
