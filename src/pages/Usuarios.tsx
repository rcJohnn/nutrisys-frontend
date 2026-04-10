import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsuarios, deleteUsuario, type UsuarioFiltros } from '../api/usuarios';
import { Pagination } from '../components/Pagination';
import './Usuarios.css';

const PAGE_SIZE = 10;

const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userType = localStorage.getItem('userType') || 'A';
  
  const [filtros, setFiltros] = useState<UsuarioFiltros>({
    correo: '',
    nombre: '',
    estado: 'Activo'
  });
  const [page, setPage] = useState(1);

  const { data: usuarios, isLoading, refetch } = useQuery({
    queryKey: ['usuarios', filtros],
    queryFn: () => getUsuarios(filtros),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, force }: { id: number; force: boolean }) => 
      deleteUsuario(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
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

  const handleCrearUsuario = () => {
    navigate('/usuarios/nuevo');
  };

  const handleEditarUsuario = (id: number) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleVerExpediente = (id: number) => {
    navigate(`/expediente/${id}`);
  };

  const handleVerPadecimientos = (id: number) => {
    navigate(`/usuarios/padecimientos/${id}`);
  };

  const handleEliminarUsuario = async (id: number) => {
    const result = window.confirm('¿Está seguro de eliminar este usuario?');
    if (result) {
      try {
        await deleteMutation.mutateAsync({ id, force: false });
        alert('Usuario eliminado correctamente');
      } catch (error: any) {
        if (error.response?.data?.error?.includes('consultas médicas')) {
          const forceDelete = window.confirm(
            'Este usuario tiene consultas médicas asociadas. ¿Desea eliminarlo de todas formas?'
          );
          if (forceDelete) {
            await deleteMutation.mutateAsync({ id, force: true });
            alert('Usuario eliminado correctamente');
          }
        } else {
          alert('Error al eliminar usuario');
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
    setFiltros({ correo: '', nombre: '', estado: 'Activo' });
    setPage(1);
  };

  // Slice data for current page
  const allUsuarios = usuarios || [];
  const total = allUsuarios.length;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedUsuarios = allUsuarios.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNombreCompleto = (row: any) => {
    return `${row.Nombre || ''} ${row.Prim_Apellido || ''} ${row.Seg_Apellido || ''}`.trim();
  };

  return (
    <div className="usuarios-page">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb my-breadcrumb">
          <li className="breadcrumb-item"><a href="/dashboard">Inicio</a></li>
          <li className="breadcrumb-item active" aria-current="page">Usuarios</li>
        </ol>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
      </div>

      {/* Hero: Acción principal */}
      <div className="cu-hero">
        <div className="cu-hero-info">
          <div className="cu-hero-icon"><i className="fa fa-users"></i></div>
          <div>
            <div className="cu-hero-title">Gestion de Usuarios</div>
            <div className="cu-hero-sub">Administra y gestiona los pacientes del sistema</div>
          </div>
        </div>
        {(userType === 'A' || userType === 'M') && (
          <button className="cu-hero-btn" onClick={handleCrearUsuario}>
            <i className="fa fa-user-plus"></i> Crear Nuevo Usuario
          </button>
        )}
      </div>

      {/* Layout: tabla + filtros */}
      <div className="cu-layout">
        {/* Columna principal: tabla */}
        <div className="cu-main">
          <div className="card card_border py-2 mb-4">
            <div className="cards__heading">
              <h3>Listado de Usuarios <span></span></h3>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center p-4">Cargando...</div>
              ) : (
                <>
                  <table id="tblUsuarios" className="table table-striped">
                    <thead>
                      <tr>
                        <th>Id Usuario</th>
                        <th>Correo</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'center' }}>Expediente</th>
                        <th style={{ textAlign: 'center' }}>Padecimientos</th>
                        {(userType === 'A' || userType === 'M') && (
                          <th style={{ textAlign: 'center' }}>Eliminar</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsuarios.length > 0 ? (
                        paginatedUsuarios.map((row: any) => (
                          <tr key={row.Id_Usuario}>
                            <td 
                              style={{ cursor: 'pointer' }} 
                              onClick={() => handleEditarUsuario(row.Id_Usuario)}
                            >
                              {row.Id_Usuario}
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
                                className="fa fa-folder-open-o" 
                                onClick={() => handleVerExpediente(row.Id_Usuario)}
                                style={{ cursor: 'pointer', color: '#3498db' }}
                                title="Ver Expediente Clinico"
                              ></i>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <i 
                                className="fa fa-heartbeat" 
                                onClick={() => handleVerPadecimientos(row.Id_Usuario)}
                                style={{ cursor: 'pointer', color: '#e74c3c' }}
                                title="Gestionar Padecimientos"
                              ></i>
                            </td>
                            {(userType === 'A' || userType === 'M') && (
                              <td style={{ textAlign: 'center' }}>
                                <i 
                                  className="fa fa-trash-o" 
                                  onClick={() => handleEliminarUsuario(row.Id_Usuario)}
                                  style={{ cursor: 'pointer' }}
                                ></i>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center">No se encontraron registros</td>
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

        {/* Sidebar: filtros */}
        <div className="cu-sidebar">
          <div className="cu-filter-card">
            <div className="cu-filter-header">
              <i className="fa fa-search cu-filter-icon"></i>
              <span>Filtrar usuarios</span>
            </div>
            <div className="cu-filter-body">
              <form onSubmit={handleBuscar}>
                <div className="form-group">
                  <label htmlFor="bsqCorreo" className="input__label">Correo</label>
                  <input 
                    type="text" 
                    className="form-control input-style" 
                    id="bsqCorreo"
                    placeholder="Correo del paciente"
                    maxLength={50}
                    value={filtros.correo}
                    onChange={(e) => setFiltros({ ...filtros, correo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bsqUsuario" className="input__label">Nombre</label>
                  <input 
                    type="text" 
                    className="form-control input-style" 
                    id="bsqUsuario"
                    placeholder="Nombre del paciente"
                    maxLength={50}
                    value={filtros.nombre}
                    onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bsqEstado" className="input__label">Estado</label>
                  <select 
                    id="bsqEstado" 
                    className="form-control input-style"
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="cu-filter-actions">
                  <button type="submit" className="btn btn-primary btn-style">
                    <i className="fa fa-search"></i> Buscar
                  </button>
                  <button type="button" className="btn btn-secondary btn-style" onClick={handleLimpiar}>
                    <i className="fa fa-eraser"></i> Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
