import React, { useEffect, useState, useCallback, useRef } from "react";
import { observer } from "mobx-react";
import { chunk, debounce, isEmpty, set, throttle } from "lodash";
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
  const [offsetHeight, setOffsetHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const listener = useCallback((e) => {
    if (!isEmpty(blocks)) {
      const {
        scrollTop,
        scrollLeft,
        offsetHeight,
        offsetLeft,
        offsetWidth,
        offsetTop,
        offsetParent,
        // clientHeight,
        scrollHeight,
      } = e.target;
      let currentIndex = Math.floor(scrollTop / store.perHeight);
      let rowsBoxScrollTop =
        scrollTop - (store.currentIndex - 1) * store.perHeight;
      rowsRef.current.scrollTop = rowsBoxScrollTop;
    }
  });

  const removeTableRefEventListener = useCallback(
    debounce(() => {
      tableRef.current.addEventListener("scroll", listener);
    }, 100)
  );

  const sycListener = useCallback((e) => {
    // tableRef.current.removeEventListener("scroll", listener);
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
    // store.setPreScrollTop(scrollTop);
    const { perHeight, preIndex } = store;
    if (
      Math.abs(store.totalScrollTop - tableRef.current.scrollTop) > perHeight
    ) {
      store.setTotalScrollTop(tableRef.current.scrollTop);
      let currentIndex = Math.floor(
        tableRef.current.scrollTop / store.perHeight
      );
      let rowsBoxScrollTop =
        tableRef.current.scrollTop - (currentIndex - 1) * store.perHeight;
      store.setCurrentIndex(currentIndex);
      rowsRef.current.scrollTop = rowsBoxScrollTop;
      return;
    }
    const isUp =
      preIndex > store.curentBolckIndex ||
      (store.currentIndex - 1) * perHeight + e.target.scrollTop <
        store.totalScrollTop;

    let currentScrollTop = rowsRef.current.scrollTop;
    let currentIndex = store.currentIndex;
    if (!isUp && scrollTop >= perHeight * 1.25) {
      currentIndex = store.currentIndex + 1;
      currentScrollTop = rowsRef.current.scrollTop - perHeight;
      store.setPreIndex(store.currentIndex);
      store.setCurrentIndex(currentIndex);
      rowsRef.current.scrollTop = currentScrollTop;
    } else if (isUp && scrollTop <= perHeight / 2) {
      if (store.currentIndex > 1) {
        currentIndex = store.currentIndex - 1;
        currentScrollTop = rowsRef.current.scrollTop + perHeight;
        store.setPreIndex(store.currentIndex);
        store.setCurrentIndex(currentIndex);
        rowsRef.current.scrollTop = currentScrollTop;
      }
    }
    const totalScrollTop = (currentIndex - 1) * perHeight + currentScrollTop;
    store.setTotalScrollTop(totalScrollTop + (isUp ? 1 : -1));

    tableRef.current.scrollTop = totalScrollTop;
  });

  const setScrollTop = useCallback((value) => {
    tableRef.current.scrollTop = value;
  });

  useEffect(() => {
    if (tableRef.current) {
      const blocks = chunk(rows, tableRef.current.offsetHeight / 32);
      const perHeight = 32 * blocks[0]?.length;
      setBlocks(blocks);
      store.setPerHeight(perHeight);
      setClientHeight(tableRef.current.clientHeight);
      setOffsetHeight(tableRef.current.offsetHeight);
      tableRef.current.addEventListener("scroll", listener);
      window.setScrollTop = (value) => {
        tableRef.current.scrollTop = value;
      };
    }
    return () => {
      tableRef.current.removeEventListener("scroll", listener);
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
