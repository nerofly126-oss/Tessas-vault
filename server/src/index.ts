import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config';
import authRoutes from './routes/auth';
import albumRoutes from './routes/albums';
import memoryRoutes from './routes/memories';
import { auth } from './middleware/auth';
const app = express();
const allowedOrigins = ['http://localhost:3000', env.frontendUrl].filter(
  (origin): origin is string => Boolean(origin),
);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/albums', auth, albumRoutes);
app.use('/api/memories', auth, memoryRoutes);
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});
mongoose
  .connect(env.mongoUri)
  .then(() => app.listen(process.env.PORT || 4000, () => console.log("Tessa's Vault API running")))
  .catch((err) => {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  });

export default app;
