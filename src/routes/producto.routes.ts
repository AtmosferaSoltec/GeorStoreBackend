import { Router } from 'express';
import controller from '../controllers/producto.controller';
import { checkToken } from '../middlewares/checkToken';

const router = Router();

router.get('/', checkToken, controller.getAll);
router.get('/search/:valor', checkToken, controller.search);
router.post('/', checkToken, controller.insert);
router.put('/', checkToken, controller.update);

export { router };