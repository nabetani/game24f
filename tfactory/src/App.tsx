import Field from './Field'
import './App.css'
import * as G from "./game"
import React from 'react'

function App() {
  const [wo, setWo] = React.useState(G.restoreWorld({}))

  React.useEffect(() => {
    let timeoutId = setInterval(() => {
      setWo(wo.progress())
    }, 1000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [wo])

  console.dir(JSON.stringify(wo.fieldObjs))
  return (
    <>
      <div>
        {JSON.stringify(wo.powers)}
      </div>
      <Field world={wo} />
    </>
  )
}

export default App
