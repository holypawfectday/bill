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
                  let services = data.services;
                  let memberships = data.memberships;
                  let invoiceStyle = data.invoiceStyle;
                  
                  const targetPath = path.join(process.cwd(), 'src', 'defaults.ts');
                  let fileContent = '';
                  if (fs.existsSync(targetPath)) {
                    fileContent = fs.readFileSync(targetPath, 'utf-8');
                  }

                  // Extract existing values if they are missing from the request
                  if (!services && fileContent) {
                    const match = fileContent.match(/export const DEFAULT_SERVICES: ServiceItem\[\] = ([\s\S]+?);/);
                    if (match) {
                      try {
                        services = eval(`(${match[1]})`);
                      } catch (e) {
                        console.error('Failed to parse current DEFAULT_SERVICES:', e);
                      }
                    }
                  }
                  if (!memberships && fileContent) {
                    const match = fileContent.match(/export const DEFAULT_MEMBERSHIPS: MemberType\[\] = ([\s\S]+?);/);
                    if (match) {
                      try {
                        memberships = eval(`(${match[1]})`);
                      } catch (e) {
                        console.error('Failed to parse current DEFAULT_MEMBERSHIPS:', e);
                      }
                    }
                  }
                  if (!invoiceStyle && fileContent) {
                    const match = fileContent.match(/export const DEFAULT_INVOICE_STYLE: InvoiceStyle = ([\s\S]+?);/);
                    if (match) {
                      try {
                        invoiceStyle = eval(`(${match[1]})`);
                      } catch (e) {
                        console.error('Failed to parse current DEFAULT_INVOICE_STYLE:', e);
                      }
                    }
                  }

                  if (!services) services = [];
                  if (!memberships) memberships = [];

                  const code = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, MemberType, InvoiceStyle } from './types';

export const DEFAULT_SERVICES: ServiceItem[] = ${JSON.stringify(services, null, 2)};

export const DEFAULT_MEMBERSHIPS: MemberType[] = ${JSON.stringify(memberships, null, 2)};

export const DEFAULT_INVOICE_STYLE: InvoiceStyle = ${invoiceStyle ? JSON.stringify(invoiceStyle, null, 2) : '{}'};
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
