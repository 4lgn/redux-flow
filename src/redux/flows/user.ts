import Flow, { asyncState, AsyncObj } from '../Flow'
import { Action } from 'redux'

interface UserInfo {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string
}

type State = {
  id: number
  info: AsyncObj<UserInfo | null>
}

const { reducer, actions } = Flow('user', {
  initialState: {
    id: 0,
    info: asyncState,
  } as State,
  mutations: {
    setId(state: State, payload: number) {
      state.id = payload
    },
  },
  actions: {
    fetchUserInfo: {
      selector: 'info',
      fn: async (state: State) => {
        const res = await fetch(`https://reqres.in/api/users/${state.id}`)
        if (res.status !== 200) throw Error('Error ' + res.status)
        return (await res.json()).data
      },
    },
  },
})

export const {
  setId,
  fetchUserInfo,
}: {
  setId: (payload: number) => Action
  fetchUserInfo: () => Action
} = actions as any

export { reducer }
