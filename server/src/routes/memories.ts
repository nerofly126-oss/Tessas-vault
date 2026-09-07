import { Router } from 'express';
import multer from 'multer';
import {
  createMemory,
  deleteMemory,
  listMemories,
  updateMemory,
} from '../controllers/memoryController';
const r = Router(),
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_r, f, cb) =>
      cb(null, f.mimetype.startsWith('image/') || f.mimetype.startsWith('video/')),
  });
r.get('/', listMemories);
r.post('/', upload.single('file'), createMemory);
r.put('/:id', updateMemory);
r.delete('/:id', deleteMemory);
export default r;
