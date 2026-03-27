import { UpdateLoanRequest } from "../types/SPInsertNewLoanRequest";
import sql, { Request, Int, VarChar, Float, Text } from "mssql";
import { calculateEndDate } from "./calculateEndDate";

export function fullUpdateLoanReqQuery(
  updateLoanRequest: UpdateLoanRequest,
  approvedStatusFlag: boolean,
  poolRequest: Request,
  currentSystemDate: Date
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
    id_gerencia_original,
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
    cruce_calles_cliente,
    gmaps_url_location,
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
    ocupacion_aval,
    cruce_calles_aval,
  } = datosAval;

  const { id: id_plazo, tasa_de_interes, semanas_plazo } = datosPlazo;
  const { fecha_inicial_calculada, fecha_final_estimada_calculada } =
    calculateEndDate(
      fecha_inicial,
      fecha_final_estimada,
      currentSystemDate,
      Number(semanas_plazo)
    );

  updateQueryColumns = `SET 
                          LOAN_REQUEST_STATUS = @newLoanRequestStatus
                          ,ID_AGENTE = @id_agente
                          ,ID_GRUPO_ORIGINAL = @id_grupo_original
                          ,NOMBRE_CLIENTE =  @nombre_cliente
                          ,APELLIDO_PATERNO_CLIENTE =  @apellido_paterno_cliente
                          ,APELLIDO_MATERNO_CLIENTE =  @apellido_materno_cliente
                          ,TELEFONO_MOVIL_CLIENTE =  @telefono_movil_cliente                                                    
                          ,CURP_CLIENTE =  @curp_cliente      
                          ,TIPO_CALLE_CLIENTE =  @tipo_calle_cliente
                          ,NOMBRE_CALLE_CLIENTE =  @nombre_calle_cliente 
                          ,COLONIA_CLIENTE =  @colonia_cliente
                          ,MUNICIPIO_CLIENTE =  @municipio_cliente
                          ,ESTADO_CLIENTE =  @estado_cliente
                          ,CP_CLIENTE =  @cp_cliente                          
                          ,NOMBRE_AVAL =  @nombre_aval
                          ,APELLIDO_PATERNO_AVAL =  @apellido_paterno_aval
                          ,APELLIDO_MATERNO_AVAL =  @apellido_materno_aval                        
                          ,TELEFONO_MOVIL_AVAL =  @telefono_movil_aval                          
                          ,CURP_AVAL =  @curp_aval      
                          ,TIPO_CALLE_AVAL =  @tipo_calle_aval
                          ,NOMBRE_CALLE_AVAL =  @nombre_calle_aval
                          ,COLONIA_AVAL =  @colonia_aval
                          ,MUNICIPIO_AVAL =  @municipio_aval
                          ,ESTADO_AVAL =  @estado_aval
                          ,CP_AVAL =  @cp_aval                          
                          ,ID_PLAZO = @id_plazo
                          ,TASA_DE_INTERES = @tasa_de_interes
                          ,SEMANAS_PLAZO = @semanas_plazo
                          ,CANTIDAD_PRESTADA = @cantidad_prestada
                          ,DIA_SEMANA =  @dia_semana
                          ,FECHA_INICIAL =  @fecha_inicial
                          ,FECHA_FINAL_ESTIMADA =  @fecha_final_estimada
                          ,CANTIDAD_PAGAR = @cantidad_pagar      
                          ,TELEFONO_FIJO_CLIENTE = @telefono_fijo_cliente
                          ,CORREO_ELECTRONICO_CLIENTE = @correo_electronico_cliente
                          ,OCUPACION_CLIENTE = @ocupacion_cliente
                          ,NUMERO_EXTERIOR_CLIENTE = @numero_exterior_cliente
                          ,NUMERO_INTERIOR_CLIENTE = @numero_interior_cliente
                          ,REFERENCIAS_DOM_CLIENTE = @referencias_dom_cliente
                          ,TELEFONO_FIJO_AVAL = @telefono_fijo_aval
                          ,CORREO_ELECTRONICO_AVAL = @correo_electronico_aval
                          ,NUMERO_EXTERIOR_AVAL = @numero_exterior_aval
                          ,NUMERO_INTERIOR_AVAL = @numero_interior_aval
                          ,REFERENCIAS_DOM_AVAL = @referencias_dom_aval
                          ,OBSERVACIONES = @observaciones
                          ,ID_LOAN_TO_REFINANCE = @id_loan_to_refinance
                          ,OCUPACION_AVAL = @ocupacion_aval
                          ,GMAPS_URL_LOCATION = @gmaps_url_location
                          ,CRUCE_CALLES_CLIENTE = @cruce_calles_cliente
                          ,CRUCE_CALLES_AVAL = @cruce_calles_aval
                          ,ID_GERENCIA_ORIGINAL = @id_gerencia_original                                            
                                                  
`;

  poolRequest.input("newLoanRequestStatus", VarChar, newLoanRequestStatus);
  poolRequest.input("id_agente", Int, id_agente);
  poolRequest.input("id_grupo_original", Int, id_grupo_original);
  poolRequest.input("nombre_cliente", VarChar, nombre_cliente);
  poolRequest.input(
    "apellido_paterno_cliente",
    VarChar,
    apellido_paterno_cliente
  );
  poolRequest.input(
    "apellido_materno_cliente",
    VarChar,
    apellido_materno_cliente
  );
  poolRequest.input("telefono_movil_cliente", VarChar, telefono_movil_cliente);
  poolRequest.input("curp_cliente", VarChar, curp_cliente);
  poolRequest.input("tipo_calle_cliente", VarChar, tipo_calle_cliente.value);
  poolRequest.input("nombre_calle_cliente", VarChar, nombre_calle_cliente);
  poolRequest.input("colonia_cliente", VarChar, colonia_cliente);
  poolRequest.input("municipio_cliente", VarChar, municipio_cliente);
  poolRequest.input("estado_cliente", VarChar, estado_cliente.value);
  poolRequest.input("cp_cliente", VarChar, cp_cliente);
  poolRequest.input("nombre_aval", VarChar, nombre_aval);
  poolRequest.input("apellido_paterno_aval", VarChar, apellido_paterno_aval);
  poolRequest.input("apellido_materno_aval", VarChar, apellido_materno_aval);
  poolRequest.input("telefono_movil_aval", VarChar, telefono_movil_aval);
  poolRequest.input("curp_aval", VarChar, curp_aval);
  poolRequest.input("tipo_calle_aval", VarChar, tipo_calle_aval.value);
  poolRequest.input("nombre_calle_aval", VarChar, nombre_calle_aval);
  poolRequest.input("colonia_aval", VarChar, colonia_aval);
  poolRequest.input("municipio_aval", VarChar, municipio_aval);
  poolRequest.input("estado_aval", VarChar, estado_aval.value);
  poolRequest.input("cp_aval", VarChar, cp_aval);
  poolRequest.input("id_plazo", Int, id_plazo);
  poolRequest.input("tasa_de_interes", Int, tasa_de_interes);
  poolRequest.input("semanas_plazo", Int, semanas_plazo);
  poolRequest.input("cantidad_prestada", Float, cantidad_prestada);
  poolRequest.input("dia_semana", VarChar, dia_semana);
  poolRequest.input("fecha_inicial", sql.Date, fecha_inicial_calculada);
  poolRequest.input(
    "fecha_final_estimada",
    sql.Date,
    fecha_final_estimada_calculada
  );
  poolRequest.input("cantidad_pagar", Float, cantidad_pagar);
  poolRequest.input(
    "telefono_fijo_cliente",
    VarChar,
    telefono_fijo_cliente || null
  );
  poolRequest.input(
    "correo_electronico_cliente",
    VarChar,
    correo_electronico_cliente || null
  );
  poolRequest.input("ocupacion_cliente", VarChar, ocupacion_cliente || null);
  poolRequest.input(
    "numero_exterior_cliente",
    VarChar,
    numero_exterior_cliente || null
  );
  poolRequest.input(
    "numero_interior_cliente",
    VarChar,
    numero_interior_cliente || null
  );
  poolRequest.input(
    "referencias_dom_cliente",
    VarChar,
    referencias_dom_cliente || null
  );
  poolRequest.input("telefono_fijo_aval", VarChar, telefono_fijo_aval || null);
  poolRequest.input(
    "correo_electronico_aval",
    VarChar,
    correo_electronico_aval || null
  );
  poolRequest.input(
    "numero_exterior_aval",
    VarChar,
    numero_exterior_aval || null
  );
  poolRequest.input(
    "numero_interior_aval",
    VarChar,
    numero_interior_aval || null
  );
  poolRequest.input("referencias_dom_aval", Text, referencias_dom_aval || null);
  poolRequest.input("observaciones", Text, observaciones || null);
  poolRequest.input("id_loan_to_refinance", Int, id_loan_to_refinance || null);
  poolRequest.input("ocupacion_aval", VarChar, ocupacion_aval || null);
  poolRequest.input("gmaps_url_location", VarChar, gmaps_url_location || null);
  poolRequest.input(
    "cruce_calles_cliente",
    VarChar,
    cruce_calles_cliente || null
  );
  poolRequest.input("cruce_calles_aval", VarChar, cruce_calles_aval || null);
  poolRequest.input("id_gerencia_original", Int, id_gerencia_original || null);

  if (!approvedStatusFlag) {
    updateQueryColumns += `,ID_CLIENTE = @id_cliente
                          ,ID_AVAL = @id_aval
                          ,ID_DOMICILIO_CLIENTE = @id_domicilio_cliente
                          ,ID_DOMICILIO_AVAL = @id_domicilio_aval
    `;

    poolRequest.input("id_cliente", Int, id_cliente || null);
    poolRequest.input("id_aval", Int, id_aval || null);
    poolRequest.input(
      "id_domicilio_cliente",
      Int,
      id_domicilio_cliente || null
    );
    poolRequest.input("id_domicilio_aval", Int, id_domicilio_aval || null);
  }

  return updateQueryColumns;
}
