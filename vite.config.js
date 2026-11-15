import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 로컬 개발에서 /api/* 요청을 api/ 폴더의 Vercel 함수로 연결합니다. (배포 환경에서는 Vercel이 직접 처리)
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        const file = path.join(process.cwd(), url.pathname + '.js');
        if (!existsSync(file)) {
          res.statusCode = 404;
          return res.end('{"error":"없는 API"}');
        }
        let raw = '';
        for await (const chunk of req) raw += chunk;
        req.body = raw && (req.headers['content-type'] || '').includes('json') ? JSON.parse(raw) : raw;
        try {
          const mod = await server.ssrLoadModule(file);
          await mod.default(req, res);
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), devApi()],
    base: '/',
    server: { host: true },
  };
});
