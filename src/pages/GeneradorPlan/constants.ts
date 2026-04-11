import type { TiempoComidaKey } from '../../api/distribucionPlan';

export const TIEMPOS_COMIDA: { key: TiempoComidaKey; label: string; time: string; icon: string; principal: boolean }[] = [
  { key: 'Desayuno', label: 'Desayuno', time: '6:00–8:00 AM', icon: 'fa-sun-o', principal: true },
  { key: 'MeriendaAM', label: 'Merienda AM', time: '9:30–10:30 AM', icon: 'fa-coffee', principal: false },
  { key: 'Almuerzo', label: 'Almuerzo', time: '12:00–1:00 PM', icon: 'fa-cutlery', principal: true },
  { key: 'MeriendaPM', label: 'Merienda PM', time: '3:00–4:00 PM', icon: 'fa-apple', principal: false },
  { key: 'Cena', label: 'Cena', time: '6:00–7:30 PM', icon: 'fa-moon-o', principal: true },
];

export const GP_MACROGRUPOS: Record<string, { emoji: string; color: string }> = {
  'Lácteos y derivados': { emoji: '🥛', color: '#e8f4fd' },
  'Proteínas animales': { emoji: '🍗', color: '#fce8e8' },
  Vegetales: { emoji: '🥦', color: '#e6f5e6' },
  'Grasas y semillas': { emoji: '🥑', color: '#f0f7e6' },
  Frutas: { emoji: '🍎', color: '#fce8f0' },
  'Cereales y harinas': { emoji: '🍞', color: '#fef5e7' },
  'Azúcares y dulces': { emoji: '🍯', color: '#fef9e0' },
  'Sin clasificar': { emoji: '🍽️', color: '#f0f0f0' },
};

export const MACROCHIP_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'Lácteos y derivados', label: '🥛 Lácteos y derivados' },
  { id: 'Proteínas animales', label: '🍗 Proteínas animales' },
  { id: 'Vegetales', label: '🥦 Vegetales' },
  { id: 'Grasas y semillas', label: '🥑 Grasas y semillas' },
  { id: 'Frutas', label: '🍎 Frutas' },
  { id: 'Cereales y harinas', label: '🍞 Cereales y harinas' },
  { id: 'Azúcares y dulces', label: '🍯 Azúcares y dulces' },
] as const;

export const NUTRIENT_RANK_OPTIONS: { value: string; label: string; group?: string }[] = [
  { value: 'Energia_kcal', label: 'Energía (kcal)', group: 'Macronutrientes' },
  { value: 'Proteina_g', label: 'Proteína (g)', group: 'Macronutrientes' },
  { value: 'Carbohidratos_g', label: 'Carbohidratos (g)', group: 'Macronutrientes' },
  { value: 'Grasa_g', label: 'Grasas totales (g)', group: 'Macronutrientes' },
  { value: 'Fibra_g', label: 'Fibra (g)', group: 'Macronutrientes' },
  { value: 'Colesterol_mg', label: 'Colesterol (mg)', group: 'Macronutrientes' },
  { value: 'Calcio_mg', label: 'Calcio (mg)', group: 'Minerales' },
  { value: 'Fosforo_mg', label: 'Fósforo (mg)', group: 'Minerales' },
  { value: 'Hierro_mg', label: 'Hierro (mg)', group: 'Minerales' },
  { value: 'Potasio_mg', label: 'Potasio (mg)', group: 'Minerales' },
  { value: 'Zinc_mg', label: 'Zinc (mg)', group: 'Minerales' },
  { value: 'Magnesio_mg', label: 'Magnesio (mg)', group: 'Minerales' },
  { value: 'Sodio_mg', label: 'Sodio (mg)', group: 'Minerales' },
  { value: 'Vit_C_mg', label: 'Vitamina C (mg)', group: 'Vitaminas' },
  { value: 'Vit_A_ug', label: 'Vitamina A (µg)', group: 'Vitaminas' },
  { value: 'Tiamina_mg', label: 'Tiamina / B1 (mg)', group: 'Vitaminas' },
  { value: 'Riboflavina_mg', label: 'Riboflavina / B2 (mg)', group: 'Vitaminas' },
  { value: 'Niacina_mg', label: 'Niacina / B3 (mg)', group: 'Vitaminas' },
  { value: 'Vit_B6_mg', label: 'Vitamina B6 (mg)', group: 'Vitaminas' },
  { value: 'Vit_B12_ug', label: 'Vitamina B12 (µg)', group: 'Vitaminas' },
  { value: 'Folato_ug', label: 'Folato (µg)', group: 'Vitaminas' },
  { value: 'Ac_Grasos_Saturados_g', label: 'Ag. saturados (g)', group: 'Ácidos grasos' },
  { value: 'Ac_Grasos_Monoinsaturados_g', label: 'Ag. monoinsaturados (g)', group: 'Ácidos grasos' },
  { value: 'Ac_Grasos_Poliinsaturados_g', label: 'Ag. poliinsaturados (g)', group: 'Ácidos grasos' },
];
