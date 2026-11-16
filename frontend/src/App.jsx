import React from 'react';
import TarjetaCharla from './components/TarjetaCharla';
import FormularioLogin from './components/FormularioLogin';
import './App.css';

const API = 'http://127.0.0.1:8000/api';

class App extends React.Component {
  constructor(props) {
    super(props);

    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    let usuario = null;
    if (usuarioGuardado) {
      usuario = JSON.parse(usuarioGuardado);
    }

    this.state = {
      charlas: [],
      cargando: true,
      error: null,
      token: token,
      usuario: usuario,
      mostrarLogin: false,
      aviso: null
    };
  }

  componentDidMount() {
    this.cargarCharlas();
    this.comprobarSesion();
  }

  async cargarCharlas() {
    try {
      const respuesta = await fetch(API + '/charlas');
      if (!respuesta.ok) {
        throw new Error('Error ' + respuesta.status);
      }
      const datos = await respuesta.json();
      this.setState({ charlas: datos, cargando: false });
    } catch (error) {
      console.log(error);
      this.setState({ error: 'No se ha podido conectar con el servidor.', cargando: false });
    }
  }

  async comprobarSesion() {
    if (!this.state.token) {
      return;
    }
    try {
      const respuesta = await fetch(API + '/yo', {
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + this.state.token }
      });
      if (respuesta.status === 401) {
        this.borrarSesion();
        this.setState({ aviso: 'Tu sesión ha caducado. Vuelve a iniciar sesión.' });
      }
    } catch (error) {
      console.log(error);
    }
  }

  iniciarSesion(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.setState({ token: token, usuario: usuario, mostrarLogin: false, aviso: null });
  }

  async cerrarSesion() {
    try {
      await fetch(API + '/logout', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + this.state.token }
      });
    } catch (error) {
      console.log(error);
    }
    this.borrarSesion();
  }

  borrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.setState({ token: null, usuario: null });
  }

  render() {
    let sesion;
    if (this.state.usuario) {
      sesion = (
        <div className="sesion">
          <span>Hola, {this.state.usuario.nombre} ({this.state.usuario.perfil})</span>
          <button onClick={() => this.cerrarSesion()}>Cerrar sesión</button>
        </div>
      );
    } else {
      sesion = (
        <div className="sesion">
          <button onClick={() => this.setState({ mostrarLogin: true })}>Iniciar sesión</button>
        </div>
      );
    }

    let login = null;
    if (this.state.mostrarLogin && !this.state.usuario) {
      login = (
        <FormularioLogin
          api={API}
          alIniciarSesion={(token, usuario) => this.iniciarSesion(token, usuario)}
          alCancelar={() => this.setState({ mostrarLogin: false })}
        />
      );
    }

    let aviso = null;
    if (this.state.aviso) {
      aviso = <p role="alert" className="aviso">{this.state.aviso}</p>;
    }

    let contenido;
    if (this.state.cargando) {
      contenido = <p>Cargando charlas...</p>;
    } else if (this.state.error) {
      contenido = <p role="alert" className="error">{this.state.error}</p>;
    } else if (this.state.charlas.length === 0) {
      contenido = <p>Todavía no hay charlas publicadas.</p>;
    } else {
      contenido = (
        <div className="lista">
          {this.state.charlas.map((charla) => <TarjetaCharla key={charla.id} charla={charla} />)}
        </div>
      );
    }

    return (
      <main>
        <header className="cabecera">
          <h1>SABITECH · Programa de charlas</h1>
          {sesion}
        </header>
        {aviso}
        {login}
        {contenido}
      </main>
    );
  }
}

export default App;