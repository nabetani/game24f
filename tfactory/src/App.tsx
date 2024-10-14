import Field from './Field'
import './App.css'
import * as G from "./game"
import React from 'react'
import { useImmer } from 'use-immer';
import * as Layout from "./layout"
import * as WS from "./wstorage";
import { Header } from "./Header"

function App() {
  const [wo, updateWorld] = useImmer(WS.world.value)

  React.useEffect(() => {
    let timeoutId = setInterval(() => {
      updateWorld(w => {
        G.progress(w)
        WS.world.write(w)
      })
    }, 50) // TODO: 500
    return () => {
      clearTimeout(timeoutId)
    }
  }, [wo])
  const c = Layout.clientWH()
  const op = (cmd: string): void => {
    switch (cmd) {
      case "reset":
        updateWorld(w => {
          const e = G.emptyWorld()
          w.buildings = e.buildings
          w.duration = e.duration
          w.powers = e.powers
          w.size = e.size
        })
    }
  }

  return (
    <div style={{}}>
      <div style={{
        margin: "auto",
        borderStyle: "solid",
        width: c.w,
        minWidth: c.w,
        maxWidth: c.w,
        height: c.h,
        minHeight: c.h,
        maxHeight: c.h,
      }}>
        <Header world={wo} op={op} />
        <Field world={wo} updateWorld={updateWorld} />
      </div >
    </div >
  )
}

export default App
