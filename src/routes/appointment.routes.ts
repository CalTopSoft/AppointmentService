import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';

const router = Router();
const controller = new AppointmentController();

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;