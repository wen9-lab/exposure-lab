import { describe, expect, it } from 'vitest'
import { evaluate, makeSetting, moveAndCompensate, rangeWarnings, sunny16 } from './exposure'

const base = makeSetting(4, 1 / 500, 100, 'full')

describe('曝光计算', () => {
  it('A: 档位等效且展示标称值偏差', () => {
    const result = evaluate(base, makeSetting(2.8, 1 / 1000, 100, 'full'))
    expect(result.nominalEV).toBe(0)
    expect(result.actualEV).toBeCloseTo(0.029146, 5)
    expect(result.status).toBe('nominal')
  })
  it('B: ISO 只改变推算亮度，不增加进光量', () => {
    const result = evaluate(base, makeSetting(4, 1 / 1000, 200, 'full'))
    expect(result.nominalEV).toBe(0)
    expect(result.lightEV).toBeCloseTo(-1, 6)
  })
  it('C: 三分之一档等效并保留微小偏差', () => {
    const result = evaluate(
      makeSetting(2.8, 1 / 250, 100, 'third'),
      makeSetting(3.2, 1 / 200, 100, 'third'),
    )
    expect(result.nominalEV).toBe(0)
    expect(result.actualEV).toBeCloseTo(-0.063362, 5)
  })
  it('D: 阳光16按模式选择快门', () => {
    expect(sunny16('sunny', 400, 'full', 'exact').shutter.value).toBe(1 / 400)
    expect(sunny16('sunny', 400, 'full', 'standard').shutter.value).toBe(1 / 500)
    expect(sunny16('sunny', 400, 'third', 'standard').shutter.value).toBe(1 / 400)
  })
  it('E: 胶片不能自动改变ISO', () => {
    const result = moveAndCompensate(
      {
        base,
        current: base,
        mode: 'full',
        camera: 'film',
        targetEV: 0,
        preferred: 'iso',
        locks: [],
        ranges: {},
      },
      'shutter',
      1 / 1000,
    )
    expect(result.current.iso.value).toBe(100)
    expect(result.current.aperture.value).toBe(2.8)
  })
  it('F: 越界不能误报完全等效', () => {
    const current = makeSetting(2.8, 1 / 8000, 100, 'full')
    const result = moveAndCompensate(
      {
        base: makeSetting(4, 1 / 8000, 100, 'full'),
        current,
        mode: 'full',
        camera: 'digital',
        targetEV: 0,
        preferred: 'shutter',
        locks: ['iso'],
        ranges: { shutter: [1 / 8000, 30] },
      },
      'aperture',
      2,
    )
    expect(result.evaluation.residualEV).not.toBe(0)
  })
  it('非标准正数使用实际数值计算', () => {
    const result = evaluate(base, makeSetting(3.7, 1 / 570, 125, 'full'))
    expect(result.nominalEV).toBeNull()
    expect(result.actualEV).toBeCloseTo(
      Math.log2(((1 / 570) * 125) / 3.7 ** 2 / (((1 / 500) * 100) / 4 ** 2)),
      9,
    )
  })
  it('关闭自动补偿时只修改用户选择的参数', () => {
    const result = moveAndCompensate(
      {
        base,
        current: base,
        mode: 'full',
        camera: 'digital',
        targetEV: 0,
        preferred: 'none',
        locks: [],
        ranges: {},
      },
      'aperture',
      2.8,
    )
    expect(result.current.shutter.value).toBe(1 / 500)
    expect(result.evaluation.residualEV).toBe(-1)
  })
  it('识别当前组合超出用户设备范围', () => {
    expect(
      rangeWarnings(makeSetting(4, 1 / 16000, 100, 'full'), { shutter: [1 / 8000, 30] }),
    ).toContain('快门超出设备范围')
  })
  it('优先参数到达边界后继续尝试其他未锁定参数', () => {
    const result = moveAndCompensate(
      {
        base,
        current: base,
        mode: 'full',
        camera: 'digital',
        targetEV: 0,
        preferred: 'shutter',
        locks: [],
        ranges: { shutter: [1 / 500, 30] },
      },
      'aperture',
      2.8,
    )
    expect(result.current.shutter.value).toBe(1 / 500)
    expect(result.current.iso.value).toBe(50)
    expect(result.evaluation.residualEV).toBe(0)
  })
})

describe('三分之一 EV 补偿目标', () => {
  it('固定参数时目标本身不改变进光量，只留下精确 1/3 EV 残差', () => {
    const result = evaluate(base, base, 1 / 3, false, 'full')
    expect(result.actualEV).toBe(0)
    expect(result.lightEV).toBe(0)
    expect(result.residualEV).toBeCloseTo(1 / 3, 10)
    expect(result.status).toBe('different')
  })

  it('完整档参数不能精确满足 1/3 EV 时保留残差', () => {
    const result = moveAndCompensate(
      {
        base,
        current: base,
        mode: 'full',
        camera: 'digital',
        targetEV: 1 / 3,
        preferred: 'shutter',
        locks: [],
        ranges: {},
      },
      'iso',
      200,
    )
    expect(result.evaluation.residualEV).toBeCloseTo(1 / 3, 10)
    expect(result.evaluation.status).toBe('limited')
    expect(result.reasons.some((reason) => reason.includes('无法完全补偿'))).toBe(true)
  })

  it('精细档 ISO 125 满足 1/3 档目标，同时保留标称数值差异', () => {
    const setting = makeSetting(4, 1 / 500, 100, 'third')
    const result = evaluate(setting, makeSetting(4, 1 / 500, 125, 'third'), 1 / 3, false, 'third')
    expect(result.nominalEV).toBeCloseTo(1 / 3, 10)
    expect(result.actualEV).toBeCloseTo(Math.log2(1.25), 10)
    expect(result.residualEV).toBeCloseTo(0, 10)
    expect(result.status).toBe('nominal')
    expect(result.lightRatio).toBeCloseTo(1, 10)
  })
})
