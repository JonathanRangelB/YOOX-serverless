import { generateJsonResponse } from './helpers/generateJsonResponse';

module.exports.handler = async (event: any) => {
  console.log(event);
  return generateJsonResponse({ message: 'Autorización éxitosa!' }, 200);
};
