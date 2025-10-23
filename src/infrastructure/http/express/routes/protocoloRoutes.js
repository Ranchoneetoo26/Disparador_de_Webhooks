import express from 'express';
import { listarProtocolos, consultarProtocolo } from '../controllers/ProtocoloController';

const router = express.Router();

router.get('/', listarProtocolos);

router.get('/:uuid', consultarProtocolo);

export default router;
