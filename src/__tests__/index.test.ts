import Flow, { asyncState, AsyncObj, Action } from '../index'

/*

Initial user 'flow' setup

*/

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

let initialState: State = {
  id: 0,
  info: asyncState,
}

const { reducer, actions } = Flow('user', {
  initialState,
  mutations: {
    setId(state: State, id: number) {
      state.id = id
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

const {
  setId,
  fetchUserInfo,
}: {
  setId: (id: number) => Action<State>
  fetchUserInfo: () => Action<State>
} = actions as any

/*

Actual tests

*/

describe('reducer', () => {
  afterEach(() => {
    initialState = {
      id: 0,
      info: asyncState,
    }
  })

  it('returns correct action creators', () => {
    console.log(actions)
    expect(setId(5)).toEqual({
      type: 'user/setId',
      payload: 5,
    })

    expect(fetchUserInfo().type).toBe('user/fetchUserInfo_REQUEST')
    expect(fetchUserInfo().payload).toBeFalsy()
    // TODO: Possibly check on correct function or mock it.
    expect(fetchUserInfo().meta).toBeTruthy()
  })

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  it('should handle user/setId', () => {
    expect(
      reducer(undefined, {
        type: 'user/setId',
        payload: 5,
      })
    ).toEqual({
      id: 5,
      info: {
        isFetching: false,
        data: null,
        error: '',
      },
    })

    expect(
      reducer(
        {
          id: 6,
          info: {
            isFetching: false,
            data: null,
            error: '',
          },
        },
        {
          type: 'user/setId',
          payload: 1337,
        }
      )
    ).toEqual({
      id: 1337,
      info: {
        isFetching: false,
        data: null,
        error: '',
      },
    })
  })

  it('should handle user/fetchUserInfo_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: 'user/fetchUserInfo_REQUEST',
      })
    ).toEqual({
      id: 0,
      info: {
        isFetching: true,
        data: null,
        error: '',
      },
    })
  })

  it('should handle user/fetchUserInfo_SUCCESS', () => {
    const data = {
      id: 5,
      full_name: 'John Doe',
    }
    expect(
      reducer(initialState, {
        type: 'user/fetchUserInfo_SUCCESS',
        payload: data,
      })
    ).toEqual({
      id: 0,
      info: {
        isFetching: false,
        data,
        error: '',
      },
    })
  })

  it('should handle user/fetchUserInfo_FAILED', () => {
    expect(
      reducer(initialState, {
        type: 'user/fetchUserInfo_FAILED',
        payload: 'Error 404',
      })
    ).toEqual({
      id: 0,
      info: {
        isFetching: false,
        data: null,
        error: 'Error 404',
      },
    })
  })
})
