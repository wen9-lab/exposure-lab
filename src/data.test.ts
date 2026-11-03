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
