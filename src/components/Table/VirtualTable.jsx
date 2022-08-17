import React, { useEffect, useRef, useState } from "react";
import { observer, useLocalObservable, useLocalStore } from "mobx-react";
import "./styles.less";
import Rows from "./components/Rows";
import TableStore from "./state";

const VirtualTable = observer(() => {
  const [store] = useState(new TableStore());
  const tableRef = useRef();
  const rowsRef = useRef();
  const [scrollBlock, setScrollBlock] = useState(0);
  const cellValues = new Array(100)
    .fill("category")
    .map((category, index) => `${category}__${index}`.toUpperCase());
  const data = new Array(100000).fill(null).map((_, index) => {
    const row = {};
    cellValues.forEach((key) => {
      row[key] = index;
    });
    return row;
  });
  useEffect(() => {
    if (tableRef.current) {
      const scrollBlock =
        tableRef.current.offsetWidth - tableRef.current.clientWidth;
      setScrollBlock(scrollBlock);
    }
  }, [tableRef.current]);

  return (
    <div className="table">
      <div style={{ position: "fixed", top: 0 }}></div>
      <div
        onWheel={(e) => {
          // const move = e.deltaY / Math.abs(e.deltaY);
          // console.log(move);
          // for (let i = 0; i < 60; i++) {
          //   setTimeout(() => {
          //     tableRef.current.scrollTop += move;
          //   }, i);
          // }
        }}
        className="context-box"
        style={{
          height: `calc(100% - ${scrollBlock}px)`,
          width: `calc(100% - ${scrollBlock}px)`,
        }}
      >
        <Rows
          store={store}
          rows={data}
          cellValues={cellValues}
          tableRef={tableRef}
          rowsRef={rowsRef}
          scrollBlock={scrollBlock}
        />
      </div>
      <div
        ref={tableRef}
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "scroll",
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: data.length * 32,
            width: 150 * cellValues.length,
            zIndex: -1,
            pointerEvents: "none",
          }}
        ></div>
      </div>
    </div>
  );
});
export default VirtualTable;