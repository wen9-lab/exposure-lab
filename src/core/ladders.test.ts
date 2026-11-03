import { expect, it } from 'vitest'
import { ladder } from './ladders'

it('1/3 档快门包含常见标称值且慢快门不会误写成 1/1 秒', () => {
  const values = ladder('shutter', 'third')
  expect(values.find((v) => v.value === 1 / 400)?.label).toBe('1/400s')
  expect(values.find((v) => v.value === 1 / 1.3)?.label).toBe('0.8s')
})
