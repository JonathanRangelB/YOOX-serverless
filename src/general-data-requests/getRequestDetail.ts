import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { ClienteDomicilio, DatosCliente } from './types/getCustomer.interface';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { customerSearchQuery } from './utils/querySearchCustomer';
import { isValidSearchCustomerParameters } from './validateSearchCustomerParameters';