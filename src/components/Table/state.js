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
  // isUp = false;
  // setIsUp(val) {
  //   this.isUp = val;
  // }
  totalScrollTop = 0;
  setTotalScrollTop(val) {
    this.totalScrollTop = val;
  }
}

export default TableStore;
