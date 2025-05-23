const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  basePath: isProd ? '/agile2025' : '',
  assetPrefix: isProd ? '/agile2025' : '',
  images: {
    domains: ['www.im.fju.edu.tw'],
    unoptimized: true,
  },
};