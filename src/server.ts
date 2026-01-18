import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import justificationsRoutes from './routes/justifications';
import financialRoutes from './routes/financial';
import dashboardRoutes from './routes/dashboard';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/justifications', justificationsRoutes);
app.use('/financial', financialRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));