import commonConfig from './webpack.common';

const common = commonConfig('production');

export default [common.server, common.client];
