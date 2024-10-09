import { Button, Card, ImageList, ImageListItem, Paper } from "@mui/material";
import React from "react";
import * as U from './util'
import * as G from "./game"

class FieldObj extends React.Component<{ world: G.World, fieldObj: G.FieldObj }, {}> {
  render() {
    const fo = this.props.fieldObj
    const W = 70
    const s: React.CSSProperties = {
      left: fo.area.topleft.x * W,
      top: fo.area.topleft.y * W,
      minWidth: fo.area.wh.x * W,
      maxWidth: fo.area.wh.x * W,
      minHeight: fo.area.wh.y * W,
      maxHeight: fo.area.wh.y * W,
    }
    const col = new Map<G.FieldObjIDType, string>([
      [G.FieldObjID.none, "black"],
      [G.FieldObjID.blabo, "darkorange"],
      [G.FieldObjID.plabo, "red"],
      [G.FieldObjID.factory, "gray"],
      [G.FieldObjID.house, "green"],
    ]).get(fo.oid)
    return <div className={"cell"} style={s}>
      <Button fullWidth={false} sx={{ backgroundColor: col }} variant="contained">{"hoge"}</Button>
    </div >
  }
}

class Field extends React.Component<{ world: G.World }, {}> {
  render() {
    const wo = this.props.world
    return (
      <div id="field">
        {wo.fieldObjs.map(f => <FieldObj world={wo} fieldObj={f} />)}
      </div>
    );
  }
}

export default Field
