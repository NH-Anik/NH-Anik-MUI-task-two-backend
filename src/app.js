import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './database/dbConnection.js';
import authRoutes from './routes/authRoutes.js';

// Initialize the express application
dotenv.config();
const app = express();

// Database connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the rate limiter to all requests
app.use(limiter);

// Routes
app.use('/api/v1/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hello World! My Test - 2');
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Export the app as the default export
export default app;
