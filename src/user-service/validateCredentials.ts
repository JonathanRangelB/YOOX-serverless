import { credentials } from "./types/user-service";

const sql = require('mssql');
const md5 = require('md5');

export const validateCredentials = async (data: credentials) => {
    const { userId, password } = data
    const md5Password = md5(password)
    const sqlConfig = {
        user: process.env.USUARIO,
        password: process.env.PASSWORD,
        database: process.env.DB_NAME,
        server: process.env.SERVER,
        options: {
            // encrypt: true, // for azure
            trustServerCertificate: false, // change to true for local dev / self-signed certs
        },
    };

    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect(sqlConfig);
        return await sql.query`SELECT ID, NOMBRE, ROL, ACTIVO, ID_GRUPO, ID_ROL FROM USUARIOS WHERE NOMBRE=${userId} AND PASSWORD=${md5Password} AND ACTIVO=1`;
    } catch (err) {
        return { err };
    }
};