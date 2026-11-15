import React from 'react';

class TarjetaCharla extends React.Component {
  render() {
    const charla = this.props.charla;
    const fecha = new Date(charla.fecha).toLocaleDateString('es-ES');
    const inicio = charla.hora_inicio.substring(0, 5);
    const fin = charla.hora_fin.substring(0, 5);

    let plazas;
    if (charla.plazas_disponibles === 0) {
      plazas = <p className="plazas completa">Completa · sin plazas</p>;
    } else {
      plazas = <p className="plazas">Plazas libres: {charla.plazas_disponibles} de {charla.aforo}</p>;
    }

    return (
      <article className="tarjeta">
        <h2>{charla.titulo}</h2>
        <p>{fecha} · {inicio} - {fin}</p>
        <p>Ponente: {charla.ponente} ({charla.empresa})</p>
        <p>Sala: {charla.sala} · {charla.ubicacion}</p>
        {plazas}
      </article>
    );
  }
}

export default TarjetaCharla;