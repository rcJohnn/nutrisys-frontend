import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAlimentos, type AlimentoResponse } from '../api/alimentos';
import { Pagination } from '../components/Pagination';
import './Alimentos.css';

const PAGE_SIZE = 10;

const Alimentos: React.FC = () => {
  const navigate = useNavigate();
  const [filtroNombre, setFiltroNombre] = useState('');
  const [page, setPage] = useState(1);

  const { data: alimentos = [], isLoading, refetch } = useQuery({
    queryKey: ['alimentos', filtroNombre],
    queryFn: () => getAlimentos(filtroNombre ? { nombre: filtroNombre } : undefined),
  });

  const handleCrear = () => {
    navigate('/mantenimiento-alimentos');
  };

  // Reset page when search changes
  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  // Slice data for current page
  const total = alimentos.length;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedAlimentos = alimentos.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="alimentos-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Consulta de Alimentos</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>Alimentos</h1>
        <p className="text-muted">Buscar y gestionar alimentos en la base de datos nutricional.</p>
      </div>

      {/* Filtros */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Filtros de Búsqueda de Alimentos</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="bsqNombre" className="input__label">Nombre del Alimento</label>
              <input
                type="text"
                className="form-control input-style"
                id="bsqNombre"
                placeholder="Nombre del Alimento"
                maxLength={150}
                value={filtroNombre}
                onChange={(e) => {
                  setFiltroNombre(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-style mt-3"
            onClick={handleSearch}
          >
            <i className="fa fa-search" /> Buscar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-style mt-3 ml-2"
            onClick={handleCrear}
          >
            <i className="fa fa-plus" /> Crear
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Resultados de Búsqueda de Alimentos</h3>
          <span className="badge bg-secondary">{total}</span>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center p-4">
              <i className="fa fa-spinner fa-spin fa-2x" />
              <p className="mt-2">Cargando alimentos...</p>
            </div>
          ) : total === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fa fa-info-circle fa-2x" />
              <p className="mt-2">No se encontraron registros</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Macrogrupo</th>
                      <th>Marca</th>
                      <th>Energía (kcal)</th>
                      <th>Proteína (g)</th>
                      <th>Grasa (g)</th>
                      <th>Carbohidratos (g)</th>
                      <th>Fibra (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAlimentos.map((al: AlimentoResponse) => (
                      <tr key={al.Id_Alimento}>
                        <td>
                          <button
                            className="btn btn-link btn-sm p-0 border-0"
                            onClick={() => navigate(`/mantenimiento-alimentos/${al.Id_Alimento}`)}
                            title="Ver detalle"
                          >
                            {al.Id_Alimento}
                          </button>
                        </td>
                        <td>{al.Nombre}</td>
                        <td>{al.Categoria || '—'}</td>
                        <td>{al.Macrogrupo || '—'}</td>
                        <td>{al.Marca || '—'}</td>
                        <td>{al.Energia_kcal?.toFixed(1) || '0'}</td>
                        <td>{al.Proteina_g?.toFixed(1) || '0'}</td>
                        <td>{al.Grasa_g?.toFixed(1) || '0'}</td>
                        <td>{al.Carbohidratos_g?.toFixed(1) || '0'}</td>
                        <td>{al.Fibra_g?.toFixed(1) || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                total={total}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alimentos;
