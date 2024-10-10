import Field from './Field'
import './App.css'
import * as G from "./game"
import React from 'react'
import { useImmer, Updater } from 'use-immer';
import * as Layout from "./layout"
import { hexToRgb } from '@mui/material';
import { height } from '@mui/system';

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
    <div style={{
      borderStyle: "solid",
    }}>
      <Field world={wo} updateWorld={updateWorld} />
      <div>
        week: {wo.duration}<br />
        stock: {JSON.stringify(wo.powers)}<br />
        income: {JSON.stringify(G.incomeW(wo))} / week
      </div>
    </div>
  )
}

export default App
