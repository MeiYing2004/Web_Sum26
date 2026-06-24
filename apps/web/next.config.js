/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const gateway = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    const aiService = process.env.AI_SERVICE_URL || 'http://localhost:8765';
    return [
      { source: '/graphql', destination: `${gateway}/graphql` },
      { source: '/api/chat', destination: `${aiService}/chat` },
    ];
  },
};

module.exports = nextConfig;
