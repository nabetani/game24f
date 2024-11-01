import './App.css'
import * as G from "./game2"
import * as U from './util'
import * as Layout from "./layout"
import * as Mui from "@mui/material";
import * as Icon from '@mui/icons-material';
import * as MuiL from "@mui/lab";
import React from 'react'
import * as W from "./World"

const mtab = {
  usage: "mtab-usage",
  general: "mtab-general",
  reset: "mtab-reset",
} as const

function GeneralUI(p: {
  op: (cmd: string) => void,
  closer: () => void,
}): JSX.Element {
  return <>
    <Mui.Stack direction={"column"}>
      <Mui.Stack direction={"row"} alignItems={'baseline'}>
        <Mui.Typography>サウンド</Mui.Typography>
        <Mui.Switch></Mui.Switch>
      </Mui.Stack>
    </Mui.Stack >
  </>
}

function ResetUI(p: {
  op: (cmd: string) => void,
  closer: () => void,
}): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  return <>
    <Mui.Stack direction={"column"} gap={3}>
      <Mui.Stack direction={"row"} alignItems={'baseline'} gap={3}>
        <Mui.Typography>最初からやりなおす</Mui.Typography>
        <Mui.Button variant='contained' color='warning' onClick={() => { setVisible(true) }}>実行</Mui.Button>
      </Mui.Stack>
      {visible ? <>
        <Mui.Button variant='contained' color='error' onClick={() => { p.closer(); p.op("reset") }}>本当に実行する！</Mui.Button>
      </> : <></>}
    </Mui.Stack >
  </>
}

function UsageUI(p: {
  op: (cmd: string) => void,
  world: W.World,
  closer: () => void,
}): JSX.Element {
  const T = Mui.Typography
  return <>
    <T>
      タイツを作るゲームです。ゴールはありません。<br />
      建物は5種類あり、特徴は以下の通りです。</T>
    <Mui.Divider />
    <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
      <Icon.Home /> <T>自宅 兼 工場</T></Mui.Stack>
    <Mui.Box sx={{ pl: 4 }}><T>
      • タイツを製造する<br />
      • 建築も撤去もできない
      {G.canBuildMagic(p.world) ? <>
        <br />• 隣接する魔術研の能力を上げる
      </> : <></>}
    </T></Mui.Box>
    <Mui.Divider />

    <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
      <Icon.Factory /><T>工場</T></Mui.Stack>
    <Mui.Box sx={{ pl: 4 }}><T>
      • タイツを製造する<br />
      • 建築可能レベルは「生産技術」で決まる
      {G.canBuildMagic(p.world) ? <>
        <br />• 隣接する魔術研が一個だと能力が上がり、複数だと能力が下がる
      </> : <></>}
    </T>
    </Mui.Box>
    <Mui.Divider />
    <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
      <Icon.Settings /><T>生産技研</T></Mui.Stack>
    <Mui.Box sx={{ pl: 4 }}><T>
      • 生産技術を上げる<br />
      • 建築可能レベルは「基礎技術」で決まる<br />
      • 隣接する工場などの能力を上げることがある
      {G.canBuildMagic(p.world) ? <>
        <br />• 隣接する魔術研が一個だと能力が上がり、複数だと能力が下がる
      </> : <></>}</T>
    </Mui.Box>
    <Mui.Divider />
    <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
      <Icon.Science /><T> 基礎研</T></Mui.Stack>
    <Mui.Box sx={{ pl: 4 }}><T>
      • 基礎技術を上げる<br />
      • 建築可能レベルは「基礎技術」で決まる<br />
      • 隣接する生産技研の能力を上げることがある
      {G.canBuildMagic(p.world) ? <>
        <br />• 隣接する魔術研が一個だと能力が上がり、複数だと能力が下がる
      </> : <></>}</T>
    </Mui.Box>
    <Mui.Divider />
    {G.canBuildMagic(p.world) ? <>
      <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
        <Icon.AutoFixHigh /><T>魔術研</T></Mui.Stack>
      <Mui.Box sx={{ pl: 4 }}><T>
        • 何も生産せず、隣接する施設に影響を与える
        <br />• 強化できない
        <br />• 撤去費用が膨大
      </T>
      </Mui.Box>
    </> : <>
      <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
        <Icon.Help /><T> ???</T></Mui.Stack>
    </>}

    <Mui.Divider />
    <T>できること</T>
    <Mui.Box sx={{ pl: 2 }}><T>
      • 工場や研究所の建築<br />
      • 工場や研究所の強化<br />
      • 工場や研究所の撤去<br />
    </T></Mui.Box>
  </>
}

