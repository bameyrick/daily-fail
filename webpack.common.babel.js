import * as path from 'path';
import { NoEmitOnErrorsPlugin, NamedModulesPlugin } from 'webpack';
import ProgressPlugin from 'webpack/lib/ProgressPlugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries';
import merge from 'webpack-merge';

import postcssPlugins from './postcss.config';

const base = {
  context: `${__dirname}/src`,

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

    new CopyWebpackPlugin([
      {
        from: {
          glob: 'views/**/*',
        },
        to: '',
      },
    ]),
  ],
};

export default function(mode) {
  return {
    server: merge(base, {
      mode,

      target: 'node',

      externals: [nodeExternals()],

      node: {
        __dirname: false,
      },

      entry: {
        server: ['./server/index.ts'],
      },

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
    }),

    client: merge(base, {
      mode,

      entry: {
        styles: ['./styles/index.scss'],
        scripts: ['./scripts/index.ts'],
      },

      module: {
        rules: [
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
                },
              },
            ],
          },
        ],
      },

      plugins: [
        new FixStyleOnlyEntriesPlugin({
          extensions: ['scss'],
          silent: true,
        }),

        new CopyWebpackPlugin([
          {
            from: {
              glob: 'assets/**/*',
            },
            to: '',
          },
        ]),
      ],
    }),
  };
}
