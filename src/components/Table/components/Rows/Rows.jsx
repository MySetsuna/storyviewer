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
  const { fields, rows, tableRef, rowsRef, store, scrollBlock, rowHeight } =
    props;
  const [blocks, setBlocks] = useState([]);
  const [curentBolckIndex, setCurrentBoclkIndex] = useState(1);
  const [moveHeight, setMoveHeight] = useState(0);
  const [offsetHeight, setOffsetHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const initSign = useCallback(
    debounce(() => {
      store.setSign("first");
    }, 100)
  );

  const rowsBoxScroll = useCallback((e) => {
    if (store.sign !== e.target.className && store.sign !== "first") return;
    store.setSign(rowsRef.current.className);
    const { scrollTop: top, scrollLeft: left } = rowsRef.current;
    let { currentTop: preTop, preIndex, currentIndex, perHeight } = store;
    const isUp = preTop > top || preIndex > currentIndex;
    let currentScrollTop = top;
    store.setPreIndex(currentIndex);
    if (
      !isUp &&
      top > perHeight * 1.25 &&
      store.currentIndex < blocks.length - 2
    ) {
      currentIndex += 1;
      currentScrollTop = top - perHeight;
      store.setCurrentIndex(currentIndex);
      store.setCurrentTop(currentScrollTop - 2);
      rowsRef.current.scrollTo(left, currentScrollTop);
    } else if (
      isUp &&
      store.currentIndex > 1 &&
      top < perHeight / 2 &&
      store.currentIndex < blocks.length - 1
    ) {
      currentScrollTop = top + perHeight;
      currentIndex -= 1;

      store.setCurrentIndex(currentIndex);
      store.setCurrentTop(currentScrollTop + 2);
      rowsRef.current.scrollTo(left, currentScrollTop);
    } else if (preIndex === currentIndex) {
      // setTimeout(() => {
      store.setCurrentTop(currentScrollTop + (isUp ? 1 : -1));
      // });
    }
    tableRef.current.scrollTo(
      left,
      (currentIndex - 1) * perHeight + currentScrollTop
    );
    store.setMiddleClickScroll(false);
    initSign();
  });

  const tableBoxScroll = useCallback((e) => {
    if (store.sign !== tableRef.current.className && store.sign !== "first")
      return;
    store.setSign(tableRef.current.className);
    const { scrollTop: top, scrollLeft: left } = tableRef.current;
    let currentIndex = Math.floor((top + store.perHeight) / store.perHeight);
    let rowsBoxScrollTop;
    if (currentIndex < blocks.length - 1) {
      store.setCurrentIndex(currentIndex);
      rowsBoxScrollTop = top - (currentIndex - 1) * store.perHeight;
    } else {
      store.setCurrentIndex(currentIndex - 1);
      rowsBoxScrollTop = top - (currentIndex - 2) * store.perHeight + 2;
    }
    store.setCurrentTop(rowsBoxScrollTop);
    rowsRef.current.scrollTo({ left, top: rowsBoxScrollTop });
    store.setMiddleClickScroll(false);
    initSign();
  });

  const addScrollEvent = useCallback((node, eventFn) => {
    if (!eventFn) return;

    // node.addEventListener("mouseenter", async (e) => {
    //   console.log(
    //     store.isMiddleClickScroll,
    //     "store.isMiddleClickScroll",
    //     "444"
    //   );
    //   // if (!store.isMiddleClickScroll) {
    //   // console.log(store.isMiddleClickScroll, "store.isMiddleClickScroll");
    //   await store.setSign(node.className);
    //   // }
    // }); // 这里不同的节点用不同的 class 值
    let event = eventFn.bind(node);
    node.addEventListener("scroll", event);
  });

  useEffect(() => {
    if (tableRef.current && rowsRef.current && rows) {
      const blocks = chunk(rows, tableRef.current.offsetHeight / rowHeight);
      const perHeight = rowHeight * blocks[0]?.length;
      setBlocks(blocks);
      store.setPerHeight(perHeight);
      setClientHeight(tableRef.current.clientHeight);
      setOffsetHeight(tableRef.current.offsetHeight);
      // syncScroller(tableRef.current, rowsRef.current);
      const { sign } = store;
      addScrollEvent(rowsRef.current, rowsBoxScroll);
      addScrollEvent(tableRef.current, tableBoxScroll);
    }
  }, [tableRef.current, rowsRef.current, rows]);

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
        // top: !curentBolckIndex ? -offsetHeight + (offsetHeight % rowHeight) : 0,
      }}
    >
      <div
        className="preBufferRows"
        style={{
          // position: "absolute",
          height: store.perHeight,
          // top: -moveHeight - offsetHeight,
          pointerEvents: "auto",
        }}
      >
        {blocks[store.currentIndex - 1]?.map((value, index) => (
          <div
            key={index}
            style={{
              height: rowHeight,
              borderBottom: "solid 1px red",
              boxSizing: "border-box",
            }}
          >
            {value[fields?.[0]]}
          </div>
        ))}
      </div>
      <div
        className="currentRows"
        style={{
          // position: "absolute",
          height:
            store.currentIndex === blocks.length - 1
              ? "max-content"
              : store.perHeight,
          // height: blocks[curentBolckIndex] * rowHeight,
          top: -moveHeight,
          pointerEvents: "auto",
        }}
      >
        {blocks[store.currentIndex]?.map((value, index) => (
          <div
            key={index}
            style={{
              height: rowHeight,
              borderBottom: "solid 1px red",
              boxSizing: "border-box",
            }}
          >
            {value[fields[0]]}
          </div>
        ))}
      </div>

      <div
        className="nextBufferRows"
        style={{
          // position: "absolute",
          // top: -moveHeight + offsetHeight,
          height:
            store.currentTop > store.perHeight * 0.75 ||
            isEmpty(blocks[store.currentIndex + 1])
              ? "max-content"
              : offsetHeight - (offsetHeight % rowHeight),
          pointerEvents: "auto",
          // height: rowHeight * blocks[curentBolckIndex + 1]?.length,
          // height: offsetHeight - (offsetHeight % rowHeight),
          // overflow: "hidden",
        }}
      >
        {store.currentTop > store.perHeight * 0.75 &&
          blocks[store.currentIndex + 1]?.map((value, index) => (
            <div
              key={index}
              style={{
                height: rowHeight,
                borderBottom: "solid 1px red",
                boxSizing: "border-box",
              }}
            >
              {value[fields[0]]}
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
