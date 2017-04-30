import React, { Component } from 'react';
import './App.css';
// let Mandelbrot = new Worker('/mandelbrot.js');

/**
1.	Seahorse Valley
-0.75, 0.1

2.	Elephant Valley
0.275, 0

3.	Triple Spiral Valley
-0.088,0.654

4.	Quad-Spiral Valley
0.274,0.482

7.	Double Scepter Valley
-0.1002,0.8383

5.	Scepter Valley
-1.36,0.005

8.	Mini Mandelbrot
-1.75,0

6.	Scepter Variant
-1.108,
0.230

9.	Another Mandelbrot
-0.1592,-1.0317
**/

class App extends Component {
  constructor() {
    super();

    this.height = 800;
    this.width = 1200;
    this.current_points = [];
    this.current_boxes = [];

    const startColors = [
      [0.9323656359627446, 0.7942651204375739, 3.809844101500997],
      [0.80901699437,1.61803398875, 2.42705098313],
      [1,1,1],
      [6.624459115312229, -6.976354113876891, -2.0703643976739547],
      [2.365688220101208, 0.9446999052794773, 3.9472993144931214],
      [6.795545985897607, -6.719446348473062, 2.767286146730843],
      [0.20815586834839928, 2.559426916543999, 6.140759597370099]
    ];

    const targetCol = startColors[Math.floor(Math.random() * startColors.length)];

    this.state = {
      'progress' : 0,
      'loading' : false,
      'zoom' : 1,
      'colors' : {
        'r' : targetCol[0],
        'g' : targetCol[1],
        'b' : targetCol[2]
      }
    }
  }

  _setScopeValues() {
    this.scale = 10;

    //calc x trasl factors
    this.xDelt = this.props.x_max - this.props.x_min;
    this.xNegRatio = Math.abs(this.props.x_max <= 0 ? 1 : this.props.x_min >= 0 ? 0 : this.props.x_min / this.xDelt);
    this.xNegSection = Math.abs(this.xNegRatio * this.width);
    this.xNegDeltSection = this.xDelt * this.xNegRatio;

    this.xPosRatio = 1 - this.xNegRatio;
    this.xPosSection = Math.abs(this.xPosRatio * this.width);
    this.xPosDeltSection = this.xDelt * this.xPosRatio;

    //calc y trasl factorn
    this.yDelt = this.props.y_max - this.props.y_min;
    this.yNegRatio = Math.abs(this.props.y_max <= 0 ? 1 : this.props.y_min >= 0 ? 0 : this.props.y_min / this.yDelt);
    this.yNegSection = Math.abs(this.yNegRatio * this.height);
    this.yNegDeltSection = this.yDelt * this.yNegRatio;
    this.yPosRatio = 1 - this.yNegRatio;
    this.yPosSection = Math.abs(this.yPosRatio * this.height);
    this.yPosDeltSection = this.yDelt * this.yPosRatio;

    console.log('App', this);
  }

  _refreshColors() {
    const colOrder3 = Math.random();
    const colOrder2 = Math.random();
    let col = {
      'r' : colOrder3 <= 0.333 ? Math.random() + 6 : colOrder2 <= 0.333 ? Math.random() + 2 : Math.random(),
      'g' : colOrder3 < 0.333 && colOrder3 <= 0.666 ? Math.random() + 6 : colOrder2 > 0.333 && colOrder2 <= 0.666 ? Math.random() + 2 : Math.random(),
      'b' : colOrder3 > 0.666 ? Math.random() + 6 : colOrder2 > 0.3 ? Math.random() + 2 : Math.random()
    };

    col.r = Math.random() > 0.5 ? col.r*-1 : col.r;
    col.g = Math.random() > 0.5 ? col.g*-1 : col.g;
    col.b = Math.random() > 0.5 ? col.b*-1 : col.b;

    this.setState({
      'colors' : col,
      'loading' : true
    });

    setTimeout(() => {
      this._draw(this.current_points);
    }, 100);
  }

  componentDidMount() {
    this.props.dispatch({
      type : "get_set",
      scope: {
        x_min: this.props.x_min,
        x_max: this.props.x_max,
        y_min: this.props.y_min,
        y_max: this.props.y_max,
        n_max: this.props.n_max,
        stepps: this.props.stepps
      }
    });

    this.setState({
      "loading" : true
    })
  }

  _reset() {
    this.current_points = [];
    this.current_boxes = [];
  }

  componentDidUpdate(prevProps) {
    //only draw if theres new points
    if (prevProps.latest_points[0] !== this.props.latest_points[0] ||
        prevProps.latest_points[1] !== this.props.latest_points[1]) {
      this._setScopeValues();
      this._draw(this.props.latest_points);
      this.current_points = [...this.current_points, ...this.props.latest_points];
      this.current_boxes.push(this.props.latest_box);
    }
  }

