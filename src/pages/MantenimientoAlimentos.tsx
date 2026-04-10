import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createAlimento, getAlimentoById } from '../api/alimentos';
import type { CreateAlimentoRequest } from '../api/alimentos';
import './MantenimientoAlimentos.css';

const CATEGORIAS = [
  '', 'Lácteos', 'Huevos', 'Aves', 'Res', 'Cerdo', 'Embutidos',
  'Mariscos', 'Legumbres', 'Frutos Secos', 'Verduras', 'Frutas',
  'Harinas', 'Azúcares', 'Grasas'
];

const MACROGRUPOS = [
  '', 'Lácteos y derivados', 'Proteínas animales', 'Vegetales',
  'Grasas y semillas', 'Frutas', 'Cereales y harinas', 'Azúcares y dulces'
];

const initialForm: CreateAlimentoRequest = {
  Nombre: '',
  Energia_kcal: 0,
  Proteina_g: 0,
  Grasa_g: 0,
  Carbohidratos_g: 0,
  Fibra_g: 0,
  Calcio_mg: 0,
  Fosforo_mg: 0,
  Hierro_mg: 0,
  Potasio_mg: 0,
  Zinc_mg: 0,
  Magnesio_mg: 0,
  Sodio_mg: 0,
  Tiamina_mg: 0,
  Riboflavina_mg: 0,
  Niacina_mg: 0,
  Vit_B6_mg: 0,
  Vit_B12_ug: 0,
  Vit_C_mg: 0,
  Vit_A_ug: 0,
  Ac_Folico_ug: 0,
  Folato_ug: 0,
  Agua_g: 0,
  Ceniza_g: 0,
  Colesterol_mg: 0,
  Ac_Grasos_Saturados_g: 0,
  Ac_Grasos_Monoinsaturados_g: 0,
  Ac_Grasos_Poliinsaturados_g: 0,
  Categoria: '',
  Macrogrupo: '',
  Marca: '',
  Presentacion: ''
};

