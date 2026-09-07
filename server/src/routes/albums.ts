import { Router } from 'express';
import { createAlbum, listAlbums } from '../controllers/albumController';
const r = Router();
r.get('/', listAlbums);
r.post('/', createAlbum);
export default r;
