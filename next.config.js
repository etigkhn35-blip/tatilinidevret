/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! UYARI !!
    // Projenizde tip hataları olsa bile build alınmasına izin verir.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build sırasında ESLint hatalarını görmezden gelir.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;