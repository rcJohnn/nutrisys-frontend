import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import type { LoginRequest } from '../types/auth';
import logoImage from '../assets/images/Untitled.png';
import videoSource from '../assets/videos/Fondo.mp4';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({ Correo: '', Password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      console.log('Login response:', response);
      
      if (response.Exito) {
        localStorage.setItem('token', 'logged-in');
        localStorage.setItem('userId', response.Id?.toString() || '');
        localStorage.setItem('userType', response.Tipo || '');
        localStorage.setItem('userName', response.NombreCompleto || '');
        localStorage.setItem('userEmail', response.Correo || '');
        navigate('/dashboard');
      } else {
        setError(response.Mensaje || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ls-layout">
      <div className="ls-ghost-border" />
      
      {/* LEFT: Video Panel */}
      <div className="ls-left">
        <div className="ls-left-overlay" />
        <video 
          className="ls-video"
          autoPlay 
          muted 
          loop 
          playsInline
          src={videoSource}
        />
      </div>

      {/* RIGHT: Login Panel */}
      <div className="ls-right">
        <div className="ls-right-inner">
          
          {/* Branding */}
          <div className="ls-branding">
            <div className="ls-logo">
              <img src={logoImage} alt="NutriSys" />
            </div>
            <h1 className="ls-title">Bienvenido de nuevo</h1>
            <p className="ls-subtitle">Gestión nutricional integral</p>
          </div>

          {/* Form */}
          <form className="ls-form" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="ls-field">
              <div className="ls-label-row">
                <label className="ls-label">Correo electrónico</label>
              </div>
              <div className="ls-input-wrapper">
                <span className="ls-input-icon">✉</span>
                <input
                  type="email"
                  className="ls-input"
                  placeholder="correo@ejemplo.com"
                  value={formData.Correo}
                  onChange={(e) => setFormData({ ...formData, Correo: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="ls-field">
              <div className="ls-label-row">
                <label className="ls-label">Contraseña</label>
              </div>
              <div className="ls-input-wrapper">
                <span className="ls-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="ls-input ls-input-pw"
                  placeholder="••••••••"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="ls-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="ls-error">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="ls-btn" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="ls-signup">
            ¿No tienes cuenta? <a href="#">Regístrate aquí</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;