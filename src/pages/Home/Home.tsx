import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserInfo, setId } from '../../redux/flows/user'

const Home: React.FC = () => {
  const dispatch = useDispatch()

  return (
    <div>
      <button onClick={() => dispatch(setId(5))}>Press me!</button>
      <button onClick={() => dispatch(fetchUserInfo())}>No, me! :)</button>
    </div>
  )
}

export default Home
