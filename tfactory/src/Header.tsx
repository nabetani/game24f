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
  migrate: "mtab-migrate",

  operation: "mtab-goal",
  story: "mtab-story",
  buildings: "mtab-buildings",
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

function ResetUIUnit({ buttonText, onClick }: { buttonText: string, onClick: () => void }): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  return <>
    <Mui.Stack direction={"column"} gap={3}>
      <Mui.Stack direction={"row"} alignItems={'baseline'} gap={3}>
        <Mui.Typography>{buttonText}</Mui.Typography>
        <Mui.Button variant='contained' color='warning' onClick={() => { setVisible(true) }}>実行</Mui.Button>
      </Mui.Stack>
      {visible ? <>
        <Mui.Button variant='contained' color='error' onClick={onClick}>本当に実行する！</Mui.Button>
      </> : <></>}
    </Mui.Stack >
  </>
}

function ResetUI(p: {
  world: W.World,
  op: (cmd: string) => void,
  closer: () => void,
}): JSX.Element {
  if (p.world.maxMagic == 1) {
    return <ResetUIUnit buttonText="最初からやり直す" onClick={() => { p.closer(); p.op("complete-reset") }} />
  } else {
    return <Mui.Stack direction="column" gap={2}>
      <ResetUIUnit key="0" buttonText="完全に最初からやり直す" onClick={() => { p.closer(); p.op("complete-reset") }} />
      <Mui.Divider />
      <ResetUIUnit key="1" buttonText="最高魔術研レベルなどはこのままでやり直す" onClick={() => { p.closer(); p.op("reset") }} />
    </Mui.Stack>
  }
}

function MigrateUI(p: {
  world: W.World,
  op: (cmd: string) => void,
  closer: () => void,
}): JSX.Element {
  const [visible, setVisible] = React.useState<boolean>(false);
  return <>
    <Mui.Stack direction={"column"} gap={3}>
      {G.trueMaxMagicLevel <= p.world.maxMagic ? <>
        <Mui.Typography>
          これ以上転生できません...
        </Mui.Typography></>
        : <><Mui.Stack direction={"row"} alignItems={'baseline'} gap={3}>
          <Mui.Typography>
            時間の流れがちょっと速くて、<br />魔術研の最高レベルが今より高い世界に転生する<br />
          </Mui.Typography>
          <Mui.Button variant='contained' color='warning' onClick={() => { setVisible(true) }}>実行</Mui.Button>
        </Mui.Stack>
          {visible ? <>
            <Mui.Button variant='contained' color='error' onClick={() => { p.closer(); p.op("migrate") }}>本当に転生する！</Mui.Button>
          </> : <></>}</>}
    </Mui.Stack >
  </>
}

