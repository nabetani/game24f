import * as Mui from "@mui/material";
import * as MuiL from "@mui/lab";
import React, { useEffect } from "react";
import * as U from './util'
import * as G from "./game2"
import * as World from './World';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Updater } from 'use-immer';
import * as Layout from "./layout"
import * as Icon from '@mui/icons-material';
import * as W from "./World"


type BuildAreaContextV = {
  buildArea?: W.Area,
  setBuildArea?: React.Dispatch<React.SetStateAction<W.Area | undefined>>,
}
const BuildAreaContext = React.createContext<BuildAreaContextV>({})

function DestroyUI(p: {
  world: W.World,
  updateWorld: Updater<W.World>,
  cell: W.Cell,
  closer: () => void
}): JSX.Element {
  const cost = G.destroyCost(p.world, p.cell)
  return <>
    <Mui.Box>
      <Mui.FormControl size="small">
        <Mui.Stack>
          {cost == null ? <></> :
            <Mui.Typography>
              コスト: {U.numText(cost)}
            </Mui.Typography>}
          <Mui.Button variant="contained" color="warning"
            disabled={cost == null || p.world.powers.money < cost}
            onClick={() => {
              p.updateWorld((w: W.World) => {
                G.destroy(w, p.cell)
              })
              p.closer()
            }}
          ><Icon.DeleteForever />
            撤去</Mui.Button>
        </Mui.Stack>
      </Mui.FormControl>
    </Mui.Box>
  </>
}

function ImproveUI(p: {
  world: W.World,
  updateWorld: Updater<W.World>,
  cell: W.Cell,
  closer: () => void
}): JSX.Element {
  const cost = G.improveCost(p.world, p.cell)
  return <>
    <Mui.Box>
      <Mui.FormControl size="small">
        <Mui.Stack>
          {cost == null
            ? <></>
            : <Mui.Typography>
              コスト: {U.numText(cost)}
            </Mui.Typography>}
          <Mui.Button variant="contained"
            disabled={cost == null || p.world.powers.money < cost}
            onClick={() => {
              p.updateWorld((w: W.World) => {
                G.improve(w, p.cell)
              })
              p.closer()
            }}
          >強化</Mui.Button>
        </Mui.Stack>
      </Mui.FormControl>
    </Mui.Box>
  </>
}

