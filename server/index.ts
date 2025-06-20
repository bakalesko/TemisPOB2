import { createServer } from 'vite';
import path from 'path';

async function startServer() {
  try {
    const server = await createServer({
      root: path.resolve(process.cwd(), 'client'),
      plugins: [
        (await import('@vitejs/plugin-react')).default({
          jsxRuntime: 'automatic'
        })
      ],
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: [
          '9340157d-046e-4f97-bcb2-47890cff455a-00-102o6hg0lgzcl.worf.replit.dev',
          'pob-webeve-disitarbakaiov.replit.app',
          '.replit.app',
          '.replit.dev',
          'temispob.onrender.com',
          'localhost',
          '127.0.0.1'
        ],
        fs: {
          allow: [
            // Allow access to the entire project
            path.resolve(process.cwd()),
            // Specifically allow client directory
            path.resolve(process.cwd(), 'client'),
            // Allow shared directory
            path.resolve(process.cwd(), 'shared'),
            // Allow attached assets
            path.resolve(process.cwd(), 'attached_assets'),
            // Allow public directory
            path.resolve(process.cwd(), 'public'),
            // Allow node_modules
            path.resolve(process.cwd(), 'node_modules')
          ]
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), 'client', 'src'),
          '@shared': path.resolve(process.cwd(), 'shared'),
          '@assets': path.resolve(process.cwd(), 'attached_assets'),
        }
      },
      esbuild: {
        jsx: 'automatic'
      }
    });

    await server.listen();
    console.log('Development server running on port 5000');
    console.log('Allowed paths:', [
      path.resolve(process.cwd()),
      path.resolve(process.cwd(), 'client'),
      path.resolve(process.cwd(), 'shared'),
      path.resolve(process.cwd(), 'attached_assets')
    ]);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();