import * as Mui from "@mui/material";
import * as MuiL from "@mui/lab";
import React from "react";
import * as U from './util'
import * as G from "./game"
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Updater } from 'use-immer';
import { Upcoming } from "@mui/icons-material";
import * as Layout from "./layout"

function AddDestroyUI(p: {
  world: G.World,
  updateWorld: Updater<G.World>,
  fieldObj: G.FieldObj,
  closer: () => void
}): JSX.Element {
  return <>
    <Mui.Box>
      <Mui.FormControl size="small">
        <Mui.Button variant="contained"
          disabled={!G.isDestroyable(p.fieldObj)}
          onClick={() => {
            p.updateWorld((w: G.World) => {
              G.destroy(w, p.fieldObj)
            })
            p.closer()
          }}
        >撤去</Mui.Button>
      </Mui.FormControl>
    </Mui.Box>
  </>
}

function AddImproveUI(p: {
  world: G.World,
  updateWorld: Updater<G.World>,
  fieldObj: G.FieldObj,
  closer: () => void
}): JSX.Element {
  const cost = G.improveCost(p.world, p.fieldObj)
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
            disabled={cost == null}
            onClick={() => {
              p.updateWorld((w: G.World) => {
                G.improve(w, p.fieldObj)
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
  world: G.World,
  updateWorld: Updater<G.World>,
  fieldObj: G.FieldObj,
  closer: () => void
}): JSX.Element {
  const [param, setParam] = React.useState<G.BuildParam>(G.defaultBuildParam(p.world))
  const bs = G.bulidState(p.world, param, p.fieldObj)
  return <>
    <Mui.Box><Mui.FormControl size="small">
      <Mui.FormLabel id="btype-selector">建物の種類</Mui.FormLabel>
      <Mui.RadioGroup
        row
        aria-labelledby="btype-selector"
        name="btype-selector-buttons-group"
      >
        <Mui.FormControlLabel
          checked={param.toBiuld == G.FieldObjKind.factory}
          value="factory" control={<Mui.Radio />} label="工場" onClick={
            () => setParam({ ...param, toBiuld: G.FieldObjKind.factory })} />
        <Mui.FormControlLabel
          checked={param.toBiuld == G.FieldObjKind.pLabo}
          value="plabo" control={<Mui.Radio />} label="生産技術研究所" onClick={
            () => setParam({ ...param, toBiuld: G.FieldObjKind.pLabo })} />
        <Mui.FormControlLabel
          checked={param.toBiuld == G.FieldObjKind.bLabo}
          value="blabo" control={<Mui.Radio />} label="基礎研究所" onClick={
            () => setParam({ ...param, toBiuld: G.FieldObjKind.bLabo })} />
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
            () => setParam({ ...param, size: 1 })} />
        <Mui.FormControlLabel
          checked={param.size == 2}
          value="2" control={<Mui.Radio />} label="中" onClick={
            () => setParam({ ...param, size: 2 })} />
        <Mui.FormControlLabel
          checked={param.size == 3}
          value="3" control={<Mui.Radio />} label="大" onClick={
            () => setParam({ ...param, size: 3 })} />
      </Mui.RadioGroup>
      <Mui.FormLabel id="q-selector">技術レベル</Mui.FormLabel>
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
        max={G.buildableMax(p.world, param.toBiuld)}
      />
      <Mui.Stack direction={"column"}>
        <Mui.Typography>コスト: {U.numText(bs.cost)} T </Mui.Typography>
        <Mui.Typography> 工期: {U.numText(bs.duration)} w</Mui.Typography>
        <Mui.Typography> 能力: {U.numText(bs.power)}</Mui.Typography>
      </Mui.Stack>
      <Mui.Button variant="contained"
        disabled={!bs.canBuild}
        onClick={() => {
          p.updateWorld((w: G.World) => {
            G.addBuilding(w, p.fieldObj, param)
          })
          p.closer()
        }}
      >着工</Mui.Button>
    </Mui.FormControl>
    </Mui.Box >
  </>
}

function CellClickUI(p: {
  world: G.World,
  updateWorld: Updater<G.World>,
  fieldObj: G.FieldObj,
  closer: () => void
}): JSX.Element {
  const [value, setValue] = React.useState('1');
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return <MuiL.TabContext value={value}>
    <Mui.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList onChange={handleChange} aria-label="lab API tabs example" >
        <Mui.Tab label="建築" value="1" />
        <Mui.Tab label="撤去" value="2" />
        <Mui.Tab label="強化" value="3" />
      </TabList>
    </Mui.Box>
    <TabPanel value="1">
      <AddBuildingUI world={p.world} updateWorld={p.updateWorld} fieldObj={p.fieldObj} closer={p.closer} />
    </TabPanel>
    <TabPanel value="2">
      <AddDestroyUI world={p.world} updateWorld={p.updateWorld} fieldObj={p.fieldObj} closer={p.closer} />
    </TabPanel>
    <TabPanel value="3">
      <AddImproveUI world={p.world} updateWorld={p.updateWorld} fieldObj={p.fieldObj} closer={p.closer} />
    </TabPanel>
  </MuiL.TabContext>
}

function FieldObj(p: { world: G.World, updateWorld: Updater<G.World>, fieldObj: G.FieldObj }): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null | undefined>(null);
  const fo = p.fieldObj
  const c = Layout.fieldWH()
  const wsize = p.world.size

  const xsize = c.w / (wsize.w + 1)
  const xgap = (c.w - xsize * wsize.w) / (wsize.w + 1)
  const xstep = xsize + xgap
  const width = fo.area.w * xstep - xgap

  const ygap = xgap
  const ysize = (c.h - ygap * (wsize.h + 1)) / wsize.h
  const ystep = ysize + ygap
  const height = fo.area.h * ystep - ygap
  const fontSize = height / 4
  const smallFontSize = fontSize * 0.7

  const s: React.CSSProperties = {
    position: "absolute",
    left: fo.area.x * xstep + xgap,
    top: fo.area.y * ystep + xgap,
    minWidth: width,
    maxWidth: width,
    minHeight: height,
    maxHeight: height,
    overflow: "hidden",
    margin: 0,
    padding: 0,

  }
  const col = new Map<G.FieldObjKindType, string>([
    [G.FieldObjKind.none, "#eee"],
    [G.FieldObjKind.bLabo, "darkorange"],
    [G.FieldObjKind.pLabo, "red"],
    [G.FieldObjKind.factory, "gray"],
    [G.FieldObjKind.house, "green"],
  ]).get(fo.kind)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget?.parentElement?.parentElement);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? `simple-popover-${U.XY.fromXY(fo.area).toNum()}` : undefined;
  const cond = G.condition(p.world, p.fieldObj)
  const pline = (x: number | undefined) => {
    if (x == null) { return <></> }
    const regexp = /^(\d+)(\.\d+)?(\D)?$/g;
    const m = [...U.numText(x).matchAll(regexp)];
    const [_, ms, ls, u] = (m || [])[0]
    return <Mui.Box alignSelf={"center"}>
      <Mui.Stack direction={"row"} alignItems={"baseline"}>
        <Mui.Typography fontSize={fontSize}>{ms}</Mui.Typography>
        {ls ? <Mui.Typography fontSize={smallFontSize}>{ls}</Mui.Typography> : <></>}
        <Mui.Typography fontSize={fontSize}>{u}</Mui.Typography>
      </Mui.Stack ></Mui.Box>
  }
  const sline = (x: number | undefined, y: number | undefined) => <span>
    {x != null ? <>Lv. {x}</> : <></>}{y != null ? <span className="improve">{y}</span> : <></>}
  </span>
  if (cond.construction != null && 0 < cond.construction && cond.constructionTotal != null && 0 < cond.construction) {
    const w = width / 2
    const h = height / 2
    const r = h * 0.9
    let x = (cond.construction) / (cond.constructionTotal + 1)
    console.log({ x: x, c: cond.construction, total: cond.constructionTotal })
    if (x == 0.5) { x = 0.5 + 1e-9 }
    const t = Math.PI * 2 * x
    const dx = r * (-Math.sin(t))
    const dy = r * (1 - Math.cos(t))
    return <div className={"cell"} style={s}>
      <svg version="1.1"
        width={width} height={height}
        xmlns="http://www.w3.org/2000/svg">
        <rect x={0} y={0} width={width} height={height} fill="#ddd" rx={r / 5} ry={r / 5} />
        <circle cx={w} cy={h} r={r} fill="#fff" />
        <path d={`
          M ${w},${h}
          l 0,${-r}
          a ${r} ${r} 270 ${x < 0.5 ? 1 : 0} 1 ${dx},${dy}
          Z`} fill={col} />
      </svg>
    </div>
  }

  return <div className={"cell"} style={s}>
    <Mui.Button
      aria-describedby={id} fullWidth={false} size="small"
      sx={{
        backgroundColor: col,
        borderWidth: Layout.border() * 2,
        borderColor: "black",
        borderStyle: (open ? "solid" : "none"),
        padding: 0,
        margin: "0",
        minWidth: width,
        width: width,
        height: height,
        textTransform: "none",
        fontSize: fontSize,
      }}
      variant="contained"
      onClick={handleClick}>
      <Mui.Stack>
        {pline(cond.power)}
        {sline(cond.level, cond.improve)}
      </Mui.Stack>
    </Mui.Button>
    <Mui.Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    ><CellClickUI world={p.world} updateWorld={p.updateWorld} fieldObj={p.fieldObj} closer={() => { setAnchorEl(null) }} /></Mui.Popover></div >
}

class Field extends React.Component<{ world: G.World, updateWorld: Updater<G.World> }, {}> {
  render() {
    const wo = this.props.world
    const c = Layout.fieldWH()
    return (
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
        {G.fieldObjs(wo).map(f => <FieldObj key={`${U.XY.fromXY(f.area).toNum()}`} world={wo} updateWorld={this.props.updateWorld} fieldObj={f} />)}
      </div>
    );
  }
}

export default Field