function AddBuildingUI(p: {
  world: W.World,
  updateWorld: Updater<W.World>,
  cell: W.Cell,
  closer: () => void
}): JSX.Element {
  const [param, setParam] = React.useState<G.BuildParam>({ level: 1 })
  const { setBuildArea } = React.useContext(BuildAreaContext)
  const bs = G.bulidState(p.world, param, p.cell.area)
  useEffect(() => setBuildArea && setBuildArea(
    bs.canBuild ? { ...p.cell.area, w: param.size ?? 0, h: param.size ?? 0 } : undefined),
    [setBuildArea, bs.canBuild, param.size])
  const setSize = (n: G.SizeType): void => {
    setParam({ ...param, size: n })
  }
  const setWTB = (b: G.WhatToBuild): void => {
    setParam({ ...param, toBiuld: b })
  }
  const levelMax = param.toBiuld == null ? 1 : G.visibleMaxLevel(p.world, param.toBiuld)
  if (levelMax < param.level) {
    setParam({ ...param, level: levelMax })
  }
  const levelAdd = (x: number) => {
    setParam({ ...param, level: U.clamp((param.level ?? 0) + x, 1, levelMax) })
  }
  return <>
    <Mui.Box><Mui.FormControl size="small">
      <Mui.FormLabel id="btype-selector">建物の種類</Mui.FormLabel>
      <Mui.RadioGroup
        row
        aria-labelledby="btype-selector"
        name="btype-selector-buttons-group"
      >
        <Mui.FormControlLabel
          checked={param.toBiuld == World.FieldObjKind.factory}
          value="factory" control={<Mui.Radio />} label="工場" onClick={
            () => setWTB(World.FieldObjKind.factory)} />
        <Mui.FormControlLabel
          checked={param.toBiuld == World.FieldObjKind.pLabo}
          value="plabo" control={<Mui.Radio />} label="生産技研" onClick={
            () => setWTB(World.FieldObjKind.pLabo)} />
        <Mui.FormControlLabel
          checked={param.toBiuld == World.FieldObjKind.bLabo}
          value="blabo" control={<Mui.Radio />} label="基礎研" onClick={
            () => setWTB(World.FieldObjKind.bLabo)} />
        {bs.canBuildMagic ? <>
          <Mui.FormControlLabel
            checked={param.toBiuld == World.FieldObjKind.magic}
            value="magic" control={<Mui.Radio />} label="魔術研" onClick={
              () => setWTB(World.FieldObjKind.magic)} /></> : <></>}
      </Mui.RadioGroup>
      <Mui.FormLabel id="bsize-selector">建物のサイズ</Mui.FormLabel>
      <Mui.RadioGroup
        row
        aria-labelledby="bsize-selector"
        name="bsize-selector-buttons-group"
      >
        <Mui.FormControlLabel
          checked={param.size == 1}
          value="1" control={<Mui.Radio />} label="小" onClick={
            () => setSize(1)} />
        <Mui.FormControlLabel
          checked={param.size == 2}
          value="2" control={<Mui.Radio />} label="中" onClick={
            () => setSize(2)} />
        <Mui.FormControlLabel
          checked={param.size == 3}
          value="3" control={<Mui.Radio />} label="大" onClick={
            () => setSize(3)} />
      </Mui.RadioGroup>
      {param.toBiuld && <>
        <Mui.Stack direction="row" gap={3} alignItems="baseline">
          <Mui.FormLabel id="q-selector">技術レベル {param?.level ?? "??"}</Mui.FormLabel>
          <Mui.Button size="small" onClick={() => levelAdd(-1)} disabled={(param.level ?? 0) < 2}><Icon.ArrowBackIos fontSize="inherit" /></Mui.Button>
          <Mui.Button size="small" onClick={() => levelAdd(1)} disabled={levelMax <= (param.level ?? levelMax)}><Icon.ArrowForwardIos fontSize="inherit" /></Mui.Button>
        </Mui.Stack>
        <Mui.Slider
          aria-labelledby="q-selector"
          defaultValue={1}
          getAriaValueText={(v) => `${v}`}
          valueLabelDisplay="auto"
          value={param.level}
          step={1}
          onChange={(_, val) => {
            if (typeof val === 'number') {
              setParam({ ...param, level: val })
            }
          }}
          marks
          min={1}
          max={levelMax}
        /></>
      }
      {param.toBiuld && 0 < (param.size ?? 0) && <>
        <Mui.Stack direction={"column"}>
          <Mui.Typography>
            建設費: {U.numText(bs.cost)} T
          </Mui.Typography>
          <Mui.Typography> 工期: {U.numText(bs.duration)} w</Mui.Typography>
          <Mui.Typography> 能力: {U.numText(bs.power)}</Mui.Typography>
        </Mui.Stack></>
      }
      {0 < param.level && <Mui.Button variant="contained"
        disabled={!bs.canBuild}
        onClick={() => {
          p.updateWorld((w: W.World) => {
            G.addBuilding(w, p.cell.area, param)
          })
          p.closer()
        }}
      >着工</Mui.Button>}
    </Mui.FormControl>
    </Mui.Box >
  </>
}

const buildingTypeText = (k: W.FieldObjKindType): string => {
  switch (k) {
    case World.FieldObjKind.house: return "自宅兼工場"
    case World.FieldObjKind.factory: return "工場"
    case World.FieldObjKind.pLabo: return "生産技研"
    case World.FieldObjKind.bLabo: return "基礎研"
    case World.FieldObjKind.magic: return "魔術研"
    default:
      return "n/a"
  }
}
function StateUI(p: {
  world: W.World,
  cell: W.Cell,
  closer: () => void
}): JSX.Element {
  const c = G.condition(p.world, p.cell)
  const improve = 0 < (c.improve ?? 0)
  const i: [string, string][] = [
    ["種類", buildingTypeText(p.cell.kind)],
    ["Level" + (improve ? "〈強化〉" : ""), `Lv. ${c.level}` + (improve ? `〈+${c.improve}〉` : "")],
    ["能力", U.numText(c.power ?? 0)],
    ["基礎能力", U.numText(c.basicPower ?? 0)],
    ["強化の効果", `× ${U.ratioText(c.improveRatio ?? 1)}`],
    ["隣の建物の効果", `× ${U.ratioText(c.neibourEffect ?? 1)}`],
  ]
  return <>
    <Mui.Box>
      <Mui.TableContainer sx={{ p: 0, m: 0 }}>
        <Mui.Table size="small">
          <Mui.TableBody>
            {i.map(([k, v]) =>
              <Mui.TableRow key={k}>
                <Mui.TableCell sx={{ fontWeight: "bold" }}>{k}</Mui.TableCell>
                <Mui.TableCell>{v}</Mui.TableCell>
              </Mui.TableRow>
            )}
          </Mui.TableBody>
        </Mui.Table>
      </Mui.TableContainer>
    </Mui.Box>
  </>
}

