import { IFS, LSystem } from 'fractals';

export function lRenderer(canvas: HTMLCanvasElement, fractal: LSystem) {
  if (!canvas) {
    console.warn('canvas is null');
    return;
  }

  const offsetX = -fractal.bounds[2];
  const offsetY = -fractal.bounds[3];
  canvas.height = fractal.bounds[1] + Math.abs(fractal.bounds[3]) + 20;
  canvas.width = fractal.bounds[0] + Math.abs(fractal.bounds[2]) + 20;

  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.translate(10, 10);
  const color = 255 / fractal.points.length - 1;
  for (let i = 1; i < fractal.points.length; i++) {
    const [x, y, { paintable }] = fractal.points[i];
    if (!paintable) {
      continue;
    }
    ctx.beginPath();
    const [startX, startY] = fractal.points[i - 1];
    ctx.moveTo(startX + offsetX, startY + offsetY);
    ctx.strokeStyle = `hsl(${color * i}, 100%, 50%)`;
    ctx.lineTo(x + offsetX, y + offsetY);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.restore();
}

export function ifsRenderer(canvas: HTMLCanvasElement, fractal: IFS) {
  if (!canvas) {
    console.warn('canvas is null');
    return;
  }

  const offsetX = fractal.bounds[2];
  const offsetY = fractal.bounds[3];
  canvas.height = fractal.bounds[1] + Math.abs(fractal.bounds[3]) + 20;
  canvas.width = fractal.bounds[0] + Math.abs(fractal.bounds[2]) + 20;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.save();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(-offsetX + 10, offsetY + canvas.height - 10);
  ctx.scale(1, -1);

  const color = 255 / fractal.matrices.length - 1;

  for (let i = 0; i < fractal.points.length; i++) {
    const [x, y, { matrixNum }] = fractal.points[i];
    ctx.fillStyle = `hsl(${color * matrixNum}, 100%, 50%)`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}
