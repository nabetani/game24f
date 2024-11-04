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
  return <>
    <Mui.Box>
      <Mui.FormControl size="small" >
        <Mui.Stack direction="column" spacing={2}>
          {[1, 3, 10, 30].map(e => {
            const cost = G.improveCost(p.world, p.cell, e)
            return <>
              <Mui.Stack direction="row" spacing={2}>
                <Mui.Button variant="contained"
                  disabled={cost == null || p.world.powers.money < cost}
                  onClick={() => {
                    p.updateWorld((w: W.World) => {
                      G.improve(w, p.cell, e)
                    })
                    p.closer()
                  }}
                >強化 × {e}</Mui.Button>
                <Mui.Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {cost == null
                    ? <></>
                    : <Mui.Typography>
                      コスト: {U.numText(cost)}
                    </Mui.Typography>}
                </Mui.Box>
              </Mui.Stack>
            </>
          })}
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
            建設費: {U.numText(bs.cost)}
          </Mui.Typography>
          <Mui.Typography> 工期: {U.numText(bs.duration)}</Mui.Typography>
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
    ["隣の建物の効果", `× ${U.ratioText(c.neibourEffect?.power ?? 1)}`],
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
  const count = 15
  const vx = 200
  const vy = 100
  function T({ ix, offset }: { ix: number, offset: number }): JSX.Element {
    const t = ix * 3 / count - 1.5
    const th = t * Math.PI + offset
    const kx = 0.1
    const x = (t - kx * Math.sin(th * 2)) * vx
    const y = Math.sin(th) * vy
    const dx = (1 - kx * Math.PI * 2 * Math.cos(th * 2)) * vx
    const dy = Math.cos(th) * vy * Math.PI
    const deg = 90 + Math.atan2(dy, dx) * 180 / Math.PI
    return <g
      transform={` translate(${x} ${y}) scale(${0.7}) rotate(${deg}) `}>
      <path d={tightsPath} /></g>
  }
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-130 -150 220 350"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="white" stroke="none" opacity={0.2} transform="rotate(-20)">
      {[...Array(count)].map((_, ix) => {
        return <><T ix={ix} offset={3.5} />
          <T ix={ix} offset={5} /></>
      })}

    </g>
  </svg>
}

function CellDecoF(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-80 -50 100 100"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="white" stroke="none" opacity={0.2}>
      <path d={tightsPath} transform="rotate(33)" />
    </g>
  </svg>
}

function CellDecoB(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  const count = 30
  const scale0 = 0.1
  const scale = 1.2
  const deg = 50
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
      {[...Array(count)].map((_, ix) => {
        return <g
          transform={`rotate(${deg * ix}) scale(${scale0 * scale ** ix}) translate(0 90) `}>
          <path d={tightsPath} /></g>
      })}

    </g>
  </svg>
}

