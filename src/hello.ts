import { generateJsonResponse } from './helpers/generateJsonResponse';

module.exports.handler = async (event: any) => {
  return generateJsonResponse({ message: 'Autorización éxitosa!' }, 200);
};
