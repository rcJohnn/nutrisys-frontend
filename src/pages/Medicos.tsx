import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedicos, deleteMedico, type MedicoFiltros } from '../api/medicos';
import { Pagination } from '../components/Pagination';
import './Medicos.css';

const PAGE_SIZE = 10;

const Medicos: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userType = localStorage.getItem('userType') || 'A';
  
  const [filtros, setFiltros] = useState<MedicoFiltros>({
    correo: '',
    nombre: '',
    estado: 'A'
  });
  const [page, setPage] = useState(1);

  const { data: medicos, isLoading, refetch } = useQuery({
    queryKey: ['medicos', filtros],
    queryFn: () => getMedicos(filtros),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, force }: { id: number; force: boolean }) => {
      const userId = parseInt(localStorage.getItem('userId') || '0');
      return deleteMedico(id, userId, force);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
    },
  });

  useEffect(() => {
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const el = document.getElementById('nombreUsuario');
    const el2 = document.getElementById('emlUsuario');
    if (el) el.textContent = name;
    if (el2) el2.textContent = email;
  }, []);

  const handleCrearMedico = () => {
    navigate('/medicos/nuevo');
  };

  const handleEditarMedico = (id: number) => {
    navigate(`/medicos/editar/${id}`);
  };

  const handleIrConfigAgenda = (id: number) => {
    navigate(`/config-agenda?medicoId=${id}`);
  };

  const handleEliminarMedico = async (id: number) => {
    const result = window.confirm('¿Está seguro de eliminar este médico?');
    if (result) {
      try {
        await deleteMutation.mutateAsync({ id, force: false });
        alert('Médico eliminado correctamente');
      } catch (error: any) {
        if (error.response?.data?.error?.includes('consultas')) {
          const forceDelete = window.confirm(
            'Este médico tiene consultas asociadas. ¿Desea eliminarlo de todas formas?'
          );
          if (forceDelete) {
            await deleteMutation.mutateAsync({ id, force: true });
            alert('Médico eliminado correctamente');
          }
        } else {
          alert('Error al eliminar médico');
        }
      }
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleLimpiar = () => {
    setFiltros({ correo: '', nombre: '', estado: 'A' });
    setPage(1);
  };

  // Slice data for current page
  const allMedicos = medicos || [];
  const total = allMedicos.length;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedMedicos = allMedicos.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNombreCompleto = (row: any) => {
    return `${row.Nombre || ''} ${row.Prim_Apellido || ''} ${row.Seg_Apellido || ''}`.trim();
  };

  return (
    <div className="medicos-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Consulta de Médicos</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
      </div>

      {/* Filtros */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Filtros de Búsqueda de Médicos <span></span></h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleBuscar}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="bsqCorreo" className="input__label">Correo</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="bsqCorreo"
                  placeholder="Correo del Médico"
                  maxLength={50}
                  value={filtros.correo}
                  onChange={(e) => setFiltros({ ...filtros, correo: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="bsqMedico" className="input__label">Médico</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="bsqMedico"
                  placeholder="Nombre del Médico"
                  maxLength={50}
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="bsqEstado" className="input__label">Estado</label>
                <select 
                  id="bsqEstado" 
                  className="form-control input-style"
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-style mt-4">
              <i className="fa fa-search"></i> Buscar
            </button>
            {userType === 'A' && (
              <button type="button" className="btn btn-primary btn-style mt-4" onClick={handleCrearMedico}>
                <i className="fa fa-plus"></i> Crear
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-style mt-4" onClick={handleLimpiar}>
              <i className="fa fa-eraser"></i> Limpiar
            </button>
          </form>
        </div>
      </div>

      {/* Resultados */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Resultados de Búsqueda de Médicos <span></span></h3>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center p-4">Cargando...</div>
          ) : (
            <>
              <table id="tblMedicos" className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Id Médico</th>
                    <th>Correo</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMedicos.length > 0 ? (
                    paginatedMedicos.map((row: any) => (
                      <tr key={row.Id_Medico}>
                        <td 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => handleEditarMedico(row.Id_Medico)}
                        >
                          {row.Id_Medico}
                        </td>
                        <td>{row.Correo}</td>
                        <td>{getNombreCompleto(row)}</td>
                        <td>
                          <span className={`badge badge-${row.Estado === 'Activo' ? 'success' : 'secondary'}`}>
                            {row.Estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <i 
                            className="fa fa-calendar" 
                            onClick={() => handleIrConfigAgenda(row.Id_Medico)}
                            style={{ cursor: 'pointer', marginRight: '10px', color: '#007aff' }}
                            title="Configurar Agenda"
                          ></i>
                          {userType === 'A' && (
                            <i 
                              className="fa fa-trash-o" 
                              onClick={() => handleEliminarMedico(row.Id_Medico)}
                              style={{ cursor: 'pointer' }}
                            ></i>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">No se encontraron registros</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default Medicos;
