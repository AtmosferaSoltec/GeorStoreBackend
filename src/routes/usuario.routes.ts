import { Router } from 'express';
import controller from '../controllers/usuario.controller';
import { checkToken } from '../middlewares/checkToken';

const router = Router();

router.get('/verificar-token', controller.verificarToken);
router.post('/login', controller.login);
router.get('/', checkToken, controller.getAll);
router.post('/', checkToken, controller.insert);
router.patch('/', checkToken, controller.setEstado);

export { router };