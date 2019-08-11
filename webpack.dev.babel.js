import merge from 'webpack-merge';
import WebpackShellPlugin from 'webpack-shell-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';

import { commonConfig } from './webpack.common';

export default merge(commonConfig, {
	mode: 'development',

	plugins: [
		new WebpackShellPlugin({
			onBuildEnd: ['nodemon build/server.js --watch build'],
		}),

		new LiveReloadPlugin({ delay: 1000 }),
	],
});
