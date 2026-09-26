// Port of docs/1kcomponents/app.js (Glimmer 1k components demo). Animation
// steps are driven explicitly: the op advances one step, startLoop() runs the
// original rAF animation. Point count comes from ?count= (default 1000).
import { Component, render } from 'inferno';
import { interpolateViridis } from 'd3-scale-chromatic';
import { createOpButton, installHarness } from '../shared/harness.js';

const Layout = { PHYLLOTAXIS: 0, GRID: 1, WAVE: 2, SPIRAL: 3 };
const LAYOUT_ORDER = [Layout.PHYLLOTAXIS, Layout.SPIRAL, Layout.PHYLLOTAXIS, Layout.GRID, Layout.WAVE];
const theta = Math.PI * (3 - Math.sqrt(5));

function map(arr, to) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(to(arr[i]));
  }
  return out;
}

class VizDemo extends Component {
  constructor(props, context) {
    super(props, context);
    this.layout = 0;
    this.step = 0;
    this.numSteps = 60 * 2;
    this.makePoints(props.count);
    props.controller.viz = this;
  }

  next() {
    this.step = (this.step + 1) % this.numSteps;
    if (this.step === 0) {
      this.layout = (this.layout + 1) % LAYOUT_ORDER.length;
    }
    // Clamp the linear interpolation at 80% for a pause at each finished layout state
    const pct = Math.min(1, this.step / (this.numSteps * 0.8));
    const currentLayout = LAYOUT_ORDER[this.layout];
    const nextLayout = LAYOUT_ORDER[(this.layout + 1) % LAYOUT_ORDER.length];
    const pxProp = xForLayout(currentLayout);
    const nxProp = xForLayout(nextLayout);
    const pyProp = yForLayout(currentLayout);
    const nyProp = yForLayout(nextLayout);

    this.points = this.points.map((point) => {
      const newPoint = { ...point };
      newPoint.x = lerp(newPoint, pct, pxProp, nxProp);
      newPoint.y = lerp(newPoint, pct, pyProp, nyProp);
      return newPoint;
    });
    this.setState();
  }

  makePoints(count) {
    const phyllotaxis = genPhyllotaxis(count);
    const grid = genGrid(count);
    const wave = genWave(count);
    const spiral = genSpiral(count);
    const points = [];
    for (let i = 0; i < count; i++) {
      const [gx, gy] = project(grid(i));
      const [wx, wy] = project(wave(i));
      const [sx, sy] = project(spiral(i));
      const [px, py] = project(phyllotaxis(i));
      points.push({ x: 0, y: 0, color: interpolateViridis(i / count), gx, gy, wx, wy, sx, sy, px, py });
    }
    this.points = points;
  }

  renderPoint(point) {
    return <Point x={point.x} y={point.y} color={point.color} />;
  }

  render() {
    return (
      <svg className="demo">
        <g $HasNonKeyedChildren>{map(this.points, this.renderPoint)}</g>
      </svg>
    );
  }
}

function Point({ x, y, color }) {
  return <rect className="point" transform={`translate(${Math.floor(x)}, ${Math.floor(y)})`} fill={color} />;
}

function xForLayout(layout) {
  switch (layout) {
    case Layout.PHYLLOTAXIS:
      return 'px';
    case Layout.GRID:
      return 'gx';
    case Layout.WAVE:
      return 'wx';
    case Layout.SPIRAL:
      return 'sx';
  }
}

function yForLayout(layout) {
  switch (layout) {
    case Layout.PHYLLOTAXIS:
      return 'py';
    case Layout.GRID:
      return 'gy';
    case Layout.WAVE:
      return 'wy';
    case Layout.SPIRAL:
      return 'sy';
  }
}

function lerp(obj, percent, startProp, endProp) {
  const px = obj[startProp];
  return px + (obj[endProp] - px) * percent;
}

function genPhyllotaxis(n) {
  return (i) => {
    const r = Math.sqrt(i / n);
    const th = i * theta;
    return [r * Math.cos(th), r * Math.sin(th)];
  };
}

function genGrid(n) {
  const rowLength = Math.round(Math.sqrt(n));
  return (i) => [-0.8 + (1.6 / rowLength) * (i % rowLength), -0.8 + (1.6 / rowLength) * Math.floor(i / rowLength)];
}

function genWave(n) {
  const xScale = 2 / (n - 1);
  return (i) => {
    const x = -1 + i * xScale;
    return [x, Math.sin(x * Math.PI * 3) * 0.3];
  };
}

function genSpiral(n) {
  return (i) => {
    const t = Math.sqrt(i / (n - 1));
    const phi = t * Math.PI * 10;
    return [t * Math.cos(phi), t * Math.sin(phi)];
  };
}

function project(vector) {
  const wh = window.innerHeight / 2;
  const ww = window.innerWidth / 2;
  const m = Math.min(wh, ww);
  return [vector[0] * m + ww, vector[1] * m + wh];
}

const controller = { viz: null };
const count = Number(new URLSearchParams(location.search).get('count') ?? 1000);
const root = document.getElementById('app');
render(
  <div className="app-wrapper">
    <VizDemo count={count} controller={controller} />
  </div>,
  root,
);

let looping = false;
function loop() {
  if (looping) {
    controller.viz.next();
    requestAnimationFrame(loop);
  }
}

installHarness({
  root: () => root,
  op: createOpButton(() => controller.viz.next()),
  extra: {
    startLoop() {
      looping = true;
      requestAnimationFrame(loop);
    },
    stopLoop() {
      looping = false;
    },
  },
});
