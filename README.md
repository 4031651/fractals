Tiny, dependency free library to easily generate fractals
===

This library allows you to generate fractals in two different ways:
* [IFS](https://en.wikipedia.org/wiki/Iterated_function_system)
* [L-system](https://en.wikipedia.org/wiki/L-system)

[Live Demo](https://4031651.github.io/fractals/)

# Installation

```shell script
npm install fractals #npm
yarn add fractals #yarn
```

# Usage

```typescript
import { IFS, LSystem } from 'fractals';
import type { TBounds } from 'fractals';
// or separtly
import { IFS } from 'fractals/lib/ifs';
import { LSystem } from 'fractals/lib/l';
import type { TBounds } from 'fractals/lib/types';
```

# API

## Common types

Both classes implement the `IFractal` interface.

```typescript
type TPoint = [x: number, y: number, meta: Record<string, unknown>];
type TBounds = [maxX: number, maxY: number, minX: number, minY: number];
type TPointCb = (p: TPoint, i: number) => unknown;

interface IFractal {
  readonly points: TPoint[]; // Array of generated points
  bounds: TBounds; // Bounding box of generated points
  run(fn?: TPointCb): void; // Function to start calculation process
}
```

## IFS

An excellent material with many examples about IFS can be read [here](http://paulbourke.net/fractals/ifs/).

### Types

```typescript
interface IIFSMatrix {
  // The probability of choosing the current matrix
  p: number;
  // A set of constants for the equation for calculating the next point
  [$key: string]: number;
}
type TEPoint = { x: number; y: number };
// The equation for calculating the next point
type TEquation = (x: number, y: number, m: IIFSMatrix) => TEPoint;

// The type of the result point. matrixNum - the number of the matrix
// that was chosen to generate the point. It can be useful for
// debugging or coloring points depending on the matrix.
type TIFSPoint = [x: number, y: number, meta: { matrixNum: number }];
```

### Predefined equation

There are two predefined equations: 
* affine <br/> ![affine formula](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7Dx_%7Bn%2B1%7D%5C%5Cy_%7Bn%2B1%7D%5Cend%7Bpmatrix%7D%3D%5Cbegin%7Bpmatrix%7Da%26b%5C%5Cc%26d%20%0A%5Cend%7Bpmatrix%7D%0A%5Cbegin%7Bpmatrix%7Dx_%7Bn%7D%5C%5Cy_%7Bn%7D%5Cend%7Bpmatrix%7D%20%2B%20%5Cbegin%7Bpmatrix%7De%5C%5Cf%0A%5Cend%7Bpmatrix%7D)
* radial <br/> ![radial formula](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7Dx_%7Bn%2B1%7D%5C%5Cy_%7Bn%2B1%7D%5Cend%7Bpmatrix%7D%3D%5Cbegin%7Bpmatrix%7D%0Aa%20*%5Ccos%20(%5Ctheta)%20%26%20-%20b*%20%5Csin%20(%5Ctheta)%0A%5C%5C%0Aa%20*%5Csin%20(%5Ctheta)%20%26%20b*%20%5Ccos%20(%5Ctheta)%0A%5Cend%7Bpmatrix%7D%0A%5Cbegin%7Bpmatrix%7Dx_%7Bn%7D%5C%5Cy_%7Bn%7D%5Cend%7Bpmatrix%7D%20%2B%20%5Cbegin%7Bpmatrix%7De%5C%5Cf%0A%5Cend%7Bpmatrix%7D)

Don't worry, as a code these formulas are not as scary as they seem:
```typescript
export function affine(x: number, y: number, m: IIFSMatrix): TEPoint {
  const { a, b, c, d, e, f } = m;
  const newX = x * a + y * b + e;
  const newY = x * c + y * d + f;

  return { x: newX, y: newY };
}

export function radial(x: number, y: number, m: IIFSMatrix): TEPoint {
  const { a, b, t, e, f } = m;
  const newX = x * a * Math.cos(t) - y * b * Math.sin(t) + e;
  const newY = x * a * Math.sin(t) + y * b * Math.cos(t) + f;

  return { x: newX, y: newY };
}
```
Other classes of simple geometric transformations can also be used
to construct the IFS. For example, projective:
```
X' = (ax*X + bx*Y + cx) / (dx*X + ex*Y + fx)
Y' = (ay*X + by*Y + cy) / (dy*X + ey*Y + fy)
```
or quadratic:
```
X' = ax*X*X + bx*X*Y + cx*Y*Y + dx*X + ex*Y + fx
Y' = ay*X*X + by*X*Y + cy*Y*Y + dy*X + ey*Y + fy
```

### Matrices
 The required matrix property is `p`.
 This is the probability of choosing a given matrix. 
 All other fields depend on the equation. For example,
 Barnsley Fern is calculated using affine transformations
 with the following matrices:
 
Transformation | Transition | Probability
-------------- | ---------- | -----------
![m1tf](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0%260%5C%5C0%260.16%5Cend%7Bpmatrix%7D) | ![m1ts](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0%5C%5C0%5Cend%7Bpmatrix%7D)  | 1%
![m2tf](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0.85%260.04%5C%5C-0.04%260.85%5Cend%7Bpmatrix%7D) | ![m2ts](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0%5C%5C1.6%5Cend%7Bpmatrix%7D) | 85%
![m3tf](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0.2%26-0.26%5C%5C0.23%260.22%5Cend%7Bpmatrix%7D) | ![m3ts](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0%5C%5C1.6%5Cend%7Bpmatrix%7D) | 7%
![m4tf](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D-0.15%260.28%5C%5C0.26%260.24%5Cend%7Bpmatrix%7D) | ![m4ts](https://render.githubusercontent.com/render/math?math=%5Cbegin%7Bpmatrix%7D0%5C%5C0.44%5Cend%7Bpmatrix%7D) | 7%

The matrices' configuration will be as follows:

```typescript
const fern = {
  matrices: [
    { a: 0,     b: 0,     c: 0,     d: 0.16, e: 0, f: 0,    p: 0.01 },
    { a: 0.85,  b: 0.04,  c: -0.04, d: 0.85, e: 0, f: 1.6,  p: 0.85 },
    { a: 0.2,   b: -0.26, c: 0.23,  d: 0.22, e: 0, f: 1.6,  p: 0.07 },
    { a: -0.15, b: 0.28,  c: 0.26,  d: 0.24, e: 0, f: 0.44, p: 0.07 },
  ],
};
```

### Properties

 * `matrices: IIFSMatrix[]` - array of given matrices
 * `points: TIFSPoint[]` - Calculated points.
 * `bounds: TBounds` - Bounding box of the calculated points in format [maxX, maxY, minX, minY].
  Will be filled in after calling the `run()` method.

### Methods

 * `constructor(params: IIFSParams)`
```typescript
interface IIFSParams {
  // Array of matrices
  matrices: IIFSMatrix[];
  // Think of this parameter as the scale of the plot.
  // The larger the number, the fewer points will be per area unit.
  density?: number;
  // Number of iterations (points)
  iterations?: number;
  // Formula for calculating points.
  // You can use one of the predefined ones or write your own.
  equation?: TEquation;
}
```
 * `run(callback?)`  
  Starts the calculation process. You can pass a callback function that
  will be called after each point is calculated. This will help to 
  achieve higher performance by removing the extra cycle for 
  drawing the fractal. Be careful - the bounds of points may be 
  incorrect until the end of the calculation of the entire fractal.

### Render function example

```typescript
function canvasRenderer(canvas: HTMLCanvasElement, fractal: IFS) {
  if (!canvas) {
    console.warn('canvas is null');
    return;
  }

  const offsetX = fractal.bounds[2];
  const offsetY = fractal.bounds[3];
  // margins is 10 px
  canvas.height = fractal.bounds[1] + Math.abs(fractal.bounds[3]) + 20;
  canvas.width = fractal.bounds[0] + Math.abs(fractal.bounds[2]) + 20;

  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // margins
  ctx.translate(-offsetX + 10, offsetY + canvas.height - 10);
  ctx.scale(1, -1);

  const color = 255 / fractal.matrices.length - 1;

  for (let i = 0; i < fractal.points.length; i++) {
    const [x, y, { matrixNum }] = fractal.points[i];
    ctx.fillStyle = `hsl(${color * m}, 100%, 50%)`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

document.addEventListener('DOMContentLoaded', () => {
  const fractal = new IFS(config);
  fractal.run();

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvasRenderer(canvas, fractal);
});
```

## L-system

An excellent material with many examples about L-system can be read [here](http://paulbourke.net/fractals/lsys/).

### Commands

The following commands are supported:

Character | Meaning
--------- | -------
F | Move forward by line length drawing a line
B | Move backward by line length drawing a line
&plus; | Turn left by turning angle
&minus; | Turn right by turning angle
[ | Push current drawing state onto stack
] | Pop current drawing state from the stack
&lt; | Multiply the line length by the line length scale factor
&gt; | Divide the line length by the line length scale factor


### Types
```typescript
// The type of the result point.
// paintable - currently used to work with the stack. 
// When a point was added as a result of the ']' (pop) command.
type TLPoint = [x: number, y: number, meta: { paintable: boolean }];
```
### Properties

 * `points: TLPoint[]` - Calculated points.
 * `bounds: TBounds` - Bounding box of the calculated points in format [maxX, maxY, minX, minY].
  Will be filled in after calling the `run()` method.

### Methods

* `constructor(params: ILParams)`
```typescript
interface ILParams {
  // Initial string string with commands, e.g. 'X'
  axiom: string;
  // Hash with replacement rules
  // {
  //    F: 'FF', - All occurrences of the character "F" will be replaced with the sequence "FF"
  //    X: 'F-[[X]+X]+F[+FX]-X', - and all occurrences of the character "X" will be replaced with the sequence "F-[[X]+X]+F[+FX]-X"
  // }
  rules: Record<string, string>;
  // The number of replacement iterations
  iterations: number;
  // The initial length of the line.
  distance: number;
  // Angle of rotation.
  angle: number;
  // Length scaling factor. See commands `&lt;` and `&gt;`
  lengthScale?: number;
}
```
 * `run(callback?)`  
  Starts the calculation process. You can pass a callback function that
  will be called after each point is calculated. This will help to 
  achieve higher performance by removing the extra cycle for 
  drawing the fractal. Be careful - the bounds of points may be 
  incorrect until the end of the calculation of the entire fractal.

### Render function example

```typescript
function canvasRenderer(canvas: HTMLCanvasElement, fractal: LSystem) {
  if (!canvas) {
    console.warn('canvas is null');
    return;
  }

  const offsetX = -fractal.bounds[2];
  const offsetY = -fractal.bounds[3];
  // margins is 10 px
  canvas.height = fractal.bounds[1] + Math.abs(fractal.bounds[3]) + 20;
  canvas.width = fractal.bounds[0] + Math.abs(fractal.bounds[2]) + 20;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.save();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(10, 10); // margins

  const color = 255 / fractal.points.length - 1;

  for (let i = 1; i < fractal.points.length; i++) {
    const [x, y, { paintable }] = fractal.points[i];
    if (!paintable) {
      continue;
    }

    ctx.beginPath();
    const [startX, startY] = fractal.points[i - 1];
    ctx.strokeStyle = `hsl(${color * i}, 100%, 50%)`;
    ctx.moveTo(startX + offsetX, startY + offsetY);
    ctx.lineTo(x + offsetX, y + offsetY);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.restore();
}

document.addEventListener('DOMContentLoaded', () => {
  const fractal = new LSystem(config);
  fractal.run();

  const canvas = document.getElementById('canv') as HTMLCanvasElement;
  canvasRenderer(canvas, fractal);
});
```

# Links

* [L-System User Notes](http://paulbourke.net/fractals/lsys/)
* [IFS manual](http://paulbourke.net/fractals/ifs/)
* [Iterated Function Systems](https://www.anthony-galea.com/blog/post/iterated-function-systems/) - From here you can take several matrices and look at an example of the IFS implementation in the clojure language.
* [Classic Iterated Function Systems](https://larryriddle.agnesscott.org/ifs/fractalIndex.htm) - Lots of interesting articles about fractals. List of well-known fractals with matrices to generate them.
