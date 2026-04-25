import type { MetadataRoute } from 'next'
import { SEO_BASE_URL } from '../lib/seo/alternates'

const PRIVATE_PATHS = [
  '/api/',
  '/_next/',
  '/profile/',
  '/cart',
  '/order/',
  '/order',
  '/track/',
  '/bonus/start',
]

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'Amazonbot',
  'YouBot',
  'cohere-ai',
  'Diffbot',
  'FacebookBot',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SEO_BASE_URL}/sitemap.xml`,
    host: SEO_BASE_URL,
  }
}
