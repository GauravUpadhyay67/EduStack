import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import dotenv from 'dotenv';
import { clerkWebhooks } from './controllers/webhooks.js';

dotenv.config()

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());

// Connect to MongoDB
await connectDB()

// Route
app.get('/', (req, res) => {
  res.send('Hello India!');
});

app.post('/clerk', express.json(), clerkWebhooks);

// Port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
