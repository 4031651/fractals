/* eslint-disable no-new-func,prefer-template,operator-linebreak */
/*
Based on JavaScript Micro-Templating by John Resig
https://johnresig.com/blog/javascript-micro-templating/
 */

type TData = Record<string, any>;
type TRenderer = (d: TData) => string;

const cache: Record<string, TRenderer> = {};

function t(str: string) {
  return new Function(
    'obj',
    'var p=[],print=function(){p.push.apply(p,arguments);};' +
      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +
      // Convert the template into pure JavaScript
      str
        .replace(/[\r\t\n]/g, ' ')
        .split('<%')
        .join('\t')
        .replace(/((^|%>)[^\t]*)'/g, '$1\r')
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split('\t')
        .join("');")
        .split('%>')
        .join("p.push('")
        .split('\r')
        .join("\\'") +
      "');}return p.join('');",
  );
}

export default function tml(str: string, data: TData) {
  if (!cache[str]) {
    cache[str] = t(document.getElementById(str).innerHTML) as TRenderer;
  }

  return cache[str](data);
}
