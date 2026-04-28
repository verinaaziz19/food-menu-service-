/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['vm-7y7113jmmlk6y2joaq7sck0u.vusercontent.net'],
}

export default nextConfig
