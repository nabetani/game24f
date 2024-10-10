import * as Mui from "@mui/material";
import * as MuiL from "@mui/lab";
import React from "react";
import * as U from './util'
import * as G from "./game"
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

function CellClickUI(p: {}): JSX.Element {

  const [value, setValue] = React.useState('1');
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return <MuiL.TabContext value={value}>
    <Mui.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList onChange={handleChange} aria-label="lab API tabs example">
        <Mui.Tab label="建築" value="1" />
        <Mui.Tab label="撤去" value="2" />
        <Mui.Tab label="強化" value="3" />
      </TabList>
    </Mui.Box>
    <TabPanel value="1">
      <Mui.FormControl>
        <Mui.FormLabel id="btype-selector">建物の種類</Mui.FormLabel>
        <Mui.RadioGroup
          row
          aria-labelledby="btype-selector"
          name="row-radio-buttons-group"
        >
          <Mui.FormControlLabel value="factory" control={<Mui.Radio />} label="工場" />
          <Mui.FormControlLabel value="plabo" control={<Mui.Radio />} label="生産技術研究所" />
          <Mui.FormControlLabel value="blabo" control={<Mui.Radio />} label="基礎研究所" />
        </Mui.RadioGroup>
      </Mui.FormControl>
      <Mui.FormControl>
        <Mui.FormLabel id="bsize-selector">建物のサイズ</Mui.FormLabel>
        <Mui.RadioGroup
          row
          aria-labelledby="bsize-selector"
          name="row-radio-buttons-group"
        >
          <Mui.FormControlLabel value="1" control={<Mui.Radio />} label="小" />
          <Mui.FormControlLabel value="2" control={<Mui.Radio />} label="中" />
          <Mui.FormControlLabel value="3" control={<Mui.Radio />} label="大" />
          <Mui.FormControlLabel value="4" control={<Mui.Radio />} label="巨大" />
        </Mui.RadioGroup>
      </Mui.FormControl>
    </TabPanel>
    <TabPanel value="2">Item Two</TabPanel>
    <TabPanel value="3">Item Three</TabPanel>
  </MuiL.TabContext>
}

function FieldObj(props: { world: G.World, fieldObj: G.FieldObj }): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const fo = props.fieldObj
  const W = 70
  const s: React.CSSProperties = {
    left: fo.area.x * W,
    top: fo.area.y * W,
    minWidth: fo.area.w * W,
    maxWidth: fo.area.h * W,
    minHeight: fo.area.h * W,
    maxHeight: fo.area.w * W,
  }
  const col = new Map<G.FieldObjKindType, string>([
    [G.FieldObjKind.none, "black"],
    [G.FieldObjKind.bLabo, "darkorange"],
    [G.FieldObjKind.pLabo, "red"],
    [G.FieldObjKind.factory, "gray"],
    [G.FieldObjKind.house, "green"],
  ]).get(fo.kind)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? `simple-popover-${U.XY.fromXY(fo.area).toNum()}` : undefined;
  return <div className={"cell"} style={s}>
    <Mui.Button
      aria-describedby={id} fullWidth={false}
      sx={{ backgroundColor: col }}
      variant="contained"
      onClick={handleClick}>{`${fo.kind}`}</Mui.Button>
    <Mui.Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    ><CellClickUI /></Mui.Popover></div >
}

class Field extends React.Component<{ world: G.World }, {}> {
  render() {
    const wo = this.props.world
    return (
      <div id="field">
        {G.fieldObjs(wo).map(f => <FieldObj key={`${U.XY.fromXY(f.area).toNum()}`} world={wo} fieldObj={f} />)}
      </div>
    );
  }
}

export default Field
