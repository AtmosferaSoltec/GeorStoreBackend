import { Router } from 'express';
import controller from '../controllers/talla.controller';
import { checkToken } from '../middlewares/checkToken';

const router = Router();

router.get('/', checkToken, controller.getAll);
router.post('/', checkToken, controller.insert);
router.patch('/', checkToken, controller.setEstado)

export { router };