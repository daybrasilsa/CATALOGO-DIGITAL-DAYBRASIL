import type { FacadeZone } from '@/types/acm'

/** Id do input de uma cor no seletor (usado para devolver o foco depois do "Ver na fachada"). */
export function pickerInputId(zone: FacadeZone, colorId: string): string {
  return `facade-${zone}-${colorId}`
}
