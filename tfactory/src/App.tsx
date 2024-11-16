import * as Icon from '@mui/icons-material';
import Field from './Field'
import './App.css'
import React, { useState } from 'react'
import { useImmer } from 'use-immer';
import * as Layout from "./layout"
import * as WS from "./wstorage";
import { Header } from "./Header"
import { MessageList } from "./MessageList"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as Mui from "@mui/material";
import * as G from "./game2"
import * as W from "./World"
import * as sound from "./sound"

function Tutorial({ closer }: { closer: () => void }): JSX.Element {

  const lines = [
    "グレーのマスをクリックすると各種建物を建築できます。",
    "建物をクリックすると、情報確認 などができます。",
    "各種建物の特徴などを知りたい場合は、左上のハンバーガーボタンを押してください。",
    "設定変更や ゲームのリセットも 左上のハンバーガーボタンから行うことができます。",
  ]

  return <>
    <Mui.DialogTitle>操作方法</Mui.DialogTitle>
    <Mui.IconButton
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
      }}
      onClick={() => closer()}
    ><Icon.Close /></Mui.IconButton>
    <Mui.DialogContent dividers>
      {lines.map((e, ix) => {
        return <Mui.Typography key={ix} gutterBottom>• {e}</Mui.Typography>
      })}
    </Mui.DialogContent>
  </>
}


function App() {
  const [wo, updateWorld] = useImmer(WS.world.value)
  const [showStartUI, setShowStartUI] = useState(W.isInitialWorld(WS.world.value))

  React.useEffect(() => {
    let timeoutId = setInterval(() => {
      updateWorld(w => {
        G.progress(w, sound.play)
        WS.world.write(w)
      })
    }, 300 * 0.8 ** wo.maxMagic)
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
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
          disableTouchRipple: true,
        }
      },
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
      body1: { fontSize: u * 18 },
      body2: { fontSize: u * 15 },
      caption: { fontSize: u * 22 },
    },
  });

  const op = (cmd: string): void => {
    switch (cmd) {
      case "complete-reset":
        updateWorld((w: W.World) => {
          const e = G.emptyWorld()
          w.buildings = e.buildings
          w.duration = e.duration
          w.powers = e.powers
          w.total = e.total
          w.size = e.size
          w.maxMagic = e.maxMagic
          w.messages = []
        })
        return
      case "reset":
        updateWorld((w: W.World) => {
          const e = G.emptyWorld()
          w.buildings = e.buildings
          w.duration = e.duration
          w.powers = e.powers
          w.total = e.total
          w.size = e.size
          // w.maxMagic
          w.messages = []
        })
        return
      case "migrate":
        updateWorld((w: W.World) => {
          const e = G.emptyWorld()
          w.buildings = e.buildings
          w.duration = e.duration
          w.powers = e.powers
          w.total = e.total
          w.size = e.size
          w.maxMagic = Math.min(G.trueMaxMagicLevel, w.maxMagic + 1)
          w.messages = []
        })
        return
    }
  }

  return <ThemeProvider theme={theme}>
    <Mui.Dialog onClose={() => { setShowStartUI(false) }} open={showStartUI}>
      <Tutorial closer={() => setShowStartUI(false)} />
    </Mui.Dialog>
    <Mui.Stack direction="column"
      style={{
        display: 'flex', flexDirection: "column",
        margin: "auto",
        width: c.w,
        minWidth: c.w,
        maxWidth: c.w,
        height: c.h,
        minHeight: c.h,
        maxHeight: c.h,
      }}>
      <Header world={wo} op={op} />
      <Field world={wo} updateWorld={updateWorld} />
      <Mui.Box style={{ flexGrow: 1 }}>
        <MessageList world={wo} updateWorld={updateWorld} />
      </Mui.Box>
    </Mui.Stack>
  </ThemeProvider>
}

export default App
