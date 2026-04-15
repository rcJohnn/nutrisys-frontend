import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsuarioById, createUsuario, updateUsuario } from '../api/usuarios';
import './MantenimientoUsuarios.css';

interface UsuarioForm {
  Id_Usuario: number;
  Nombre: string;
  Prim_Apellido: string;
  Seg_Apellido: string;
  Cedula: string;
  FechaNacimiento: string;
  Sexo: string;
  Telefono: string;
  Correo: string;
  Observaciones: string;
  Estado: string;
  Password: string;
}

const initialForm: UsuarioForm = {
  Id_Usuario: 0,
  Nombre: '',
  Prim_Apellido: '',
  Seg_Apellido: '',
  Cedula: '',
  FechaNacimiento: '',
  Sexo: '',
  Telefono: '',
  Correo: '',
  Observaciones: '',
  Estado: 'A',
  Password: ''
};

const MantenimientoUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<UsuarioForm>(initialForm);
  const [isSearchingCedula, setIsSearchingCedula] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userType = localStorage.getItem('userType') || 'A';

  const { data: usuario, isLoading } = useQuery({
    queryKey: ['usuario', id],
    queryFn: () => getUsuarioById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const el = document.getElementById('nombreUsuario');
    const el2 = document.getElementById('emlUsuario');
    if (el) el.textContent = name;
    if (el2) el2.textContent = email;
  }, []);

  useEffect(() => {
    if (usuario) {
      setForm({
        Id_Usuario: usuario.Id_Usuario,
        Nombre: usuario.Nombre,
        Prim_Apellido: usuario.Prim_Apellido,
        Seg_Apellido: usuario.Seg_Apellido,
        Cedula: usuario.Cedula,
        FechaNacimiento: usuario.FechaNacimiento ? new Date(usuario.FechaNacimiento).toISOString().split('T')[0] : '',
        Sexo: usuario.Sexo,
        Telefono: usuario.Telefono,
        Correo: usuario.Correo,
        Observaciones: usuario.Observaciones || '',
        Estado: usuario.Estado === 'Activo' ? 'A' : 'I',
        Password: ''
      });
    }
  }, [usuario]);

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      alert('Usuario creado correctamente. Se ha enviado la contraseña temporal al correo registrado.');
      navigate('/usuarios');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      alert('Información guardada de forma correcta.');
      navigate('/usuarios');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Error al actualizar usuario');
    },
  });

  const handleConsultarCedula = async () => {
    if (!form.Cedula) {
      alert('Ingrese una cédula');
      return;
    }
    setIsSearchingCedula(true);
    try {
      const response = await fetch(`http://localhost:5159/api/cedula/${form.Cedula}`);
      const data = await response.json();
      
      if (data.nombre) {
        setForm(prev => ({
          ...prev,
          Nombre: data.nombre || prev.Nombre,
          Prim_Apellido: data.apellido1 || prev.Prim_Apellido,
          Seg_Apellido: data.apellido2 || prev.Seg_Apellido
        }));
      } else {
        alert(data.mensaje || 'No se encontraron datos para esta cédula');
      }
    } catch (error) {
      alert('Error al consultar la cédula');
    } finally {
      setIsSearchingCedula(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id.replace('txt', '')]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.Nombre || !form.Prim_Apellido || !form.Cedula || !form.FechaNacimiento || !form.Sexo || !form.Correo) {
      alert('Todos los campos requeridos deben ser completados');
      return;
    }

    const userData = {
      Nombre: form.Nombre,
      Prim_Apellido: form.Prim_Apellido,
      Seg_Apellido: form.Seg_Apellido,
      Cedula: form.Cedula,
      FechaNacimiento: form.FechaNacimiento,
      Sexo: form.Sexo,
      Telefono: form.Telefono,
      Correo: form.Correo,
      Observaciones: form.Observaciones,
      Estado: form.Estado === 'A' ? 'Activo' : 'Inactivo',
      PasswordHash: form.Password
    };

    if (isEdit) {
      updateMutation.mutate({ id: form.Id_Usuario, data: userData });
    } else {
      createMutation.mutate(userData);
    }
  };

  const handleRegresar = () => {
    navigate('/usuarios');
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="mantenimiento-usuarios-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/usuarios')} className="cm-bc-link">Consulta de Usuarios</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Mantenimiento de Usuarios</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
      </div>

      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Mantenimiento de Información de Usuarios <span></span></h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* FILA 2: Cédula y Fecha de Nacimiento */}
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="txtCedula" className="input__label">Cédula *</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control input-style" 
                    id="txtCedula" 
                    placeholder="Ingrese cédula"
                    required
                    maxLength={20}
                    value={form.Cedula}
                    onChange={handleChange}
                  />
                  <div className="input-group-append">
                    <button 
                      className="btn btn-primary" 
                      type="button" 
                      onClick={handleConsultarCedula}
                      disabled={isSearchingCedula}
                    >
                      <i className="fa fa-search"></i> {isSearchingCedula ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>
                <small className="form-text text-muted">Consulta automática en el Registro Nacional</small>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtFechaNacimiento" className="input__label">Fecha de Nacimiento *</label>
                <input 
                  type="date" 
                  className="form-control input-style" 
                  id="txtFechaNacimiento" 
                  required
                  value={form.FechaNacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FILA 1: Nombre, Primer Apellido, Segundo Apellido */}
            <div className="form-row">
              <div className="form-group col-md-4">
                <label htmlFor="txtNombre" className="input__label">Nombre *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtNombre"
                  placeholder="Nombre del Usuario"
                  required
                  maxLength={50}
                  value={form.Nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="txtPrim_Apellido" className="input__label">Primer Apellido *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtPrim_Apellido"
                  placeholder="Primer Apellido"
                  required
                  maxLength={50}
                  value={form.Prim_Apellido}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="txtSeg_Apellido" className="input__label">Segundo Apellido *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtSeg_Apellido"
                  placeholder="Segundo Apellido"
                  required
                  maxLength={50}
                  value={form.Seg_Apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FILA 3: Teléfono y Correo */}
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="txtTelefono" className="input__label">Teléfono</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtTelefono" 
                  placeholder="Teléfono"
                  value={form.Telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtCorreo" className="input__label">Correo Electrónico *</label>
                <input 
                  type="email" 
                  className="form-control input-style" 
                  id="txtCorreo" 
                  placeholder="correo@ejemplo.com"
                  required
                  value={form.Correo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FILA 4: Password (solo en edición) y Sexo */}
            <div className="form-row" style={{ display: isEdit ? 'flex' : 'none' }}>
              <div className="form-group col-md-6">
                <label htmlFor="txtPassword" className="input__label">Nueva Contraseña</label>
                <div className="input-group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control input-style" 
                    id="txtPassword" 
                    placeholder={isEdit ? "Se generará automáticamente al crear" : "Se generará automáticamente"}
                    maxLength={100}
                    value={form.Password}
                    onChange={handleChange}
                  />
                  <div className="input-group-append">
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      onClick={togglePassword}
                      title="Mostrar/Ocultar contraseña"
                    >
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <small className="form-text text-muted">Dejar vacío para no cambiar la contraseña.</small>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtSexo" className="input__label">Sexo *</label>
                <select 
                  className="form-control input-style" 
                  id="txtSexo"
                  required
                  value={form.Sexo}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            {/* Si es crear, mostrar sexo en fila separada */}
            {!isEdit && (
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="txtSexoNew" className="input__label">Sexo *</label>
                  <select 
                    className="form-control input-style" 
                    id="txtSexoNew"
                    required
                    value={form.Sexo}
                    onChange={(e) => setForm(prev => ({ ...prev, Sexo: e.target.value }))}
                  >
                    <option value="">Seleccione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>
            )}

            {/* FILA 5: Observaciones */}
            <div className="form-row">
              <div className="form-group col-md-12">
                <label htmlFor="txtObservaciones" className="input__label">Observaciones</label>
                <textarea 
                  className="form-control input-style" 
                  id="txtObservaciones" 
                  rows={3} 
                  placeholder="Observaciones adicionales"
                  maxLength={500}
                  value={form.Observaciones}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* FILA 6: Estado (soloAdmin) */}
            {(userType === 'A') && (
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="txtEstado" className="input__label">Estado *</label>
                  <select 
                    id="txtEstado" 
                    className="form-control input-style"
                    required
                    value={form.Estado}
                    onChange={handleChange}
                  >
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                  </select>
                </div>
              </div>
            )}

            {/* Botones */}
            <button type="submit" className="btn btn-primary btn-style mt-4">
              <i className="fa fa-save"></i> Guardar
            </button>
            <button type="button" className="btn btn-primary btn-style mt-4" onClick={handleRegresar}>
              <i className="fa fa-arrow-left"></i> Regresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MantenimientoUsuarios;
