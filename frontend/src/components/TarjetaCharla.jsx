import React from 'react';

class TarjetaCharla extends React.Component {
  constructor(props) {
    super(props);
    this.state = { confirmando: false, acepta: false, errorFormulario: null };
  }

  abrirConfirmacion() {
    this.setState({ confirmando: true, acepta: false, errorFormulario: null });
  }

  cerrarConfirmacion() {
    this.setState({ confirmando: false, acepta: false, errorFormulario: null });
  }

  cambiarAcepta(evento) {
    this.setState({ acepta: evento.target.checked, errorFormulario: null });
  }

  confirmar(evento) {
    evento.preventDefault();
    if (!this.state.acepta) {
      this.setState({ errorFormulario: 'Tienes que aceptar el uso de tus datos para reservar.' });
      return;
    }
    this.props.alReservar(this.props.charla.id);
    this.cerrarConfirmacion();
  }

  render() {
    const charla = this.props.charla;
    const usuario = this.props.usuario;
    const fecha = new Date(charla.fecha).toLocaleDateString('es-ES');
    const inicio = charla.hora_inicio.substring(0, 5);
    const fin = charla.hora_fin.substring(0, 5);

    let plazas;
    if (charla.plazas_disponibles === 0) {
      plazas = <p className="plazas completa">Completa · sin plazas</p>;
    } else {
      plazas = <p className="plazas">Plazas libres: {charla.plazas_disponibles} de {charla.aforo}</p>;
    }

    let accion = null;
    if (this.props.tieneReserva) {
      accion = <p className="ok">Ya tienes plaza en esta charla</p>;
    } else if (charla.plazas_disponibles === 0) {
      accion = null;
    } else if (!usuario) {
      accion = <button onClick={() => this.props.alPedirLogin()}>Inicia sesión para reservar</button>;
    } else if (usuario.perfil !== 'asistente') {
      accion = null;
    } else if (!this.state.confirmando) {
      accion = <button onClick={() => this.abrirConfirmacion()}>Reservar plaza</button>;
    } else {
      let errorFormulario = null;
      if (this.state.errorFormulario) {
        errorFormulario = <p role="alert" className="error">{this.state.errorFormulario}</p>;
      }
      accion = (
        <form className="confirmar" onSubmit={(e) => this.confirmar(e)} noValidate>
          <label>
            <input type="checkbox" checked={this.state.acepta} onChange={(e) => this.cambiarAcepta(e)} />
            Acepto que mi nombre y mi email se usen para gestionar esta reserva.
          </label>
          {errorFormulario}
          <div className="botones">
            <button type="submit">Confirmar reserva</button>
            <button type="button" onClick={() => this.cerrarConfirmacion()}>Cancelar</button>
          </div>
        </form>
      );
    }

    let estado = null;
    if (this.props.reservando) {
      estado = <p role="status">Reservando...</p>;
    } else if (this.props.mensaje) {
      let clase = 'error';
      if (this.props.mensaje.ok) {
        clase = 'ok';
      }
      estado = <p role="status" className={clase}>{this.props.mensaje.texto}</p>;
    }

    return (
      <article className="tarjeta">
        <h2>{charla.titulo}</h2>
        <p>{fecha} · {inicio} - {fin}</p>
        <p>Ponente: {charla.ponente} ({charla.empresa})</p>
        <p>Sala: {charla.sala} · {charla.ubicacion}</p>
        {plazas}
        {accion}
        {estado}
      </article>
    );
  }
}

export default TarjetaCharla;