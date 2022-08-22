import React, { useEffect, useState, useCallback, useRef } from 'react';
import { observer } from 'mobx-react';
import { chunk, debounce, isEmpty, throttle } from 'lodash';
import styles from './styles.module.less';
import VirtualRow from '../VirtualRow';

/**
 *
 * @type {React.FunctionComponent<{
 *  store: import("../../state").default,
 *  scrollBlock: {x: number, y: number},
 *  currentGroupFilters: [{value, title}],
 *  handleFieldSelect: (value: string) => void,
 *  setCurrentGroup: (value: string) => void,
 *  }>}
 */
const Rows = observer((props) => {
    const { fields, rows, tableRef, rowsRef, store, scrollBlock, rowHeight, tableHeight } = props;
    const [blocks, setBlocks] = useState([]);
    const [offsetHeight, setOffsetHeight] = useState(0);
    const listeners = useRef();

    const initSign = useCallback(
        debounce(() => {
            store.setSign('first');
        }, 100)
    );

    const rowsBoxScroll = useCallback(
        debounce(
            (e) => {
                if (store.sign !== e.target.className && store.sign !== 'first') return;
                store.setSign(rowsRef.current.className);
                const { scrollTop: top, scrollLeft: left } = rowsRef.current;
                const { currentTop: preTop, preIndex, perHeight } = store;
                let { currentIndex } = store;
                const isUp = preTop > top || preIndex > currentIndex;
                let currentScrollTop = top;
                store.setPreIndex(currentIndex);
                if (!isUp && top > perHeight * 1.25 && store.currentIndex < blocks.length - 2) {
                    currentIndex += 1;
                    currentScrollTop = top - perHeight;
                    store.setCurrentIndex(currentIndex);
                    store.setCurrentTop(currentScrollTop - 0.01);
                    rowsRef.current.scrollTo(left, currentScrollTop);
                } else if (isUp && store.currentIndex > 1 && top < perHeight / 2 && store.currentIndex < blocks.length - 1) {
                    currentScrollTop = top + perHeight;
                    currentIndex -= 1;

                    store.setCurrentIndex(currentIndex);
                    store.setCurrentTop(currentScrollTop + 0.01);
                    rowsRef.current.scrollTo(left, currentScrollTop);
                } else if (preIndex === currentIndex) {
                    // setTimeout(() => {
                    store.setCurrentTop(currentScrollTop + (isUp ? 0.01 : -0.01));
                    // });
                }
                tableRef.current.scrollTo(left, (currentIndex - 1) * perHeight + currentScrollTop);
                store.setMiddleClickScroll(false);
                initSign();
            },
            100,
            {
                leading: true,
                trailing: true,
            }
        )
    );

    const tableBoxScroll = useCallback(
        debounce(
            () => {
                if (store.sign !== tableRef.current.className && store.sign !== 'first') return;
                store.setSign(tableRef.current.className);
                const { scrollTop: top, scrollLeft: left } = tableRef.current;
                const currentIndex = Math.floor((top + store.perHeight) / store.perHeight);
                let rowsBoxScrollTop;
                if (currentIndex < blocks.length - 1) {
                    store.setCurrentIndex(currentIndex);
                    rowsBoxScrollTop = top - (currentIndex - 1) * store.perHeight;
                } else {
                    store.setCurrentIndex(currentIndex - 1);
                    rowsBoxScrollTop = top - (currentIndex - 2) * store.perHeight + 0.01;
                }
                store.setCurrentTop(rowsBoxScrollTop);
                rowsRef.current.scrollTo({ left, top: rowsBoxScrollTop });
                store.setMiddleClickScroll(false);
                initSign();
            },
            100,
            {
                leading: true,
                trailing: true,
            }
        )
    );

    const addScrollEvent = useCallback((node, eventFn) => {
        if (!eventFn) return;
        const event = eventFn.bind(node);
        listeners.current.push({ event, node });
        node.addEventListener('scroll', event);
    });

    useEffect(() => {
        if (tableRef.current && rowsRef.current && rows && tableHeight) {
            listeners.current = [];
            const blocks = chunk(rows, tableRef.current.offsetHeight / rowHeight);
            const perHeight = rowHeight * blocks[0]?.length;
            setBlocks(blocks);
            store.setPerHeight(perHeight);
            store.setPerRowNumber(blocks[0]?.length || 0);
            setOffsetHeight(tableRef.current.offsetHeight);
            // syncScroller(tableRef.current, rowsRef.current);
            addScrollEvent(rowsRef.current, rowsBoxScroll);
            addScrollEvent(tableRef.current, tableBoxScroll);
        }
        return () => {
            listeners.current?.forEach(({ node, event }) => {
                node?.removeEventListener('scroll', event);
            });
        };
    }, [tableRef.current, rowsRef.current, rows, tableHeight, rowHeight]);

    return (
        <div
            ref={rowsRef}
            className={styles.rows}
            style={{
                wordBreak: 'break-all',
                // height: `calc(100% - ${scrollBlock}px)`,
                // width: `calc(100% - ${scrollBlock}px)`,
                height: '100%',
                width: '100%',
                position: 'relative',
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
                    pointerEvents: 'auto',
                }}
            >
                {blocks[store.currentIndex - 1]?.map((value, index) => (
                    // <div
                    //     key={index}
                    //     style={{
                    //         height: rowHeight,
                    //         borderBottom: 'solid 1px red',
                    //         boxSizing: 'border-box',
                    //     }}
                    // >
                    //     {value[fields?.[1]?.value]}
                    // </div>
                    <VirtualRow rowHeight={rowHeight} rowData={value} key={`${value.rowId}${store.perRowNumber * store.currentIndex + index}`} fields={fields} />
                ))}
            </div>
            <div
                className="currentRows"
                style={{
                    height: store.currentIndex === blocks.length - 1 ? 'max-content' : store.perHeight,
                    pointerEvents: 'auto',
                }}
            >
                {blocks[store.currentIndex]?.map((value, index) => (
                    // <div
                    //     key={index}
                    //     style={{
                    //         height: rowHeight,
                    //         borderBottom: 'solid 1px red',
                    //         boxSizing: 'border-box',
                    //     }}
                    // >
                    //     {value[fields?.[1]?.value]}
                    // </div>
                    <VirtualRow rowHeight={rowHeight} rowData={value} key={`${value.rowId}${store.perRowNumber * store.currentIndex + index}`} fields={fields} />
                ))}
            </div>

            <div
                className="nextBufferRows"
                style={{
                    height: store.currentTop > store.perHeight * 0.75 || isEmpty(blocks[store.currentIndex + 1]) ? 'max-content' : offsetHeight - (offsetHeight % rowHeight),
                    pointerEvents: 'auto',
                }}
            >
                {store.currentTop > store.perHeight * 0.75 &&
                    blocks[store.currentIndex + 1]?.map((value, index) => (
                        // <div
                        //     key={index}
                        //     style={{
                        //         height: rowHeight,
                        //         borderBottom: 'solid 1px red',
                        //         boxSizing: 'border-box',
                        //     }}
                        // >
                        //     {value[fields?.[1]?.value]}
                        // </div>
                        <VirtualRow rowHeight={rowHeight} rowData={value} key={`${value.rowId}${store.perRowNumber * store.currentIndex + index}`} fields={fields} />
                    ))}
            </div>
        </div>
    );
});

export default Rows;
