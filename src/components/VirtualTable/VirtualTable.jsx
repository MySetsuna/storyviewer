import React, { useEffect, useMemo, useRef } from 'react';
import styles from './styles.module.less';
import VirtualRows from './components/VirtualRows';
import VirtualTitleCell from './components/VirtualTitleCell';
import classNames from 'classnames';
import { Spin } from 'antd';
import { isEmpty } from 'lodash';
import rafSchedule from 'raf-schd';
import { useMemoizedFn } from 'ahooks';
/**
 *
 * @type {React.FunctionComponent<{
 *  fields: [{value :string, title: string, component: React.ReactNode}],
 *  filterGroups: [{value, title}],
 *  currentGroupFilters: [{value, title}],
 *  handleFieldSelect: (value: string) => void,
 *  setCurrentGroup: (value: string) => void,
 *  stickyCells: string[],
 *  }>}
 */
const VirtualTable = ({ rowHeight = 42, startSorting = 500, table, ...rest }) => {
    const tableRef = useRef();
    const [resizeData, setResizeData] = React.useState(null);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [clientWidth, setClientWidth] = React.useState(0);
    const [sorting, setSorting] = React.useState(false);
    const totalRowHeight = useMemo(() => rest.rows.length * rowHeight, [rest.rows.length, rest.fixedRow, rowHeight]);
    const fields = useMemo(() => {
        let fieldLeft = 0;
        return rest.fields?.map((filed) => {
            const left = fieldLeft;
            const { width, minWidth } = filed;
            const right = left + (width || minWidth);
            fieldLeft = fieldLeft + (width || minWidth);
            return {
                ...filed,
                left,
                right,
            };
        });
    }, [rest.fields]);
    const totolWidth = useMemo(() => {
        return (
            rest.fields.reduce((totolWidth, filed) => {
                const { width, minWidth } = filed;
                return totolWidth + (width || minWidth);
            }, 0) || 0
        );
    }, [rest.fields]);

    const stickyPosMap = useMemo(() => {
        let posLeft = 0;
        const stickyPosMap = new Map();
        rest.fields?.forEach((field) => {
            const stickyValue = rest.stickyCells?.find((value) => value === field.value);
            if (stickyValue) {
                stickyPosMap.set(`${stickyValue}left`, posLeft);
                posLeft += field.width;
            }
        });
        rest.fields?.forEach((field) => {
            const stickyValue = rest.stickyCells?.find((value) => value === field.value);
            if (stickyValue) {
                posLeft -= field.width;
                stickyPosMap.set(`${stickyValue}right`, posLeft);
            }
        });
        return stickyPosMap;
    }, [rest.stickyCells, rest.fields]);

    useEffect(() => {
        const observer = new ResizeObserver(handleResize);
        observer.observe(tableRef.current);
        return () => observer?.disconnect();
    }, []);

    useEffect(() => {
        if (tableRef.current) {
            tableRef.current.addEventListener('scroll', handleScroll);
        }
        return () => {
            tableRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, [tableRef.current]);

    const handleScroll = useMemoizedFn(
        rafSchedule((e) => {
            const { scrollLeft } = e.target;
            setScrollLeft?.(scrollLeft);
        })
    );

    const handleResize = React.useCallback((e) => {
        setResizeData(e[0]);
        setClientWidth(e[0]?.target?.clientWidth);
    }, []);
    const handleSort = useMemoizedFn((value) => {
        setSorting(value);
    });

    const { start, end, endStyles, startStyles } = rest.fixedRow || {};
    useEffect(() => {
        if (!!table && !!tableRef.current) {
            // eslint-disable-next-line no-param-reassign
            table.current = {
                dom: tableRef.current,
                action: {
                    scrollToBottom: () => {
                        tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight });
                    },
                },
            };
        }
    }, [table]);
    return (
        <div className={classNames(styles.table, rest.className)}>
            <div
                className={classNames(styles.widthBorder)}
                style={{ display: 'flex', background: rest.titleBackgroud, width: Math.max(totolWidth, clientWidth), right: scrollLeft, height: rowHeight, position: 'relative' }}
            >
                {fields.map((field) => {
                    let fieldItem = field || {};

                    if (rest.stickyCells?.includes(field.value)) {
                        const stickyLeft = stickyPosMap.get(`${field.value}left`);
                        const stickyRight = stickyPosMap.get(`${field.value}right`);

                        if (scrollLeft + clientWidth - stickyRight < field.right) {
                            fieldItem = {
                                ...field,
                                stickyStyle: {
                                    width: field.width,
                                    height: rowHeight,
                                    left: clientWidth - field.width + scrollLeft - stickyPosMap.get(`${field.value}right`) - field.left,
                                    zIndex: 3,
                                    position: 'relative',
                                    background: rest.titleBackgroud,
                                    boxShadow: '-6px 0px 8px 0px rgba(0, 0, 0, 0.45)',
                                },
                            };
                        }
                        if (scrollLeft + stickyLeft > field.left) {
                            fieldItem = {
                                ...field,
                                stickyStyle: {
                                    width: field.width,
                                    height: rowHeight,
                                    left: scrollLeft + stickyPosMap.get(`${field.value}left`) - field.left,
                                    zIndex: 3,
                                    position: 'relative',
                                    background: rest.titleBackgroud,
                                    boxShadow: '6px 0px 8px 0px rgba(0, 0, 0, 0.45)',
                                },
                            };
                        }
                    }
                    return <VirtualTitleCell titleClass={rest.titleClass} key={field.value} field={fieldItem} handleSort={rest.rows?.length > startSorting ? handleSort : null} />;
                })}
            </div>
            <div
                className="table-box"
                ref={tableRef}
                style={{
                    height: '100%',
                    width: '100%',
                    overflow: 'auto',
                    zIndex: 1,
                }}
            >
                {!!start && (
                    <div
                        style={{
                            height: rowHeight,
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            position: 'sticky',
                            top: 0,
                            left: 0,
                            backgroundColor: 'inherit',
                            zIndex: 999,
                            ...startStyles,
                        }}
                        className={classNames(styles.hoverClassName, styles.widthBorder)}
                    >
                        {start}
                    </div>
                )}

                <Spin spinning={sorting || rest.loading}>
                    {isEmpty(rest.rows) ? (
                        rest.emptyBox
                    ) : (
                        <div
                            style={{
                                height: totalRowHeight,
                                position: 'relative',
                            }}
                        >
                            <VirtualRows
                                {...rest}
                                tableRef={tableRef}
                                fields={fields}
                                resizeData={resizeData}
                                totolWidth={totolWidth}
                                totalRowHeight={totalRowHeight}
                                cellRender={rest.cellRender}
                                stickyPosMap={stickyPosMap}
                            />
                        </div>
                    )}
                </Spin>
                {!!end && (
                    <div
                        style={{
                            height: rowHeight,
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            position: 'sticky',
                            bottom: 0,
                            left: 0,
                            backgroundColor: 'inherit',
                            zIndex: 999,
                            ...endStyles,
                        }}
                        className={classNames(styles.hoverClassName, styles.widthTopBorder)}
                    >
                        {end}
                    </div>
                )}
            </div>
        </div>
    );
};
export default VirtualTable;
