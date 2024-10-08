import { Button, Card, ImageList, ImageListItem, Paper } from "@mui/material";
import React from "react";

function* range(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

type itemDataType = {
  key: string,
  t: string,
  x: number,
  y: number,
  cols: number,
  rows: number,
}

var globalKey = 1
function newItemData(t: string, x: number, y: number, cols: number, rows: number): itemDataType {
  return {
    key: `${globalKey++}`,
    t: t,
    x: x,
    y: y,
    cols: cols,
    rows: rows
  }
}

const itemData: itemDataType[] = [
  newItemData("hoge", 0, 0, 1, 2),
  newItemData("fuga", 1, 1, 2, 1),
  newItemData("piyo", 0, 3, 2, 2),
  newItemData("bar", 3, 0, 3, 3),
]

class Field extends React.Component<{ CellCount: number }, {}> {
  render() {
    return (
      <div id="field">
        {itemData.map(e =>
          <div className={["cell", `x${e.x}`, `y${e.y}`, `w${e.cols}`, `h${e.rows}`].join(" ")}>
            <Button variant="contained">{JSON.stringify(`x${e.x} y${e.y} w${e.cols} h${e.rows}`)}</Button>
          </div>
        )}
      </div>
    );
  }
}

export default Field
