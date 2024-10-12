import Field from './Field'
import './App.css'
import * as G from "./game"
import * as U from './util'
import React from 'react'
import { useImmer, Updater } from 'use-immer';
import * as Layout from "./layout"
import * as Mui from "@mui/material";

import { hexToRgb } from '@mui/material';
import { fontSize, height } from '@mui/system';

function HeaderStatus(p: {
  world: G.World,
}): JSX.Element {
  const rows: { name: string, v: G.Powers }[] = [
    { name: "ストック", v: p.world.powers },
    { name: "フロー", v: G.incomeW(p.world) },
  ];
  const cellStyle = { fontSize: Layout.clientWH().h / 60 }
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
          {rows.map((row) => (
            <Mui.TableRow
              key={row.name}
            >
              <Mui.TableCell sx={cellStyle} component="th" scope="row">
                {row.name}
              </Mui.TableCell>
              <Mui.TableCell sx={cellStyle}>{U.numText(row.v.money)}</Mui.TableCell>
              <Mui.TableCell sx={cellStyle} >{U.numText(row.v.pDev)}</Mui.TableCell>
              <Mui.TableCell sx={cellStyle} >{U.numText(row.v.bDev)}</Mui.TableCell>
            </Mui.TableRow>
          ))}
        </Mui.TableBody>
      </Mui.Table>
    </Mui.TableContainer>
  );
}

function App() {
  const [wo, updateWorld] = useImmer(G.restoreWorld({}))

  React.useEffect(() => {
    let timeoutId = setInterval(() => {
      updateWorld(w => { G.progress(w) })
    }, 500)
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
