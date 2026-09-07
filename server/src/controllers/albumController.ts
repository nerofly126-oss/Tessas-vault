import { Request, Response } from 'express';
import Joi from 'joi';
import Album from '../models/Album';
const schema = Joi.object({ name: Joi.string().trim().max(80).required() });
export const listAlbums = async (_req: Request, res: Response) =>
  res.json({ data: await Album.find().sort({ createdAt: -1 }) });
export async function createAlbum(req: Request, res: Response) {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  res.status(201).json({ data: await Album.create(value) });
}
