import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsuarios, type Usuario } from '../api/usuarios';
import './BusquedaPaciente.css';

const BusquedaPaciente: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || '';
  const userEmail = localStorage.getItem('userEmail') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Búsqueda de usuarios con debounce
  const buscarUsuarios = useCallback((term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    getUsuarios({ nombre: term }).then((res) => {
      setSearchResults(res as Usuario[]);
      setShowResults(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => buscarUsuarios(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, buscarUsuarios]);

  const seleccionarPaciente = (paciente: Usuario) => {
    setSearchTerm('');
    setShowResults(false);
    navigate(`/expediente/${paciente.Id_Usuario}`);
  };

  return (
    <div className="busqueda-paciente-page">
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Expediente de Pacientes</span>
      </nav>

      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary">{userName}</span>, Bienvenido</h1>
        <p>{userEmail}</p>
      </div>

      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Selección de Paciente <span></span></h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="input__label">Paciente *</label>
            <div className="bp-search-container">
              <span className="bp-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input
                type="text"
                className="form-control input-style bp-search-input"
                placeholder="Buscar paciente por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
              {showResults && searchResults.length > 0 && (
                <div className="bp-search-dropdown">
                  {searchResults.map((u) => (
                    <div key={u.Id_Usuario} className="bp-search-item" onClick={() => seleccionarPaciente(u)}>
                      <div className="bp-search-nombre">{u.Nombre} {u.Prim_Apellido} {u.Seg_Apellido}</div>
                      <div className="bp-search-email">{u.Correo}</div>
                    </div>
                  ))}
                </div>
              )}
              {showResults && searchResults.length === 0 && searchTerm.length >= 2 && (
                <div className="bp-search-dropdown">
                  <div className="bp-search-no-results">No se encontraron pacientes</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bp-info-card">
        <div className="bp-info-icon">📋</div>
        <div className="bp-info-content">
          <h4>Expediente de Paciente</h4>
          <p>Seleccione un paciente para ver y gestionar su expediente clínico, evaluación cuantitativa y análisis bioquímicos.</p>
        </div>
      </div>
    </div>
  );
};

export default BusquedaPaciente;
