/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    styledComponents: true
  },
  experimental: {
    emotion: true
    // modularizeImports: {
    //   '@mui/material/?(((\\w*)?/?)*)': {
    //     transform: '@mui/material/{{ matches.[1] }}/{{member}}'
    //   },
    //   '@mui/icons-material/?(((\\w*)?/?)*)': {
    //     transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}'
    //   }
    // }
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 750,
      aggregateTimeout: 300
    }
    return config
  }
}

module.exports = nextConfig
