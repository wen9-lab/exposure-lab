import { expect, it } from 'vitest'
import { defaultData, parseBackup } from './data'

it('JSON 备份保留两个计算器各自的基准', () => {
  const data = defaultData()
  data.full.base.aperture.value = 8
  const restored = parseBackup(JSON.stringify(data))
  expect(restored.full.base.aperture.value).toBe(8)
  expect(restored.third.base.aperture.value).toBe(4)
})

it('拒绝无版本号与无效曝光参数的备份', () => {
  expect(() => parseBackup('{"full":{}}')).toThrow()
  const data = defaultData()
  data.full.current.shutter.value = -2
  expect(() => parseBackup(JSON.stringify(data))).toThrow()
})

it('保存两个独立的默认基准并兼容旧版备份', () => {
  const data = defaultData()
  data.defaultBases.full = data.full.current
  const restored = parseBackup(JSON.stringify(data))
  expect(restored.defaultBases.full.aperture.value).toBe(4)
  const legacy = JSON.parse(JSON.stringify(data))
  delete legacy.defaultBases
  expect(parseBackup(JSON.stringify(legacy)).defaultBases.third.shutter.value).toBe(1 / 500)
})

it('拒绝损坏的设备范围或胶卷 ISO', () => {
  const data = defaultData()
  expect(() => parseBackup(JSON.stringify({ ...data, ranges: null }))).toThrow('设备范围')
  expect(() =>
    parseBackup(JSON.stringify({ ...data, full: { ...data.full, filmISO: -1 } })),
  ).toThrow('计算器设置')
})
