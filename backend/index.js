import Hapi from '@hapi/hapi';
import Jwt from 'hapi-auth-jwt2';
import { authRoutes } from './routes/routes.js';
import inert from '@hapi/inert';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = "secretkey123";

const validateUser = async (decoded, request, h) => {
  if (!decoded || !decoded.id || !decoded.role) {
    return { isValid: false };
  }
  return { isValid: true, credentials: decoded };
};

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        credentials: true,
        exposedHeaders: ['Authorization']
      }
    }
  });

  await server.register([Jwt, inert]);

  server.route({
    method: 'GET',
    path: '/uploads/{filename}',
    handler: (request, h) => {
      const filePath = path.join(process.cwd(), 'uploads', request.params.filename);
      return h.file(filePath);
    },
    options: {
      auth: false
    }
  });

  server.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    validate: validateUser,
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default('jwt');
  server.route(authRoutes);

  await server.start();
  console.log(`🚀 Server running at: ${server.info.uri}`);
};

init();