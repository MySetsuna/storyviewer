import { makeAutoObservable } from "mobx";

class TableStore {
  constructor() {
    makeAutoObservable(this);
  }

  currentIndex = 1;
  setCurrentIndex(val) {
    this.currentIndex = val;
  }
  preIndex = 1;
  setPreIndex(val) {
    this.preIndex = val;
  }
  perHeight = 0;
  setPerHeight(val) {
    this.perHeight = val;
  }
  currentTop = 0;
  setCurrentTop(val) {
    this.currentTop = val;
  }
  totalScrollTop = 0;
  setTotalScrollTop(val) {
    this.totalScrollTop = val;
  }
}

export default TableStore;
