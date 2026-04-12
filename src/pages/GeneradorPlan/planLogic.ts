import type { AlimentoNutricional, PlanAlimentoItem } from '../../api/plan';

export interface PlanItemEdit {
  key: string;
  id_bd: number;
  nombre: string;
  categoria: string;
  macrogrupo: string;
  porcion_g: number;
  factor_coccion: number;
  carb: number;
  prot: number;
  grasa: number;
  fibra: number;
  energia: number;
}

export interface MacrosMeta {
  carb: number;
  prot: number;
  grasa: number;
  fibra: number;
}

export interface Totales {
  carb: number;
  prot: number;
  grasa: number;
  fibra: number;
  energia: number;
}

export function planItemKey(id: number, index: number) {
  return `${id}_${index}`;
}

export function fromApiAlimento(a: PlanAlimentoItem, index: number): PlanItemEdit {
  // normalizeKeys convierte _([a-z]) → Mayúscula: porcion_g → PorcionG, carbohidratos_g → CarbohidratosG, etc.
  const r = a as any;
  return {
    key: planItemKey(a.Id_Alimento, index),
    id_bd: a.Id_Alimento,
    nombre: a.Nombre,
    categoria: a.Categoria,
    macrogrupo: a.Macrogrupo || a.Categoria || '',
    porcion_g: r.PorcionG ?? r.Porcion_g ?? 0,
    factor_coccion: a.Factor_Coccion ?? 1,
    carb: r.CarbohidratosG ?? r.Carbohidratos_g ?? 0,
    prot: r.ProteinaG ?? r.Proteina_g ?? 0,
    grasa: r.GrasaG ?? r.Grasa_g ?? 0,
    fibra: r.FibraG ?? r.Fibra_g ?? 0,
    energia: r.EnergiaKcal ?? r.Energia_kcal ?? 0,
  };
}

export function computeTotales(items: PlanItemEdit[]): Totales {
  let carb = 0,
    prot = 0,
    grasa = 0,
    fibra = 0,
    energia = 0;
  for (const a of items) {
    carb += a.carb;
    prot += a.prot;
    grasa += a.grasa;
    fibra += a.fibra;
    energia += a.energia;
  }
  return {
    carb: +carb.toFixed(2),
    prot: +prot.toFixed(2),
    grasa: +grasa.toFixed(2),
    fibra: +fibra.toFixed(2),
    energia: +energia.toFixed(2),
  };
}

export function displayPorcion(a: PlanItemEdit) {
  const fc = a.factor_coccion || 1;
  return fc > 1 ? +(a.porcion_g * fc).toFixed(1) : a.porcion_g;
}

export function applyPorcionDisplay(
  item: PlanItemEdit,
  nuevaPorcionDisplay: number,
  base: AlimentoNutricional | null,
): PlanItemEdit {
  let n = nuevaPorcionDisplay;
  if (Number.isNaN(n) || n < 1) n = 1;
  if (n > 1500) n = 1500;

  const factorCoccion = item.factor_coccion || 1;
  const porcionBruta =
    factorCoccion > 1 ? +(n / factorCoccion).toFixed(2) : n;

  let carbBase: number;
  let protBase: number;
  let grasaBase: number;
  let fibraBase: number;
  let enerBase: number;
  let fc: number;

  if (base) {
    const rb = base as any;
    carbBase  = rb.CarbohidratosG ?? rb.Carbohidratos_g ?? 0;
    protBase  = rb.ProteinaG      ?? rb.Proteina_g      ?? 0;
    grasaBase = rb.GrasaG         ?? rb.Grasa_g         ?? 0;
    fibraBase = rb.FibraG         ?? rb.Fibra_g         ?? 0;
    enerBase  = rb.EnergiaKcal    ?? rb.Energia_kcal    ?? 0;
    fc = base.Fraccion_Comestible !== undefined && base.Fraccion_Comestible > 0 ? base.Fraccion_Comestible : 1;
  } else {
    const factor100 = item.porcion_g > 0 ? 100 / item.porcion_g : 1;
    carbBase = +(item.carb * factor100).toFixed(4);
    protBase = +(item.prot * factor100).toFixed(4);
    grasaBase = +(item.grasa * factor100).toFixed(4);
    fibraBase = +(item.fibra * factor100).toFixed(4);
    enerBase = +(item.energia * factor100).toFixed(4);
    fc = 1;
  }

  const porcionComestible = porcionBruta * fc;

  return {
    ...item,
    porcion_g: +porcionBruta.toFixed(1),
    carb: +((carbBase / 100) * porcionComestible).toFixed(2),
    prot: +((protBase / 100) * porcionComestible).toFixed(2),
    grasa: +((grasaBase / 100) * porcionComestible).toFixed(2),
    fibra: +((fibraBase / 100) * porcionComestible).toFixed(2),
    energia: +((enerBase / 100) * porcionComestible).toFixed(2),
  };
}

export interface SugerenciaAlimento {
  macro: 'cho' | 'prot' | 'grasa' | 'fibra';
  macroLabel: string;
  deficit: number;       // gramos que faltan para la meta, post-escalado
  categoria: string;     // macrogrupo a agregar
  emoji: string;
  cantidadG: number;     // porción sugerida en gramos
}

