const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaLarga(fecha) {
  const f = new Date(fecha + 'T00:00:00');
  return DIAS[f.getDay()] + ', ' + f.getDate() + ' de ' + MESES[f.getMonth()];
}

export function fechaCorta(fecha) {
  const f = new Date(fecha + 'T00:00:00');
  return f.getDate() + ' ' + MESES_CORTOS[f.getMonth()];
}

export function mesYAnio(fecha) {
  const f = new Date(fecha + 'T00:00:00');
  return MESES[f.getMonth()] + ' de ' + f.getFullYear();
}

export function numeroDia(fecha) {
  const f = new Date(fecha + 'T00:00:00');
  return f.getDate();
}

export function hora(texto) {
  const f = new Date('2000-01-01T' + texto);
  let horas = f.getHours();
  let minutos = f.getMinutes();
  if (horas < 10) {
    horas = '0' + horas;
  }
  if (minutos < 10) {
    minutos = '0' + minutos;
  }
  return horas + ':' + minutos;
}

export function yaCelebrada(fecha) {
  const finDelDia = new Date(fecha + 'T23:59:59');
  return finDelDia < new Date();
}