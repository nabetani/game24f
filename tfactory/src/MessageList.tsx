import * as Mui from "@mui/material";
import * as Icon from '@mui/icons-material';
import { useState } from "react";

export function MessageList(): JSX.Element {
  const [msgs, setMsgs] = useState<string[]>(["hoge", "fuga"])
  const [curMsg, setCurMsg] = useState<string | null>(null)

  const consumeMessage = () => {
    setCurMsg(msgs[0])
    setMsgs(msgs.slice(1))
  }

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
        <Mui.Alert severity="info">{curMsg}</Mui.Alert>}
    </Mui.Grid2>

  </Mui.Grid2>
}