export interface OptimizacionPreview {
  factor: number;
  items: { nombre: string; actual: number; nuevo: number }[];
  nuevoCarb: number;
  nuevoProt: number;
  nuevoGrasa: number;
  nuevoFibra: number;
  nuevoEnergia: number;
  advertencias: string[];
  yaOptimizado: boolean;
  sugerencias: SugerenciaAlimento[];
}

// Densidad típica de macros por 100g de cada macrogrupo (valores de referencia)
const DENSIDAD_CATEGORIA: Record<string, { cho: number; prot: number; grasa: number; fibra: number }> = {
  'Cereales y harinas':  { cho: 68, prot: 7,  grasa: 2,  fibra: 3   },
  'Proteínas animales':  { cho: 0,  prot: 27, grasa: 8,  fibra: 0   },
  'Lácteos y derivados': { cho: 6,  prot: 7,  grasa: 4,  fibra: 0   },
  'Vegetales':           { cho: 6,  prot: 2,  grasa: 0,  fibra: 2.5 },
  'Frutas':              { cho: 15, prot: 1,  grasa: 0.5, fibra: 2  },
  'Grasas y semillas':   { cho: 4,  prot: 5,  grasa: 55, fibra: 4   },
};

// Categoría preferida y porción máxima razonable para cubrir cada macro deficiente
const CATEGORIA_PARA_MACRO: Record<'cho' | 'prot' | 'grasa' | 'fibra', { categoria: string; emoji: string; maxG: number }> = {
  cho:   { categoria: 'Cereales y harinas', emoji: '🍞', maxG: 120 },
  prot:  { categoria: 'Proteínas animales', emoji: '🍗', maxG: 100 },
  grasa: { categoria: 'Grasas y semillas',  emoji: '🥑', maxG: 30  },
  fibra: { categoria: 'Vegetales',          emoji: '🥦', maxG: 250 },
};

export function previewOptimizar(items: PlanItemEdit[], metas: MacrosMeta): OptimizacionPreview {
  const C = items.reduce((s, a) => s + a.carb, 0);
  const P = items.reduce((s, a) => s + a.prot, 0);
  const G = items.reduce((s, a) => s + a.grasa, 0);
  const F = items.reduce((s, a) => s + a.fibra, 0);
  const E = items.reduce((s, a) => s + a.energia, 0);

  if (C + P + G === 0) {
    return {
      factor: 1,
      items: [],
      nuevoCarb: 0,
      nuevoProt: 0,
      nuevoGrasa: 0,
      nuevoFibra: 0,
      nuevoEnergia: 0,
      advertencias: [],
      yaOptimizado: true,
      sugerencias: [],
    };
  }

  const kcalMeta = 4 * metas.carb + 4 * metas.prot + 9 * metas.grasa;
  const kcalActual = 4 * C + 4 * P + 9 * G;
  const k = kcalMeta / kcalActual;
  const kClamp = Math.min(Math.max(k, 0.35), 3);

  const yaOptimizado = Math.abs(kClamp - 1) < 0.02;

  const proyeccion = items.map((a) => ({
    nombre: a.nombre,
    actual: displayPorcion(a),
    nuevo: +(a.porcion_g * kClamp).toFixed(1),
  }));

  const nuevoCarb = +(C * kClamp).toFixed(2);
  const nuevoProt = +(P * kClamp).toFixed(2);
  const nuevoGrasa = +(G * kClamp).toFixed(2);
  const nuevoFibra = +(F * kClamp).toFixed(2);
  const nuevoEnergia = +(E * kClamp).toFixed(2);

  const advertencias: string[] = [];
  const parEliminar: string[] = [];
  for (const row of proyeccion) {
    if (row.nuevo < 15) parEliminar.push(`${row.nombre} (${row.nuevo}g)`);
    else if (row.nuevo > 600) advertencias.push(`${row.nombre} quedaría con ${row.nuevo}g — revisá si es razonable.`);
  }
  if (parEliminar.length) {
    advertencias.unshift(
      `Estos alimentos quedarían con menos de 15g: ${parEliminar.join(', ')}.`,
    );
  }

  const pct = (nuevo: number, meta: number) => (meta > 0 ? (nuevo / meta) * 100 : 100);
  if (pct(nuevoCarb, metas.carb) < 78) advertencias.push('CHO quedaría bajo la meta — considerá agregar carbohidratos.');
  if (pct(nuevoProt, metas.prot) < 78) advertencias.push('Proteínas quedarían bajo la meta.');
  if (pct(nuevoGrasa, metas.grasa) < 78) advertencias.push('Grasas quedarían bajo la meta.');
  if (k !== kClamp) advertencias.push(`El factor se limitó a ${kClamp.toFixed(2)}× (ideal ${k.toFixed(2)}×).`);

  // Sugerencias: para cada macro que quede > 12% por debajo de la meta
  const sugerencias: SugerenciaAlimento[] = [];
  const THRESHOLD = 0.88;
  const macroChecks: { macro: 'cho' | 'prot' | 'grasa' | 'fibra'; label: string; nuevo: number; meta: number }[] = [
    { macro: 'cho',   label: 'Carbohidratos', nuevo: nuevoCarb,  meta: metas.carb  },
    { macro: 'prot',  label: 'Proteínas',     nuevo: nuevoProt,  meta: metas.prot  },
    { macro: 'grasa', label: 'Grasas',        nuevo: nuevoGrasa, meta: metas.grasa },
    { macro: 'fibra', label: 'Fibra',         nuevo: nuevoFibra, meta: metas.fibra },
  ];

  for (const { macro, label, nuevo, meta } of macroChecks) {
    if (meta <= 0) continue;
    if (nuevo / meta >= THRESHOLD) continue;

    const deficit = meta - nuevo;
    const cfg = CATEGORIA_PARA_MACRO[macro];
    const densidad = DENSIDAD_CATEGORIA[cfg.categoria];
    const densMacro = densidad ? densidad[macro === 'cho' ? 'cho' : macro] : 10;
    const cantidadG = Math.min(cfg.maxG, Math.max(10, Math.round(deficit / (densMacro / 100))));

    sugerencias.push({
      macro,
      macroLabel: label,
      deficit: +deficit.toFixed(1),
      categoria: cfg.categoria,
      emoji: cfg.emoji,
      cantidadG,
    });
  }

  return {
    factor: kClamp,
    items: proyeccion,
    nuevoCarb,
    nuevoProt,
    nuevoGrasa,
    nuevoFibra,
    nuevoEnergia,
    advertencias,
    yaOptimizado,
    sugerencias,
  };
}

