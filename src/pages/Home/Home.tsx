import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../../redux/flows/user'
// import { repositories } from '../../redux/user/selectors'
// import { fetchRepositories } from '../../redux/user/actions'
// import RepoList from './components/RepoList'
// import StandardSelectorDisplay from '../../components/StandardSelectorDisplay'

const Home: React.FC = () => {
  const dispatch = useDispatch()

  return (
    <div>
      <button
        onClick={() => dispatch(actions[0](5))}
        // onClick={() => {
        //   dispatch({
        //     type: 'user/setId',
        //     payload: 5,
        //   })
        // }}
      >
        Press me!
      </button>
      <button
        onClick={() => dispatch(actions[1]())}
        // onClick={() => {
        //   dispatch({
        //     type: 'user/getInfo_REQUEST',
        //   })
        // }}
      >
        No, me! :)
      </button>
    </div>
  )
}

export default Home
