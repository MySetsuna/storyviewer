const syncScroller = function () {
  let nodes = Array.prototype.filter.call(
    arguments,
    (item) => item instanceof HTMLElement
  );
  let max = nodes.length;
  if (!max || max === 1) return;
  let sign = 0; // 用于标注
  nodes.forEach((ele, index) => {
    ele.addEventListener("scroll", function () {
      // 给每一个节点绑定 scroll 事件
      if (!sign) {
        // 标注为 0 时 表示滚动起源
        sign = max - 1;
        let top = this.scrollTop;
        let left = this.scrollLeft;
        for (const node of nodes) {
          // 同步所有除自己以外节点
          if (node == this) continue;
          node.scrollTo(left, top);
        }
      } else --sign; // 其他节点滚动时 标注减一
    });
  });
};
// usage

// 在两个表格中用这种方法同步左中右
syncScroller(tableFixedLeft, tableMain, tableFixedRight);

let tableMain1, tableMain2; // 获取两个主表格的滚动主体节点

// 在外部依旧使用 标注法 同步两个主表格
addScrollEvent(tableMain1, function () {
  if (sign !== this.className) return;
  let left = this.scrollLeft,
    top = this.scrollTop;
  tableMain2.scrollTo(left, top);
});

addScrollEvent(tableMain2, function () {
  if (sign !== this.className) return;
  let left = this.scrollLeft,
    top = this.scrollTop;
  tableMain1.scrollTo(left, top);
});
