import React from 'react';
import TarjetaCharla from './components/TarjetaCharla';
import FormularioLogin from './components/FormularioLogin';
import MisReservas from './components/MisReservas';
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
      aviso: null,
      vista: 'programa',
      misReservas: [],
      reservandoId: null,
      mensaje: null
    };
  }

  componentDidMount() {
    this.cargarCharlas();
    if (this.state.token) {
      this.cargarMisReservas(this.state.token);
    }
  }

  cabeceras(token) {
    return { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
  }

  async cargarCharlas() {
    try {
      const respuesta = await fetch(API + '/charlas');
      if (!respuesta.ok) {
        throw new Error('Error ' + respuesta.status);
      }
      const datos = await respuesta.json();
      this.setState({ charlas: datos, cargando: false, error: null });
    } catch (error) {
      console.log(error);
      this.setState({ error: 'No se ha podido conectar con el servidor.', cargando: false });
    }
  }

  async cargarMisReservas(token) {
    try {
      const respuesta = await fetch(API + '/mis-reservas', { headers: this.cabeceras(token) });
      if (respuesta.status === 401) {
        this.borrarSesion();
        this.setState({ aviso: 'Tu sesión ha caducado. Vuelve a iniciar sesión.' });
        return;
      }
      const datos = await respuesta.json();
      this.setState({ misReservas: datos });
    } catch (error) {
      console.log(error);
    }
  }

  iniciarSesion(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.setState({ token: token, usuario: usuario, mostrarLogin: false, aviso: null });
    this.cargarMisReservas(token);
  }

  async cerrarSesion() {
    try {
      await fetch(API + '/logout', { method: 'POST', headers: this.cabeceras(this.state.token) });
    } catch (error) {
      console.log(error);
    }
    this.borrarSesion();
  }

  borrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.setState({ token: null, usuario: null, misReservas: [], vista: 'programa', mensaje: null });
  }

  async reservar(charlaId) {
    this.setState({ reservandoId: charlaId, mensaje: null });

    try {
      const respuesta = await fetch(API + '/reservas', {
        method: 'POST',
        headers: this.cabeceras(this.state.token),
        body: JSON.stringify({ charla_id: charlaId })
      });

      if (respuesta.status === 401) {
        this.borrarSesion();
        this.setState({ aviso: 'Tu sesión ha caducado. Vuelve a iniciar sesión.', reservandoId: null });
        return;
      }

      const datos = await respuesta.json();

      if (respuesta.ok) {
        this.setState({ mensaje: { charlaId: charlaId, ok: true, texto: 'Reserva confirmada. Tu código es ' + datos.codigo + '.' } });
        this.cargarMisReservas(this.state.token);
      } else {
        this.setState({ mensaje: { charlaId: charlaId, ok: false, texto: datos.mensaje } });
      }
      this.cargarCharlas();
    } catch (error) {
      console.log(error);
      this.setState({ mensaje: { charlaId: charlaId, ok: false, texto: 'No se ha podido conectar con el servidor.' } });
    }

    this.setState({ reservandoId: null });
  }

  tieneReserva(charlaId) {
    for (let i = 0; i < this.state.misReservas.length; i++) {
      const reserva = this.state.misReservas[i];
      if (reserva.charla_id === charlaId && reserva.estado === 'confirmada') {
        return true;
      }
    }
    return false;
  }

  mensajeDe(charlaId) {
    if (this.state.mensaje && this.state.mensaje.charlaId === charlaId) {
      return this.state.mensaje;
    }
    return null;
  }

  render() {
    const usuario = this.state.usuario;

    let sesion;
    if (usuario) {
      sesion = (
        <div className="sesion">
          <span>Hola, {usuario.nombre} ({usuario.perfil})</span>
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

    let menu = null;
    if (usuario && usuario.perfil === 'asistente') {
      menu = (
        <nav className="menu">
          <button onClick={() => this.setState({ vista: 'programa' })} aria-current={this.state.vista === 'programa'}>Programa</button>
          <button onClick={() => this.setState({ vista: 'mis-reservas' })} aria-current={this.state.vista === 'mis-reservas'}>Mis reservas</button>
        </nav>
      );
    }

    let login = null;
    if (this.state.mostrarLogin && !usuario) {
      login = (
        <FormularioLogin
          api={API}
          alIniciarSesion={(token, datosUsuario) => this.iniciarSesion(token, datosUsuario)}
          alCancelar={() => this.setState({ mostrarLogin: false })}
        />
      );
    }

    let aviso = null;
    if (this.state.aviso) {
      aviso = <p role="alert" className="aviso">{this.state.aviso}</p>;
    }

    let contenido;
    if (this.state.vista === 'mis-reservas' && usuario) {
      contenido = <MisReservas reservas={this.state.misReservas} />;
    } else if (this.state.cargando) {
      contenido = <p>Cargando charlas...</p>;
    } else if (this.state.error) {
      contenido = <p role="alert" className="error">{this.state.error}</p>;
    } else if (this.state.charlas.length === 0) {
      contenido = <p>Todavía no hay charlas publicadas.</p>;
    } else {
      contenido = (
        <div className="lista">
          {this.state.charlas.map((charla) => (
            <TarjetaCharla
              key={charla.id}
              charla={charla}
              usuario={usuario}
              tieneReserva={this.tieneReserva(charla.id)}
              reservando={this.state.reservandoId === charla.id}
              mensaje={this.mensajeDe(charla.id)}
              alReservar={(id) => this.reservar(id)}
              alPedirLogin={() => this.setState({ mostrarLogin: true })}
            />
          ))}
        </div>
      );
    }

    return (
      <main>
        <header className="cabecera">
          <h1>SABITECH · Programa de charlas</h1>
          {sesion}
        </header>
        {menu}
        {aviso}
        {login}
        {contenido}
      </main>
    );
  }
}

export default App;