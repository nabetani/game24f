import Field from './Field'
import './App.css'
import * as G from "./game"
import React from 'react'
import { useImmer, Updater } from 'use-immer';
function App() {

  const [wo, updateWorld] = useImmer(G.restoreWorld({}))

  type x = { u: Updater<G.World> }
  React.useEffect(() => {
    let timeoutId = setInterval(() => {
      updateWorld(w => { G.progress(w) })
    }, 1000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [wo])

  return (
    <>
      <div>
        {JSON.stringify(wo.powers)} / week: {wo.duration}
      </div>
      <Field world={wo} updateWorld={updateWorld} />
    </>
  )
}

export default App