function CellClickUI(p: {
  world: W.World,
  updateWorld: Updater<W.World>,
  cell: W.Cell,
  closer: () => void
}): JSX.Element {
  const tabs = {
    b: G.canBuildAt(p.world, p.cell),
    i: G.canImprove(p.world, p.cell),
    d: G.isDestroyable(p.world, p.cell),
    s: G.isBuilding(p.world, p.cell),
  }
  const [value, setValue] = React.useState(((): string => (
    tabs.s ? "s" :
      tabs.b ? "b" :
        tabs.i ? "i" :
          tabs.d ? "d" :
            "" // unreachable
  ))());
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return <MuiL.TabContext value={value}>
    <Mui.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList onChange={handleChange}>
        {!tabs.s ? [] : <Mui.Tab label="情報" value="s" />}
        {!tabs.b ? [] : <Mui.Tab label="建築" value="b" />}
        {!tabs.i ? [] : <Mui.Tab label="強化" value="i" />}
        {!tabs.d ? [] : <Mui.Tab label="撤去" value="d" />}
      </TabList>
    </Mui.Box>
    {!tabs.b ? [] :
      <TabPanel value="b">
        <AddBuildingUI world={p.world} updateWorld={p.updateWorld} cell={p.cell} closer={p.closer} />
      </TabPanel>}
    {!tabs.i ? [] :
      <TabPanel value="i">
        <ImproveUI world={p.world} updateWorld={p.updateWorld} cell={p.cell} closer={p.closer} />
      </TabPanel>}
    {!tabs.d ? [] :
      <TabPanel value="d">
        <DestroyUI world={p.world} updateWorld={p.updateWorld} cell={p.cell} closer={p.closer} />
      </TabPanel>}
    {!tabs.s ? [] :
      <TabPanel value="s" sx={{ p: 0, m: 0 }}>
        <StateUI world={p.world} cell={p.cell} closer={p.closer} />
      </TabPanel>}
  </MuiL.TabContext>
}

function fieldObjArea(area: W.Area, wo: W.World): W.Area {
  const c = Layout.fieldWH()
  const wsize = wo.size

  const xsize = c.w / (wsize.w + 0.2)
  const xgap = (c.w - xsize * wsize.w) / (wsize.w + 0.2)
  const xstep = xsize + xgap
  const width = area.w * xstep - xgap

  const ygap = xgap
  const ysize = (c.h - ygap * (wsize.h + 1)) / wsize.h
  const ystep = ysize + ygap
  const height = area.h * ystep - ygap

  return {
    x: area.x * xstep + xgap,
    y: area.y * ystep + xgap,
    w: width,
    h: height
  }
}

const tightsPath = [
  "M -24,-40",
  "v 80",
  "h 16",
  "v -50",
  "h 16",
  "v 50",
  "h 16",
  "v -80",
].join(" ")

function CellDecoP(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  const dur = (0.1 + 80 / (Math.log10(Math.max(10, p.power ?? 10))) ** 2)
  const d = tightsPath
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-100 -55 105 105"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="white" stroke="none" opacity={0.2}>
      <path d={d} id="t">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur={`${dur}s`}
          repeatCount="indefinite" />
      </path>
    </g>
  </svg>
}

function CellDecoF(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  const dur = 2 * (0.1 + 80 / (Math.log10(Math.max(10, p.power ?? 10))) ** 2)

  function T({ r }: { r: number }): JSX.Element {
    return <g fill="white" stroke="none" opacity={0.2}>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="translate"
        values={`-100,200;100,-200`}
        begin={`${-r * dur}s`}
        dur={`${dur}s`}
        offset={`${dur * r}s`}
        repeatCount="indefinite" />
      <path d={d} id="t">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          values="0;360"
          dur={`${dur / 2}s`}
          repeatCount="indefinite" />
      </path>
    </g>
  }
  const d = tightsPath
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-80 -55 105 105"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <T r={0} />
    <T r={1 / 3} />
    <T r={2 / 3} />
  </svg>
}

function CellDecoB(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  const dur = (0.1 + 60 / (Math.log10(Math.max(10, p.power ?? 10))) ** 1.5)
  const d = tightsPath
  const values = [0, ...Array(30)].map((_, i) => 1.25 ** (i - 14)).join(";")
  function P({ begin }: { begin: number }): JSX.Element {
    return <path d={d} id="t">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="scale"
        values={values}
        dur={`${dur}s`}
        begin={`${-begin * dur}s`}
        repeatCount="indefinite" />
    </path>
  }
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-100 -55 105 105"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="white" stroke="none" opacity={0.2}>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        values="0;360"
        dur={`${dur / 2}s`}
        repeatCount="indefinite" />
      <P begin={0} />
      <P begin={0.5} />
    </g>
  </svg>
}

