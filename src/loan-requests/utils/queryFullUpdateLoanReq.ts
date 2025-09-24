import { UpdateLoanRequest } from "../types/SPInsertNewLoanRequest";

export function fullUpdateLoanReqQuery(
  updateLoanRequest: UpdateLoanRequest,
  approvedStatusFlag: boolean
): string {
  let updateQueryColumns = "";

  const {
    loan_request_status: newLoanRequestStatus,
    cantidad_prestada,
    cantidad_pagar,
    id_agente,
    id_grupo_original,
    fecha_inicial,
    fecha_final_estimada,
    dia_semana,
    observaciones,
    plazo: datosPlazo,
    formCliente: datosCliente,
    formAval: datosAval,
    id_loan_to_refinance,
  } = updateLoanRequest;

  const {
    id_cliente,
    nombre_cliente,
    apellido_paterno_cliente,
    apellido_materno_cliente,
    telefono_fijo_cliente,
    telefono_movil_cliente,
    correo_electronico_cliente,
    ocupacion_cliente,
    curp_cliente,
    tipo_calle_cliente,
    nombre_calle_cliente,
    numero_exterior_cliente,
    numero_interior_cliente,
    colonia_cliente,
    municipio_cliente,
    estado_cliente,
    cp_cliente,
    referencias_dom_cliente,
    id_domicilio_cliente,
  } = datosCliente;

  const {
    id_aval,
    nombre_aval,
    apellido_paterno_aval,
    apellido_materno_aval,
    telefono_fijo_aval,
    telefono_movil_aval,
    correo_electronico_aval,
    curp_aval,
    tipo_calle_aval,
    nombre_calle_aval,
    numero_exterior_aval,
    numero_interior_aval,
    colonia_aval,
    municipio_aval,
    estado_aval,
    cp_aval,
    referencias_dom_aval,
    id_domicilio_aval,
  } = datosAval;

  const { id: id_plazo, tasa_de_interes, semanas_plazo } = datosPlazo;

  updateQueryColumns = `SET 
      LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
      ,ID_AGENTE = ${id_agente}
      ,ID_GRUPO_ORIGINAL = ${id_grupo_original}      
      ,NOMBRE_CLIENTE = '${nombre_cliente.trim().toUpperCase()}'
      ,APELLIDO_PATERNO_CLIENTE = '${apellido_paterno_cliente.trim().toUpperCase()}'
      ,APELLIDO_MATERNO_CLIENTE = '${apellido_materno_cliente.trim().toUpperCase()}'
      ,TELEFONO_FIJO_CLIENTE = ${telefono_fijo_cliente ? `'${telefono_fijo_cliente}'` : `NULL`}
      ,TELEFONO_MOVIL_CLIENTE = '${telefono_movil_cliente}'
      ,CORREO_ELECTRONICO_CLIENTE = ${correo_electronico_cliente ? `'${correo_electronico_cliente}'` : `NULL`}
      ,OCUPACION_CLIENTE = ${ocupacion_cliente ? `'${ocupacion_cliente}'` : `NULL`}
      ,CURP_CLIENTE = '${curp_cliente}'      
      ,TIPO_CALLE_CLIENTE = '${tipo_calle_cliente.value}' 
      ,NOMBRE_CALLE_CLIENTE = '${nombre_calle_cliente}' 
      ,NUMERO_EXTERIOR_CLIENTE = ${numero_exterior_cliente ? `'${numero_exterior_cliente}'` : `NULL`}
      ,NUMERO_INTERIOR_CLIENTE = ${numero_interior_cliente ? `'${numero_interior_cliente}'` : `NULL`} 
      ,COLONIA_CLIENTE = '${colonia_cliente}' 
      ,MUNICIPIO_CLIENTE = '${municipio_cliente}' 
      ,ESTADO_CLIENTE = '${estado_cliente.value}' 
      ,CP_CLIENTE = '${cp_cliente}'
      ,REFERENCIAS_DOM_CLIENTE = ${referencias_dom_cliente ? `'${referencias_dom_cliente}'` : `NULL`}      
      ,NOMBRE_AVAL = '${nombre_aval.trim()}'
      ,APELLIDO_PATERNO_AVAL = '${apellido_paterno_aval.trim().toUpperCase()}'
      ,APELLIDO_MATERNO_AVAL = '${apellido_materno_aval.trim().toUpperCase()}'
      ,TELEFONO_FIJO_AVAL = ${telefono_fijo_aval ? `'${telefono_fijo_aval}'` : `NULL`}
      ,TELEFONO_MOVIL_AVAL = '${telefono_movil_aval}'
      ,CORREO_ELECTRONICO_AVAL = ${correo_electronico_aval ? `'${correo_electronico_aval}'` : `NULL`}
      ,CURP_AVAL = '${curp_aval}'      
      ,TIPO_CALLE_AVAL = '${tipo_calle_aval.value}'
      ,NOMBRE_CALLE_AVAL = '${nombre_calle_aval}'
      ,NUMERO_EXTERIOR_AVAL = ${numero_exterior_aval ? `'${numero_exterior_aval}'` : `NULL`}
      ,NUMERO_INTERIOR_AVAL = ${numero_interior_aval ? `'${numero_interior_aval}'` : `NULL`}
      ,COLONIA_AVAL = '${colonia_aval}'
      ,MUNICIPIO_AVAL = '${municipio_aval}'
      ,ESTADO_AVAL = '${estado_aval.value}'
      ,CP_AVAL = '${cp_aval}'
      ,REFERENCIAS_DOM_AVAL = ${referencias_dom_aval ? `'${referencias_dom_aval}'` : `NULL`}
      ,ID_PLAZO = ${id_plazo}
	  ,TASA_DE_INTERES = ${tasa_de_interes} 
	  ,SEMANAS_PLAZO = ${semanas_plazo}
      ,CANTIDAD_PRESTADA = ${cantidad_prestada}
      ,DIA_SEMANA = '${dia_semana}'
      ,FECHA_INICIAL = '${fecha_inicial}'
      ,FECHA_FINAL_ESTIMADA = '${fecha_final_estimada}'
      ,CANTIDAD_PAGAR = ${cantidad_pagar}      
      ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : `NULL`}
      ,ID_LOAN_TO_REFINANCE = ${id_loan_to_refinance ? id_loan_to_refinance : `NULL`}
`;

  if (!approvedStatusFlag) {
    updateQueryColumns += `
        ,ID_CLIENTE = ${id_cliente ? id_cliente : `NULL`}
        ,ID_AVAL = ${id_aval ? id_aval : `NULL`}
        ,ID_DOMICILIO_CLIENTE = ${id_domicilio_cliente ? id_domicilio_cliente : `NULL`}
        ,ID_DOMICILIO_AVAL = ${id_domicilio_aval ? id_domicilio_aval : `NULL`}
        `;
  }

  return updateQueryColumns;
}
