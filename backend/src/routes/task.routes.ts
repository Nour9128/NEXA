import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', TaskController.getTasks);
router.post('/', validate({ body: createTaskSchema }), TaskController.createTask);
router.patch('/:id', validate({ body: updateTaskSchema }), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.post('/:id/subtasks', TaskController.addSubtask);
router.patch('/subtasks/:subtaskId/toggle', TaskController.toggleSubtask);

export default router;
