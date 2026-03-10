// Territory and continent definitions for Risk Lite
// 30 territories across 6 continents

import type { Territory, ContinentDef } from '@/types/game';

export const TERRITORIES: Territory[] = [
  // ─── North America ───────────────────────────────────────
  {
    id: 'alaska',
    name: 'Alaska',
    continent: 'North America',
    position: { x: 75, y: 95 },
    adjacencies: ['canada', 'w_usa', 'siberia'],
  },
  {
    id: 'canada',
    name: 'Canada',
    continent: 'North America',
    position: { x: 165, y: 90 },
    adjacencies: ['alaska', 'w_usa', 'e_usa'],
  },
  {
    id: 'w_usa',
    name: 'W. USA',
    continent: 'North America',
    position: { x: 130, y: 175 },
    adjacencies: ['alaska', 'canada', 'e_usa', 'c_america'],
  },
  {
    id: 'e_usa',
    name: 'E. USA',
    continent: 'North America',
    position: { x: 215, y: 175 },
    adjacencies: ['canada', 'w_usa', 'c_america'],
  },
  {
    id: 'c_america',
    name: 'C. America',
    continent: 'North America',
    position: { x: 175, y: 265 },
    adjacencies: ['w_usa', 'e_usa', 'venezuela'],
  },

  // ─── South America ────────────────────────────────────────
  {
    id: 'venezuela',
    name: 'Venezuela',
    continent: 'South America',
    position: { x: 245, y: 330 },
    adjacencies: ['c_america', 'brazil', 'argentina'],
  },
  {
    id: 'brazil',
    name: 'Brazil',
    continent: 'South America',
    position: { x: 280, y: 415 },
    adjacencies: ['venezuela', 'argentina', 'n_africa'],
  },
  {
    id: 'argentina',
    name: 'Argentina',
    continent: 'South America',
    position: { x: 245, y: 500 },
    adjacencies: ['venezuela', 'brazil'],
  },

  // ─── Europe ───────────────────────────────────────────────
  {
    id: 'brit_isles',
    name: 'Brit. Isles',
    continent: 'Europe',
    position: { x: 390, y: 115 },
    adjacencies: ['scandinavia', 'c_europe', 'n_africa'],
  },
  {
    id: 'scandinavia',
    name: 'Scandinavia',
    continent: 'Europe',
    position: { x: 450, y: 70 },
    adjacencies: ['brit_isles', 'c_europe', 'e_europe'],
  },
  {
    id: 'c_europe',
    name: 'C. Europe',
    continent: 'Europe',
    position: { x: 450, y: 155 },
    adjacencies: ['brit_isles', 'scandinavia', 's_europe', 'e_europe'],
  },
  {
    id: 's_europe',
    name: 'S. Europe',
    continent: 'Europe',
    position: { x: 430, y: 230 },
    adjacencies: ['c_europe', 'e_europe', 'n_africa', 'middle_east'],
  },
  {
    id: 'e_europe',
    name: 'E. Europe',
    continent: 'Europe',
    position: { x: 520, y: 130 },
    adjacencies: ['scandinavia', 'c_europe', 's_europe', 'siberia', 'central_asia'],
  },

  // ─── Africa ───────────────────────────────────────────────
  {
    id: 'n_africa',
    name: 'N. Africa',
    continent: 'Africa',
    position: { x: 410, y: 315 },
    adjacencies: ['brit_isles', 'brazil', 's_europe', 'middle_east', 'w_africa', 'e_africa'],
  },
  {
    id: 'w_africa',
    name: 'W. Africa',
    continent: 'Africa',
    position: { x: 375, y: 400 },
    adjacencies: ['n_africa', 'e_africa', 's_africa'],
  },
  {
    id: 'e_africa',
    name: 'E. Africa',
    continent: 'Africa',
    position: { x: 490, y: 370 },
    adjacencies: ['n_africa', 'w_africa', 's_africa', 'middle_east'],
  },
  {
    id: 's_africa',
    name: 'S. Africa',
    continent: 'Africa',
    position: { x: 440, y: 480 },
    adjacencies: ['w_africa', 'e_africa'],
  },

  // ─── Asia ─────────────────────────────────────────────────
  {
    id: 'middle_east',
    name: 'Middle East',
    continent: 'Asia',
    position: { x: 570, y: 250 },
    adjacencies: ['s_europe', 'e_europe', 'n_africa', 'e_africa', 'central_asia', 'india'],
  },
  {
    id: 'central_asia',
    name: 'C. Asia',
    continent: 'Asia',
    position: { x: 630, y: 170 },
    adjacencies: ['e_europe', 'middle_east', 'siberia', 'china', 'india'],
  },
  {
    id: 'siberia',
    name: 'Siberia',
    continent: 'Asia',
    position: { x: 700, y: 90 },
    adjacencies: ['alaska', 'e_europe', 'central_asia', 'china', 'korea'],
  },
  {
    id: 'india',
    name: 'India',
    continent: 'Asia',
    position: { x: 645, y: 305 },
    adjacencies: ['middle_east', 'central_asia', 'china', 'se_asia'],
  },
  {
    id: 'china',
    name: 'China',
    continent: 'Asia',
    position: { x: 745, y: 230 },
    adjacencies: ['siberia', 'central_asia', 'india', 'korea', 'se_asia'],
  },
  {
    id: 'korea',
    name: 'Korea',
    continent: 'Asia',
    position: { x: 805, y: 195 },
    adjacencies: ['siberia', 'china', 'japan'],
  },
  {
    id: 'japan',
    name: 'Japan',
    continent: 'Asia',
    position: { x: 845, y: 145 },
    adjacencies: ['korea'],
  },
  {
    id: 'se_asia',
    name: 'SE. Asia',
    continent: 'Asia',
    position: { x: 775, y: 325 },
    adjacencies: ['india', 'china', 'indonesia'],
  },

  // ─── Oceania ──────────────────────────────────────────────
  {
    id: 'indonesia',
    name: 'Indonesia',
    continent: 'Oceania',
    position: { x: 785, y: 410 },
    adjacencies: ['se_asia', 'new_guinea', 'w_australia'],
  },
  {
    id: 'new_guinea',
    name: 'New Guinea',
    continent: 'Oceania',
    position: { x: 865, y: 385 },
    adjacencies: ['indonesia', 'e_australia'],
  },
  {
    id: 'w_australia',
    name: 'W. Australia',
    continent: 'Oceania',
    position: { x: 815, y: 490 },
    adjacencies: ['indonesia', 'e_australia'],
  },
  {
    id: 'e_australia',
    name: 'E. Australia',
    continent: 'Oceania',
    position: { x: 895, y: 465 },
    adjacencies: ['new_guinea', 'w_australia'],
  },
];

