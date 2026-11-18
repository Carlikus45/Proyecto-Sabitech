import React from 'react';
import { fechaLarga, hora } from '../fechas';

class MisReservas extends React.Component {
  render() {
    const confirmadas = [];
    for (let i = 0; i < this.props.reservas.length; i++) {
      const reserva = this.props.reservas[i];
      if (reserva.estado === 'confirmada') {
        confirmadas.push(reserva);
      }
    }

    if (confirmadas.length === 0) {
      return (
        <div className="vacio">
          <p>Todavía no tienes reservas.</p>
          <button className="boton" onClick={() => this.props.alVerPrograma()}>Ver el programa</button>
        </div>
      );
    }

    return (
      <ul className="billetes">
        {confirmadas.map((reserva) => (
          <li key={reserva.id} className="billete">
            <div className="billete-codigo">
              <span className="billete-etiqueta">Código de reserva</span>
              <strong>{reserva.codigo}</strong>
            </div>
            <div className="billete-info">
              <h2>{reserva.titulo}</h2>
              <p>{fechaLarga(reserva.fecha)}, de {hora(reserva.hora_inicio)} a {hora(reserva.hora_fin)}</p>
              <p>{reserva.sala} ({reserva.ubicacion})</p>
            </div>
            <p className="billete-estado estado-confirmada">Confirmada</p>
          </li>
        ))}
      </ul>
    );
  }
}

export default MisReservas;