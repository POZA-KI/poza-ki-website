/**
 * Eine Quelle für die Sektionsnummerierung. Header, Seiten-Navigation und die
 * Marker auf der linken Verbindungslinie lesen alle hier — sonst laufen die
 * Nummern auseinander.
 */
export const SEKTIONEN = [
  { id: 'position',   nr: '01', label: 'Positionierung' },
  { id: 'leistungen', nr: '02', label: 'Leistungen' },
  { id: 'systeme',    nr: '03', label: 'Systeme' },
  { id: 'case',       nr: '04', label: 'Referenz' },
  { id: 'produkte',   nr: '05', label: 'Produkte' },
  { id: 'vorgehen',   nr: '06', label: 'Vorgehen' },
  { id: 'gruender',   nr: '07', label: 'Gründer' },
  { id: 'kontakt',    nr: '08', label: 'Kontakt' },
] as const;

export type SektionId = (typeof SEKTIONEN)[number]['id'];
