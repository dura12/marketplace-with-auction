/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "hebbkx1anhila5yf.public.blob.vercel-storage.com", 
      "firebasestorage.googleapis.com",
      "example.com",
      'images.unsplash.com',
    ], 
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

export default nextConfig;
