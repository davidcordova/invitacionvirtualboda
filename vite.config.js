import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    {
      name: 'audio-upload-middleware',
      configureServer(server) {
        server.middlewares.use('/api/upload-audio', (req, res, next) => {
          if (req.method !== 'POST') return next();

          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              if (buffer.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Archivo vacío' }));
              }

              const targetDir = path.resolve(process.cwd(), 'public', 'assets');
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              const targetPath = path.join(targetDir, 'musica.mp3');
              fs.writeFileSync(targetPath, buffer);

              console.log(`[Vite Audio API] Archivo musica.mp3 guardado con éxito (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                url: `/assets/musica.mp3?t=${Date.now()}`,
                size: buffer.length
              }));
            } catch (err) {
              console.error('[Vite Audio API] Error al guardar audio:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      }
    }
  ]
});
