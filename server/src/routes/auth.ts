import { Router } from 'express';
import { changePassword, login } from '../controllers/authController';
import { auth } from '../middleware/auth';
const r = Router();
r.post('/login', login);
r.put('/change-password', auth, changePassword);
export default r;
