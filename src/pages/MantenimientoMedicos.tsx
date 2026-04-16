import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
import { getMedicoById, createMedico, updateMedico, getMedicoClinicas, addMedicoClinica, deleteMedicoClinica, uploadLogoClinica } from '../api/medicos';
import { resolveApiFileUrl } from '../api/client';
=======
import { getMedicoById, createMedico, updateMedico, getMedicoClinicas, addMedicoClinica, deleteMedicoClinica } from '../api/medicos';
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
import './MantenimientoMedicos.css';

interface MedicoForm {
  Id_Medico: number;
  Nombre: string;
  Prim_Apellido: string;
  Seg_Apellido: string;
  Cedula: string;
  Telefono: string;
  Correo: string;
  Estado: string;
  Password: string;
}

interface ClinicaForm {
  Id_Clinica: number;
  Nombre: string;
  Direccion: string;
  Latitud: string;
  Longitud: string;
  LogoUrl: string;
}

const initialForm: MedicoForm = {
  Id_Medico: 0,
  Nombre: '',
  Prim_Apellido: '',
  Seg_Apellido: '',
  Cedula: '',
  Telefono: '',
  Correo: '',
  Estado: 'A',
  Password: ''
};

const initialClinica: ClinicaForm = {
  Id_Clinica: 0,
  Nombre: '',
  Direccion: '',
  Latitud: '',
  Longitud: '',
  LogoUrl: ''
};

const MantenimientoMedicos: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<MedicoForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showClinicasPanel, setShowClinicasPanel] = useState(false);
  const [clinicaForm, setClinicaForm] = useState<ClinicaForm>(initialClinica);
<<<<<<< HEAD
  const [logoFile, setLogoFile] = useState<File | null>(null);
