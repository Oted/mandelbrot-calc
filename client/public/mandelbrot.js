/**
 *  This is a webworker and is called with messag arguments from the react App.js
 */

let result = [];
let hash = {};

const C = class C {
  /**
   *  Constructor for a class representing a complex number
   */
  constructor(r,i) {
    this.r = r;
    this.i = i;
    this.updatePows();
  }

  /**
   *  Unly updates this when ness
   */
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

/**
 *  Mandelbrot iteration over the given values from App.js
 */
const iterate = (xMin, xMax, yMin, yMax, nMax, s) => {
  let xDelt = (xMax - xMin);
  let yDelt = (yMax - yMin);
  let counter = 0;
  //test the values x and y with complex(x,y)
  for (let x = xMin; x < xMax; x+=s) {
    if (counter++ % 20 === 0) {post('progress', (x - xMin) / xDelt)};
    result = [];

    for (let y = yMin; y < yMax; y+=s) {
      let n = 0;
      let z = new C(0,0);
      // let c = new C(_getDiv(x,xDelt),_getDiv(y,yDelt));
      let c = new C(x,y);

      while ((z.getRPow() + z.getIPow()) <= 4 && n < nMax) {
        z = _getZ(z, c);
        n++;
      }

      result.push([c.getR(),c.getI(),n]);
    }

    post('draw', result);
  }
}

const _getZ = (z, c) => {
  z.setI(z.getR() * z.getI());
  z.setI(z.getI() + z.getI());
  z.setI(z.getI() + c.getI());
  z.setR(z.getRPow() - z.getIPow() + c.getR());
  z.updatePows();
  return z;
}

/**
 *  posting and receiving
 */
const post = (type, data) => {
  self.postMessage([type, data]);
}

self.onmessage = function(e) {
  console.log('got message', e.data);

  if (Array.isArray(e.data) && e.data.length === 6) {
    iterate(e.data[0], e.data[1], e.data[2], e.data[3], e.data[4], e.data[5]);
  } else {
    console.log('invalid args', e.data);
  }
}
