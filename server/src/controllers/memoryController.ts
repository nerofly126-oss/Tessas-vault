import { Request, Response } from 'express';
import Joi from 'joi';
import Memory from '../models/Memory';
import Album from '../models/Album';
import { uploadMedia, removeMedia } from '../services/cloudinary';
const createSchema = Joi.object({
  caption: Joi.string().allow('').max(500).default(''),
  date: Joi.date().iso().required(),
  albumId: Joi.string().hex().length(24).optional().allow(''),
});
const updateSchema = Joi.object({
  caption: Joi.string().allow('').max(500),
  date: Joi.date().iso(),
  albumId: Joi.string().hex().length(24).allow('', null),
}).min(1);
export const listMemories = async (_req: Request, res: Response) =>
  res.json({ data: await Memory.find().populate('album').sort({ date: -1 }) });
export async function createMemory(req: Request, res: Response) {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  if (!req.file) return res.status(400).json({ message: 'A photo or video file is required' });
  if (value.albumId && !(await Album.exists({ _id: value.albumId })))
    return res.status(400).json({ message: 'Album not found' });
  const result = await uploadMedia(req.file);
  const memory = await Memory.create({
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    caption: value.caption,
    date: value.date,
    album: value.albumId || undefined,
  });
  res.status(201).json({ data: await memory.populate('album') });
}
export async function updateMemory(req: Request, res: Response) {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  if (value.albumId && !(await Album.exists({ _id: value.albumId })))
    return res.status(400).json({ message: 'Album not found' });
  const data: any = { ...value };
  if (value.albumId === '') data.album = undefined;
  delete data.albumId;
  if (value.albumId) data.album = value.albumId;
  const memory = await Memory.findByIdAndUpdate(req.params.id, data, { new: true }).populate(
    'album',
  );
  if (!memory) return res.status(404).json({ message: 'Memory not found' });
  res.json({ data: memory });
}
export async function deleteMemory(req: Request, res: Response) {
  const memory = await Memory.findByIdAndDelete(req.params.id);
  if (!memory) return res.status(404).json({ message: 'Memory not found' });
  await removeMedia(memory.publicId, memory.resourceType);
  res.status(204).end();
}
