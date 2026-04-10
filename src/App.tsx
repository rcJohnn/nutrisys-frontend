import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layout/MainLayout';
import Usuarios from './pages/Usuarios';
import MantenimientoUsuarios from './pages/MantenimientoUsuarios';
import Medicos from './pages/Medicos';
import MantenimientoMedicos from './pages/MantenimientoMedicos';
import Consultas from './pages/Consultas';
import MantenimientoConsultas from './pages/MantenimientoConsultas';
import DetalleConsulta from './pages/DetalleConsulta';
import GeneradorPlan from './pages/GeneradorPlan';
import Alimentos from './pages/Alimentos';
import MantenimientoAlimentos from './pages/MantenimientoAlimentos';
import ConfigAgenda from './pages/ConfigAgenda';
import MiPerfil from './pages/MiPerfil';
import ExpedientePaciente from './pages/ExpedientePaciente';
import PadecimientosUsuario from './pages/PadecimientosUsuario';
import Progreso from './pages/Progreso';
import BusquedaPaciente from './pages/BusquedaPaciente';
import BusquedaPadecimientos from './pages/BusquedaPadecimientos';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Usuarios */}
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/nuevo" element={<MantenimientoUsuarios />} />
            <Route path="/usuarios/editar/:id" element={<MantenimientoUsuarios />} />

            {/* Medicos */}
            <Route path="/medicos" element={<Medicos />} />
            <Route path="/medicos/nuevo" element={<MantenimientoMedicos />} />
            <Route path="/medicos/editar/:id" element={<MantenimientoMedicos />} />

            {/* Consultas */}
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/consultas/nueva" element={<MantenimientoConsultas />} />
            <Route path="/consultas/editar/:id" element={<MantenimientoConsultas />} />
            <Route path="/consultas/detalle/:id" element={<DetalleConsulta />} />

            {/* Generador Plan */}
            <Route path="/generar-plan" element={<GeneradorPlan />} />

            {/* Alimentos */}
            <Route path="/alimentos" element={<Alimentos />} />
            <Route path="/mantenimiento-alimentos" element={<MantenimientoAlimentos />} />
            <Route path="/mantenimiento-alimentos/:id" element={<MantenimientoAlimentos />} />

            {/* Config Agenda */}
            <Route path="/config-agenda" element={<ConfigAgenda />} />
            <Route path="/config-agenda/:medicoId" element={<ConfigAgenda />} />

            {/* Mi Perfil — solo rol U */}
            <Route path="/perfil" element={<MiPerfil />} />

            {/* Padecimientos */}
            <Route path="/usuarios/padecimientos/:id" element={<PadecimientosUsuario />} />
            <Route path="/padecimientos" element={<BusquedaPadecimientos />} />

            {/* Mi Progreso */}
            <Route path="/progreso" element={<Progreso />} />

            {/* Expediente */}
            <Route path="/expediente" element={<BusquedaPaciente />} />
            <Route path="/expediente/:id" element={<ExpedientePaciente />} />

            {/* placeholders */}
            <Route path="/auditoria" element={<div className="hub-page"><h2>Auditoría</h2></div>} />
            <Route path="/configuracion" element={<div className="hub-page"><h2>Configuración</h2></div>} />
            <Route path="/plan" element={<div className="hub-page"><h2>Mi Plan Nutricional</h2></div>} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
