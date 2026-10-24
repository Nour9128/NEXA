import { Router } from 'express';
import { SpaceController } from '../controllers/space.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSpaceSchema, inviteMemberSchema, updateMemberRoleSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', SpaceController.getSpaces);
router.post('/', validate({ body: createSpaceSchema }), SpaceController.createSpace);
router.get('/:id', SpaceController.getSpaceById);
router.post('/:id/invitations', validate({ body: inviteMemberSchema }), SpaceController.createInvitation);
router.post('/join/:token', SpaceController.joinSpace);
router.patch('/:id/members/:memberId', validate({ body: updateMemberRoleSchema }), SpaceController.updateMemberRole);
router.delete('/:id/members/:memberId', SpaceController.removeMember);
router.post('/:id/expenses', SpaceController.addSpaceExpense);

export default router;
