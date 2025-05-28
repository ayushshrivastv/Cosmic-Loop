import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  experimental: {
    mdxRs: true,
    turbo: {
      rules: {
        // Configure Tailwind CSS processing
        '*.css': [
          { loader: 'postcss', options: { postcssOptions: { config: './postcss.config.mjs' } } },
        ],
      },
    },
  },
  env: {
    // Perplexity API Configuration
    PERPLEXITY_API_KEY: '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',
    PERPLEXITY_BASE_URL: 'https://api.perplexity.ai',
    PERPLEXITY_MODEL: 'llama-3.1-sonar-small-128k-online',
    PERPLEXITY_MAX_TOKENS: '4000',
    PERPLEXITY_TEMPERATURE: '0.1',
    
    // Gemini API Configuration
    NEXT_PUBLIC_GEMINI_API_KEY: 'AIzaSyDQSk9hHJCJX6yUWEZwQnGNEtRQnVODj_A',  // Sample API key for development
    NEXT_PUBLIC_GEMINI_MODEL: 'gemini-2.0-flash',
    NEXT_PUBLIC_GEMINI_MAX_TOKENS: '1024',
    NEXT_PUBLIC_GEMINI_TEMPERATURE: '0.7',
    
    // Next.js Configuration
    NEXT_PUBLIC_APP_NAME: 'Financial Analysis Chat',
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
    providerImportSource: "@mdx-js/react",
  },
});

export default withMDX(nextConfig);
