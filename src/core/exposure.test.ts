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
