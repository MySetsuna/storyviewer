import React, { useEffect } from "react";
import { observer } from "mobx-react";

const BufferRows = observer((props) => {
  const { cellValues, rows, tableRef } = props;
  useEffect(() => {
    console.log(tableRef.current);
  }, [tableRef.current]);
  return (
    <div></div>
  );
});
export default BufferRows;