function CellDecoM(p: { w: number, h: number, power: number | undefined }): JSX.Element {
  const iz = 16
  const edge = 5
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox="-200 -125 250 250"
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g fill="white" stroke="none" opacity={0.2}>
      {[...Array(iz)].map((_, ix) => {
        const t = ix * 360 / iz
        return <g transform={`rotate(${t}) translate(100 0) scale(0.4)`}><path d={tightsPath} /></g>
      })}
      {[...Array(5)].map((_, rot) => {
        return <g transform={`rotate( ${72 * rot - 90})`}>
          {[...Array(edge)].map((_, ix) => {
            return <g transform={`translate( 31,${(ix - (edge - 1) / 2) * 40}) scale(0.4)`}><path d={tightsPath} /></g>
          })}</g>
      })}
    </g>
  </svg>
}
function Ani(p: { dir: [number, number] }): JSX.Element {
  const [x, y] = p.dir
  const k = 3
  return <animateTransform
    attributeName="transform"
    attributeType="XML"
    type="translate"
    values={`0,0;${x * k},${y * k};0,0`}
    dur="1s"
    repeatCount="indefinite" />

}
function NeibourEffect(p: { cell: World.Cell, w: number, h: number, cond: G.CondType | undefined }): JSX.Element {
  const vb = `0 0 ${p.w} ${p.h}`
  const deltas = (positive: boolean) => {
    const d = (positive ? 0.2 : 0.35) * p.h / p.cell.area.h
    return [d, d / 3]
  }
  // const vb = `${-p.w} ${-p.h} ${p.w * 3} ${p.h * 3}`
  function HT(o: { x: number, y: number, dir: 1 | -1, positive: boolean }): JSX.Element {
    const [delta, delta2] = deltas(o.positive)
    const r = p.w / p.cell.area.w
    const x1 = (o.x + 0.5) * r
    const x0 = x1 - delta
    const x2 = x1 + delta
    const y0 = o.y * p.h / p.cell.area.h + delta2 * o.dir
    const y1 = y0 + delta * o.dir
    const path = [
      `M ${x0} ${y0}`,
      `L ${x1} ${y1}`,
      `L ${x2} ${y0}`,
    ].join(" ")
    return <path d={path} fill={o.positive ? "#ff0" : "black"} ><Ani dir={[0, o.dir]} /></path>

  }
  function VT(o: { x: number, y: number, dir: 1 | -1, positive: boolean }): JSX.Element {
    const [delta, delta2] = deltas(o.positive)
    const r = p.h / p.cell.area.h
    const y1 = (o.y + 0.5) * r
    const y0 = y1 - delta
    const y2 = y1 + delta
    const x0 = o.x * p.w / p.cell.area.w + delta2 * o.dir
    const x1 = x0 + delta * o.dir
    const path = [
      `M ${x0} ${y0}`,
      `L ${x1} ${y1}`,
      `L ${x0} ${y2}`,
    ].join(" ")
    return <path d={path} fill={o.positive ? "#ff0" : "black"} ><Ani dir={[o.dir, 0]} /></path>
  }
  const effects = p.cond?.neibourEffect?.effects ?? []
  if (effects == null || effects.length == 0) { return <></> }
  return <svg style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: p.w,
    height: p.h,
  }} version="1.1"
    viewBox={vb}
    width={p.w} height={p.h}
    xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" opacity={0.3}>
      {effects.map((e) => {
        switch (e.dir) {
          case "b":
            return [...Array(e.len)].map((_, ix) => {
              return <HT key={`${ix}`} x={e.pos + ix} y={p.cell.area.h} dir={-1} positive={e.positive} />
            })
          case "t":
            return [...Array(e.len)].map((_, ix) => {
              return <HT key={`${ix}`} x={e.pos + ix} y={0} dir={1} positive={e.positive} />
            })
          case "l":
            return [...Array(e.len)].map((_, ix) => {
              return <VT key={`${ix}`} y={e.pos + ix} x={0} dir={1} positive={e.positive} />
            })
          case "r":
            return [...Array(e.len)].map((_, ix) => {
              return <VT key={`${ix}`} y={e.pos + ix} x={p.cell.area.w} dir={-1} positive={e.positive} />
            })
          default:
            return <></>
        }
      })}
    </g>
  </svg>

}

function CellDeco(p: { cell: World.Cell, w: number, h: number, cond: G.CondType | undefined }): JSX.Element {
  const nef = <NeibourEffect {...p} />
  switch (p.cell.kind) {
    case W.FieldObjKind.factory:
      return <>{nef}<CellDecoF w={p.w} h={p.h} power={p.cond?.power} /></>
    case W.FieldObjKind.pLabo:
      return <>{nef}<CellDecoP w={p.w} h={p.h} power={p.cond?.power} /></>
    case W.FieldObjKind.bLabo:
      return <>{nef}<CellDecoB w={p.w} h={p.h} power={p.cond?.power} /></>
    case W.FieldObjKind.magic:
      return <>{nef}<CellDecoM w={p.w} h={p.h} power={p.cond?.power} /></>
    default:
      return <>{nef}</>
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
        <CellDeco cell={fo} w={foa.w} h={foa.h} cond={cond} />
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
