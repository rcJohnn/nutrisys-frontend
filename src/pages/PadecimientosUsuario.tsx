import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsuarioById } from '../api/usuarios';
import {
  getPadecimientosDisponibles,
  getPadecimientosUsuario,
  asignarPadecimiento,
  eliminarPadecimiento,
} from '../api/padecimientos';
import type { PadecimientoAvailable, PadecimientoAsignado } from '../api/padecimientos';
import './PadecimientosUsuario.css';

const PadecimientosUsuario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentUserId, setCurrentUserId] = useState(0);

  useEffect(() => {
    const uid = Number(localStorage.getItem('userId') || '0');
    setCurrentUserId(uid);
  }, []);

  // Info del paciente
  const { data: paciente } = useQuery({
    queryKey: ['usuario-info', id],
    queryFn: () => getUsuarioById(Number(id)),
    enabled: Boolean(id),
  });

  // Padecimientos disponibles
  const { data: padecimientosDisponibles = [] } = useQuery({
    queryKey: ['padecimientos-disponibles'],
    queryFn: getPadecimientosDisponibles,
  });

  // Padecimientos asignados al usuario
  const { data: padecimientosAsignados = [], isLoading: loadingAsignados } = useQuery({
    queryKey: ['padecimientos-usuario', id],
    queryFn: () => getPadecimientosUsuario(Number(id)),
    enabled: Boolean(id),
  });

  const asignarMutation = useMutation({
    mutationFn: (idPadecimiento: number) => asignarPadecimiento(Number(id), idPadecimiento),
    onSuccess: (data) => {
      if (data === -1) {
        alert('Este padecimiento ya está asignado al usuario.');
      } else {
        alert('Padecimiento asignado correctamente.');
        queryClient.invalidateQueries({ queryKey: ['padecimientos-usuario', id] });
      }
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Error al asignar'),
  });

  const eliminarMutation = useMutation({
    mutationFn: (idPadecimiento: number) => eliminarPadecimiento(Number(id), idPadecimiento, currentUserId),
    onSuccess: () => {
      alert('Padecimiento eliminado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['padecimientos-usuario', id] });
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Error al eliminar'),
  });

  const handleAsignar = () => {
    const select = document.getElementById('cboPadecimientos') as HTMLSelectElement;
    const idPadecimiento = Number(select.value);
    if (!idPadecimiento) {
      alert('Por favor seleccione un padecimiento.');
      return;
    }
    asignarMutation.mutate(idPadecimiento);
  };

  const handleEliminar = (idPadecimiento: number) => {
    if (window.confirm('¿Está seguro de eliminar este padecimiento del usuario?')) {
      eliminarMutation.mutate(idPadecimiento);
    }
  };

  if (!id) {
    return (
      <div className="text-center p-5">
        <p className="text-muted">No se especificó el usuario.</p>
        <Link to="/usuarios" className="btn btn-secondary">Regresar</Link>
      </div>
    );
  }

  return (
    <div className="padecimientos-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/usuarios')} className="cm-bc-link">Consulta de Usuarios</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Padecimientos del Usuario</span>
      </nav>

      {/* Header */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>
          Hola <span className="text-primary">
            {paciente ? `${paciente.Nombre} ${paciente.Prim_Apellido} ${paciente.Seg_Apellido}` : 'Cargando...'}
          </span>, Bienvenido
        </h1>
        {paciente?.Correo && <p className="text-muted">{paciente.Correo}</p>}
      </div>

      {/* Info del usuario */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Información del Usuario</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label className="input__label">Nombre:</label>
              <p className="form-control-plaintext">
                <strong>
                  {paciente ? `${paciente.Nombre} ${paciente.Prim_Apellido} ${paciente.Seg_Apellido}` : '-'}
                </strong>
              </p>
            </div>
            <div className="form-group col-md-6">
              <label className="input__label">Correo:</label>
              <p className="form-control-plaintext">
                <strong>{paciente?.Correo || '-'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de padecimientos */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Asignar Padecimientos</h3>
        </div>
        <div className="card-body">
          <p className="text-muted">
            Seleccione los padecimientos que tiene el usuario. Estos serán usados para excluir alimentos contraindicados en los planes nutricionales.
          </p>

          <div className="form-row">
            <div className="form-group col-md-12">
              <label htmlFor="cboPadecimientos" className="input__label">Padecimientos Disponibles</label>
              <select id="cboPadecimientos" className="form-control input-style">
                <option value="0">Seleccione un padecimiento...</option>
                {(padecimientosDisponibles as PadecimientoAvailable[]).map((p) => (
                  <option key={p.Id_Padecimiento} value={p.Id_Padecimiento}>
                    {p.Descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-success btn-style mt-2"
            onClick={handleAsignar}
            disabled={asignarMutation.isPending}
          >
            <i className={`fa ${asignarMutation.isPending ? 'fa-spinner fa-spin' : 'fa-plus'}`} />
            {asignarMutation.isPending ? ' Asignando...' : ' Asignar Padecimiento'}
          </button>
        </div>
      </div>

      {/* Lista de padecimientos asignados */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Padecimientos Asignados</h3>
        </div>
        <div className="card-body">
          {loadingAsignados ? (
            <div className="text-center"><i className="fa fa-spinner fa-spin"></i></div>
          ) : (padecimientosAsignados as PadecimientoAsignado[]).length === 0 ? (
            <p className="text-center text-muted">No tiene padecimientos asignados.</p>
          ) : (
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Padecimiento</th>
                  <th style={{ textAlign: 'center' }}>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {(padecimientosAsignados as PadecimientoAsignado[]).map((p) => (
                  <tr key={p.Id_Padecimiento}>
                    <td>{p.Id_Padecimiento}</td>
                    <td>{p.Descripcion}</td>
                    <td style={{ textAlign: 'center' }}>
                      <i
                        className="fa fa-trash-o"
                        style={{ cursor: 'pointer', color: 'red' }}
                        onClick={() => handleEliminar(p.Id_Padecimiento)}
                        title="Eliminar"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="text-center mt-4 mb-5">
        <button type="button" className="btn btn-secondary btn-style" onClick={() => navigate('/usuarios')}>
          <i className="fa fa-arrow-left" /> Regresar a Usuarios
        </button>
      </div>
    </div>
  );
};

export default PadecimientosUsuario;
