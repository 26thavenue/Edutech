import express ,{type Application, type Request, type NextFunction, type Response} from 'express';
import morgan from 'morgan'
import dotenv from "dotenv"

// import { corsOptions } from './config/config';
import loggerMiddleware from './middlewares/logger.middleware';
// import router from './routes/index.route'
// import authController from './routes/auth.route'


dotenv.config()


const PORT = process.env.DEVELOPMENT_PORT || 3000;


const app:Application = express();

app.use(express.json());

app.use(morgan('dev'));

// app.use(cors(corsOptions));

app.use(loggerMiddleware);


// app.use('/api', router)

// app.use('/auth', authController)


app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.get('/health', (req, res) => {
    res.send('Health Check');
});


app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: 'Not Found' });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


export default app