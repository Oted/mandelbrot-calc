export class C {
  constructor(r,i) {
    this.r = r;
    this.i = i;
    this.updatePows();
  }


  updatePows() {
    this.rPow = this.r * this.r;
    this.iPow = this.i * this.i;
  }

  getI() {
    return this.i;
  }

  getR() {
    return this.r;
  }

  getRPow() {
    return this.rPow;
  }

  getIPow() {
    return this.iPow;
  }

  setI(i) {
    this.i = i;
  }

  setR(r) {
    this.r = r;
  }

  toString() {
    return this.r + ',' + this.i + 'i';
  }
}


