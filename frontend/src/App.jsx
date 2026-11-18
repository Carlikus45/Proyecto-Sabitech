import React from 'react';
import TarjetaCharla from './components/TarjetaCharla';
import FormularioLogin from './components/FormularioLogin';
import MisReservas from './components/MisReservas';
import { fechaLarga, mesYAnio, numeroDia, yaCelebrada } from './fechas';
import './App.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
      this.setState({ error: 'No se ha podido conectar con el servidor. Comprueba tu conexión y recarga la página.', cargando: false });
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
      if (!respuesta.ok) {
        throw new Error('Error ' + respuesta.status);
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
      } else {
        let texto = datos.mensaje;
        if (!texto) {
          texto = 'Error del servidor (' + respuesta.status + '). Inténtalo más tarde.';
        }
        this.setState({ mensaje: { charlaId: charlaId, ok: false, texto: texto } });
      }

      await this.cargarMisReservas(this.state.token);
      await this.cargarCharlas();
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

    agruparPorDia() {
    const dias = [];

    for (let i = 0; i < this.state.charlas.length; i++) {
      const charla = this.state.charlas[i];
      if (!yaCelebrada(charla.fecha)) {
        let dia = null;
        for (let j = 0; j < dias.length; j++) {
          if (dias[j].fecha === charla.fecha) {
            dia = dias[j];
          }
        }
        if (dia === null) {
          dia = { fecha: charla.fecha, charlas: [] };
          dias.push(dia);
        }
        dia.charlas.push(charla);
      }
    }

    return dias;
  }


  tituloFechas(dias) {
    if (dias.length === 0) {
      return 'Programa de charlas';
    }
    let texto = '';
    for (let i = 0; i < dias.length; i++) {
      if (i > 0 && i === dias.length - 1) {
        texto = texto + ' y ';
      } else if (i > 0) {
        texto = texto + ', ';
      }
      texto = texto + numeroDia(dias[i].fecha);
    }
    return texto + ' de ' + mesYAnio(dias[dias.length - 1].fecha);
  }

  pintarCharla(charla) {
    return (
      <li key={charla.id}>
        <TarjetaCharla
          charla={charla}
          usuario={this.state.usuario}
          tieneReserva={this.tieneReserva(charla.id)}
          reservando={this.state.reservandoId === charla.id}
          mensaje={this.mensajeDe(charla.id)}
          alReservar={(id) => this.reservar(id)}
          alPedirLogin={() => this.setState({ mostrarLogin: true })}
        />
      </li>
    );
  }

  render() {
    const usuario = this.state.usuario;
    const dias = this.agruparPorDia();

    let sesion;
    if (usuario) {
      sesion = (
        <div className="sesion-usuario">
          <span>Hola, <strong>{usuario.nombre}</strong></span>
          <button className="boton boton-barra" onClick={() => this.cerrarSesion()}>Cerrar sesión</button>
        </div>
      );
    } else {
      sesion = (
        <div className="sesion-usuario">
          <button className="boton boton-barra" onClick={() => this.setState({ mostrarLogin: true })}>Iniciar sesión</button>
        </div>
      );
    }

    let menu = null;
    if (usuario && usuario.perfil === 'asistente') {
      menu = (
        <nav className="menu" aria-label="Secciones">
          <button onClick={() => this.setState({ vista: 'programa' })} aria-current={this.state.vista === 'programa'}>Programa</button>
          <button onClick={() => this.setState({ vista: 'mis-reservas' })} aria-current={this.state.vista === 'mis-reservas'}>Mis reservas</button>
        </nav>
      );
    }

    let portada;
    if (this.state.vista === 'mis-reservas' && usuario) {
      portada = (
        <section className="portada portada-corta">
          <div className="portada-contenido">
                        <div className="portada-titulo">
              <h1>Mis reservas</h1>
              <div className="portada-linea"></div>
            </div>
            <p>Guarda tu código de reserva: el día de la charla lo necesitarás para entrar.</p>
          </div>
        </section>
      );
    } else {
      portada = (
        <section className="portada">
          <div className="portada-contenido">
                        <p className="portada-evento">Jornadas tecnológicas, {this.tituloFechas(dias)}</p>
            <div className="portada-titulo">
              <h1>SABITECH</h1>
              <div className="portada-linea"></div>
            </div>
            <p>Charlas sobre desarrollo web, despliegue y accesibilidad. Elige las que te interesen y reserva tu plaza.</p>
          </div>
        </section>
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
      contenido = <MisReservas reservas={this.state.misReservas} alVerPrograma={() => this.setState({ vista: 'programa' })} />;
    } else if (this.state.cargando) {
      contenido = <p className="estado-carga">Cargando el programa...</p>;
    } else if (this.state.error) {
      contenido = <p role="alert" className="error">{this.state.error}</p>;
    } else if (this.state.charlas.length === 0) {
      contenido = <p className="vacio">Todavía no hay charlas publicadas.</p>;
        } else if (dias.length === 0) {
      contenido = <p className="vacio">No quedan charlas próximas en el programa.</p>;
    } else {
      contenido = (
        <div>
          {dias.map((dia) => (
            <section key={dia.fecha} className="dia">
              <h2 className="dia-titulo">{fechaLarga(dia.fecha)}</h2>
              <ol className="sesiones">
                {dia.charlas.map((charla) => this.pintarCharla(charla))}
              </ol>
            </section>
          ))}
        </div>
      );
    }

    return (
      <div className="pagina">
        <header className="barra">
          <div className="barra-contenido">
            <p className="marca">SABITECH</p>
            {menu}
            {sesion}
          </div>
        </header>
        {portada}
        <main className="contenido">
          {aviso}
          {login}
          {contenido}
        </main>
        <footer className="pie">
          <p>SABITECH WEB, desarrollada por BlackVan Events para las jornadas SABITECH.</p>
        </footer>
      </div>
    );
  }
}

export default App;