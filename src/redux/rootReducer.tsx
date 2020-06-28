import { combineReducers } from 'redux'
import * as user from './flows/user'

export default combineReducers({ user: user.reducer })
