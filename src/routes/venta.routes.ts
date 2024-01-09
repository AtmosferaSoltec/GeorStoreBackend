import { Router } from 'express';
import controller from '../controllers/venta.controller';
import { checkToken } from '../middlewares/checkToken';

const router = Router();

router.get('/', checkToken, controller.getAll);
router.post('/', checkToken, controller.insert);
router.put('/', checkToken, controller.update);

export { router };