import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { repositories } from '../../redux/user/selectors'
// import { fetchRepositories } from '../../redux/user/actions'
// import RepoList from './components/RepoList'
// import StandardSelectorDisplay from '../../components/StandardSelectorDisplay'

const Home: React.FC = () => {
  const dispatch = useDispatch()
  // const repos = useSelector(repositories)

  return (
    <div>
      {/* <button onClick={() => dispatch(fetchRepositories('#bspwm'))}>
        Hey, click me!
      </button> */}

      <div>
        {/* <StandardSelectorDisplay
          selector={repos}
          // TODO: Make it possible to get type annotations on the data parameter being the same as the data object in repos
          successRender={data => <RepoList data={data} />}
        /> */}
      </div>
    </div>
  )
}

export default Home
