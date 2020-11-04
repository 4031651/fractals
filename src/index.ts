import { LSystem, IFS, affine, radial, IIFSParams, IIFSMatrix } from 'fractals';
import formatHighlight from 'json-format-highlight';

import tpl from './tpl';
import { lRenderer, ifsRenderer } from './renderes';

import lData from './data/l.json';
import IFSData from './data/ifs.json';

const JSON_COLORS = {
  keyColor: '#9876AA',
  numberColor: '#6897BB',
  stringColor: '#6A8759',
  trueColor: '#CC7832',
  falseColor: '#CC7832',
  nullColor: '#CC7832',
} as const;

function $(selector: string) {
  return document.querySelector(selector);
}

function tabs(selector: string, onChange?: (s: string) => unknown) {
  $(`${selector} > .tabs`).addEventListener('click', (e) => {
    const tab = e.target as HTMLSpanElement;
    const selected = tab.getAttribute('aria-selected') === 'true';
    if (selected) {
      return;
    }

    $(`${selector} [aria-selected=true]`).setAttribute('aria-selected', 'false');
    tab.setAttribute('aria-selected', 'true');

    const toActivate = tab.getAttribute('aria-controls');

    $('.tab-pane.show').classList.remove('show');
    $(`.tab-pane[aria-labelledby="${toActivate}"]`).classList.add('show');

    if (typeof onChange === 'function') {
      onChange(toActivate);
    }
  });
}

function formatIFSConfig(config: IIFSParams) {
  return JSON.stringify(
    config,
    (k, v) => {
      if (k === 'matrices') {
        return v.map((m: IIFSMatrix) => `¤¤${JSON.stringify(m, null, ' ')}¤¤`);
      }
      return v;
    },
    2,
  )
    .replace(/\\"/g, '"')
    .replace(/"¤¤{/g, '{')
    .replace(/}¤¤"/g, ' }')
    .replace(/\\n/g, '');
}

function render(type: string, name: string) {
  if (type === 'l') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const config = lData[name];
    if (!config) {
      return;
    }

    $('#config').innerHTML = formatHighlight(config, JSON_COLORS);

    const fractal = new LSystem(config);
    fractal.run();

    const canvas = $('#canvas') as HTMLCanvasElement;
    lRenderer(canvas, fractal);
    return;
  }

  if (type === 'ifs') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const config = IFSData[name];
    if (!config) {
      return;
    }

    $('#config').innerHTML = formatHighlight(formatIFSConfig(config), JSON_COLORS);

    const fractal = new IFS({
      ...config,
      equation: config.equation === 'radial' ? radial : affine,
    });
    fractal.run();

    const canvas = $('#canvas') as HTMLCanvasElement;

    ifsRenderer(canvas, fractal);
    return;
  }

  console.warn(`render():: Unknown fractal type ${type}`);
}

document.addEventListener('DOMContentLoaded', () => {
  const active = Object.keys(lData)[0];
  $('#l-examples').innerHTML = tpl('examples', {
    fractals: lData,
    active,
  });

  $('#ifs-examples').innerHTML = tpl('examples', {
    fractals: IFSData,
    active,
  });

  $('#l-examples').addEventListener('click', (e) => {
    const { fractal } = (<HTMLLIElement>e.target).dataset;
    if (!fractal) {
      return;
    }

    $('#l-examples .active')?.classList.remove('active');
    (<HTMLLIElement>e.target).classList.add('active');

    render('l', fractal);
  });

  $('#ifs-examples').addEventListener('click', (e) => {
    const { fractal } = (<HTMLLIElement>e.target).dataset;
    if (!fractal) {
      return;
    }

    $('#ifs-examples .active')?.classList.remove('active');
    (<HTMLLIElement>e.target).classList.add('active');

    render('ifs', fractal);
  });

  tabs('#tabs');

  render('l', active);
});
