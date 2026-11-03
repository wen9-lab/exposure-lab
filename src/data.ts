import { makeSetting, type Camera, type ExposureSetting, type Parameter } from './core/exposure'

export interface CalculatorData {
  base: ExposureSetting
  current: ExposureSetting
  camera: Camera
  targetEV: number
  preferred: Parameter | 'none'
  locks: Parameter[]
  filmISO: number
  ei: number
  warnings: string[]
}
export interface SavedPreset {
  id: string
  name: string
  mode: 'full' | 'third'
  setting: ExposureSetting
}
export interface HistoryEntry {
  id: string
  at: string
  mode: 'full' | 'third'
  setting: ExposureSetting
  note: string
}
export interface AppData {
  version: 1
  theme: 'dark' | 'light'
  defaultMode: 'full' | 'third'
  defaultCamera: Camera
  defaultBases: Record<'full' | 'third', ExposureSetting>
  shutterFormat: 'fraction' | 'decimal'
  showExtended: boolean
  ranges: Partial<Record<Parameter, [number, number]>>
  full: CalculatorData
  third: CalculatorData
  presets: SavedPreset[]
  history: HistoryEntry[]
}

function newCalculator(mode: 'full' | 'third'): CalculatorData {
  const base = makeSetting(4, 1 / 500, 100, mode)
  return {
    base,
    current: makeSetting(4, 1 / 500, 100, mode),
    camera: 'digital',
    targetEV: 0,
    preferred: 'none',
    locks: [],
    filmISO: 100,
    ei: 100,
    warnings: [],
  }
}
export function defaultData(): AppData {
  return {
    version: 1,
    theme: 'dark',
    defaultMode: 'full',
    defaultCamera: 'digital',
    defaultBases: {
      full: makeSetting(4, 1 / 500, 100, 'full'),
      third: makeSetting(4, 1 / 500, 100, 'third'),
    },
    shutterFormat: 'fraction',
    showExtended: true,
    ranges: {},
    full: newCalculator('full'),
    third: newCalculator('third'),
    presets: [],
    history: [],
  }
}
function validSetting(raw: unknown, mode: 'full' | 'third'): ExposureSetting {
  if (!raw || typeof raw !== 'object') throw new Error('缺少曝光组合')
  const r = raw as Record<string, { value?: number }>
  return makeSetting(
    Number(r.aperture?.value),
    Number(r.shutter?.value),
    Number(r.iso?.value),
    mode,
  )
}
export function parseBackup(raw: string): AppData {
  const value = JSON.parse(raw) as Partial<AppData>
  if (!value || value.version !== 1 || !value.full || !value.third)
    throw new Error('不支持的备份格式或版本')
  const data = { ...defaultData(), ...value }
  if (!data.defaultBases || typeof data.defaultBases !== 'object')
    throw new Error('备份中的默认基准无效')
  data.defaultBases = {
    full: validSetting(data.defaultBases.full, 'full'),
    third: validSetting(data.defaultBases.third, 'third'),
  }
  for (const mode of ['full', 'third'] as const) {
    const calc = data[mode]
    const base = validSetting(calc.base, mode)
    const current = validSetting(calc.current, mode)
    if (
      !['digital', 'film'].includes(calc.camera) ||
      !Number.isFinite(calc.targetEV) ||
      !Number.isFinite(calc.filmISO) ||
      calc.filmISO <= 0 ||
      !Number.isFinite(calc.ei) ||
      calc.ei <= 0 ||
      !['none', 'aperture', 'shutter', 'iso'].includes(calc.preferred)
    )
      throw new Error('备份中的计算器设置无效')
    data[mode] = {
      ...calc,
      base,
      current,
      warnings: Array.isArray(calc.warnings)
        ? calc.warnings.filter((w): w is string => typeof w === 'string')
        : [],
      locks: Array.isArray(calc.locks)
        ? calc.locks.filter((p): p is Parameter => ['aperture', 'shutter', 'iso'].includes(p))
        : [],
    }
  }
  if (!data.ranges || typeof data.ranges !== 'object' || Array.isArray(data.ranges))
    throw new Error('备份中的设备范围无效')
  for (const range of Object.values(data.ranges))
    if (
      range &&
      (!Array.isArray(range) ||
        range.length !== 2 ||
        !range.every((n) => Number.isFinite(n) && n > 0) ||
        range[0] > range[1])
    )
      throw new Error('备份中的设备范围无效')
  if (!Array.isArray(data.presets) || !Array.isArray(data.history))
    throw new Error('备份中的预设或历史无效')
  data.presets = data.presets.map((p) => ({ ...p, setting: validSetting(p.setting, p.mode) }))
  data.history = data.history
    .slice(0, 100)
    .map((h) => ({ ...h, setting: validSetting(h.setting, h.mode) }))
  return data
}
const STORAGE_KEY = 'exposure-lab-v1'
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseBackup(raw) : defaultData()
  } catch {
    return defaultData()
  }
}
export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
