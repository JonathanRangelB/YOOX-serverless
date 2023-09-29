import { credentials } from './types/user-service';
import { validateCredentials } from './validateCredentials';

const Ajv = require("ajv")
const userSchema = require('./schemas/user.schema.json')

const ajv = new Ajv({ allErrors: true })

module.exports.handler = async (event: any) => {
  const data: credentials = JSON.parse(event.body)
  const validate = ajv.compile(userSchema)
  const valid = validate(data)



  if (!valid) {
    console.log(ajv.errorsText(validate.errors, { separator: " AND " }));
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          errors: ajv.errorsText(validate.errors, { separator: " AND " })
        },
      ),
    };
  }

  const { recordset, rowsAffected } = await validateCredentials(data);

  if (!rowsAffected[0]) {
    return {
      statusCode: 404,
      body: JSON.stringify(
        {
          message: "Login failed, varify your credentials"
        },
      ),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        recordset,
        rowsAffected
      },
    ),
  };
};
