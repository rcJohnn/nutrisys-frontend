import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import './Alerta.css';

type AlertaTipo = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertaOpciones {
  tipo: AlertaTipo;
  titulo: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

interface AlertaItem extends AlertaOpciones {
  id: number;
  resolver: (value: boolean) => void;
}

interface AlertaContextValue {
  mostrar: (opciones: AlertaOpciones) => Promise<boolean>;
}

const AlertaContext = createContext<AlertaContextValue | null>(null);

const ICONS: Record<AlertaTipo, string> = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
  confirm: '❓',
};

const COLOR_CLASS: Record<AlertaTipo, string> = {
  success: 'alerta-success',
  error:   'alerta-error',
  warning: 'alerta-warning',
  info:    'alerta-info',
  confirm: 'alerta-confirm',
};

export const AlertaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cola, setCola] = useState<AlertaItem[]>([]);
  const idRef = useRef(0);

  const mostrar = useCallback((opciones: AlertaOpciones): Promise<boolean> => {
    return new Promise<boolean>((resolver) => {
      const id = ++idRef.current;
      setCola((prev) => [...prev, { ...opciones, id, resolver }]);
    });
  }, []);

  const responder = (item: AlertaItem, valor: boolean) => {
    item.resolver(valor);
    setCola((prev) => prev.filter((x) => x.id !== item.id));
  };

  const actual = cola[0] ?? null;

  return (
    <AlertaContext.Provider value={{ mostrar }}>
      {children}
      {actual && (
        <div
          className="alerta-backdrop"
          onClick={() => {
            if (actual.tipo !== 'confirm') responder(actual, true);
          }}
        >
          <div
            className={`alerta-modal ${COLOR_CLASS[actual.tipo]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="alerta-icon">{ICONS[actual.tipo]}</div>
            <div className="alerta-titulo">{actual.titulo}</div>
            {actual.mensaje && <div className="alerta-mensaje">{actual.mensaje}</div>}
            <div className="alerta-acciones">
              {actual.tipo === 'confirm' ? (
                <>
                  <button
                    type="button"
                    className="alerta-btn alerta-btn-cancel"
                    onClick={() => responder(actual, false)}
                  >
                    {actual.textoCancelar ?? 'Cancelar'}
                  </button>
                  <button
                    type="button"
                    className="alerta-btn alerta-btn-ok"
                    onClick={() => responder(actual, true)}
                  >
                    {actual.textoConfirmar ?? 'Confirmar'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="alerta-btn alerta-btn-ok"
                  onClick={() => responder(actual, true)}
                >
                  {actual.textoConfirmar ?? 'Aceptar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertaContext.Provider>
  );
};

export function useAlerta() {
  const ctx = useContext(AlertaContext);
  if (!ctx) throw new Error('useAlerta debe usarse dentro de <AlertaProvider>');

  const { mostrar } = ctx;

  return {
    success: (titulo: string, mensaje?: string) =>
      mostrar({ tipo: 'success', titulo, mensaje }),

    error: (titulo: string, mensaje?: string) =>
      mostrar({ tipo: 'error', titulo, mensaje }),

    warning: (titulo: string, mensaje?: string) =>
      mostrar({ tipo: 'warning', titulo, mensaje }),

    info: (titulo: string, mensaje?: string) =>
      mostrar({ tipo: 'info', titulo, mensaje }),

    confirm: (titulo: string, mensaje?: string, opciones?: { textoConfirmar?: string; textoCancelar?: string }) =>
      mostrar({ tipo: 'confirm', titulo, mensaje, ...opciones }),
  };
}
