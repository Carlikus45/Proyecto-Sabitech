import React from 'react';

class MisReservas extends React.Component {
  textoEstado(reserva) {
    if (reserva.asistencia_registrada) {
      return 'Asistencia registrada';
    }
    if (reserva.estado === 'cancelada') {
      return 'Cancelada';
    }
    return 'Confirmada';
  }

  render() {
    if (this.props.reservas.length === 0) {
      return <p>Todavía no tienes reservas.</p>;
    }

    return (
      <div className="lista">
        {this.props.reservas.map((reserva) => (
          <article key={reserva.id} className="tarjeta">
            <h2>{reserva.titulo}</h2>
            <p>{new Date(reserva.fecha).toLocaleDateString('es-ES')} · {reserva.hora_inicio.substring(0, 5)} - {reserva.hora_fin.substring(0, 5)}</p>
            <p>Sala: {reserva.sala} · {reserva.ubicacion}</p>
            <p>Código de reserva: <strong>{reserva.codigo}</strong></p>
            <p className="plazas">Estado: {this.textoEstado(reserva)}</p>
          </article>
        ))}
      </div>
    );
  }
}

export default MisReservas;