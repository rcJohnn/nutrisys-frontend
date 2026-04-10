import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import logoImage from '../assets/images/Untitled.png';
import { getModulos, type ModuloItem } from '../api/sesion';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState(0);
  const [userInitials, setUserInitials] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('/dashboard');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Usuario';
    const email = localStorage.getItem('userEmail') || '';
    const type = localStorage.getItem('userType') || 'A';
    const id = Number(localStorage.getItem('userId') || '0');
    setUserName(name);
    setUserEmail(email);
    setUserType(type);
    setUserId(id);
    
    const parts = name.split(' ');
    const initials = parts.length >= 2 
      ? parts[0][0] + parts[1][0] 
      : name.substring(0, 2);
    setUserInitials(initials.toUpperCase());
  }, []);

  // Load modules from database
  const { data: modulos = [], isLoading: loadingModulos } = useQuery({
    queryKey: ['modulos', userId, userType],
    queryFn: () => getModulos(userId, userType),
    enabled: userId > 0 && Boolean(userType),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sortedModulos = [...modulos].sort((a, b) => a.Orden - b.Orden);

  return (
    <div className={`main-layout ${sidebarCollapsed ? 'sidebar-closed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar-menu">
        <div className="logo">
          <Link to="/dashboard">
            <img src={logoImage} alt="NutriSys" title="NutriSys" />
          </Link>
        </div>

        <div className="ns-sidebar-search">
          <input type="text" placeholder="Buscar..." id="ns-search-input" autoComplete="off" />
          <span className="ns-search-shortcut">⌘K</span>
        </div>

        <ul className="custom-nav" id="menu">
          {loadingModulos ? (
            <li style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
              <i className="fa fa-spinner fa-spin"></i>
            </li>
          ) : sortedModulos.length > 0 ? (
            sortedModulos.map((item: ModuloItem) => (
              <li key={item.Path} className={activeMenu === item.Path ? 'active' : ''}>
                <Link
                  to={item.Path}
                  onClick={() => setActiveMenu(item.Path)}
                >
                  <i className={`fa ${item.Icono}`}></i>
                  <span>{item.Nombre_Modulo}</span>
                </Link>
              </li>
            ))
          ) : (
            <li style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.82rem' }}>
              Sin módulos asignados
            </li>
          )}
        </ul>

        <button className="toggle-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <i className={`fa ${sidebarCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'}`}></i>
          {!sidebarCollapsed && <span>Colapsar Menú</span>}
        </button>

        <div className="ns-user-card">
          <div className="ns-user-avatar" id="sidebarUserAvatar">{userInitials}</div>
          <div>
            <div className="ns-user-card-name" id="sidebarUserName">{userName}</div>
            <div className="ns-user-card-role">NutriSys</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="sticky-header">
          <div className="menu-right">
            <div className="navbar user-panel-top">
              <div className="user-dropdown-details d-flex">
                <div className="profile_details_left">
                  <ul className="nofitications-dropdown">
                    <li className="dropdown">
                      <a href="#" className="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                        <i className="fa fa-bell-o"></i>
                        <span className="badge blue">3</span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="profile_details" ref={dropdownRef}>
                  <ul>
                    <li className="dropdown profile_details_drop">
                      <a 
                        href="#" 
                        className="dropdown-toggle" 
                        id="dropdownMenu3" 
                        aria-haspopup="true" 
                        aria-expanded="false"
                        onClick={(e) => { e.preventDefault(); setUserDropdownOpen(!userDropdownOpen); }}
                      >
                        <div className="profile_img">
                          <img src={logoImage} className="rounded-circle" alt="" />
                          <div className="user-active">
                            <span></span>
                          </div>
                        </div>
                      </a>
                      {userDropdownOpen && (
                        <ul className="dropdown-menu drp-mnu" aria-labelledby="dropdownMenu3">
                          <li className="user-info">
                            <h5 id="lblNombreUsuario" className="user-name">{userName}</h5>
                            <span id="lblEmlUsuario" className="status ml-2">{userEmail}</span>
                          </li>
                          <li className="logout">
                            <a href="#" onClick={handleLogout}>
                              <i className="fa fa-power-off"></i> Cerrar Sesión
                            </a>
                          </li>
                        </ul>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-top-gap">
          <div className="content-area">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard">
          <p>&copy; 2026 Sistema de Gestion de Consultas | NutriSys</p>
        </footer>
      </main>
    </div>
  );
};

export default MainLayout;
