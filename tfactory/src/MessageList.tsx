import * as Mui from "@mui/material";
import * as Icon from '@mui/icons-material';
import { Updater } from 'use-immer';
import * as W from "./World"

export function MessageList(
  p: { world: W.World, updateWorld: Updater<W.World> }
): JSX.Element {
  const msgs = p.world.messages ?? []
  const consumeMessage = () => {
    p.updateWorld((w) => { w.messages = w.messages.slice(1) })
  }
  const curMsg = msgs[0] ?? null

  return <Mui.Grid2 container spacing={1} sx={{ p: 1 }}>
    <Mui.Grid2 size="auto">
      <Mui.Button variant="outlined"
        sx={{ px: 0, mx: 0 }}
        onClick={() => consumeMessage()}
        disabled={msgs.length == 0}>

        <Mui.Badge color="secondary" badgeContent={msgs.length} >
          <Icon.Mail fontSize="medium" />
        </Mui.Badge>
      </Mui.Button>
    </Mui.Grid2>
    <Mui.Grid2 size="grow">
      {curMsg &&
        <Mui.Alert sx={{ textAlign: "left" }} severity="info">{curMsg}</Mui.Alert>}
    </Mui.Grid2>

  </Mui.Grid2>
}
