/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for development to enable proper client-side routing
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig