import React from 'react';
import TarjetaCharla from './components/TarjetaCharla';
import './App.css';

const API = 'http://127.0.0.1:8000/api';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { charlas: [], cargando: true, error: null };
  }

  async componentDidMount() {
    try {
      const respuesta = await fetch(API + '/charlas');
      if (!respuesta.ok) {
        throw new Error('Error ' + respuesta.status);
      }
      const datos = await respuesta.json();
      this.setState({ charlas: datos, cargando: false });
    } catch (error) {
      this.setState({ error: 'No se ha podido conectar con el servidor.', cargando: false });
    }
  }

  render() {
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
        <h1>SABITECH · Programa de charlas</h1>
        {contenido}
      </main>
    );
  }
}

export default App;