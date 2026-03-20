import sql, { Transaction } from "mssql";
import { GenericBDRequest } from "../../types/genericBDRequest";
import { Direccion } from "../../../interfaces/common-properties";
import { StatusCodes } from "../../../helpers/statusCodes";

export const updateAddress = async (
  direccion: Direccion,
  id_persona: number,
  tipo: string,
  procTransaction: Transaction
): Promise<GenericBDRequest> => {
  const {
    id,
    tipo_calle,
    nombre_calle,
    numero_exterior,
    numero_interior,
    colonia,
    municipio,
    estado,
    cp,
    referencias_dom,
    usuario,
    fecha_operacion,
    gmaps_url_location,
    cruce_calles,
  } = direccion;

  const { value: tipoCalle } = tipo_calle;
  const { value: estadoNombre } = estado;

  try {
    const domicilioEncontrado = await procTransaction
      .request()
      .input("idDomicilio", sql.Int, id)
      .query("SELECT 1 FROM DOMICILIOS WHERE ID = @idDomicilio");

    if (!domicilioEncontrado.rowsAffected[0])
      return {
        message: "Domicilio no encontrado",
        generatedId: 0,
        error: StatusCodes.NOT_FOUND,
      };

    const poolRequest = procTransaction.request();

    let queryUpdateAddress = `
        UPDATE
          DOMICILIOS

        SET
          TIPO_CALLE = @tipoCalle
          ,NOMBRE_CALLE = @nombre_calle
          ,NUMERO_EXTERIOR = @numero_exterior
          ,COLONIA = @colonia
          ,MUNICIPIO = @municipio
          ,ESTADO = @estadoNombre
          ,CP = @cp
          ,REFERENCIAS = @referencias_dom
          ,MODIFIED_BY_USR = @usuario
          ,MODIFIED_DATE = @fecha_operacion
          ,CRUCE_CALLES = @cruce_calles
      
        `;

    if (tipo == "CLIENTE") {
      poolRequest.input(
        "gmaps_url_location",
        sql.VarChar,
        gmaps_url_location || null
      );
      queryUpdateAddress += ",GMAPS_URL_LOCATION = @gmaps_url_location ";
    }
    queryUpdateAddress += " WHERE ID = @id ";

    poolRequest.input("tipoCalle", sql.VarChar, tipoCalle);
    poolRequest.input("nombre_calle", sql.VarChar, nombre_calle);
    poolRequest.input("numero_exterior", sql.VarChar, numero_exterior);
    poolRequest.input("colonia", sql.VarChar, colonia);
    poolRequest.input("municipio", sql.VarChar, municipio);
    poolRequest.input("estadoNombre", sql.VarChar, estadoNombre);
    poolRequest.input("cp", sql.VarChar, cp);
    poolRequest.input("referencias_dom", sql.Text, referencias_dom);
    poolRequest.input("usuario", sql.Int, usuario);
    poolRequest.input(
      "fecha_operacion",
      sql.DateTime,
      fecha_operacion.toISOString()
    );
    poolRequest.input("cruce_calles", sql.VarChar, cruce_calles);
    poolRequest.input("id", sql.Int, id);

    let valoresAInsertar = "";
    let queryClearSuiteNumber = "";
    let queryUpdateSuiteNumber = "";

    if (numero_interior) {
      switch (tipo) {
        case "CLIENTE":
          valoresAInsertar =
            "(@numInt_id, @numInt_numero_interior, @numInt_id_persona, NULL, @numInt_TipoPersona)";
          break;
        case "AVAL":
          valoresAInsertar =
            "(@numInt_id, @numInt_numero_interior, NULL, @numInt_id_persona, @numInt_TipoPersona)";
          break;
      }

      poolRequest.input("numInt_id", sql.Int, id);
      poolRequest.input("numInt_numero_interior", sql.VarChar, numero_interior);
      poolRequest.input("numInt_id_persona", sql.Int, id_persona);
      poolRequest.input("numInt_TipoPersona", sql.VarChar, tipo);

      queryUpdateSuiteNumber = `
                    INSERT INTO
                    DOMICILIOS_NUM_INTERIOR
                    (ID_DOMICILIO, NUMERO_INTERIOR, ID_CLIENTE, ID_AVAL, TIPO)
                    VALUES
                    ${valoresAInsertar}

            `;
    }

    queryClearSuiteNumber = `
        DELETE 
        FROM DOMICILIOS_NUM_INTERIOR 
        WHERE TIPO = @delete_NumInt_tipo AND ID_${tipo} = @delete_NumInt_id_persona 
        
        `;

    poolRequest.input("delete_NumInt_tipo", sql.VarChar, tipo);
    poolRequest.input("delete_NumInt_id_persona", sql.Int, id_persona);

    const updateResult = await poolRequest.query(
      queryUpdateAddress + queryClearSuiteNumber + queryUpdateSuiteNumber
    );

    if (!updateResult.rowsAffected[0])
      return {
        message: "Domicilio no actualizado",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };
    return {
      message: "Domicilio actualizado",
      generatedId: id,
    };
  } catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    };
  }
};
