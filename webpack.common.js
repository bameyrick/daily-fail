import * as path from 'path';
import { NoEmitOnErrorsPlugin, NamedModulesPlugin } from 'webpack';
import ProgressPlugin from 'webpack/lib/ProgressPlugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries';

import postcssPlugins from './postcss.config';

export const commonConfig = {
	target: 'node',

	externals: [nodeExternals()],

	node: {
		__dirname: false,
	},

	context: `${__dirname}/src`,

	entry: {
		server: ['./server/index.ts'],
		styles: ['./styles/index.scss'],
	},

	output: {
		path: path.join(process.cwd(), 'build'),
		filename: '[name].js',
		chunkFilename: '[id].js',
	},

	resolve: {
		extensions: ['.ts', '.js', '.json', '.scss'],
		modules: ['./node_modules'],
		symlinks: true,
	},

	resolveLoader: {
		modules: ['./node_modules'],
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /(node_modules)/,
				use: ['ts-loader'],
			},
			{
				test: /\.scss$|\.sass$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'css/[name].css',
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							plugins: postcssPlugins,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
							precision: 8,
							// includePaths: [path.resolve('./src/client/styles')],
						},
					},
				],
			},
		],
	},

	plugins: [
		new NoEmitOnErrorsPlugin(),

		new ProgressPlugin(),

		new CircularDependencyPlugin({
			exclude: /(\\|\/)node_modules(\\|\/)/,
			failOnError: false,
		}),

		new NamedModulesPlugin({}),

		new FixStyleOnlyEntriesPlugin({
			extensions: ['scss'],
			silent: true,
		}),

		new CopyWebpackPlugin([
			{
				from: {
					glob: 'views/**/*',
				},
				to: '',
			},
			{
				from: {
					glob: 'assets/**/*',
				},
				to: '',
			},
		]),
	],

	node: {
		fs: 'empty',
		global: true,
		crypto: 'empty',
		tls: 'empty',
		net: 'empty',
		process: true,
		module: false,
		clearImmediate: false,
		setImmediate: false,
	},
};