function CellDecoM(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  const dur = 0.1 + 100 / (Math.log10(Math.max(10, p.power ?? 10))) ** 2.2
  const rep = Math.round(Math.max(2, 12 - (Math.log10(Math.max(10, p.power ?? 10)))))
  const tcount = 7
  const dur1 = dur * Math.SQRT1_2 / tcount
  const d = tightsPath
  const values = "0,80;0,120" + ";0,80".repeat(rep)
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-250 -160 320 320"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="white" stroke="none" opacity={0.2}>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        values="0;360"
        dur={`${dur}s`}
        repeatCount="indefinite" />
      {[...Array(tcount)].map((_, i) => i).map((e) =>
        <g transform={`rotate(${e * 360 / tcount})`}>
          <path d={d} id="t">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values={values}
              dur={`${dur1}s`}
              begin={`${-e * dur1 * 3 / tcount}s`}
              repeatCount="indefinite" />
          </path>
        </g>)}
    </g>
  </svg>
}

function CellDeco(p: { cell: World.Cell, w: number, h: number, power: number | undefined }): JSX.Element {
  switch (p.cell.kind) {
    case W.FieldObjKind.factory:
      return <CellDecoF w={p.w} h={p.h} power={p.power} />
    case W.FieldObjKind.pLabo:
      return <CellDecoP w={p.w} h={p.h} power={p.power} />
    case W.FieldObjKind.bLabo:
      return <CellDecoB w={p.w} h={p.h} power={p.power} />
    case W.FieldObjKind.magic:
      return <CellDecoM w={p.w} h={p.h} power={p.power} />
    default:
      return <></>
  }
}

