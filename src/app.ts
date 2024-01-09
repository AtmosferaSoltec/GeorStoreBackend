import express from "express";
import cors from "cors";
import "dotenv/config";
import { router } from './routes';
import path from 'path';

const puerto = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json())

app.get('/ping', (req, res) => {
    res.send('pong local');
});

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.type('application/javascript');
        }
    }
}));

app.use('/api', router);

app.listen(puerto, () => {
    console.log(`Servidor HTTPS en el puerto ${puerto}`);
});