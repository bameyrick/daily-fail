const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const mqoptimize = require('postcss-mq-optimize');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');

const baseHref = '';
const deployUrl = '';

module.exports = function() {
  // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
  const minimizeOptions = {
    autoprefixer: false,
    safe: true,
    mergeLonghand: false,
    discardComments: {
      removeAll: true,
    },
  };

  return [
    postcssUrl({
      url: URL => {
        URL = URL.url;

        // Only convert root relative URLs, which CSS-Loader won't process into require().
        if (!URL.startsWith('/') || URL.startsWith('//')) {
          return URL;
        }
        if (deployUrl.match(/:\/\//)) {
          // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
          return `${deployUrl.replace(/\/$/, '')}${URL}`;
        } else if (baseHref.match(/:\/\//)) {
          // If baseHref contains a scheme, include it as is.
          return baseHref.replace(/\/$/, '') + `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
        } else {
          // Join together base-href, deploy-url and the original URL.
          // Also dedupe multiple slashes into single ones.
          return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
        }
      },
    }),
    autoprefixer(),
    mqpacker({ sort: true }),
    mqoptimize(),
    cssnano(minimizeOptions),
  ];
};
