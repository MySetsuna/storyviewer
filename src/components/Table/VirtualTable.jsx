import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.less";
import Rows from "./components/Rows";
import TableStore from "./state";
import VirtualRows from "./components/VirtualRows";

/**
 *
 * @type {React.FunctionComponent<{
 *  fields: [{value :string, title: string, component: React.ReactNode}],,
 *  filterGroups: [{value, title}],
 *  currentGroupFilters: [{value, title}],
 *  handleFieldSelect: (value: string) => void,
 *  setCurrentGroup: (value: string) => void,
 *  }>}
 */
const VirtualTable = observer(({ rowHeight = 42, overscan = 2 }) => {
  const tableRef = useRef();
  const scollingTimer = React.useRef(null);
  const [isScrolling, setIsCrolling] = React.useState(false);
  const fields = React.useMemo(() => {
    let fieldLeft = 0;
    return new Array(100).fill("category").map((category, index) => {
      const left = fieldLeft + Math.min(150 * index, 300);
      const width = Math.min(150 * (index + 1), 300);
      const right = left + width;
      fieldLeft = left;
      return {
        label: `${category}__${index}`.toUpperCase(),
        width,
        left,
        right,
      };
    });
  }, []);
  const data = React.useMemo(
    () =>
      new Array(10000).fill(null).map((_, index) => {
        const top = index * rowHeight;
        const bottom = top + rowHeight;
        const row = {
          style: {
            top,
            height: rowHeight,
            display: "flex",
          },
          bottom,
          top,
          id: index,
        };
        fields.forEach((key) => {
          row[key] = `${key}${index}`;
        });
        return row;
      }),
    []
  );

  useEffect(() => {
    const observer = new ResizeObserver(handleResize);
    observer.observe(tableRef.current);
    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      setvisibleWindowPos({
        top: 0,
        bottom: tableRef.current.clientHeight,
        left: 0,
        right: tableRef.current.clientWidth,
      });
      tableRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      tableRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [tableRef.current]);

  const [visibleWindowPos, setvisibleWindowPos] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  const handleScroll = React.useCallback((e) => {
    setIsCrolling(true);
    clearTimeout(scollingTimer.current);
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = e.target;
    setvisibleWindowPos({
      top: scrollTop,
      bottom: scrollTop + clientHeight,
      left: scrollLeft,
      right: scrollLeft + clientWidth,
    });
    scollingTimer.current = setTimeout(() => {
      setIsCrolling(false);
    }, 100);
  }, []);

  const handleResize = React.useCallback((e) => handleScroll(e[0]), []);

  return (
    <div className={styles.table}>
      <div
        className="table-box"
        ref={tableRef}
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          overflow: "scroll",
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: data.length * rowHeight,
            width: fields.reduce(
              (totalWidth, item) => totalWidth + item.width,
              0
            ),
            background: "rgba(255, 99, 71, 0.1)",
          }}
        >
          <VirtualRows
            rows={data}
            fields={fields}
            visiblePos={visibleWindowPos}
            isScrolling={isScrolling}
          />
        </div>
      </div>
    </div>
  );
});
export default VirtualTable;
