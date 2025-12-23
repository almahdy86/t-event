// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: ['localhost'],
//   },
// }

// module.exports = nextConfig
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't-event-production.up.railway.app', // الدومين الخاص بك
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}