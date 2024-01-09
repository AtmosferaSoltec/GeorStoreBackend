import express from "express";
import cors from "cors";
import "dotenv/config";
import { router } from './routes';

const puerto = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json())

app.get('/ping', (req, res) => {
    res.json('pong local');
});


app.use('/api', router);

app.listen(puerto, () => {
    console.log(`Servidor HTTPS en el puerto ${puerto}`);
});