export function calculateEndDate(
  fechaInicial: Date,
  fechaFinalEstimada: Date,
  currentSystemDate: Date,
  numberOfWeeks: number
): { fecha_inicial_calculada: Date; fecha_final_estimada_calculada: Date } {
  const fecha_inicial_tmp = fechaInicial
    ? new Date(fechaInicial)
    : currentSystemDate;
  const fecha_final_estimada_tmp = fechaInicial
    ? new Date(fechaFinalEstimada)
    : calculateEndDateWeeks(currentSystemDate, numberOfWeeks);
  const fecha_inicial_calculada = new Date(
    fecha_inicial_tmp.getFullYear(),
    fecha_inicial_tmp.getMonth(),
    fecha_inicial_tmp.getDate()
  );
  const fecha_final_estimada_calculada = new Date(
    fecha_final_estimada_tmp.getFullYear(),
    fecha_final_estimada_tmp.getMonth(),
    fecha_final_estimada_tmp.getDate()
  );

  return { fecha_inicial_calculada, fecha_final_estimada_calculada };
}

function calculateEndDateWeeks(
  currentSystemDate: Date,
  numberOfWeeks: number
): Date {
  const fecha_final_estimada_sistema = new Date(currentSystemDate);
  fecha_final_estimada_sistema.setDate(
    currentSystemDate.getDate() + numberOfWeeks * 7
  );

  return fecha_final_estimada_sistema;
}