export const CONTINENTS: ContinentDef[] = [
  {
    name: 'North America',
    bonus: 3,
    color: 'rgba(0, 180, 255, 0.12)',
    territories: ['alaska', 'canada', 'w_usa', 'e_usa', 'c_america'],
  },
  {
    name: 'South America',
    bonus: 2,
    color: 'rgba(0, 230, 100, 0.12)',
    territories: ['venezuela', 'brazil', 'argentina'],
  },
  {
    name: 'Europe',
    bonus: 3,
    color: 'rgba(180, 100, 255, 0.12)',
    territories: ['brit_isles', 'scandinavia', 'c_europe', 's_europe', 'e_europe'],
  },
  {
    name: 'Africa',
    bonus: 2,
    color: 'rgba(255, 160, 0, 0.12)',
    territories: ['n_africa', 'w_africa', 'e_africa', 's_africa'],
  },
  {
    name: 'Asia',
    bonus: 5,
    color: 'rgba(255, 50, 80, 0.12)',
    territories: ['middle_east', 'central_asia', 'siberia', 'india', 'china', 'korea', 'japan', 'se_asia'],
  },
  {
    name: 'Oceania',
    bonus: 2,
    color: 'rgba(255, 230, 0, 0.12)',
    territories: ['indonesia', 'new_guinea', 'w_australia', 'e_australia'],
  },
];

/** Fast lookup map */
export const TERRITORY_MAP: Record<string, Territory> = Object.fromEntries(
  TERRITORIES.map((t) => [t.id, t])
);
