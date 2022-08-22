import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './styles.module.less';

const VirtualRow = observer((props) => {
    const { tableRef, rowHeight, rowData, fields } = props;
    useEffect(() => {
        // console.log(tableRef?.current);
    }, [tableRef?.current]);
    return (
        <div
            style={{
                height: rowHeight,
            }}
            className={styles.virtualRow}
        >
            {fields.map((field, index) => (
                <div key={`${rowData.rowId}${field.value}${index}`} className={classNames('virtual-td', field.className)} style={{ ...field.style }}>
                    {React.cloneElement(field.component, {
                        rowData,
                    })}
                </div>
            ))}
        </div>
    );
});
export default VirtualRow;
