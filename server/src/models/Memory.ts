import { Schema, model, Types } from 'mongoose';
export interface IMemory {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
  caption: string;
  date: Date;
  album?: Types.ObjectId;
}
export default model<IMemory>(
  'Memory',
  new Schema<IMemory>(
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      resourceType: { type: String, enum: ['image', 'video'], required: true },
      caption: { type: String, trim: true, maxlength: 500, default: '' },
      date: { type: Date, required: true },
      album: { type: Schema.Types.ObjectId, ref: 'Album' },
    },
    { timestamps: true },
  ),
);
