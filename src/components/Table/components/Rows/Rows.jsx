import React, { useEffect, useState, useCallback, useRef } from "react";
import { observer } from "mobx-react";
import { chunk, isEmpty, set } from "lodash";
import styles from "./styles.module.less";
import TableStore from "../../state";

/**
 * @param {string} store
 * @t
 */
const Rows = observer((props) => {
  const { cellValues, rows, tableRef, rowsRef, store } = props;
  const [blocks, setBlocks] = useState([]);
  const [curentBolckIndex, setCurrentBoclkIndex] = useState(1);
  const [moveHeight, setMoveHeight] = useState(0);
  const [perHeight, setPerHeight] = useState(0);
  const [offsetHeight, setOffsetHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  // const listener = useCallback(
  //   (e) => {
  //     if (!isEmpty(blocks)) {
  //       const {
  //         scrollTop,
  //         scrollLeft,
  //         offsetHeight,
  //         offsetLeft,
  //         offsetWidth,
  //         offsetTop,
  //         offsetParent,
  //         // clientHeight,
  //         scrollHeight,
  //       } = e.target;
  //       let curentBolckIndex = Math.floor(scrollTop / perHeight);
  //       console.log(scrollTop, curentBolckIndex, "scrollTop, curentBolckIndex");
  //       let moveHeight = scrollTop % perHeight;
  //       // console.log(moveHeight);
  //       moveHeight > perHeight / 2
  //         ? (curentBolckIndex += 1) && (moveHeight -= perHeight)
  //         : "";
  //       setMoveHeight(moveHeight);

  //       setCurrentBoclkIndex(curentBolckIndex);
  //       // setMoveHeight(moveHeight);
  //     }
  //   },
  //   [blocks]
  // );

  const sycListener = useCallback((e) => {
    const {
      scrollTop,
      scrollLeft,
      offsetHeight,
      offsetLeft,
      offsetWidth,
      offsetTop,
      offsetParent,
      clientHeight,
      clientWidth,
      scrollHeight,
    } = rowsRef.current;

    const { perHeight, isUp } = store;
    console.log(
      offsetHeight,
      perHeight,
      rowsRef.current.scrollTop,
      perHeight * 2,
      store.currentIndex
    );
    if (!isUp && scrollTop >= perHeight * 1.25) {
      console.log(store.currentIndex, "store.currentIndex");
      store.setCurrentIndex(store.currentIndex + 1);
      rowsRef.current.scrollTop -= perHeight;
    } else if (isUp && scrollTop <= perHeight / 2) {
      if (store.currentIndex > 1) {
        store.setCurrentIndex(store.currentIndex - 1);
        e.target.scrollTop += perHeight;
      }
    }
  });

  const setScrollTop = useCallback((value) => {
    tableRef.current.scrollTop = value;
  });

  useEffect(() => {
    if (tableRef.current) {
      const blocks = chunk(rows, tableRef.current.offsetHeight / 32);
      // const perHeight =
      //   (tableRef.current.scrollHeight - tableRef.current.offsetHeight) /
      //   (blocks.length -
      //     2 +
      //     blocks[blocks.length - 1].length / blocks[0].length);
      const perHeight = 32 * blocks[0]?.length;
      // tableRef.current.offsetHeight - (tableRef.current.offsetHeight % 32);
      console.log(perHeight);
      setBlocks(blocks);
      store.setPerHeight(perHeight);
      setClientHeight(tableRef.current.clientHeight);
      setOffsetHeight(tableRef.current.offsetHeight);
      // tableRef.current.addEventListener("scroll", listener);
      window.setScrollTop = (value) => {
        tableRef.current.scrollTop = value;
      };
    }
    return () => {
      // tableRef.current.removeEventListener("scroll", listener);
    };
  }, [tableRef.current, rows]);

  useEffect(() => {
    if (rowsRef.current) {
      rowsRef.current.addEventListener("scroll", sycListener);
    }
    return () => {
      tableRef.current.removeEventListener("scroll", sycListener);
    };
  }, [rowsRef.current, rows]);

  return (
    <div
      onWheel={(e) => {
        const isUp = e.deltaY < 0;
        store.setIsUp(isUp);
      }}
      ref={rowsRef}
      className={styles.rows}
      style={{
        wordBreak: "break-all",
        // height: `calc(100% - ${scrollBlock}px)`,
        // width: `calc(100% - ${scrollBlock}px)`,
        height: "100%",
        width: "100%",
        position: "relative",
        // overflow: "scroll",
        scrollbarWidth: 1,
        // top: !curentBolckIndex ? -offsetHeight + (offsetHeight % 32) : 0,
      }}
    >
      <div
        className="preBufferRows"
        style={{
          // position: "absolute",
          height: offsetHeight - (offsetHeight % 32),
          top: -moveHeight - offsetHeight,
          pointerEvents: "auto",
        }}
      >
        {blocks[store.currentIndex - 1]?.map((value, index) => (
          <div
            key={index}
            style={{
              height: 32,
              borderBottom: "solid 1px red",
              boxSizing: "border-box",
            }}
          >
            {value[cellValues[0]]}
          </div>
        ))}
      </div>
      <div
        className="currentRows"
        style={{
          // position: "absolute",
          // height: offsetHeight - (offsetHeight % 32),
          // height: blocks[curentBolckIndex] * 32,
          top: -moveHeight,
          pointerEvents: "auto",
        }}
      >
        {blocks[store.currentIndex]?.map((value, index) => (
          <div
            key={index}
            style={{
              height: 32,
              borderBottom: "solid 1px red",
              boxSizing: "border-box",
            }}
          >
            {value[cellValues[0]]}
          </div>
        ))}
      </div>

      <div
        className="nextBufferRows"
        style={{
          // position: "absolute",
          // top: -moveHeight + offsetHeight,
          height: "max-content",
          pointerEvents: "auto",
          // height: 32 * blocks[curentBolckIndex + 1]?.length,
          // height: offsetHeight - (offsetHeight % 32),
          // overflow: "hidden",
        }}
      >
        {blocks[store.currentIndex + 1]?.map((value, index) => (
          <div
            key={index}
            style={{
              height: 32,
              borderBottom: "solid 1px red",
              boxSizing: "border-box",
            }}
          >
            {value[cellValues[0]]}
          </div>
        ))}
      </div>
    </div>
  );
});

Rows.propTypes = {
  store: TableStore,
};
export default Rows;
