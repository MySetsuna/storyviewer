import classNames from 'classnames';
import { isEmpty } from 'lodash';
import React, { useCallback } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
// import InfiniteLoader from 'react-window-infinite-loader';
import styles from './styles.module.less';

// const LOADING = 1;
// const LOADED = 2;
const VirtualTableContext = React.createContext({});
/**
 *
 * @type {React.FunctionComponent<{
 *  fields: [{value :string, title: string, component: React.ReactNode,style:{width}}],
 *  rowOverscan:number,
 *  cellOverscan: number,
 *  }>}
 */
const VirtualTable = ({ rows, fields, rowHeight = 42, rowOverscan = 5, defaultLoadingRow = 30, titleBackgroud, titleHeight = 42, cellOverscan = 1, className }) => {
    const tableRef = React.useRef();
    const virtualGrid = React.useRef();
    const domResizeObserver = React.useRef();
    const [itemStatusMap, setItemStatusMap] = React.useState({ startIndex: 0, stopIndex: 0, loadingCellIndex: 0 });

    const [offsetWidth, setOffsetWidth] = React.useState(0);
    const [offsetHeight, setOffsetHeight] = React.useState(0);

    React.useEffect(() => {
        const observer = new ResizeObserver(setTableBasicData.bind(this, tableRef.current));
        domResizeObserver.current = observer;
        observer.observe(tableRef.current);
    }, []);

    const setTableBasicData = React.useCallback((target) => {
        setOffsetHeight(target.offsetHeight);
        setOffsetWidth(target.offsetWidth);
    }, []);

    const onItemsRendered = useCallback(
        (params) => {
            const { visibleRowStartIndex, visibleRowStopIndex, visibleColumnStartIndex } = params;
            if (!isEmpty(rows)) {
                setItemStatusMap(Object.assign(itemStatusMap, { startIndex: visibleRowStartIndex }));
                setItemStatusMap(Object.assign(itemStatusMap, { endIndex: visibleRowStopIndex }));
                setItemStatusMap(Object.assign(itemStatusMap, { loadingCellIndex: visibleColumnStartIndex }));
            }
        },
        [rows]
    );

    const itemKey = ({ rowIndex, columnIndex }) => {
        const row = rows?.[rowIndex];
        const field = fields?.[columnIndex];
        return `${field?.value}-${row?.rowId}-${rowIndex}-${columnIndex}`;
    };
    return (
        <div ref={tableRef} className={classNames(styles.table, className)}>
            {/* <VirtualTableContext.Provider value={{ itemStatusMap, fields, rows, offsetWidth, titleBackgroud, titleHeight, rowOverscan }}> */}
            <Grid
                // itemData={{ rows, fields, offsetWidth }}
                itemKey={itemKey}
                ref={virtualGrid}
                overscanColumnCount={cellOverscan}
                overscanRowCount={defaultLoadingRow}
                columnCount={fields?.length}
                columnWidth={(index) => fields[index]?.width}
                height={offsetHeight}
                rowCount={rows.length}
                rowHeight={() => (true ? rowHeight : 85)}
                width={offsetWidth}
                // innerElementType={innerStickyGrid}
                // onItemsRendered={({ visibleRowStartIndex: visibleStartIndex, visibleRowStopIndex: visibleStopIndex }) =>
                //     onItemsRendered({ visibleStartIndex, visibleStopIndex })
                // }
                onItemsRendered={onItemsRendered}
            >
                {(props) => (
                    <Cell
                        itemStatusMap={itemStatusMap}
                        fields={fields}
                        rows={rows}
                        offsetWidth={offsetWidth}
                        titleBackgroud={titleBackgroud}
                        titleHeight={titleHeight}
                        rowOverscan={rowOverscan}
                        {...props}
                    />
                )}
            </Grid>
            {/* </VirtualTableContext.Provider> */}
        </div>
    );
};

const Cell = (props) => {
    const { columnIndex, rowIndex, style, itemStatusMap, offsetWidth, rowOverscan } = props;
    if (rowIndex < itemStatusMap.startIndex - rowOverscan || rowIndex > itemStatusMap.endIndex + rowOverscan) {
        return columnIndex === itemStatusMap.loadingCellIndex ? (
            <div className="loading" style={{ ...style, height: 0, left: 0, width: offsetWidth, transform: `translateY(${style.top}px)` }}>
                Loading...
            </div>
        ) : null;
    }
    const { fields, rows } = props;
    const field = fields?.[columnIndex];
    return (
        <div style={style}>
            {React.cloneElement(field?.component, {
                row: rows?.[rowIndex],
            })}
        </div>
    );
};

const innerStickyGrid = React.forwardRef(({ children, style }, ref) => {
    const { fields, titleBackgroud, titleHeight } = React.useContext(VirtualTableContext);
    const titleWidth = fields?.reduce((titleWidth, { width }) => titleWidth + width, 0);
    return (
        <div ref={ref} style={{ ...style, width: titleWidth }}>
            <div className={styles.stickyRow} style={{ background: titleBackgroud, height: titleHeight, top }}>
                {fields.map((field, index) => (
                    <div key={`${field.key}-title-${index}`} style={{ width: field.width, background: titleBackgroud, height: titleHeight }} className={styles.stickyCell}>
                        {typeof field?.title === 'string' ? <div className="string-title">{field.title}</div> : field?.title}
                    </div>
                ))}
            </div>
            {children}
        </div>
    );
});
innerStickyGrid.displayName = 'InnerStickyGrid';

const VirtualTable1 = VirtualTable;
export default VirtualTable1;
