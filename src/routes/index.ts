import { Router } from "express";
import { readdirSync } from "fs";

const router = Router();

const cleanFileName = (fileName: string) => {
    return fileName.split('.').shift();;
}

readdirSync(__dirname).filter((filename) => {
    const cleanName = cleanFileName(filename);
    if (cleanName !== 'index') {
        import(`./${cleanName}.routes`).then((moduloRuta) => {
            router.use(`/${cleanName}`, moduloRuta.router)
        });
    }
})

export { router };