function FieldObj(p: { world: W.World, updateWorld: Updater<W.World>, cell: W.Cell }): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null | undefined>(null);
  const fo = p.cell
  const foa = fieldObjArea(fo.area, p.world)
  const { setBuildArea } = React.useContext(BuildAreaContext)

  const fontSize = foa.h / 4
  const smallFontSize = fontSize * 0.7

  const cellCSS: React.CSSProperties = {
    position: "absolute",
    left: foa.x,
    top: foa.y,
    overflow: "hidden",
    margin: 0,
    padding: 0,
  }
  const col = new Map<W.FieldObjKindType, string>([
    [World.FieldObjKind.none, "#eee"],
    [World.FieldObjKind.bLabo, "oklch(0.5 0.4 240)"],
    [World.FieldObjKind.pLabo, "oklch(0.4 0.4 150)"],
    [World.FieldObjKind.factory, "oklch(0.45 0.4 100)"],
    [World.FieldObjKind.magic, "#000"],
    [World.FieldObjKind.house, "oklch(0.2 0.4 10)"],
  ]).get(fo.kind)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget?.parentElement?.parentElement);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setBuildArea && setBuildArea(undefined);
  };
  const open = Boolean(anchorEl);
  const id = open ? `simple-popover-${U.XY.fromXY(fo.area).toNum()}` : undefined;
  const cond = G.condition(p.world, p.cell)
  const pline = (prefix: string, x: number | undefined) => {
    if (x == null) { return <></> }
    const regexp = /^((?:\-)?\d+)(\.\d+)?(\D+)?$/g;
    const m = [...U.numText(x).matchAll(regexp)];
    const [_, ms, ls, u] = (m || [])[0]
    return <Mui.Box alignSelf={"center"}>
      <Mui.Stack direction={"row"} alignItems={"baseline"}>
        <Mui.Typography fontSize={fontSize}>{prefix}{ms}</Mui.Typography>
        {ls ? <Mui.Typography fontSize={smallFontSize}>{ls}</Mui.Typography> : <></>}
        <Mui.Typography fontSize={fontSize}>{u}</Mui.Typography>
      </Mui.Stack ></Mui.Box>
  }
  const sline = (x: number | undefined, y: number | undefined) => <span>
    {x != null ? <>Lv. {x}</> : <></>}{0 < (y ?? 0) ? <span className="improve">{y}</span> : <></>}
  </span>
  if (cond.construction != null && 0 < cond.construction && cond.constructionTotal != null && 0 < cond.construction) {
    const w = foa.w / 2
    const h = foa.h / 2
    const r = h * 0.9
    let x = (cond.construction) / (cond.constructionTotal + 1)
    if (x == 0.5) { x = 0.5 + 1e-9 }
    const t = Math.PI * 2 * x
    const dx = r * (-Math.sin(t))
    const dy = r * (1 - Math.cos(t))
    return <div className={"cell"} style={cellCSS}>
      <svg version="1.1"
        width={foa.w} height={foa.h}
        xmlns="http://www.w3.org/2000/svg">
        <rect x={0} y={0} width={foa.w} height={foa.h} fill="#ddd" rx={r / 5} ry={r / 5} />
        <circle cx={w} cy={h} r={r} fill="#fff" />
        <path d={`
          M ${w},${h}
          l 0,${-r}
          a ${r} ${r} 270 ${x < 0.5 ? 1 : 0} 1 ${dx},${dy}
          Z`} fill={col} />
      </svg>
    </div>
  }
  const icon = <Mui.Box
    sx={{
      fontSize: fontSize * 2,
      color: "rgba(255,255,255,0.3)",
    }}
  >{((): JSX.Element => {
    const iconStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      fontSize: foa.h / 2,
    }
    switch (fo.kind) {
      case World.FieldObjKind.factory:
        return <Icon.Factory sx={iconStyle} />
      case World.FieldObjKind.pLabo:
        return <Icon.Settings sx={iconStyle} />
      case World.FieldObjKind.bLabo:
        return <Icon.Science sx={iconStyle} />
      case World.FieldObjKind.magic:
        return <Icon.AutoFixHigh sx={iconStyle} />
      case World.FieldObjKind.house:
        return <Icon.Home sx={iconStyle} />
      default:
        return <></>
    }
  })()}</Mui.Box>

  return <>
    <div className={"cell"} style={cellCSS}>
      <Mui.Button
        aria-describedby={id} fullWidth={false} size="small"
        sx={{
          backgroundColor: col,
          borderWidth: Layout.border() * 2,
          borderColor: "black",
          borderStyle: (open ? "solid" : "none"),
          padding: 0,
          margin: "0",
          minWidth: foa.w,
          width: foa.w,
          height: foa.h,
          textTransform: "none",
          fontSize: fontSize,
        }}
        variant="contained"
        onClick={handleClick}>
        {icon}
        <CellDeco cell={fo} w={foa.w} h={foa.h} power={cond.power} />
        <Mui.Stack>
          {pline((fo.kind == World.FieldObjKind.magic ? "× " : ""), cond.power)}
          {sline(cond.level, cond.improve)}
        </Mui.Stack>
      </Mui.Button>
      <Mui.Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      ><CellClickUI
          world={p.world}
          updateWorld={p.updateWorld}
          cell={p.cell}
          closer={() => {
            setAnchorEl(null);
            setBuildArea && setBuildArea(undefined)
          }} /></Mui.Popover></div ></>
}

function Field(p: { world: W.World, updateWorld: Updater<W.World> }): JSX.Element {
  const [buildArea, setBuildArea] = React.useState<W.Area | undefined>(undefined)
  const wo = p.world
  const c = Layout.fieldWH()
  const ba: undefined | W.Area = buildArea && fieldObjArea(buildArea, p.world)
  return (
    <BuildAreaContext.Provider value={{ buildArea, setBuildArea }}>
      <div style={{
        position: "relative",
        width: c.w,
        minWidth: c.w,
        maxWidth: c.w,
        height: c.h,
        maxHeight: c.h,
        minHeight: c.h,
        borderStyle: "solid",
        overflow: "hidden",
        marginLeft: "auto",
        marginRight: "auto",

      }}>
        <Mui.Box sx={{ zIndex: "tooltip", width: c.w, height: c.h }}
          style={{ position: "relative", left: 0, top: 0, pointerEvents: "none" }}>
          {ba &&
            <svg version="1.1"
              style={{ width: c.w, height: c.h, pointerEvents: "none" }}
              width={c.w} height={c.h}
              xmlns="http://www.w3.org/2000/svg">
              <rect x={ba.x} y={ba.y} width={ba.w} height={ba.h} opacity={0.2} stroke="#000" strokeWidth={10} fill="none" rx={10} ry={10} />
            </svg>}
        </Mui.Box>
        {G.cells(wo).map(f => <FieldObj key={`${U.XY.fromXY(f.area).toNum()}`} world={wo} updateWorld={p.updateWorld} cell={f} />)}
      </div></BuildAreaContext.Provider>
  );
}

export default Field
