const md5 = require('md5');
const sql = require('mssql');
const Ajv = require("ajv")
const userSchema = require('./schemas/user.schema.json')

const ajv = new Ajv({ allErrors: true })

module.exports.handler = async (event: any) => {
  const data = JSON.parse(event.body)
  const validate = ajv.compile(userSchema)
  const valid = validate(data)

  console.log(ajv.errorsText(validate.errors, { separator: " AND " }));


  if (!valid) return {
    statusCode: 400,
    body: JSON.stringify(
      {
        errors: ajv.errorsText(validate.errors, { separator: " AND " })
      },
      null,
      2
    ),
  };

  const { recordset, rowsAffected } = await coneccion(data);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        recordset,
        rowsAffected
      },
      null,
      2
    ),
  };
};

const coneccion = async (data: { userId: string, password: string }) => {
  const { userId, password } = data
  const md5Password = md5(password)
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
    const result = await sql.query`SELECT * FROM USUARIOS WHERE NOMBRE=${userId} AND PASSWORD=${md5Password}`;
    return result;
  } catch (err) {
    return { err };
  }
};
