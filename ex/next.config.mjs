import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add rule to process TypeScript files from parent ../src directory
    config.module.rules.push({
      test: /\.tsx?$/,
      include: [path.resolve(__dirname, '../src')],
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: path.resolve(__dirname, '../tsconfig.json'),
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
