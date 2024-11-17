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

function SplashDialog(p: { onClose: () => void }): JSX.Element {
  const theme = Mui.useTheme()
  const w = theme.typography.fontSize * 25
  const [open, setOpen] = React.useState<boolean>(true)
  const onClose = () => {
    setOpen(false);
    p.onClose()
  }
  return <Mui.Dialog open={open} onClose={onClose}>
    <Mui.DialogContent>
      <Mui.Card>
        <Mui.CardMedia
          component="img"
          sx={{ width: w, }}
          image="/title.webp"
          alt="タイツ工場"
        />
        <Mui.CardContent>
          <Mui.Box
            sx={{ position: "relative" }}>
            <Mui.Typography variant='body1'>
              閉じるとスタートです。<br />
              遊び方などについては<br />
              左上のハンバーガボタンから確認できます。
            </Mui.Typography>
            <Mui.IconButton
              sx={{
                position: 'absolute',
                right: theme.typography.fontSize * -1,
                top: theme.typography.fontSize * -1,
              }}
              onClick={onClose}
            ><Icon.Close /></Mui.IconButton>
          </Mui.Box>
        </Mui.CardContent>
      </Mui.Card>

    </Mui.DialogContent>
  </Mui.Dialog>
}


function App() {
  const [wo, updateWorld] = useImmer(WS.world.value)
  const [started, setStarted] = useState(false)


  React.useEffect(() => {
    if (started) {
      let timeoutId = setInterval(() => {
        updateWorld(w => {
          G.progress(w, sound.play)
          WS.world.write(w)
        })
      }, 300 * 0.8 ** wo.maxMagic)
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [started, wo.maxMagic])
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
    <SplashDialog onClose={() => {
      sound.play("bgm");
      setStarted(true);
    }} />
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
