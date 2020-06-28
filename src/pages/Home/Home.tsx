import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { repositories } from '../../redux/user/selectors'
// import { fetchRepositories } from '../../redux/user/actions'
// import RepoList from './components/RepoList'
// import StandardSelectorDisplay from '../../components/StandardSelectorDisplay'

const Home: React.FC = () => {
  const dispatch = useDispatch()

  return (
    <div>
      <button
        onClick={() => {
          dispatch({
            type: 'user/setId',
            payload: 5,
          })
        }}
      >
        Press me!
      </button>
      <button
        onClick={() => {
          dispatch({
            type: 'user/getInfo_REQUEST',
          })
        }}
      >
        No, me! :)
      </button>
    </div>
  )
}

export default Home
