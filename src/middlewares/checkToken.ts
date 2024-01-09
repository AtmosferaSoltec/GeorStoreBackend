import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

//Funcion para ver si el token ingresado es valido o no
export function checkToken(req: Request, res: Response, next: NextFunction) {
    //Obtenemos el token
    const token = req.headers.authorization;

    //Verificamos si el token existe
    if (!token) {
        return res.json({
            isSuccess: false,
            mensaje: "El token es necesario"
        });
    }

    //Verificamos si el token es valido
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.body.user = data;
        next();
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: "El token es incorrecto"
        });
    }
}