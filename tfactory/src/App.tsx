import Field from './Field'
import './App.css'
import React from 'react'
import { useImmer } from 'use-immer';
import * as Layout from "./layout"
import * as WS from "./wstorage";
import { Header } from "./Header"
import { MessageList } from "./MessageList"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as Mui from "@mui/material";
import * as G from "./game2"

function App() {
  const [wo, updateWorld] = useImmer(WS.world.value)

  React.useEffect(() => {
    let timeoutId = setInterval(() => {
      updateWorld(w => {
        G.progress(w)
        WS.world.write(w)
      })
    }, 250) // TODO: 250
    return () => {
      clearTimeout(timeoutId)
    }
  }, [wo])
  const c = Layout.clientWH()

  const u = c.h / 1000

  const theme = createTheme({
    cssVariables: true,
    spacing: u * 10,
    components: {
      MuiRadio: {
        defaultProps: {
          size: "small",
        },
      },
      MuiStack: {
        defaultProps: {
          sx: {
            margin: 0,
            padding: 0,
          }
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "contained",
        }
      }
    },
    typography: {
      fontSize: u * 16,
      button: {
        fontSize: u * 16,
      },
      body1: { fontSize: u * 16 },
      body2: { fontSize: u * 16 },
    },
  });

  const op = (cmd: string): void => {
    switch (cmd) {
      case "reset":
        updateWorld(w => {
          const e = G.emptyWorld()
          w.buildings = e.buildings
          w.duration = e.duration
          w.powers = e.powers
          w.total = e.total
          w.size = e.size
        })
    }
  }

  return <ThemeProvider theme={theme}>
    <Mui.Stack direction="column"
      style={{
        display: 'flex', flexDirection: "column",
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
      <Mui.Box border={3} style={{ flexGrow: 1 }}>
        <MessageList world={wo} updateWorld={updateWorld} />
      </Mui.Box>
    </Mui.Stack>
  </ThemeProvider>
}

export default App