  render() {
    return (
      <div className="App">
        <div className='nav'>
          {this.state.loading ?
            <span className="loading">Loading<span>.</span><span>.</span><span>.</span></span> :
            this.state.zoom === 1 ?
              <span> Zoom where you want to explore </span> :
              <span> Done! </span>
          }
          {!this.state.loading ? <span onClick={(e) =>{ this._refreshColors() }} className='refresh-colors'> shuffle colors </span> : null}
        </div>
        <canvas
          id="canvas"
          width={this.width}
          onClick={(e) => { this._clicked(e)}}
          height={this.height}>
        </canvas>
      </div>
    );
  }

  _clicked(e) {
    if (this.state.loading) {
      return alert('its still lodaing');
    }

    var rect = this.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    let xStep = (this.props.x_max - this.props.x_min) / this.width
    let yStep = (this.props.y_max - this.props.y_min) / this.height

    let xCoord = this.props.x_min + xStep * x;
    let yCoord = this.props.y_max - yStep * y;

    let xMin = xCoord - (this.xDelt / this.scale);
    let xMax = xCoord + (this.xDelt / this.scale);

    let yMin = yCoord - (this.yDelt / this.scale);
    let yMax = yCoord + (this.yDelt / this.scale);

    this.ctx.fillStyle = "rgba("+255+","+0+","+0+",1)";

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.moveTo(this._translateX(xMin),this._translateY(yMax));
    this.ctx.lineTo(this._translateX(xMax),this._translateY(yMax));
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this._translateX(xMax),this._translateY(yMax));
    this.ctx.lineTo(this._translateX(xMax),this._translateY(yMin));
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this._translateX(xMax),this._translateY(yMin));
    this.ctx.lineTo(this._translateX(xMin),this._translateY(yMin));
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this._translateX(xMin),this._translateY(yMin));
    this.ctx.lineTo(this._translateX(xMin),this._translateY(yMax));
    this.ctx.stroke();

    setTimeout(() => {
      this._reset();

      this.props.dispatch({
        type : "get_set",
        split_section  : (this.state.zoom + 1) + ".1-1",
        scope: {
          x_min: xMin,
          x_max: xMax,
          y_min: yMin,
          y_max: yMax,
          n_max: this.props.n_max + 25 + Math.floor(this.state.zoom * this.state.zoom * 1.5),
          stepps: this.props.stepps
        }
      });

      this.setState({
        zoom : this.state.zoom + 1,
        loading : true
      });
    }, 50);
  }

  _draw(arr) {
    const oldC = this.ctx;
    window.requestAnimationFrame(() => {
      this.canvas = this.canvas || document.getElementById('canvas');

      if (this.canvas) {
        this.ctx = this.ctx || this.canvas.getContext('2d');
        this.ctx.clearRect(
          this._translateX(arr[0]),
          this._translateY(arr[1]) - this.height / this.props.split,
          this.width / this.props.split,
          this.height / this.props.split
        );

        for (let i = 0; i < arr.length; i+=3) {
          this._drawPoint(arr[i], arr[i+1], arr[i+2]);
        }

        if (this.current_boxes.length === this.props.split**2) {
          this.setState({
            loading : false
          });
        }
      }
    });
  }

  _drawPoint(x, y, n) {
    let r = 0;
    let g = 0;
    let b = 0;

    let c =  n / this.props.n_max;

    if (c < 1) {
      r = Math.floor(255 * Math.sin(c**-this.state.colors.r));
      g = Math.floor(255 * Math.sin(c**-this.state.colors.g));
      b = Math.floor(255 * Math.sin(c**-this.state.colors.b));
    }

    this.ctx.fillStyle = "rgba("+r+","+g+","+b+",1)";
    this.ctx.fillRect(
      this._translateX(x),
      this._translateY(y),
      1,
      1
    );
  }

  _translateX(x) {
    let newX = 0;

    if (x >= 0) {
      //if were only on the positive plane
      if (this.xPosRatio === 1) {
        newX = this.xPosSection * ((x - this.props.x_min) / this.xDelt);
      } else {
        newX = this.xNegSection + this.xPosSection * (x / this.xPosDeltSection);
      }
    } else {
      //if were only on the neg plane
      if (this.xNegRatio === 1) {
        newX = this.xNegSection * ((x - this.props.x_min) / this.xDelt);
      } else {
        newX = this.xNegSection - this.xNegSection * (x / this.xNegDeltSection) * -1;
      }
    }

    return newX;
  }

  _translateY(y) {
    let newY = 0;

    if (y >= 0) {
      //if were only on the positive plane
      if (this.yPosRatio === 1) {
        newY = this.yPosSection - this.yPosSection * ((y - this.props.y_min) / this.yDelt);
      } else {
        newY = this.yPosSection - this.yPosSection * (y / this.yPosDeltSection);
      }
    } else {
      //if were only on the neg plane
      if (this.yNegRatio === 1) {
        newY = this.yNegSection - this.yNegSection * ((y - this.props.y_min) / this.yDelt);
      } else {
        newY = this.yPosSection + this.yNegSection * (y / this.yNegDeltSection) * -1;
      }
    }

    return newY;
  }
}

export default App;
