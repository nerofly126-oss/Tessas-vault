import { Schema, model } from 'mongoose';
export interface IAlbum {
  name: string;
  createdAt: Date;
}
export default model<IAlbum>(
  'Album',
  new Schema<IAlbum>(
    { name: { type: String, required: true, trim: true, maxlength: 80 } },
    { timestamps: true },
  ),
);