function UsageUI(p: {
  op: (cmd: string) => void,
  world: W.World,
  closer: () => void,
}): JSX.Element {
  const T = Mui.Typography
  const [value, setValue] = React.useState<string>(mtab.story);
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  function TY({ children, sx }: { sx?: Mui.SxProps<Mui.Theme>, children: JSX.Element | (string | JSX.Element)[] | string }): JSX.Element {
    return <T sx={{ ...sx, pb: 0.5 }}>{children}</T>
  }
  const magic = G.canBuildMagic(p.world)


  return <Mui.Box sx={{ border: 1, m: 1, borderRadius: 5, borderColor: "#eee", backgroundColor: "#e8e8e8" }}>
    <MuiL.TabContext value={value}>
      <Mui.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <MuiL.TabList onChange={handleChange}>
          <Mui.Tab label="ストーリー" value={mtab.story} />
          <Mui.Tab label="操作" value={mtab.operation} />
          <Mui.Tab label="建物" value={mtab.buildings} />
        </MuiL.TabList>
      </Mui.Box>
      <MuiL.TabPanel value={mtab.story}>
        <TY>自宅兼工場でタイツを作るあなたのもとに、銀色の顔をしたスーツ姿の人物（？）が現れた。</TY>
        <TY><br />銀色「あなたのタイツを売ってください」</TY>
        <TY>あなた「うちのタイツはちょっとお高くなってますけど、大丈夫でしょうか……」</TY>
        <TY>銀色「値段は、一足 xx円 でどうでしょう。」</TY>
        <TY>あなた（……そんなに高く？）</TY>
        <TY>銀色「納期はでき次第で良きです。個数は全部です。」</TY>
        <TY>あなた「全部？」</TY>
        <TY>銀色「御社のタイツを無制限に全部買うので、たくさん作ってください。」</TY>
        <TY>あなた「無制限……」</TY>
        <TY>銀色「必要な材料やエネルギーは格安で無制限に調達できます。」</TY>
        <TY>あなた「無制限に調達……」</TY>
        <TY>銀色「おわかりいただけないと思いますが、実は御社にとっても重大な案件で、宇宙の存亡が……」</TY>
        <TY>あなた「え、宇宙のそん……え？」</TY>
        <TY>銀色「御社にとって良いビジネス思います」</TY>
        <TY>あなた「え、あ、はい。やりましょう。」</TY>
        <T><br />かくして、タイツの増産が始まった。</T>

      </MuiL.TabPanel>
      <MuiL.TabPanel value={mtab.operation}>
        <TY>グレーのマスをクリックすると各種建物を建築できます。</TY>
        <TY>建物をクリックすると、情報確認 などができます。</TY>
        <TY>各種建物の特徴などを知りたい場合は、左上のハンバーガーボタンを押してください。</TY>
        <TY>設定変更や ゲームのリセットも 左上のハンバーガーボタンから行うことができます。</TY>
      </MuiL.TabPanel>
      <MuiL.TabPanel value={mtab.buildings}>


        <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
          <Icon.Home /> <T>自宅 兼 工場</T></Mui.Stack>
        <Mui.Box sx={{ pl: 4 }}><T>
          • タイツを製造する<br />
          • 建築も撤去もできない
          {magic ? <>
            <br />• 隣接する魔術研の能力を上げる
          </> : <></>}
        </T></Mui.Box>
        <Mui.Divider />

        <Mui.Stack gap={1} direction="row" display="flex" alignItems="center">
          <Icon.Factory /><T>工場</T></Mui.Stack>
        <Mui.Box sx={{ pl: 4 }}><T>
          • タイツを製造する<br />
          • 建築可能レベルは「生産技術」で決まる
          {magic ? <>
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
          {magic ? <>
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
          {magic ? <>
            <br />• 隣接する魔術研が一個だと能力が上がり、複数だと能力が下がる
          </> : <></>}</T>
        </Mui.Box>
        <Mui.Divider />
        {magic ? <>
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
      </MuiL.TabPanel>
    </MuiL.TabContext>
  </Mui.Box>
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
          <Mui.Tab label="遊び方など" value={mtab.usage} />
          <Mui.Tab label="設定" value={mtab.general} />
          <Mui.Tab label="リセット" value={mtab.reset} />
          {G.canMigrate(p.world) ? <Mui.Tab label="転生" value={mtab.migrate} /> : <></>}
        </MuiL.TabList>
      </Mui.Box>
      <MuiL.TabPanel value={mtab.usage} sx={{ p: 0 }}>
        <UsageUI world={p.world} op={p.op} closer={p.closer} />
      </MuiL.TabPanel>
      <MuiL.TabPanel value={mtab.general}>
        <GeneralUI op={p.op} closer={p.closer} />
      </MuiL.TabPanel>
      <MuiL.TabPanel value={mtab.reset}>
        <ResetUI world={p.world} op={p.op} closer={p.closer} />
      </MuiL.TabPanel>
      {G.canMigrate(p.world) ?
        <MuiL.TabPanel value={mtab.migrate}>
          <MigrateUI world={p.world} op={p.op} closer={p.closer} />
        </MuiL.TabPanel> : <></>}
    </MuiL.TabContext>
  </>
}

function IconMenu(): JSX.Element {
  const w = 22
  const h = w
  const b0 = [
    `M 100,30`,
    `A 30,30 0 0 0 70,0`,
    `L 30,0`,
    `A 30,30 90 0 0 0,30`,
  ].join(" ")
  const b1 = [
    `M 0,80`,
    `A 20,20 180 0 0 20,100`,
    `L 80,100`,
    `A 20,20 270 0 0 100,80`,
  ].join(" ")
  function P({ y, h, col }: { y: number, h: number, col: string }): JSX.Element {
    return <g fill={col}>
      <rect x={0} y={y} width={100} height={h} />
    </g>
  }
  return <svg version="1.1"
    viewBox="-10 -20 120 140"
    width={w} height={h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="#CD9F64"><path d={b0} /></g>
    <g fill="#E2B883"><path d={b1} /></g>
    <P y={32} h={10} col="#A5D800" />
    <P y={44} h={10} col="red" />
    <P y={56} h={5} col="yellow" />
    <P y={63} h={15} col="#AA5600" />
  </svg>
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
    <IconMenu />
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
    return <Mui.Typography component="span" key="d">{d}</Mui.Typography>
  }
  const z = [...u].length == 1 ? "100%" : "70%"
  return <>
    <Mui.Typography component="span" key="d">{d}<span style={{
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
  const cellWithLevel = (v: number): JSX.Element =>
    <Mui.Stack component="span" direction={"row"} alignItems={"baseline"}>
      <Digit v={v} />
      <Mui.Typography component="span" fontSize={Layout.clientWH().h / 80}>
        &nbsp;(Lv. {G.buildLevel(v)})
      </Mui.Typography>
    </Mui.Stack>
  function Cell({ children }: { children: JSX.Element | JSX.Element[] | string }): JSX.Element {
    return <Mui.Grid2 sx={{ p: 0.3, display: 'flex', alignItems: 'flex-end', justifyContent: "center" }} size={10 / 3}><Mui.Typography>{children}</Mui.Typography></Mui.Grid2>
  }
  function Head({ children }: { children: JSX.Element | JSX.Element[] | string }): JSX.Element {
    return <Mui.Grid2 sx={{ p: 0.3 }} size={1.8}><Mui.Typography>{children}</Mui.Typography></Mui.Grid2>
  }
  return (
    <>
      <Mui.Grid2 container>
        <Mui.Grid2 sx={{ p: 0.3 }} size={1.8}>
          <MenuButton op={p.op} world={p.world} />
        </Mui.Grid2>
        <Cell>お金</Cell>
        <Cell>生産技術</Cell>
        <Cell>基礎技術</Cell>
        {/*--------------*/}
        <Head>{r0.name}</Head>
        <Cell><Digit v={r0.v.money} /></Cell>
        <Cell>{cellWithLevel(r0.v.pDev)}</Cell>
        <Cell>{cellWithLevel(r0.v.bDev)}</Cell>
        {/*--------------*/}
        <Head>{r1.name}</Head>
        <Cell><Digit v={r1.v.money} /></Cell>
        <Cell ><Digit v={r1.v.pDev} /></Cell>
        <Cell ><Digit v={r1.v.bDev} /></Cell>
      </Mui.Grid2>
      <Mui.Divider />
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
