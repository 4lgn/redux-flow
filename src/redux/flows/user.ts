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

// TODO: Suggestion: maybe make it key'ed object like Vuex

export const { reducer, actions } = Flow('user', {
  initialState: {
    id: 0,
    info: asyncState,
  },
  mutations: {
    setId(state: any, payload: any) {
      return { ...state, id: payload }
    },
    // incrementId(state: any) {
    //   return { ...state, id: state.id + 1 }
    // },
  },
  actions: {
    async info(state: any) {
      const res = await fetch(`https://reqres.in/api/users/${state.id}`)
      // const res = await fetch(
      //   `http://slowwly.robertomurray.co.uk/delay/3000/url/https://reqres.in/api/users/${state.id}`
      // )
      if (res.status !== 200) throw Error('Error ' + res.status)
      return await res.json()
    },
  },
})
