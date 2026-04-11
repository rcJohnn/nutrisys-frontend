import React, { useState } from 'react';
import { generarRecetaIA, enviarRecetaCorreo, parseSpliterResponse } from '../../api/plan';
import type { TiempoComidaKey } from '../../api/distribucionPlan';
import type { PlanItemEdit } from './planLogic';
import { GP_MACROGRUPOS } from './constants';

export interface PlanIAContext {
  tiempo: TiempoComidaKey;
  items: PlanItemEdit[];
  totales: { carb: number; prot: number; grasa: number; fibra: number; energia: number };
  metas: { carb: number; prot: number; grasa: number; fibra: number };
}

function buildPrompt(p: PlanIAContext, alterna: boolean): string {
  const nombre = p.tiempo.replace('AM', ' AM').replace('PM', ' PM');
  const lista = p.items
    .map(
      (a) =>
        `- ${a.nombre} (${a.porcion_g}g): ${a.carb}g carb, ${a.prot}g prot, ${a.grasa}g grasa, ${a.fibra}g fibra`,
    )
    .join('\n');
  return (
    `Sos un nutricionista y chef. El usuario tiene el siguiente plan nutricional para ${nombre}:\n\n` +
    `ALIMENTOS:\n${lista}\n\n` +
    `TOTALES: CHO ${p.totales.carb}g (meta ${p.metas.carb}), Prot ${p.totales.prot}g (meta ${p.metas.prot}), ` +
    `Grasa ${p.totales.grasa}g (meta ${p.metas.grasa}), Fibra ${p.totales.fibra}g (meta ${p.metas.fibra}), ` +
    `${p.totales.energia} kcal.\n\n` +
    (alterna ? 'Proponé una receta DIFERENTE y creativa.\n\n' : '') +
    'Sugerí UNA receta concreta con esos alimentos, fácil en casa, apropiada para Costa Rica.\n' +
    'Formato: 🍽️ NOMBRE / ⏱️ TIEMPO / 📝 PREPARACIÓN (pasos) / 💡 CONSEJO.'
  );
}

const IATab: React.FC<{
  idUsuario: number;
  plan: PlanIAContext | null;
  toast: (m: string) => void;
}> = ({ idUsuario, plan, toast }) => {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);

  if (!plan) {
    return (
      <div className="gp-tab-panel">
        <div className="gp-ia-empty">
          <div className="gp-ia-empty-ico">🍽️</div>
          <p>
            Primero generá y confirmá tu plan en la pestaña <strong>Generador de plan</strong> con &quot;Confirmar y generar
            ideas con IA&quot;.
          </p>
        </div>
      </div>
    );
  }

  const pedir = async (alterna: boolean) => {
    setLoading(true);
    setTexto('');
    try {
      const res = await generarRecetaIA(buildPrompt(plan, alterna));
      if (!res || String(res).includes('Error')) {
        setTexto('❌ ' + (res || 'No se pudo generar. Configurá POST /PlanNutricional/receta-ia en el API.'));
      } else {
        setTexto(res);
      }
    } catch {
      setTexto('❌ Error de conexión o endpoint de IA no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const enviar = async () => {
    if (!texto || texto.startsWith('❌')) {
      toast('⚠️ Generá una receta primero');
      return;
    }
    try {
      const raw = await enviarRecetaCorreo(idUsuario, 0, texto);
      const { ok, parts } = parseSpliterResponse(raw);
      toast(ok ? '✅ ' + (parts[1] || 'Enviado') : '⚠️ ' + (parts[1] || raw));
    } catch {
      toast('⚠️ Endpoint enviar-receta-correo no disponible');
    }
  };

  const nombre = plan.tiempo.replace('AM', ' AM').replace('PM', ' PM');

  return (
    <div className="gp-tab-panel">
      <div className="gp-ia-card">
        <div className="gp-ia-header">
          <div className="gp-ia-icon">🤖</div>
          <div>
            <div className="gp-ia-title">Ideas de comidas con IA</div>
            <div className="gp-ia-sub">
              Plan de {nombre} · {plan.totales.energia} kcal
            </div>
          </div>
        </div>
        <div className="gp-plan-chips">
          {plan.items.map((a) => {
            const info = GP_MACROGRUPOS[a.macrogrupo] || GP_MACROGRUPOS[a.categoria] || { emoji: '🍽️' };
            return (
              <span key={a.key} className="gp-plan-chip">
                {info.emoji} {a.nombre} <strong>{a.porcion_g}g</strong>
              </span>
            );
          })}
        </div>
        <div className="gp-ia-actions">
          <button type="button" className="gp-btn gp-btn-primary" disabled={loading} onClick={() => pedir(false)}>
            ✨ Sugerirme una receta
          </button>
          <button type="button" className="gp-btn gp-btn-outline" disabled={loading} onClick={() => pedir(true)}>
            🎲 Otra sugerencia
          </button>
        </div>
        {loading && (
          <div className="gp-loading-inline">
            <div className="gp-spinner sm" /> Generando…
          </div>
        )}
        {texto && (
          <div className="gp-ia-response-wrap">
            <div className="gp-ia-response">{texto.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
            <button type="button" className="gp-btn gp-btn-primary" onClick={enviar}>
              📧 Enviar receta por correo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IATab;