=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91

  const { data: medico, isLoading: isLoadingMedico } = useQuery({
    queryKey: ['medico', id],
    queryFn: () => getMedicoById(Number(id)),
    enabled: isEdit,
  });

  const { data: clinicas, isLoading: isLoadingClinicas } = useQuery({
    queryKey: ['medicoClinicas', id],
    queryFn: () => getMedicoClinicas(Number(id)),
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
    if (medico) {
      setForm({
        Id_Medico: medico.Id_Medico,
        Nombre: medico.Nombre,
        Prim_Apellido: medico.Prim_Apellido,
        Seg_Apellido: medico.Seg_Apellido,
        Cedula: medico.Cedula,
        Telefono: medico.Telefono || '',
        Correo: medico.Correo,
        Estado: medico.Estado === 'Activo' ? 'A' : 'I',
        Password: ''
      });
      setShowClinicasPanel(true);
    }
  }, [medico]);

  const createMutation = useMutation({
    mutationFn: createMedico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
      alert('Médico creado correctamente');
      navigate('/medicos');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Error al crear médico');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateMedico(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
      alert('Información guardada de forma correcta');
      navigate('/medicos');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Error al actualizar médico');
    },
  });

  const addClinicaMutation = useMutation({
    mutationFn: (data: any) => addMedicoClinica(data),
<<<<<<< HEAD
    onSuccess: async (data: any) => {
      // El SP retorna @FinalIdClinica en ValorScalar → llega como Id_MedicoClinica
      const idClinica = data?.Id_MedicoClinica;
      if (logoFile && idClinica) {
        try {
          await uploadLogoClinica(idClinica, logoFile);
        } catch {
          // no bloquear el flujo si el logo falla
        }
      }
      setLogoFile(null);
=======
    onSuccess: () => {
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
      queryClient.invalidateQueries({ queryKey: ['medicoClinicas', id] });
      setClinicaForm(initialClinica);
      alert('Clínica guardada correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Error al guardar clínica');
    },
  });

  const deleteClinicaMutation = useMutation({
    mutationFn: ({ clinicaId }: { clinicaId: number }) => 
      deleteMedicoClinica(clinicaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicoClinicas', id] });
      alert('Clínica eliminada correctamente');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Error al eliminar clínica');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const field = id.replace('txt', '').replace('cbo', '');
    if (field === 'Nom' || field === 'Nombre') {
      setForm(prev => ({ ...prev, Nombre: value }));
    } else if (field === 'Ape1') {
      setForm(prev => ({ ...prev, Prim_Apellido: value }));
    } else if (field === 'Ape2') {
      setForm(prev => ({ ...prev, Seg_Apellido: value }));
    } else if (field === 'Ced') {
      setForm(prev => ({ ...prev, Cedula: value }));
    } else if (field === 'Tel') {
      setForm(prev => ({ ...prev, Telefono: value }));
    } else if (field === 'Eml') {
      setForm(prev => ({ ...prev, Correo: value }));
    } else if (field === 'Sts') {
      setForm(prev => ({ ...prev, Estado: value }));
    } else if (field === 'Pwd') {
      setForm(prev => ({ ...prev, Password: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.Nombre || !form.Prim_Apellido || !form.Cedula || !form.Correo) {
      alert('Todos los campos requeridos deben ser completados');
      return;
    }

    const userData = {
      Nombre: form.Nombre,
      Prim_Apellido: form.Prim_Apellido,
      Seg_Apellido: form.Seg_Apellido,
      Cedula: form.Cedula,
      Telefono: form.Telefono,
      Correo: form.Correo,
      Estado: form.Estado === 'A' ? 'Activo' : 'Inactivo',
      PasswordHash: form.Password
    };

    if (isEdit) {
      updateMutation.mutate({ id: form.Id_Medico, data: userData });
    } else {
      createMutation.mutate(userData);
    }
  };

  const handleRegresar = () => {
    navigate('/medicos');
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const togglePanelClinicas = () => {
    setShowClinicasPanel(!showClinicasPanel);
  };

  const handleClinicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'txtClinicaNombre') {
      setClinicaForm(prev => ({ ...prev, Nombre: value }));
    } else if (id === 'txtClinicaDireccion') {
      setClinicaForm(prev => ({ ...prev, Direccion: value }));
    } else if (id === 'txtClinicaLatitud') {
      setClinicaForm(prev => ({ ...prev, Latitud: value }));
    } else if (id === 'txtClinicaLongitud') {
      setClinicaForm(prev => ({ ...prev, Longitud: value }));
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
<<<<<<< HEAD
    setLogoFile(file); // archivo real para subir al servidor
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setClinicaForm(prev => ({ ...prev, LogoUrl: dataUrl })); // base64 solo para preview
=======
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setClinicaForm(prev => ({ ...prev, LogoUrl: dataUrl }));
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
    };
    reader.readAsDataURL(file);
  };

  const handleGuardarClinica = () => {
    if (!clinicaForm.Nombre || !id) {
      alert('El nombre de la clínica es requerido');
      return;
    }
    addClinicaMutation.mutate({
      Id_Medico: Number(id),
      Id_Clinica: clinicaForm.Id_Clinica,
      Nombre: clinicaForm.Nombre,
      Direccion: clinicaForm.Direccion,
      Latitud: clinicaForm.Latitud,
      Longitud: clinicaForm.Longitud,
<<<<<<< HEAD
      Logo_Url: '' // el logo se sube por separado tras crear la clínica
=======
      Logo_Url: clinicaForm.LogoUrl
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
    });
  };

  const handleEliminarClinica = (idMedicoClinica: number) => {
    if (window.confirm('¿Está seguro de eliminar esta clínica?')) {
      deleteClinicaMutation.mutate({ clinicaId: idMedicoClinica });
    }
  };

  const handleLimpiarFormClinica = () => {
    setClinicaForm(initialClinica);
<<<<<<< HEAD
    setLogoFile(null);
=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  };

  if (isLoadingMedico) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="mantenimiento-medicos-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/medicos')} className="cm-bc-link">Consulta de Médicos</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Mantenimiento de Médicos</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
      </div>

      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Mantenimiento de Información de Médicos <span></span></h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* FILA 1: Nombre, Primer Apellido, Segundo Apellido */}
            <div className="form-row">
              <div className="form-group col-md-4">
                <label htmlFor="txtNom" className="input__label">Nombre *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtNom"
                  placeholder="Nombre del Médico"
                  required
                  maxLength={50}
                  value={form.Nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="txtApe1" className="input__label">Primer Apellido *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtApe1"
                  placeholder="Primer Apellido"
                  required
                  maxLength={50}
                  value={form.Prim_Apellido}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="txtApe2" className="input__label">Segundo Apellido *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtApe2"
                  placeholder="Segundo Apellido"
                  required
                  maxLength={50}
                  value={form.Seg_Apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FILA 2: Cédula, Teléfono */}
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="txtCed" className="input__label">Cédula *</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtCed"
                  placeholder="Número de Cédula"
                  required
                  maxLength={20}
                  value={form.Cedula}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtTel" className="input__label">Teléfono</label>
                <input 
                  type="text" 
                  className="form-control input-style" 
                  id="txtTel"
                  placeholder="Teléfono"
                  maxLength={15}
                  value={form.Telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FILA 3: Correo, Password */}
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="txtEml" className="input__label">Correo *</label>
                <input 
                  type="email" 
                  className="form-control input-style" 
                  id="txtEml"
                  placeholder="Correo Electrónico"
                  required
                  maxLength={100}
                  value={form.Correo}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="txtPwd" className="input__label">Contraseña</label>
                <div className="input-group">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-control input-style" 
                    id="txtPwd"
                    placeholder={isEdit ? "Dejar vacío para no cambiar" : "Se genera automáticamente al crear"}
                    maxLength={100}
                    value={form.Password}
                    onChange={handleChange}
                  />
                  <div className="input-group-append">
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      onClick={togglePassword}
                      title="Mostrar/Ocultar"
                    >
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <small className="form-text text-muted">
                  {isEdit ? 'Dejar vacío para no cambiar la contraseña.' : 'Al crear: se genera y envía por correo.'}
                </small>
              </div>
            </div>

            {/* FILA 4: Estado */}
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="cboSts" className="input__label">Estado *</label>
                <select 
                  id="cboSts" 
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

            {/* Botones */}
            <button type="submit" className="btn btn-primary btn-style mt-3">
              <i className="fa fa-save"></i> Guardar
            </button>
            <button type="button" className="btn btn-primary btn-style mt-3" onClick={handleRegresar}>
              <i className="fa fa-arrow-left"></i> Regresar
            </button>
          </form>

          {/* Panel Clínicas (solo visible al editar) */}
          {isEdit && (
            <div className="clinicas-panel" style={{ marginTop: '2rem' }}>
              <div className="clinicas-panel__header" onClick={togglePanelClinicas}>
                <h5>
                  <i className="fa fa-hospital-o"></i>
                  Clínicas del Médico
                  <span className="badge-clinica-count">
                    {clinicas?.length || 0}
                  </span>
                </h5>
                <i className={`fa fa-chevron-down clinicas-panel__chevron ${showClinicasPanel ? 'open' : ''}`}></i>
              </div>
              <div className={`clinicas-panel__body ${showClinicasPanel ? 'open' : ''}`}>
                {/* Mini-form nueva clínica */}
                <div className="clinic-form">
                  <h6>
                    <i className="fa fa-plus-circle"></i> Agregar Clínica
                  </h6>
                  <div className="form-row">
                    <div className="form-group col-md-5">
                      <label className="input__label">Nombre *</label>
                      <input 
                        type="text" 
                        className="form-control input-style" 
                        id="txtClinicaNombre"
                        placeholder="Nombre de la clínica"
                        maxLength={150}
                        value={clinicaForm.Nombre}
                        onChange={handleClinicaChange}
                      />
                    </div>
                    <div className="form-group col-md-7">
                      <label className="input__label">Dirección</label>
                      <input 
                        type="text" 
                        className="form-control input-style" 
                        id="txtClinicaDireccion"
                        placeholder="Dirección de la clínica"
                        maxLength={500}
                        value={clinicaForm.Direccion}
                        onChange={handleClinicaChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-3">
                      <label className="input__label">Latitud</label>
                      <input 
                        type="text" 
                        className="form-control input-style" 
                        id="txtClinicaLatitud"
                        placeholder="Ej: 9.9341"
                        value={clinicaForm.Latitud}
                        onChange={handleClinicaChange}
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Longitud</label>
                      <input 
                        type="text" 
                        className="form-control input-style" 
                        id="txtClinicaLongitud"
                        placeholder="Ej: -84.0875"
                        value={clinicaForm.Longitud}
                        onChange={handleClinicaChange}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label className="input__label">Logo</label>
                      <input
                        type="file"
                        className="form-control input-style"
                        id="txtClinicaLogo"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                      />
                      {clinicaForm.LogoUrl && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img
                            src={clinicaForm.LogoUrl}
                            alt="Preview"
                            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #e0e0e0' }}
                          />
                          <small className="form-text text-muted d-block">Vista previa — pegar URL en producción</small>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="button" className="btn btn-success btn-sm" onClick={handleGuardarClinica}>
                    <i className="fa fa-check"></i> Guardar Clínica
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm ml-2" onClick={handleLimpiarFormClinica}>
                    <i className="fa fa-times"></i> Limpiar
                  </button>
                </div>

                {/* Listado de clínicas asignadas */}
                {isLoadingClinicas ? (
                  <div><i className="fa fa-spinner fa-spin"></i> Cargando clínicas...</div>
                ) : clinicas && clinicas.length > 0 ? (
                  <table id="tblClinicasMedico" className="table table-sm">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}></th>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicas.map((c: any) => (
                        <tr key={c.Id_MedicoClinica}>
                          <td>
                            {c.LogoUrl ? (
<<<<<<< HEAD
                              <img src={resolveApiFileUrl(c.LogoUrl)} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
=======
                              <img src={c.LogoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa fa-hospital-o" style={{ color: '#aaa' }}></i>
                              </div>
                            )}
                          </td>
                          <td>{c.Nombre}</td>
                          <td>{c.Direccion}</td>
                          <td>
                            <button 
                              className="btn btn-danger btn-quitar-clinica"
                              onClick={() => handleEliminarClinica(c.Id_MedicoClinica)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div id="divNoClinicas">
                    <i className="fa fa-info-circle"></i> Este médico aún no tiene clínicas asignadas.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MantenimientoMedicos;
