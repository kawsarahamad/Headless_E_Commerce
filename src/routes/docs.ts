import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

export const docsRouter = Router();
const doc = YAML.parse(fs.readFileSync('openapi.yaml', 'utf8'));
docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(doc));
