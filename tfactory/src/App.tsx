import Field from './Field'
import './App.css'
import * as G from "./game"
import React from 'react'
import { useImmer } from 'use-immer';
function App() {

  const [wo, updateWorld] = useImmer(G.restoreWorld({}))

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
      <Field world={wo} />
    </>
  )
}

export default App
