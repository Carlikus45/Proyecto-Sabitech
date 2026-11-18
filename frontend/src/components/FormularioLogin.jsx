import React from 'react';

class FormularioLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', enviando: false, error: null };
  }

  actualizarEmail(evento) {
    this.setState({ email: evento.target.value });
  }

  actualizarPassword(evento) {
    this.setState({ password: evento.target.value });
  }

  async enviar(evento) {
    evento.preventDefault();

    if (this.state.email.trim() === '' || this.state.password === '') {
      this.setState({ error: 'Escribe tu email y tu contraseña.' });
      return;
    }

    this.setState({ enviando: true, error: null });

    try {
      const respuesta = await fetch(this.props.api + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: this.state.email, password: this.state.password })
      });
      const datos = await respuesta.json();

      if (respuesta.ok) {
        this.props.alIniciarSesion(datos.token, datos.usuario);
      } else {
        this.setState({ error: datos.mensaje, enviando: false });
      }
    } catch (error) {
      console.log(error);
      this.setState({ error: 'No se ha podido conectar con el servidor.', enviando: false });
    }
  }

  render() {
    let error = null;
    if (this.state.error) {
      error = <p role="alert" className="error">{this.state.error}</p>;
    }

    let textoBoton = 'Entrar';
    if (this.state.enviando) {
      textoBoton = 'Entrando...';
    }

    return (
      <form className="formulario" onSubmit={(e) => this.enviar(e)} noValidate>
        <h2>Inicia sesión</h2>
        <p className="formulario-ayuda">Necesitas una cuenta para reservar plaza.</p>

        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="username"
               value={this.state.email} onChange={(e) => this.actualizarEmail(e)} />

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password"
               value={this.state.password} onChange={(e) => this.actualizarPassword(e)} />

        {error}

        <div className="botones">
          <button className="boton" type="submit" disabled={this.state.enviando}>{textoBoton}</button>
          <button className="boton boton-secundario" type="button" onClick={() => this.props.alCancelar()}>Cancelar</button>
        </div>
      </form>
    );
  }
}

export default FormularioLogin;