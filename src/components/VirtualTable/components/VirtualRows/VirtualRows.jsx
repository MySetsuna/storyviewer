import classNames from 'classnames';
import React, { useEffect } from 'react';
import styles from './virtualRows.module.less';
import rafSchedule from 'raf-schd';
import { observer } from 'mobx-react';
const VirtualRows = (props) => {
    const scollingTimer = React.useRef(null);
    const [isScrolling, setIsScrolling] = React.useState(false);
    const { rows, fields, rowHeight = 42, tableRef, resizeData, totolWidth } = props;

    const [visibleWindowPos, setvisibleWindowPos] = React.useState({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        offsetWidth: 0,
        clientWidth: 0,
    });
    const { top, left, right, bottom, clientWidth } = visibleWindowPos;

    useEffect(() => {
        if (tableRef.current) {
            setvisibleWindowPos({
                top: 0,
                bottom: tableRef.current.clientHeight,
                left: 0,
                right: tableRef.current.clientWidth,
                clientWidth: tableRef.current.clientWidth,
            });
            tableRef.current.addEventListener('scroll', handleScroll);
        }
        return () => {
            tableRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, [tableRef.current]);

    useEffect(() => {
        if (!!resizeData) handleScroll(resizeData);
    }, [resizeData]);

    const handleScroll = React.useCallback(
        rafSchedule((e) => {
            if (!isScrolling) setIsScrolling(true);
            clearTimeout(scollingTimer.current);
            // aaa += 1;
            // console.log('触发次数:', aaa);
            const { scrollTop, scrollLeft, clientHeight, clientWidth } = e.target;
            setvisibleWindowPos({
                top: scrollTop,
                bottom: scrollTop + clientHeight,
                left: scrollLeft,
                right: scrollLeft + clientWidth,
                clientWidth,
            });
            props.setScrollLeft?.(scrollLeft);
            scollingTimer.current = setTimeout(() => {
                setIsScrolling(false);
            }, 100);
        }),
        []
    );

    return (
        <>
            {rows?.map((row, rowIndex) => {
                const styleTop = rowIndex * rowHeight;
                const stylebottom = styleTop + rowHeight;
                if (top > stylebottom || bottom < styleTop) return undefined;
                return (
                    <div
                        key={`${row.rowId}${rowIndex}`}
                        style={{
                            position: 'absolute',
                            boxSizing: 'border-box',
                            height: rowHeight,
                            top: styleTop,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'inherit',
                            overflow: 'hidden',
                            width: Math.max(totolWidth, visibleWindowPos.clientWidth),
                        }}
                        className={classNames(styles.hoverClassName, styles.widthBorder)}
                    >
                        {!row.isCreating &&
                            !row.isEmpty &&
                            fields.map((field, columnIndex) => {
                                let context;
                                if (!!props.cellRender && typeof props.cellRender === 'function') {
                                    context = props.cellRender(row, field);
                                } else {
                                    const Component = field.component;
                                    context = <Component row={row} />;
                                }

                                if (props.stickyCells?.includes(field.value)) {
                                    const stickyLeft = props.stickyPosMap.get(`${field.value}left`);
                                    const stickyRight = props.stickyPosMap.get(`${field.value}right`);
                                    if (right - stickyRight < field.right) {
                                        return (
                                            <div
                                                style={{
                                                    width: field.width,
                                                    height: rowHeight,
                                                    position: 'absolute',
                                                    left: clientWidth - field.width + left - props.stickyPosMap.get(`${field.value}right`),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    zIndex: 999999,
                                                    backgroundColor: props.backgroundColor,
                                                    boxShadow: '-6px 0px 8px 0px rgba(0, 0, 0, 0.45)',
                                                }}
                                                key={`${field.value}${columnIndex}`}
                                            >
                                                {context}
                                            </div>
                                        );
                                    }
                                    if (left + stickyLeft > field.left) {
                                        return (
                                            <div
                                                style={{
                                                    width: field.width,
                                                    height: rowHeight,
                                                    position: 'absolute',
                                                    left: left + props.stickyPosMap.get(`${field.value}left`),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    zIndex: 999999,
                                                    backgroundColor: props.backgroundColor,
                                                    boxShadow: '6px 0px 8px 0px rgba(0, 0, 0, 0.45)',
                                                }}
                                                key={`${field.value}${columnIndex}`}
                                            >
                                                {context}
                                            </div>
                                        );
                                    }
                                }
                                if (left > field.right || right < field.left) {
                                    return undefined;
                                }
                                return (
                                    <div
                                        style={{
                                            width: field.width,
                                            height: rowHeight,
                                            position: 'absolute',
                                            left: field.left,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            zIndex: field.style?.zIndex,
                                        }}
                                        key={`${field.value}${columnIndex}`}
                                    >
                                        {context}
                                    </div>
                                );
                            })}
                        {row.isEmpty && props.emptyRow}
                        {row.isCreating &&
                            React.cloneElement(props.creatorRow, {
                                row,
                            })}
                    </div>
                    // )
                );
            })}
        </>
    );
};

export default observer(VirtualRows);
