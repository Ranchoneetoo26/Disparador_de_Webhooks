import express from 'express';
import { listarProtocolos } from '../controllers/ProtocoloController';

const router = express.Router();

router.get('/', listarProtocolos);

export default router;