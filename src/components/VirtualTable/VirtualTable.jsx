import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import styles from './styles.module.less';
import Rows from './components/Rows';
import TableStore from './state';
import ObserveSizeBox from '../ObserveSizeBox';

/**
 *
 * @type {React.FunctionComponent<{
 *
 *  fields: [{value :string, title: string, component: React.ReactNode}],,
 *  filterGroups: [{value, title}],
 *  currentGroupFilters: [{value, title}],
 *  handleFieldSelect: (value: string) => void,
 *  setCurrentGroup: (value: string) => void,
 *  rowHeight :number
 *  }>}
 */
const VirtualTable = observer(({ fields, rows, rowHeight, tableHeight }) => {
    const [store] = useState(new TableStore());
    const tableRef = useRef();
    const rowsRef = useRef();
    const [scrollBlock, setScrollBlock] = useState({ x: 0, y: 0 });
    // const fields = new Array(100).fill('category').map((category, index) => `${category}__${index}`.toUpperCase());
    // const rows = new Array(1000).fill(null).map((_, index) => {
    //     const row = {};
    //     fields.forEach((key) => {
    //         row[key] = index;
    //     });
    //     return row;
    // });
    useEffect(() => {
        if (tableRef.current) {
            const scrollBlockX = tableRef.current.offsetWidth - tableRef.current.clientWidth;
            const scrollBlockY = tableRef.current.offsetHeight - tableRef.current.clientHeight;
            setScrollBlock({ x: scrollBlockY, y: scrollBlockX });
        }
    }, [tableRef.current]);

    return (
        <div className={styles.table}>
            <div
                className="context-box"
                style={{
                    height: `calc(100% - ${scrollBlock.y}px)`,
                    width: `calc(100% - ${scrollBlock.x}px)`,
                }}
            >
                <Rows tableHeight={tableHeight} store={store} rows={rows} fields={fields} tableRef={tableRef} rowsRef={rowsRef} scrollBlock={scrollBlock} rowHeight={rowHeight} />
            </div>

            <div
                className="table-box"
                ref={tableRef}
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    overflow: 'scroll',
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        height: rows.length * rowHeight,
                        width: 150 * fields.length,
                        zIndex: -1,
                        pointerEvents: 'none',
                    }}
                ></div>
            </div>
        </div>
    );
});
export default VirtualTable;
