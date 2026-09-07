import { model, Schema } from 'mongoose';

export interface IAdmin {
  email: string;
  passwordHash: string;
}

export default model<IAdmin>(
  'Admin',
  new Schema<IAdmin>(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true, select: false },
    },
    { timestamps: true },
  ),
);
