import * as Mui from "@mui/material";
import * as Icon from '@mui/icons-material';
import { Updater } from 'use-immer';
import * as W from "./World"
import React from "react";
import { clamp } from "./util";
import * as WS from "./wstorage";
import { taiitsu } from "./taiitsu";

export function MessageList(
  p: { world: W.World, updateWorld: Updater<W.World> }
): JSX.Element {
  const msgs = p.world.messages ?? []
  const [msgIx, setMsgIx] = React.useState<[number, number]>(WS.messageIx.value)
  if (p.world.duration < 2 && msgIx[0] + msgIx[1] != 0) {
    WS.messageIx.write([0, 0])
    setMsgIx([0, 0])
    return <></>
  }

  const curMsg = msgs[msgIx[0]] ?? null

  const move = (d: number) => {
    const i0 = clamp(msgIx[0] + d, 0, msgs.length - 1)
    const i1 = clamp(i0, msgIx[1], msgs.length - 1)
    WS.messageIx.write([i0, i1])
    setMsgIx([i0, i1])
  }

  return <Mui.Grid2 container spacing={1} sx={{ p: 1 }}>
    <Mui.Grid2 size="auto" sx={{ display: 'flex', alignItems: 'center' }}>
      <Mui.Badge color="secondary" badgeContent={Math.max(0, msgs.length - msgIx[1] - 1)} >
        <Icon.Mail fontSize="large" color="primary" />
      </Mui.Badge>
    </Mui.Grid2>
    <Mui.Grid2 size="grow">
      {curMsg &&
        <Mui.Paper sx={{ p: 0, m: 0, backgroundColor: "#eef" }} >
          <Mui.Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', // 上下に要素を分けて配置
            padding: 1,
            height: 80,
          }}>
            <Mui.Typography align="left">{curMsg.text}</Mui.Typography>
            <Mui.Box sx={{ display: "flex", justifyContent: "right" }}>
              <Mui.Chip color="primary" label="タイーツ" size="small" variant="outlined"
                onClick={() => { taiitsu(p.world, curMsg.at, [curMsg.text]) }} />

            </Mui.Box>
          </Mui.Box>
        </Mui.Paper>}
    </Mui.Grid2>
    <Mui.Grid2 size={1}>
      <Mui.ButtonGroup orientation="vertical">
        <Mui.IconButton sx={{ border: 1, mb: 1 }} size="small" disabled={msgIx[0] <= 0} onClick={() => move(-1)}><Icon.ArrowDropUp /></Mui.IconButton>
        <Mui.IconButton sx={{ border: 1 }} size="small" disabled={msgs.length <= msgIx[0] + 1} onClick={() => move(1)}><Icon.ArrowDropDown /></Mui.IconButton>
      </Mui.ButtonGroup>
    </Mui.Grid2>
  </Mui.Grid2>
}
