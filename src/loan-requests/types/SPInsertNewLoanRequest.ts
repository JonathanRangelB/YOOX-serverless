import { Plazo } from '../../installments/types/installments.type';
import { formCustomer } from '../../interfaces/customer-interface';
import { formEndorsement } from '../../interfaces/endorsement-interface';

export interface InsertNewLoanRequest {
  cantidad_prestada: number;
  plazo: Plazo;
  id_agente: number;
  created_by: number;
  id_grupo_original: number;
  fecha_final_estimada: Date;
  dia_semana: string;
  observaciones: string;
  cantidad_pagar: number;
  status_code: number;
  fecha_inicial: Date;
  formCliente: formCustomer;
  formAval: formEndorsement;
}

export interface UpdateLoanRequest {
  id: number;
  request_number: string;
  loan_request_status: string;
  cantidad_prestada: number;
  cantidad_pagar: number;
  id_agente: number;
  id_grupo_original: number;
  fecha_inicial: Date;
  fecha_final_estimada: Date;
  dia_semana: string;
  observaciones: string;
  plazo: Plazo;
  formCustomer: formCustomer;
  formEndorsement: formEndorsement;
  id_usuario: number;
  status_code: number;
}
