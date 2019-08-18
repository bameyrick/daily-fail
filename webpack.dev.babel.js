import merge from 'webpack-merge';
import WebpackShellPlugin from 'webpack-shell-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';

import commonConfig from './webpack.common.babel';

const common = commonConfig('development');

export default [
  merge(common.server, {
    plugins: [
      new WebpackShellPlugin({
        onBuildEnd: ['nodemon build/server.js --watch build'],
      }),

      new LiveReloadPlugin({ delay: 2000 }),
    ],
  }),

  merge(common.client, {
    plugins: [new LiveReloadPlugin({ delay: 2000 })],
  }),
];