function RootMenuUI(p: {
  op: (cmd: string) => void,
  world: W.World,
  closer: () => void,
}): JSX.Element {
  const [value, setValue] = React.useState<string>(mtab.usage);
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return <>
    <MuiL.TabContext value={value}>
      <Mui.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <MuiL.TabList onChange={handleChange} aria-label="lab API tabs example" >
          <Mui.Tab label="遊び方とルール" value={mtab.usage} />
          <Mui.Tab label="設定" value={mtab.general} />
          <Mui.Tab label="リセット" value={mtab.reset} />
        </MuiL.TabList>
      </Mui.Box>
      <MuiL.TabPanel value={mtab.usage}>
        <UsageUI world={p.world} op={p.op} closer={p.closer} />
      </MuiL.TabPanel>
      <MuiL.TabPanel value={mtab.general}>
        <GeneralUI op={p.op} closer={p.closer} />
      </MuiL.TabPanel>
      <MuiL.TabPanel value={mtab.reset}>
        <ResetUI op={p.op} closer={p.closer} />
      </MuiL.TabPanel>
    </MuiL.TabContext>
  </>
}

function MenuButton(p: {
  op: (cmd: string) => void,
  world: W.World
}): JSX.Element {
  const [anchor, setAnchor] = React.useState<HTMLElement | null | undefined>(null);
  const open = Boolean(anchor);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };
  const id = "rootmenu"

  return <><Mui.Button variant='contained' onClick={handleClick}>
    <Icon.Menu />
  </Mui.Button>
    <Mui.Popover
      id={id}
      open={open}
      anchorEl={anchor}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}>
      <RootMenuUI op={p.op} world={p.world} closer={handleClose} /></Mui.Popover></>
}

function Digit(p: { v: number }): JSX.Element {
  const s = U.numText(p.v)
  const [_, d, u] = s.match(/^([\d\.]+)(\D+)?$/) ?? []
  if (u == null) {
    return <Mui.Typography key="d">{d}</Mui.Typography>
  }
  const z = [...u].length == 1 ? "100%" : "70%"
  return <>
    <Mui.Typography key="d">{d}<span style={{
      fontSize: z,
      letterSpacing: "-0.1em",
    }}>{u}</span></Mui.Typography>
  </>
}

function HeaderStatus(p: {
  world: W.World,
  op: (cmd: string) => void,
}): JSX.Element {
  const r0 = { name: "保有", v: p.world.powers }
  const r1 = { name: "増加", v: G.incomeW(p.world) }
  const cellStyle = { fontSize: Layout.clientWH().h / 60 }
  const cellWithLevel = (v: number): JSX.Element =>
    <Mui.TableCell sx={cellStyle}>
      <Mui.Stack direction={"row"} alignItems={"baseline"}>
        <Digit v={v} />
        <Mui.Typography fontSize={Layout.clientWH().h / 80}>
          (Lv. {G.buildLevel(v)})
        </Mui.Typography>
      </Mui.Stack>
    </Mui.TableCell>
  return (
    <>
      <Mui.TableContainer component={Mui.Paper}>
        <Mui.Table sx={{}} size="small" >
          <Mui.TableHead>
            <Mui.TableRow>
              <Mui.TableCell sx={cellStyle} >
                <MenuButton op={p.op} world={p.world} />
              </Mui.TableCell>
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
              <Mui.TableCell sx={cellStyle}><Digit v={r0.v.money} /></Mui.TableCell>
              {cellWithLevel(r0.v.pDev)}
              {cellWithLevel(r0.v.bDev)}
            </Mui.TableRow>

            <Mui.TableRow key={r1.name}>
              <Mui.TableCell sx={cellStyle} component="th" scope="row">
                {r1.name}
              </Mui.TableCell>
              <Mui.TableCell sx={cellStyle}><Digit v={r1.v.money} /></Mui.TableCell>
              <Mui.TableCell sx={cellStyle} ><Digit v={r1.v.pDev} /></Mui.TableCell>
              <Mui.TableCell sx={cellStyle} ><Digit v={r1.v.bDev} /></Mui.TableCell>
            </Mui.TableRow>

          </Mui.TableBody>
        </Mui.Table>
      </Mui.TableContainer>
      <Mui.Grid2 container>
        <Mui.Grid2 size={1} />
        <Mui.Grid2 size={3}>
          <Mui.Typography>期間: {`${p.world.duration}`}</Mui.Typography>
        </Mui.Grid2>
        <Mui.Grid2 size={5}>
          <Mui.Typography>総タイツ: {U.numText(p.world.total)}</Mui.Typography>
        </Mui.Grid2>
      </Mui.Grid2>
    </>
  );
}

export function Header(p: {
  world: W.World,
  op: (cmd: string) => void,
}): JSX.Element {
  return <>
    <HeaderStatus world={p.world} op={p.op} />
  </>
}
