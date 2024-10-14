import Field from './Field'
import './App.css'
import * as G from "./game"
import * as U from './util'
import React from 'react'
import { useImmer, Updater } from 'use-immer';
import * as Layout from "./layout"
import * as Mui from "@mui/material";
import * as WS from "./wstorage";

import { hexToRgb } from '@mui/material';
import { fontSize, height } from '@mui/system';

function HeaderStatus(p: {
  world: G.World,
}): JSX.Element {
  const r0 = { name: "保有", v: p.world.powers }
  const r1 = { name: "増加", v: G.incomeW(p.world) }
  const cellStyle = { fontSize: Layout.clientWH().h / 60 }
  const cellWithLevel = (v: number): JSX.Element =>
    <Mui.TableCell sx={cellStyle}>
      <Mui.Stack direction={"row"} alignItems={"baseline"}>
        {U.numText(v)}
        <Mui.Typography fontSize={Layout.clientWH().h / 80}>
          (Lv. {G.buildLevel(v)})
        </Mui.Typography>
      </Mui.Stack>
    </Mui.TableCell>
  return (
    <Mui.TableContainer component={Mui.Paper}>
      <Mui.Table sx={{}} size="small" >
        <Mui.TableHead>
          <Mui.TableRow>
            <Mui.TableCell sx={cellStyle} ></Mui.TableCell>
            <Mui.TableCell sx={cellStyle} >タイツ</Mui.TableCell>
            <Mui.TableCell sx={cellStyle} >生産技術</Mui.TableCell>
            <Mui.TableCell sx={cellStyle} >基礎技術</Mui.TableCell>
          </Mui.TableRow>
        </Mui.TableHead>
        <Mui.TableBody>
          <Mui.TableRow key={r0.name}>
            <Mui.TableCell sx={cellStyle} component="th" scope="row">
              {r0.name}
            </Mui.TableCell>
            <Mui.TableCell sx={cellStyle}>{U.numText(r0.v.money)}</Mui.TableCell>
            {cellWithLevel(r0.v.pDev)}
            {cellWithLevel(r0.v.bDev)}
          </Mui.TableRow>

          <Mui.TableRow key={r1.name}>
            <Mui.TableCell sx={cellStyle} component="th" scope="row">
              {r1.name}
            </Mui.TableCell>
            <Mui.TableCell sx={cellStyle}>{U.numText(r1.v.money)}</Mui.TableCell>
            <Mui.TableCell sx={cellStyle} >{U.numText(r1.v.pDev)}</Mui.TableCell>
            <Mui.TableCell sx={cellStyle} >{U.numText(r1.v.bDev)}</Mui.TableCell>
          </Mui.TableRow>

        </Mui.TableBody>
      </Mui.Table>
    </Mui.TableContainer>
  );
}

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

  return (
    <div style={{
      borderStyle: "solid",
    }}>
      <HeaderStatus world={wo} />
      <Field world={wo} updateWorld={updateWorld} />
    </div >
  )
}

export default App
