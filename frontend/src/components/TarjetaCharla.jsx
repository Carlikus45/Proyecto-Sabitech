import React from 'react';
import { fechaCorta, hora, yaCelebrada } from '../fechas';

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
      this.setState({ errorFormulario: 'Marca la casilla para poder reservar.' });
      return;
    }
    this.props.alReservar(this.props.charla.id);
    this.cerrarConfirmacion();
  }

  render() {
    const charla = this.props.charla;
    const usuario = this.props.usuario;
    const inicio = hora(charla.hora_inicio);
    const fin = hora(charla.hora_fin);
    const celebrada = yaCelebrada(charla.fecha);
    const ocupadas = charla.aforo - charla.plazas_disponibles;
    const porcentaje = ocupadas * 100 / charla.aforo;

    let fecha = null;
    if (celebrada) {
      fecha = <span className="hora-fecha">{fechaCorta(charla.fecha)}</span>;
    }

    let plazas;
    if (celebrada) {
      plazas = <p className="plazas">Charla celebrada</p>;
    } else if (charla.plazas_disponibles === 0) {
      plazas = <p className="plazas plazas-completa">Completa, sin plazas</p>;
    } else {
      plazas = <p className="plazas">{charla.plazas_disponibles} plazas libres de {charla.aforo}</p>;
    }

    let medidor = null;
    if (!celebrada) {
      let claseRelleno = 'medidor-relleno';
      if (charla.plazas_disponibles === 0) {
        claseRelleno = 'medidor-relleno medidor-lleno';
      }
      medidor = (
        <div className="medidor" aria-hidden="true">
          <div className={claseRelleno} style={{ width: porcentaje + '%' }}></div>
        </div>
      );
    }

    let accion = null;
    if (celebrada) {
      accion = null;
    } else if (this.props.tieneReserva) {
      accion = <p className="ok">Ya tienes plaza</p>;
    } else if (charla.plazas_disponibles === 0) {
      accion = null;
    } else if (!usuario) {
      accion = <button className="boton boton-secundario" onClick={() => this.props.alPedirLogin()}>Inicia sesión para reservar</button>;
    } else if (usuario.perfil !== 'asistente') {
      accion = null;
    } else if (!this.state.confirmando) {
      accion = <button className="boton" onClick={() => this.abrirConfirmacion()}>Reservar plaza</button>;
    } else {
      let errorFormulario = null;
      if (this.state.errorFormulario) {
        errorFormulario = <p role="alert" className="error">{this.state.errorFormulario}</p>;
      }
      accion = (
        <form className="confirmar" onSubmit={(e) => this.confirmar(e)} noValidate>
          <label>
            <input type="checkbox" checked={this.state.acepta} onChange={(e) => this.cambiarAcepta(e)} />
            <span>Acepto que mi nombre y mi email se usen para gestionar esta reserva.</span>
          </label>
          {errorFormulario}
          <div className="botones">
            <button className="boton" type="submit">Confirmar reserva</button>
            <button className="boton boton-secundario" type="button" onClick={() => this.cerrarConfirmacion()}>Cancelar</button>
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

    let claseSesion = 'sesion';
    if (celebrada) {
      claseSesion = 'sesion sesion-celebrada';
    }

    return (
      <article className={claseSesion}>
        <div className="sesion-hora">
          {fecha}
          <span className="hora-inicio">{inicio}</span>
          <span className="hora-fin">hasta las {fin}</span>
        </div>
        <div className="sesion-info">
          <h3>{charla.titulo}</h3>
          <p className="sesion-ponente">{charla.ponente}, {charla.empresa}</p>
          <p className="sesion-sala">{charla.sala} ({charla.ubicacion})</p>
        </div>
        <div className="sesion-plazas">
          {plazas}
          {medidor}
          {accion}
          {estado}
        </div>
      </article>
    );
  }
}

export default TarjetaCharla;