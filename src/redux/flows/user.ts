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

const lol = Flow({
  name: 'user',
  initialState: {
    authToken: '',
    info: null
  },
  actions: {
    setAuthToken(state: any, payload: any) {
      state.authToken = payload
    }
  },
  asyncActions: {
    async userInfo() {
      const res = await fetch('https://reqres.in/api/users/2')
      return await res.json()
    }
  }


})
