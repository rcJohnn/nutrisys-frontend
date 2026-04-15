import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getListaAlimentosNutricional } from '../../api/plan';
import { getUsuarios, type Usuario } from '../../api/usuarios';
import { getPadecimientosUsuario } from '../../api/padecimientos';
import ListaTab from './ListaTab';
import PlannerTab from './PlannerTab';
import IATab, { type PlanIAContext } from './IATab';
import '../GeneradorPlan.css';
import './generadorPlanV2.css';

type TabKey = 'planner' | 'recetas' | 'lista';

const GeneradorPlan: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userType = localStorage.getItem('userType') || 'U';
  const userId = Number(localStorage.getItem('userId') || '0');

  const [tab, setTab] = useState<TabKey>('planner');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [planesIA, setPlanesIA] = useState<PlanIAContext[]>([]);

  const [toastMsg, setToastMsg] = useState('');
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(''), 3200);
  }, []);

  useEffect(() => {
    if (userType === 'U' && userId > 0) {
      getUsuarios({ estado: 'Activo' }).then((res) => {
        const yo = res.find((u) => u.Id_Usuario === userId);
        if (yo) setSelectedUsuario(yo);
      });
    }
  }, [userType, userId]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!v.trim() || v.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }
    const term = v.trim();
    searchDebounceRef.current = setTimeout(() => {
      setShowResults(true);
      setSearchLoading(true);
      getUsuarios({ nombre: term, estado: 'Activo' })
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
  }, []);

  useEffect(() => () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  }, []);

  const idUsuario = selectedUsuario?.Id_Usuario ?? (userType === 'U' ? userId : 0);

  const { data: catalogo = [], isLoading: catLoading } = useQuery({
    queryKey: ['plan-catalogo-alimentos'],
    queryFn: getListaAlimentosNutricional,
    staleTime: 1000 * 60 * 15,
  });

  const { data: padecimientosTxt = '' } = useQuery({
    queryKey: ['gp-padecimientos', idUsuario],
    queryFn: async () => {
      const rows = await getPadecimientosUsuario(idUsuario);
      if (!rows.length) return 'Ninguno';
      return rows.map((p) => p.Descripcion || '').filter(Boolean).join(', ') || 'Ninguno';
    },
    enabled: idUsuario > 0,
  });

  const onPlanConfirmadoIA = (p: PlanIAContext) => {
    setPlanesIA([p]);
    setTab('recetas');
    toast('✅ Plan listo para IA');
  };

  const onPlanesParaIA = (planes: PlanIAContext[]) => {
    setPlanesIA(planes);
    setTab('recetas');
  };

  const showSearch = userType !== 'U';
  const nombreCompleto = selectedUsuario
    ? `${selectedUsuario.Nombre} ${selectedUsuario.Prim_Apellido} ${selectedUsuario.Seg_Apellido}`.trim()
    : '';

  return (
    <div className="gp-page gp-page--v2">
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">
          Inicio
        </span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Generador de plan nutricional</span>
      </nav>

      <div className="gp-v2-welcome">
        <h1 className="gp-v2-welcome-title">
          Hola, <span>{userName}</span>
        </h1>
        <p className="gp-v2-welcome-sub">{userEmail}</p>
      </div>

      <div className="gp-v2-card">
        <div className="gp-v2-card-title">
          <i className="fa fa-user-circle-o" /> Selección de usuario
        </div>
        {showSearch ? (
          selectedUsuario ? (
            <div className="gp-v2-user-row">
              <div className="gp-v2-avatar">{nombreCompleto.charAt(0)}</div>
              <div>
                <div className="gp-v2-user-name">{nombreCompleto}</div>
                <div className="gp-v2-user-email">{selectedUsuario.Correo}</div>
              </div>
              <button type="button" className="gp-btn gp-btn-outline" onClick={() => setSelectedUsuario(null)}>
                Cambiar paciente
              </button>
            </div>
          ) : (
            <div className="gp-v2-search-wrap">
              <i className="fa fa-search gp-v2-search-ico" />
              <input
                type="text"
                className="gp-v2-search-input"
                placeholder="Buscá por nombre o apellido…"
                value={searchTerm}
                onChange={handleSearch}
                autoComplete="off"
              />
              {showResults && (
                <div className="gp-v2-dropdown">
                  {searchLoading && <div className="gp-v2-dd-muted">Buscando…</div>}
                  {!searchLoading && searchResults.length === 0 && <div className="gp-v2-dd-muted">Sin resultados</div>}
                  {!searchLoading &&
                    searchResults.map((u) => (
                      <button
                        key={u.Id_Usuario}
                        type="button"
                        className="gp-v2-dd-item"
                        onClick={() => {
                          setSelectedUsuario(u);
                          setSearchTerm('');
                          setShowResults(false);
                        }}
                      >
                        {u.Nombre} {u.Prim_Apellido} {u.Seg_Apellido}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="gp-v2-alert">
            <strong>Generando plan para:</strong> {userName}
          </div>
        )}

        {idUsuario > 0 && (
          <div className="gp-v2-pad">
            <strong>Padecimientos:</strong> {padecimientosTxt}
          </div>
        )}
      </div>

      {!idUsuario && showSearch && (
        <div className="gp-v2-empty">Seleccioná un paciente para continuar.</div>
      )}

      {idUsuario > 0 && (
        <>
          <div className="gp-tabs-container gp-tabs-v2">
            <div className="gp-tabs">
              <button type="button" className={`gp-tab-btn${tab === 'planner' ? ' active' : ''}`} onClick={() => setTab('planner')}>
                🍽️ Generador de plan
              </button>
              <button type="button" className={`gp-tab-btn${tab === 'recetas' ? ' active' : ''}`} onClick={() => setTab('recetas')}>
                👨‍🍳 Ideas de comidas (IA)
              </button>
              <button type="button" className={`gp-tab-btn${tab === 'lista' ? ' active' : ''}`} onClick={() => setTab('lista')}>
                📋 Lista de macronutrientes por alimento
              </button>
            </div>
          </div>

          {tab === 'planner' && (
            <PlannerTab idUsuario={idUsuario} catalogo={catalogo} onPlanConfirmado={onPlanConfirmadoIA} onPlanesParaIA={onPlanesParaIA} toast={toast} />
          )}
          {tab === 'recetas' && <IATab idUsuario={idUsuario} planes={planesIA} toast={toast} />}
          {tab === 'lista' && <ListaTab alimentos={catalogo} loading={catLoading} />}
        </>
      )}

      {toastMsg && <div className="gp-toast show">{toastMsg}</div>}
    </div>
  );
};

export default GeneradorPlan;
