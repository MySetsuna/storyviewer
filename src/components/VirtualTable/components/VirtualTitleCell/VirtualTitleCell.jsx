import React, { useMemo } from 'react';
import { observer, useLocalObservable } from 'mobx-react';
import classNames from 'classnames';
import styles from './styles.module.less';
import ReactDOM from 'react-dom';
import { useMemoizedFn } from 'ahooks';

/**
 * @param {[]} stickyCells //保持可见列,目前只支持一列
 * @type {React.FunctionComponent<{
 *  resizeTrigger: 'move' || 'end' ,
 *  field: {renderTitle: ()=> ReactNode, title: string | React.FunctionComponent},
 *  stickyCells:[]
 *  }>}
 */
const VirtualTitleCell = observer((props) => {
    const { field } = props;
    const Title = field.title;
    const state = useLocalObservable(() => ({
        lastCellWidth: field.width || field.style?.width,
        setLastCellWidth(val) {
            this.lastCellWidth = val;
        },
        initMousePositionX: 0,
        setiIitMousePositionX(val) {
            this.initMousePositionX = val;
        },
    }));

    const updateResizeState = useMemoizedFn((e) => {
        const { initMousePositionX, lastCellWidth } = state;
        const offset = e.clientX - initMousePositionX;
        // if (lastCellWidth + offset <= field.minWidth) return;
        const newWidth = Math.max(lastCellWidth + offset, field.minWidth);
        field.resize(newWidth);
    });

    const onResizeMove = useMemoizedFn((e) => updateResizeState(e));
    const onResizeEnd = useMemoizedFn((e) => {
        updateResizeState(e);
        window.removeEventListener('mousemove', onResizeMove);
        window.removeEventListener('mouseup', onResizeEnd);
        state.setiIitMousePositionX(0);
        state.setLastCellWidth(field.width);
    });

    const onResizeStart = useMemoizedFn((e) => {
        e.stopPropagation();
        state.setiIitMousePositionX(e.clientX);
        updateResizeState(e);
        // 开始监听鼠标移动
        // 初始化鼠标位置
        window.addEventListener('mousemove', onResizeMove);
        window.addEventListener('mouseup', onResizeEnd);
    });

    const titleContext = useMemo(() => {
        switch (true) {
            case typeof field.renderTitle === 'function':
                return field.renderTitle();
            case typeof field.titleComponent === 'object':
                return field.titleComponent;
            case typeof field.title === 'object':
                return <Title />;
            case typeof field.title === 'object':
                return field.title;
            case typeof field.title === 'string':
                return <div className="string-title">{field.title}</div>;
            default:
                return field.title;
                break;
        }
    }, [field.title, field.renderTitle, field.titleComponent]);

    // return <>9</>;
    return (
        <>
            {state.initMousePositionX > 0 && ReactDOM.createPortal(<div className={styles.resizeBlock}></div>, document.body)}
            <div
                style={{
                    ...field.style,
                    width: field.width || field.style?.width || field.minWidth || 10,
                    zIndex: !!state.initMousePositionX ? 9999999 : field.style?.zIndex || 1,
                    ...field.stickyStyle,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (typeof field.sort === 'function')
                        setImmediate(() => {
                            field.sort(0);
                            setImmediate(() => props.handleSort?.(false));
                        });
                }}
                className={classNames(styles.virtualCell, 'pipeline-td', props.titleClass)}
            >
                {titleContext}
                {typeof field.sort === 'function' ? (
                    <div
                        className="sort-box"
                        onClick={(e) => {
                            props.handleSort?.(true);
                            e.stopPropagation();
                            setImmediate(() => {
                                field.sort(0);
                                setImmediate(() => props.handleSort?.(false));
                            });
                        }}
                    >
                        <span
                            className={`top ${field.sortValue === 1 && 'is-active'}`}
                            onClick={(e) => {
                                props.handleSort?.(true);
                                e.stopPropagation();
                                setImmediate(() => {
                                    field.sortValue === 1 ? field.sort(0) : field.sort(1);
                                    setImmediate(() => props.handleSort?.(false));
                                });
                            }}
                        ></span>
                        <span
                            className={`bottom ${field.sortValue === -1 && 'is-active'}`}
                            onClick={(e) => {
                                props.handleSort?.(true);
                                e.stopPropagation();
                                setImmediate(() => {
                                    field.sortValue === -1 ? field.sort(0) : field.sort(-1);
                                    setImmediate(() => props.handleSort?.(false));
                                });
                            }}
                        ></span>
                    </div>
                ) : (
                    ''
                )}
                {typeof field.resize === 'function' && (
                    <div className={styles.resizeCell} onMouseDown={onResizeStart}>
                        <div
                            className={classNames('draggable-line', typeof field.resize === 'function' && 'hover-title', state.initMousePositionX && styles.resizing)}
                            // style={{ height: state.initMousePositionX ? offsetHeight - scrollBarWidth : '100%', position: state.initMousePositionX ? 'fixed' : 'absolute' }}
                        ></div>
                    </div>
                )}
            </div>
        </>
    );
});
export default VirtualTitleCell;