const MantenimientoAlimentos: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isDetalle = Boolean(id);

  const [form, setForm] = useState<CreateAlimentoRequest>(initialForm);

  // Cargar alimento si es modo detalle (ruta /mantenimiento-alimentos/:id)
  const { data: alimentoData, isLoading: loadingDetalle } = useQuery({
    queryKey: ['alimento', id],
    queryFn: () => getAlimentoById(Number(id)),
    enabled: isDetalle,
  });

  // Cuando se carga el alimento, preencher el formulario (solo lectura)
  useEffect(() => {
    if (alimentoData) {
      setForm({
        // Campos sin underscore - no se transforman
        Nombre: alimentoData.Nombre || '',
        Categoria: alimentoData.Categoria || '',
        Macrogrupo: alimentoData.Macrogrupo || '',
        Marca: alimentoData.Marca || '',
        Presentacion: alimentoData.Presentacion || '',
        // Campos con underscore - el interceptor los convierte a camelCase
        // Energia_kcal -> EnergiaKcal, Proteina_g -> ProteinaG, etc.
        Energia_kcal: (alimentoData.EnergiaKcal ?? alimentoData.Energia_kcal) || 0,
        Proteina_g: (alimentoData.ProteinaG ?? alimentoData.Proteina_g) || 0,
        Grasa_g: (alimentoData.GrasaG ?? alimentoData.Grasa_g) || 0,
        Carbohidratos_g: (alimentoData.CarbohidratosG ?? alimentoData.Carbohidratos_g) || 0,
        Fibra_g: (alimentoData.FibraG ?? alimentoData.Fibra_g) || 0,
        Calcio_mg: (alimentoData.CalcioMg ?? alimentoData.Calcio_mg) || 0,
        Fosforo_mg: (alimentoData.FosforoMg ?? alimentoData.Fosforo_mg) || 0,
        Hierro_mg: (alimentoData.HierroMg ?? alimentoData.Hierro_mg) || 0,
        Potasio_mg: (alimentoData.PotasioMg ?? alimentoData.Potasio_mg) || 0,
        Zinc_mg: (alimentoData.ZincMg ?? alimentoData.Zinc_mg) || 0,
        Magnesio_mg: (alimentoData.MagnesioMg ?? alimentoData.Magnesio_mg) || 0,
        Sodio_mg: (alimentoData.SodioMg ?? alimentoData.Sodio_mg) || 0,
        Tiamina_mg: (alimentoData.TiaminaMg ?? alimentoData.Tiamina_mg) || 0,
        Riboflavina_mg: (alimentoData.RiboflavinaMg ?? alimentoData.Riboflavina_mg) || 0,
        Niacina_mg: (alimentoData.NiacinaMg ?? alimentoData.Niacina_mg) || 0,
        Vit_B6_mg: (alimentoData.VitB6 ?? alimentoData.Vit_B6_mg) || 0,
        Vit_B12_ug: (alimentoData.VitB12 ?? alimentoData.Vit_B12_ug) || 0,
        Vit_C_mg: (alimentoData.VitCMg ?? alimentoData.Vit_C_mg) || 0,
        Vit_A_ug: (alimentoData.VitAUg ?? alimentoData.Vit_A_ug) || 0,
        Ac_Folico_ug: (alimentoData.AcFolicoUg ?? alimentoData.Ac_Folico_ug) || 0,
        Folato_ug: (alimentoData.FolatoUg ?? alimentoData.Folato_ug) || 0,
        Agua_g: (alimentoData.AguaG ?? alimentoData.Agua_g) || 0,
        Ceniza_g: (alimentoData.CenizaG ?? alimentoData.Ceniza_g) || 0,
        Colesterol_mg: (alimentoData.ColesterolMg ?? alimentoData.Colesterol_mg) || 0,
        Ac_Grasos_Saturados_g: (alimentoData.AcGrasosSaturadosG ?? alimentoData.Ac_Grasos_Saturados_g) || 0,
        Ac_Grasos_Monoinsaturados_g: (alimentoData.AcGrasosMonoinsaturadosG ?? alimentoData.Ac_Grasos_Monoinsaturados_g) || 0,
        Ac_Grasos_Poliinsaturados_g: (alimentoData.AcGrasosPoliinsaturadosG ?? alimentoData.Ac_Grasos_Poliinsaturados_g) || 0,
      });
    }
  }, [alimentoData]);

  const createMutation = useMutation({
    mutationFn: createAlimento,
    onSuccess: () => {
      alert('¡Alimento guardado correctamente!');
      navigate('/alimentos');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Error al guardar el alimento';
      alert(msg);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
    setForm(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.Nombre.trim()) {
      alert('El nombre del alimento es requerido');
      return;
    }

    createMutation.mutate(form);
  };

  const handleRegresar = () => {
    navigate('/alimentos');
  };

  const isSaving = createMutation.isPending;

  // Loading state for detail mode
  if (isDetalle && loadingDetalle) {
    return (
      <div className="mantenimiento-alimentos-page">
        <nav className="cm-breadcrumb">
          <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
          <span className="cm-bc-sep"> &rsaquo; </span>
          <span onClick={() => navigate('/alimentos')} className="cm-bc-link">Consulta de Alimentos</span>
          <span className="cm-bc-sep"> &rsaquo; </span>
          <span className="cm-bc-active">Cargando...</span>
        </nav>
        <div className="text-center p-5">
          <i className="fa fa-spinner fa-spin fa-3x text-muted"></i>
          <p className="mt-3 text-muted">Cargando información del alimento...</p>
        </div>
      </div>
    );
  }

  // NOTE: According to legacy code, editing existing alimentos is NOT allowed.
  // This form only supports CREATE operation.

  return (
    <div className="mantenimiento-alimentos-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/alimentos')} className="cm-bc-link">Consulta de Alimentos</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Información de Alimento</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>{isDetalle ? 'Detalle del Alimento' : 'Nuevo Alimento'}</h1>
        <p className="text-muted">
          {isDetalle ? 'Información nutricional del alimento seleccionado.' : 'Complete la información nutricional del alimento.'}
        </p>
      </div>

      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Información Nutricional del Alimento</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* FILA 1: Nombre */}
            <div className="form-row">
              <div className="form-group col-md-12">
                <label htmlFor="Nombre" className="input__label">Nombre del Alimento *</label>
                <input
                  type="text"
                  className="form-control input-style"
                  id="Nombre"
                  name="Nombre"
                  placeholder="Nombre del Alimento"
                  required
                  maxLength={150}
                  value={form.Nombre}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECCIÓN: BÁSICOS */}
            <h5 className="mt-3 mb-3">Básicos</h5>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Agua_g" className="input__label">Agua (g)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Agua_g"
                  name="Agua_g"
                  placeholder="0.00"
                  value={form.Agua_g}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Ceniza_g" className="input__label">Ceniza (g)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Ceniza_g"
                  name="Ceniza_g"
                  placeholder="0.00"
                  value={form.Ceniza_g}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECCIÓN: MACRONUTRIENTES */}
            <h5 className="mt-3 mb-3">Macronutrientes</h5>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Energia_kcal" className="input__label">Energía (kcal) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Energia_kcal"
                  name="Energia_kcal"
                  placeholder="0.00"
                  required
                  value={form.Energia_kcal}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Proteina_g" className="input__label">Proteína (g) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Proteina_g"
                  name="Proteina_g"
                  placeholder="0.00"
                  required
                  value={form.Proteina_g}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Grasa_g" className="input__label">Grasa (g) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Grasa_g"
                  name="Grasa_g"
                  placeholder="0.00"
                  required
                  value={form.Grasa_g}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Carbohidratos_g" className="input__label">Carbohidratos (g) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Carbohidratos_g"
                  name="Carbohidratos_g"
                  placeholder="0.00"
                  required
                  value={form.Carbohidratos_g}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Fibra_g" className="input__label">Fibra (g) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Fibra_g"
                  name="Fibra_g"
                  placeholder="0.00"
                  required
                  value={form.Fibra_g}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Colesterol_mg" className="input__label">Colesterol (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Colesterol_mg"
                  name="Colesterol_mg"
                  placeholder="0.00"
                  value={form.Colesterol_mg}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECCIÓN: MINERALES */}
            <h5 className="mt-3 mb-3">Minerales</h5>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Calcio_mg" className="input__label">Calcio (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Calcio_mg"
                  name="Calcio_mg"
                  placeholder="0.00"
                  value={form.Calcio_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Fosforo_mg" className="input__label">Fósforo (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Fosforo_mg"
                  name="Fosforo_mg"
                  placeholder="0.00"
                  value={form.Fosforo_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Hierro_mg" className="input__label">Hierro (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Hierro_mg"
                  name="Hierro_mg"
                  placeholder="0.00"
                  value={form.Hierro_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Potasio_mg" className="input__label">Potasio (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Potasio_mg"
                  name="Potasio_mg"
                  placeholder="0.00"
                  value={form.Potasio_mg}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Zinc_mg" className="input__label">Zinc (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Zinc_mg"
                  name="Zinc_mg"
                  placeholder="0.00"
                  value={form.Zinc_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Magnesio_mg" className="input__label">Magnesio (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Magnesio_mg"
                  name="Magnesio_mg"
                  placeholder="0.00"
                  value={form.Magnesio_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Sodio_mg" className="input__label">Sodio (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Sodio_mg"
                  name="Sodio_mg"
                  placeholder="0.00"
                  value={form.Sodio_mg}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECCIÓN: VITAMINAS */}
            <h5 className="mt-3 mb-3">Vitaminas</h5>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Tiamina_mg" className="input__label">Tiamina (mg)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control input-style"
                  id="Tiamina_mg"
                  name="Tiamina_mg"
                  placeholder="0.0000"
                  value={form.Tiamina_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Vit_C_mg" className="input__label">Vitamina C (mg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Vit_C_mg"
                  name="Vit_C_mg"
                  placeholder="0.00"
                  value={form.Vit_C_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Vit_A_ug" className="input__label">Vitamina A (μg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Vit_A_ug"
                  name="Vit_A_ug"
                  placeholder="0.00"
                  value={form.Vit_A_ug}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Vit_B6_mg" className="input__label">Vitamina B6 (mg)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control input-style"
                  id="Vit_B6_mg"
                  name="Vit_B6_mg"
                  placeholder="0.0000"
                  value={form.Vit_B6_mg}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Vit_B12_ug" className="input__label">Vitamina B12 (μg)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control input-style"
                  id="Vit_B12_ug"
                  name="Vit_B12_ug"
                  placeholder="0.0000"
                  value={form.Vit_B12_ug}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Riboflavina_mg" className="input__label">Riboflavina (mg)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control input-style"
                  id="Riboflavina_mg"
                  name="Riboflavina_mg"
                  placeholder="0.0000"
                  value={form.Riboflavina_mg}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Niacina_mg" className="input__label">Niacina (mg)</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control input-style"
                  id="Niacina_mg"
                  name="Niacina_mg"
                  placeholder="0.000"
                  value={form.Niacina_mg}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Ac_Folico_ug" className="input__label">Ácido Fólico (μg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Ac_Folico_ug"
                  name="Ac_Folico_ug"
                  placeholder="0.00"
                  value={form.Ac_Folico_ug}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Folato_ug" className="input__label">Folato (μg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Folato_ug"
                  name="Folato_ug"
                  placeholder="0.00"
                  value={form.Folato_ug}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECCIÓN: ÁCIDOS GRASOS */}
            <h5 className="mt-3 mb-3">Ácidos Grasos</h5>
            <div className="form-row">
              <div className="form-group col-md-4">
                <label htmlFor="Ac_Grasos_Saturados_g" className="input__label">Saturados (g)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Ac_Grasos_Saturados_g"
                  name="Ac_Grasos_Saturados_g"
                  placeholder="0.00"
                  value={form.Ac_Grasos_Saturados_g}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="Ac_Grasos_Monoinsaturados_g" className="input__label">Monoinsaturados (g)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Ac_Grasos_Monoinsaturados_g"
                  name="Ac_Grasos_Monoinsaturados_g"
                  placeholder="0.00"
                  value={form.Ac_Grasos_Monoinsaturados_g}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="Ac_Grasos_Poliinsaturados_g" className="input__label">Poliinsaturados (g)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control input-style"
                  id="Ac_Grasos_Poliinsaturados_g"
                  name="Ac_Grasos_Poliinsaturados_g"
                  placeholder="0.00"
                  value={form.Ac_Grasos_Poliinsaturados_g}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECCIÓN: CLASIFICACIÓN */}
            <h5 className="mt-3 mb-3">Clasificación</h5>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label htmlFor="Categoria" className="input__label">Categoría</label>
                <select
                  className="form-control input-style"
                  id="Categoria"
                  name="Categoria"
                  value={form.Categoria}
                  onChange={handleChange}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat || '— Sin categoría —'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Macrogrupo" className="input__label">Macrogrupo</label>
                <select
                  className="form-control input-style"
                  id="Macrogrupo"
                  name="Macrogrupo"
                  value={form.Macrogrupo}
                  onChange={handleChange}
                >
                  {MACROGRUPOS.map(mg => (
                    <option key={mg} value={mg}>{mg || '— Sin macrogrupo —'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Marca" className="input__label">Marca</label>
                <input
                  type="text"
                  className="form-control input-style"
                  id="Marca"
                  name="Marca"
                  placeholder="Ej: Dos Pinos"
                  maxLength={150}
                  value={form.Marca}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label htmlFor="Presentacion" className="input__label">Presentación</label>
                <input
                  type="text"
                  className="form-control input-style"
                  id="Presentacion"
                  name="Presentacion"
                  placeholder="Ej: 1 L, 500 g"
                  maxLength={150}
                  value={form.Presentacion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {!isDetalle && (
                <button type="submit" className="btn btn-primary btn-style" disabled={isSaving}>
                  <i className={`fa ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />
                  {' '}{isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-style" onClick={handleRegresar}>
                <i className="fa fa-arrow-left" /> Regresar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default MantenimientoAlimentos;
