import commonConfig from './webpack.common';

const common = commonConfig('development');

export default [common.server, common.client];
