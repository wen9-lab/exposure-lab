import { findStop, ladder, type Mode, type Parameter } from './ladders'

export type { Mode, Parameter } from './ladders'
export interface SettingValue {
  value: number
  index: number | null
}
export interface ExposureSetting {
  aperture: SettingValue
  shutter: SettingValue
  iso: SettingValue
}
export type Camera = 'digital' | 'film'
export type Status = 'exact' | 'nominal' | 'approximate' | 'different' | 'limited'
export interface Evaluation {
  actualEV: number
  lightEV: number
  nominalEV: number | null
  residualEV: number
  status: Status
  brightnessRatio: number
  lightRatio: number
}
export interface CalculatorState {
  base: ExposureSetting
  current: ExposureSetting
  mode: Mode
  camera: Camera
  targetEV: number
  preferred: Parameter | 'none'
  locks: Parameter[]
  ranges: Partial<Record<Parameter, [number, number]>>
}
export interface CompensationResult {
  current: ExposureSetting
  evaluation: Evaluation
  reasons: string[]
}
const parameterNames: Record<Parameter, string> = { aperture: '光圈', shutter: '快门', iso: 'ISO' }
export function rangeWarnings(
  setting: ExposureSetting,
  ranges: CalculatorState['ranges'],
): string[] {
  return (Object.keys(setting) as Parameter[]).flatMap((parameter) => {
    const range = ranges[parameter]
    return range && (setting[parameter].value < range[0] || setting[parameter].value > range[1])
      ? [`${parameterNames[parameter]}超出设备范围`]
      : []
  })
}

function positive(value: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error('曝光参数必须为有限正数')
  return value
}
export function makeValue(parameter: Parameter, value: number, mode: Mode): SettingValue {
  positive(value)
  return { value, index: findStop(parameter, mode, value)?.index ?? null }
}
export function makeSetting(
  aperture: number,
  shutter: number,
  iso: number,
  mode: Mode,
): ExposureSetting {
  return {
    aperture: makeValue('aperture', aperture, mode),
    shutter: makeValue('shutter', shutter, mode),
    iso: makeValue('iso', iso, mode),
  }
}
export function remap(setting: ExposureSetting, mode: Mode): ExposureSetting {
  return makeSetting(setting.aperture.value, setting.shutter.value, setting.iso.value, mode)
}

export function evaluate(
  base: ExposureSetting,
  current: ExposureSetting,
  targetEV = 0,
  limited = false,
  mode: Mode = 'full',
): Evaluation {
  const b = base,
    c = current
  const actualEV = Math.log2(
    (c.shutter.value * c.iso.value) /
      c.aperture.value ** 2 /
      ((b.shutter.value * b.iso.value) / b.aperture.value ** 2),
  )
  const lightEV = Math.log2(
    c.shutter.value / c.aperture.value ** 2 / (b.shutter.value / b.aperture.value ** 2),
  )
  const allIndexed = (Object.keys(b) as Parameter[]).every(
    (p) => b[p].index !== null && c[p].index !== null,
  )
  const divisor = mode === 'third' ? 3 : 1
  const nominalEV = allIndexed
    ? (b.aperture.index! -
        c.aperture.index! +
        (b.shutter.index! - c.shutter.index!) +
        (c.iso.index! - b.iso.index!)) /
      divisor
    : null
  const residualEV = targetEV - (nominalEV ?? actualEV)
  const numericResidual = Math.abs(targetEV - actualEV)
  const nominalMatch = nominalEV !== null && Math.abs(targetEV - nominalEV) < 1e-8
  const status: Status =
    limited && Math.abs(residualEV) > 1e-8
      ? 'limited'
      : numericResidual <= 0.01
        ? 'exact'
        : nominalMatch
          ? 'nominal'
          : numericResidual <= 0.1
            ? 'approximate'
            : 'different'
  return {
    actualEV,
    lightEV,
    nominalEV,
    residualEV,
    status,
    brightnessRatio: 2 ** actualEV,
    lightRatio: 2 ** lightEV,
  }
}

export function moveAndCompensate(
  state: CalculatorState,
  changed: Parameter,
  value: number,
): CompensationResult {
  let current = { ...state.current, [changed]: makeValue(changed, value, state.mode) }
  const reasons: string[] = []
  if (state.preferred === 'none')
    return {
      current,
      evaluation: evaluate(state.base, current, state.targetEV, false, state.mode),
      reasons,
    }
  const order: Parameter[] = [
    ...new Set(
      [state.preferred, 'shutter', 'aperture', 'iso'].filter(
        (p): p is Parameter => p !== 'none' && p !== changed,
      ),
    ),
  ]
  for (const parameter of order) {
    if (state.camera === 'film' && parameter === 'iso') {
      reasons.push('胶片 ISO 已固定')
      continue
    }
    if (state.locks.includes(parameter)) {
      reasons.push(`${parameter} 已锁定`)
      continue
    }
    const [min, max] = state.ranges[parameter] ?? [0, Infinity]
    const candidates = ladder(parameter, state.mode).filter(
      (stop) => stop.value >= min && stop.value <= max,
    )
    if (!candidates.length) {
      reasons.push(`${parameter} 没有可用档位`)
      continue
    }
    const before = evaluate(state.base, current, state.targetEV, false, state.mode)
    if (Math.abs(before.residualEV) < 1e-8) break
    let best = current[parameter]
    let bestGap = Math.abs(before.residualEV)
    for (const stop of candidates) {
      const trial = { ...current, [parameter]: { value: stop.value, index: stop.index } }
      const gap = Math.abs(
        evaluate(state.base, trial, state.targetEV, false, state.mode).residualEV,
      )
      if (gap < bestGap - 1e-8) {
        bestGap = gap
        best = trial[parameter]
      }
    }
    current = { ...current, [parameter]: best }
    if (bestGap > 1e-8) reasons.push(`${parameter} 无法完全补偿`)
  }
  const initial = evaluate(state.base, current, state.targetEV, false, state.mode)
  return {
    current,
    evaluation: evaluate(
      state.base,
      current,
      state.targetEV,
      Math.abs(initial.residualEV) > 1e-8,
      state.mode,
    ),
    reasons,
  }
}

export type SunScene = 'sunny' | 'hazy' | 'brightCloud' | 'cloudy' | 'shade' | 'snow'
export const sunScenes: Record<SunScene, { aperture: number; label: string }> = {
  sunny: { aperture: 16, label: '直射晴天' },
  hazy: { aperture: 11, label: '薄云或轻度阴天' },
  brightCloud: { aperture: 8, label: '明亮阴天' },
  cloudy: { aperture: 5.6, label: '厚云阴天' },
  shade: { aperture: 4, label: '开放阴影' },
  snow: { aperture: 22, label: '雪地或沙滩（经验起点）' },
}
export function sunny16(
  scene: SunScene,
  iso: number,
  mode: Mode,
  selection: 'exact' | 'standard',
): ExposureSetting {
  positive(iso)
  const target = 1 / iso
  const shutter =
    selection === 'exact'
      ? target
      : ladder('shutter', mode).reduce((best, stop) =>
          Math.abs(Math.log2(stop.value / target)) < Math.abs(Math.log2(best.value / target))
            ? stop
            : best,
        ).value
  return makeSetting(sunScenes[scene].aperture, shutter, iso, mode)
}
