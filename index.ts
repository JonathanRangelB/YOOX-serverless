import { Handler } from "aws-lambda";

const md5 = require('md5');
const sql = require('mssql');

module.exports.handler = async (event: Handler) => {
  const data = '1';
  const { recordset, rowsAffected } = await coneccion();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v3.0! Your function executed successfully with TypeScript',
        md5: md5(data),
        data,
        recordset,
        rowsAffected
      },
      null,
      2
    ),
  };
};

const coneccion = async () => {
  const sqlConfig = {
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.SERVER,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      // encrypt: true, // for azure
      trustServerCertificate: false, // change to true for local dev / self-signed certs
    },
  };

  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM SEC_VERSION`;
    return result;
  } catch (err) {
    return { err };
  }
};
