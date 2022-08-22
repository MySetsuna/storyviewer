import { makeAutoObservable } from 'mobx';

class TableStore {
    constructor() {
        makeAutoObservable(this);
    }
    rowHeight = 32;
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
    perRowNumber = 0;
    setPerRowNumber(val) {
        this.perRowNumber = val;
    }
    currentTop = 0;
    setCurrentTop(val) {
        this.currentTop = val;
    }
    isUp = undefined;
    setIsUp(val) {
        this.isUp = val;
    }
    totalScrollTop = 0;
    setTotalScrollTop(val) {
        this.totalScrollTop = val;
    }
    sign = 'first';
    setSign(val) {
        this.sign = val;
    }
    isMiddleClickScroll = false;
    setMiddleClickScroll(val) {
        this.isMiddleClickScroll = val;
    }
}

export default TableStore;
