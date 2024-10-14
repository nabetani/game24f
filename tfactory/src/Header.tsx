import './App.css'
import * as G from "./game"
import * as U from './util'
import * as Layout from "./layout"
import * as Mui from "@mui/material";
import * as Icon from '@mui/icons-material';
import * as MuiL from "@mui/lab";
import React from 'react'

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
  closer: () => void,
}): JSX.Element {
  return <>
    <Mui.Typography>
      タイツを作るゲームです。ゴールはありません。<br />
      建物は4種類あります。<br />
      <Mui.Divider />
      <Icon.Home /> 自宅 兼 工場<br />
      <Mui.Box sx={{ pl: 4 }}>
        • タイツを製造する<br />
        • 建築も撤去もできない
      </Mui.Box>
      <Mui.Divider />
      <Icon.Factory /> 工場<br />
      <Mui.Box sx={{ pl: 4 }}>
        • タイツを製造する<br />
        • 建築可能レベルは「生産技術」で決まる
      </Mui.Box>
      <Mui.Divider />
      <Icon.Settings /> 生産技研<br />
      <Mui.Box sx={{ pl: 4 }}>
        • 生産技術を上げる<br />
        • 建築可能レベルは「基礎技術」で決まる
      </Mui.Box>
      <Mui.Divider />
      <Icon.Science /> 基礎研<br />
      <Mui.Box sx={{ pl: 4 }}>
        • 基礎技術を上げる<br />
        • 建築可能レベルは「基礎技術」で決まる
      </Mui.Box>
      <Mui.Divider />
      できることは<br />
      <Mui.Box sx={{ pl: 2 }}>
        • 工場や研究所の建築<br />
        • 工場や研究所の強化<br />
        • 工場や研究所の撤去<br />
      </Mui.Box>
      です。

    </Mui.Typography>
  </>
}

function RootMenuUI(p: {
  op: (cmd: string) => void,
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
          <Mui.Tab label="遊び方" value={mtab.usage} />
          <Mui.Tab label="設定" value={mtab.general} />
          <Mui.Tab label="リセット" value={mtab.reset} />
        </MuiL.TabList>
      </Mui.Box>
      <MuiL.TabPanel value={mtab.usage}>
        <UsageUI op={p.op} closer={p.closer} />
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
      <RootMenuUI op={p.op} closer={handleClose} /></Mui.Popover></>
}


function HeaderStatus(p: {
  world: G.World,
  op: (cmd: string) => void,
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
            <Mui.TableCell sx={cellStyle} >
              <MenuButton op={p.op} />
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

export function Header(p: {
  world: G.World,
  op: (cmd: string) => void,
}): JSX.Element {
  return <>
    <HeaderStatus world={p.world} op={p.op} />
  </>
}
