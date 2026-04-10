import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsuarioById, updateUsuario, type Usuario } from '../api/usuarios';
import { getMedicoById, updateMedico, type Medico } from '../api/medicos';
import './MiPerfil.css';

const MiPerfil: React.FC = () => {
  const queryClient = useQueryClient();

  const userType = localStorage.getItem('userType') || 'U';
  const userId = Number(localStorage.getItem('userId') || '0');

  // Read-only fields (display only)
  const [displayData, setDisplayData] = useState({
    Nombre: '',
    Prim_Apellido: '',
    Seg_Apellido: '',
    Cedula: '',
    FechaNacimiento: '',
    Sexo: '',
  });

  // Editable form
  const [form, setForm] = useState({
    Telefono: '',
    Correo: '',
    Password: '',
    PasswordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Load profile
  const { data: perfilData, isLoading } = useQuery({
    queryKey: ['perfil', userId, userType],
    queryFn: async () => {
      if (userType === 'M') {
        return getMedicoById(userId) as Promise<Medico>;
      } else {
        return getUsuarioById(userId) as Promise<Usuario>;
      }
    },
    enabled: userId > 0,
  });

  useEffect(() => {
    if (!perfilData) return;
    if (userType === 'M') {
      const m = perfilData as Medico;
      setDisplayData({
        Nombre: m.Nombre || '',
        Prim_Apellido: m.Prim_Apellido || '',
        Seg_Apellido: m.Seg_Apellido || '',
        Cedula: m.Cedula || '',
        FechaNacimiento: '',
        Sexo: '',
      });
      setForm({
        Telefono: m.Telefono || '',
        Correo: m.Correo || '',
        Password: '',
        PasswordConfirm: '',
      });
    } else {
      const u = perfilData as Usuario;
      setDisplayData({
        Nombre: u.Nombre || '',
        Prim_Apellido: u.Prim_Apellido || '',
        Seg_Apellido: u.Seg_Apellido || '',
        Cedula: u.Cedula || '',
        FechaNacimiento: u.FechaNacimiento || '',
        Sexo: u.Sexo || '',
      });
      setForm({
        Telefono: u.Telefono || '',
        Correo: u.Correo || '',
        Password: '',
        PasswordConfirm: '',
      });
    }
  }, [perfilData, userType]);

  // User mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (userType === 'M') {
        const data: any = {
          Nombre: displayData.Nombre,
          Prim_Apellido: displayData.Prim_Apellido,
          Seg_Apellido: displayData.Seg_Apellido,
          Cedula: displayData.Cedula,
          Telefono: form.Telefono,
          Correo: form.Correo,
        };
        if (form.Password) data.PasswordHash = form.Password;
        return updateMedico(userId, data);
      } else {
        const data: any = {
          Nombre: displayData.Nombre,
          Prim_Apellido: displayData.Prim_Apellido,
          Seg_Apellido: displayData.Seg_Apellido,
          Cedula: displayData.Cedula,
          Telefono: form.Telefono,
          Correo: form.Correo,
          FechaNacimiento: displayData.FechaNacimiento,
          Sexo: displayData.Sexo,
          Estado: 'Activo',
        };
        if (form.Password) data.PasswordHash = form.Password;
        return updateUsuario(userId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil', userId, userType] });
      alert('Perfil actualizado correctamente');
      // Update localStorage with new name/email
      localStorage.setItem('userName', `${displayData.Nombre} ${displayData.Prim_Apellido}`);
      localStorage.setItem('userEmail', form.Correo);
      setForm(f => ({ ...f, Password: '', PasswordConfirm: '' }));
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Error al actualizar el perfil');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Correo) {
      alert('El correo es obligatorio');
      return;
    }
    if (form.Password !== form.PasswordConfirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (form.Password && form.Password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    updateMutation.mutate();
  };

  const formatSexo = (sexo: string) => {
    if (sexo === 'M') return 'Masculino';
    if (sexo === 'F') return 'Femenino';
    return sexo;
  };

  if (isLoading) {
    return <div className="text-center p-4">Cargando perfil...</div>;
  }

  return (
    <div className="mi-perfil-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span className="cm-bc-active">Mi Perfil</span>
      </nav>

      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary">{displayData.Nombre} {displayData.Prim_Apellido}</span>, Bienvenido</h1>
        <p>{localStorage.getItem('userEmail')}</p>
      </div>

      {/* Info personal (solo lectura) */}
      <div className="card card_border py-2 mb-4" style={{ background: '#f8f9fa' }}>
        <div className="card-body">
          <div className="perfil-section-title">📋 Información personal (solo lectura)</div>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label className="input__label">Nombre</label>
              <input type="text" className="form-control input-style" value={displayData.Nombre} disabled />
            </div>
            <div className="form-group col-md-4">
              <label className="input__label">Primer Apellido</label>
              <input type="text" className="form-control input-style" value={displayData.Prim_Apellido} disabled />
            </div>
            <div className="form-group col-md-4">
              <label className="input__label">Segundo Apellido</label>
              <input type="text" className="form-control input-style" value={displayData.Seg_Apellido} disabled />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label className="input__label">Cédula</label>
              <input type="text" className="form-control input-style" value={displayData.Cedula} disabled />
            </div>
            {userType !== 'M' && (
              <>
                <div className="form-group col-md-4">
                  <label className="input__label">Fecha de Nacimiento</label>
                  <input type="text" className="form-control input-style"
                    value={displayData.FechaNacimiento ? displayData.FechaNacimiento.substring(0, 10) : ''} disabled />
                </div>
                <div className="form-group col-md-4">
                  <label className="input__label">Sexo</label>
                  <input type="text" className="form-control input-style" value={formatSexo(displayData.Sexo)} disabled />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Datos editables */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Mi Perfil <span></span></h3>
        </div>
        <div className="card-body">
          <div className="perfil-section-title">✏️ Datos que puedes modificar</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="txtTel" className="input__label">Teléfono</label>
                <input
                  type="text"
                  className="form-control input-style"
                  id="txtTel"
                  name="Telefono"
                  placeholder="Teléfono"
                  maxLength={15}
                  value={form.Telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtEml" className="input__label">Correo Electrónico *</label>
                <input
                  type="email"
                  className="form-control input-style"
                  id="txtEml"
                  name="Correo"
                  placeholder="correo@ejemplo.com"
                  required
                  maxLength={100}
                  value={form.Correo}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="txtPwd" className="input__label">Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control input-style"
                    id="txtPwd"
                    name="Password"
                    placeholder="Dejá vacío para no cambiarla"
                    maxLength={100}
                    value={form.Password}
                    onChange={handleChange}
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    className="pwd-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title="Mostrar/ocultar contraseña"
                    style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#6c757d', padding: '0'
                    }}
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <small className="form-text text-muted">
                  Dejá este campo vacío si no querés cambiar tu contraseña.
                </small>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtPwdConfirm" className="input__label">Confirmar Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control input-style"
                    id="txtPwdConfirm"
                    name="PasswordConfirm"
                    placeholder="Repetí la nueva contraseña"
                    maxLength={100}
                    value={form.PasswordConfirm}
                    onChange={handleChange}
                    style={{ paddingRight: '42px' }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-style mt-4" disabled={updateMutation.isPending}>
              💾 {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
