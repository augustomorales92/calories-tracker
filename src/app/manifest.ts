import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calories Tracker',
    short_name: 'Calories Tracker',
    description: 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/app-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/app-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}