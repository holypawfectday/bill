import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'save-defaults-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/save-defaults' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const services = data.services;
                  const memberships = data.memberships;
                  
                  if (!Array.isArray(services) || !Array.isArray(memberships)) {
                    throw new Error('Invalid services or memberships data format');
                  }
                  
                  const targetPath = path.join(process.cwd(), 'src', 'defaults.ts');
                  
                  const code = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, MemberType } from './types';

export const DEFAULT_SERVICES: ServiceItem[] = ${JSON.stringify(services, null, 2)};

export const DEFAULT_MEMBERSHIPS: MemberType[] = ${JSON.stringify(memberships, null, 2)};
`;
                  
                  fs.writeFileSync(targetPath, code, 'utf-8');
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true }));
                } catch (err: any) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
