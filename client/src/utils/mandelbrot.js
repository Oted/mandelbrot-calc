import {C} from '../C';
let result = [];
let div_hash = {};

const iterate = (xMin, xMax, yMin, yMax, nMax, s) => {
  result = [];

  //test the values x and y with complex(x,y)
  for (let x = xMin; x < xMax; x+=s) {
    this._progress(Math.abs(x - xMin) / (Math.abs(xMin) + Math.abs(xMax)));
    for (let y = yMin; y < yMax; y+=s) {
      let n = 0;
      let z = new C(0,0);
      let c = new C(this._getDiv(x,xMax),this._getDiv(y,yMax));

      while ((z.getRPow() + z.getIPow()) <= 4 && n < nMax) {
        z = this._getZ(z, c);
        n++;
      }

      result.push([c.getR(),c.getI(),n]);
      post('draw', this.result);
    }
  }

  return this.result;
}

const _getZ = (z, c) => {
  z.setI(z.getR() * z.getI());
  z.setI(z.getI() + z.getI());
  z.setI(z.getI() + c.getI());
  z.setR(z.getRPow() - z.getIPow() + c.getR());
  z.updatePows();
  return z;
}

const _getDiv = (a, b) => {
  const str = a + '/' + b;
  const val = this.div_hash[str];

  if (val) {
    return val;
  }

  this.div_hash[str] = a / b;
  return this.div_hash[str];
}

const post = (type, message) => {
  console.log('posting data ', type, message);
  self.postMessage('Hi');
}

self.onmessage = function(e) {
  console.log('Message received from main script');
  console.log('got message', e.data);
}