export function aplicarOptimizar(items: PlanItemEdit[], factor: number): PlanItemEdit[] {
  return items.map((a) => ({
    ...a,
    porcion_g: +(a.porcion_g * factor).toFixed(1),
    carb: +(a.carb * factor).toFixed(2),
    prot: +(a.prot * factor).toFixed(2),
    grasa: +(a.grasa * factor).toFixed(2),
    fibra: +(a.fibra * factor).toFixed(2),
    energia: +(a.energia * factor).toFixed(2),
  }));
}

export function factorCoccionArroz(nombre: string): number {
  const l = nombre.toLowerCase();
  if (l.includes('arroz') && !l.includes('cocido') && !l.includes('precocido')) return 2.8;
  return 1;
}

export function buildItemFromCatalogo(a: AlimentoNutricional, porcionBrutaG: number): PlanItemEdit {
  const r = a as any;
  const fc = a.Fraccion_Comestible !== undefined && a.Fraccion_Comestible > 0 ? a.Fraccion_Comestible : 1;
  const fCook = factorCoccionArroz(a.Nombre);
  const porcionComestible = porcionBrutaG * fc;
  const carb100  = r.CarbohidratosG ?? r.Carbohidratos_g ?? 0;
  const prot100  = r.ProteinaG      ?? r.Proteina_g      ?? 0;
  const grasa100 = r.GrasaG         ?? r.Grasa_g         ?? 0;
  const fibra100 = r.FibraG         ?? r.Fibra_g         ?? 0;
  const ener100  = r.EnergiaKcal    ?? r.Energia_kcal    ?? 0;
  return {
    key: planItemKey(a.Id_Alimento, Date.now()),
    id_bd: a.Id_Alimento,
    nombre: a.Nombre,
    categoria: a.Categoria,
    macrogrupo: a.Macrogrupo || '',
    porcion_g: porcionBrutaG,
    factor_coccion: fCook,
    carb:   +((carb100  / 100) * porcionComestible).toFixed(2),
    prot:   +((prot100  / 100) * porcionComestible).toFixed(2),
    grasa:  +((grasa100 / 100) * porcionComestible).toFixed(2),
    fibra:  +((fibra100 / 100) * porcionComestible).toFixed(2),
    energia: +((ener100  / 100) * porcionComestible).toFixed(2),
  };
}

export function mergeCambioAlimento(
  nuevo: {
    Id_Alimento: number;
    Nombre: string;
    Categoria: string;
    Macrogrupo?: string;
    Porcion_g: number;
    Factor_Coccion: number;
    Carbohidratos_g: number;
    Proteina_g: number;
    Grasa_g: number;
    Fibra_g: number;
    Energia_kcal: number;
  },
  index: number,
): PlanItemEdit {
  return {
    key: planItemKey(nuevo.Id_Alimento, index),
    id_bd: nuevo.Id_Alimento,
    nombre: nuevo.Nombre,
    categoria: nuevo.Categoria,
    macrogrupo: nuevo.Macrogrupo || '',
    porcion_g: nuevo.Porcion_g,
    factor_coccion: nuevo.Factor_Coccion || 1,
    carb: nuevo.Carbohidratos_g,
    prot: nuevo.Proteina_g,
    grasa: nuevo.Grasa_g,
    fibra: nuevo.Fibra_g,
    energia: nuevo.Energia_kcal,
  };
}
