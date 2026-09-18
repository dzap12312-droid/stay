const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');

const cache = {};

async function icon(name, color) {
  const key = name + '|' + color;
  if (cache[key]) return cache[key];
  if (!fa[name]) throw new Error('unknown icon: ' + name);
  let svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { size: 256, color: '#' + color }));
  svg = svg.replace(/currentColor/g, '#' + color);
  const buf = await sharp(Buffer.from(svg))
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  cache[key] = 'image/png;base64,' + buf.toString('base64');
  return cache[key];
}

module.exports = { icon };
