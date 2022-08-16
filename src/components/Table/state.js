import { makeAutoObservable } from "mobx";

class TableStore {
  constructor() {
    makeAutoObservable(this);
  }

  currentIndex = 1;
  setCurrentIndex(val) {
    this.currentIndex = val;
  }
  perHeight = 0;
  setPerHeight(val) {
    this.perHeight = val;
  }
  // isUp = false;
  // setIsUp(val) {
  //   this.isUp = val;
  // }
  totalScrollTop;
  setTotalScrollTop(val) {
    console.log(val);
    this.totalScrollTop = val;
  }
}

export default TableStore;
