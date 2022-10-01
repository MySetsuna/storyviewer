import { throttle } from "lodash";
import { PropTypes } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
const VirtualRows = (porps) => {
  const {
    rows,
    fields,
    visiblePos,
    isScrolling,
    overscan = 10,
    rowHeight = 42,
  } = porps;
  const { top, left, right, bottom } = visiblePos;
  const topSpeed = isScrolling ? rowHeight * overscan : 0;
  const leftSpeed = isScrolling ? rowHeight * overscan : 0;
  return (
    <>
      {rows.map(
        (row) =>
          top - topSpeed < row.bottom &&
          bottom + topSpeed > row.top && (
            <div
              key={row.id}
              style={{
                ...row.style,
                width: "100%",
              }}
            >
              {fields.map(
                (field) =>
                  left - leftSpeed < field.right &&
                  right + leftSpeed > field.left && (
                    <div
                      style={{
                        width: field.width,
                        left: field.left,
                        ...row.style,
                        position: "absolute",
                      }}
                      key={field.label}
                    >
                      {field.label}
                    </div>
                  )
              )}
            </div>
          )
      )}
    </>
  );
};

export default VirtualRows;
