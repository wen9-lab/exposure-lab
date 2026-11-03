export type Mode = 'full' | 'third'
export type Parameter = 'aperture' | 'shutter' | 'iso'
export interface Stop {
  value: number
  label: string
  index: number
}

const apertureFull = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32]
const apertureThird = [
  1, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11,
  13, 14, 16, 18, 20, 22, 25, 29, 32,
]
const shutterFull = [
  30,
  15,
  8,
  4,
  2,
  1,
  1 / 2,
  1 / 4,
  1 / 8,
  1 / 15,
  1 / 30,
  1 / 60,
  1 / 125,
  1 / 250,
  1 / 500,
  1 / 1000,
  1 / 2000,
  1 / 4000,
  1 / 8000,
  1 / 16000,
  1 / 32000,
]
const shutterThird = [
  30,
  25,
  20,
  15,
  13,
  10,
  8,
  6,
  5,
  4,
  3.2,
  2.5,
  2,
  1.6,
  1.3,
  1,
  1 / 1.3,
  1 / 1.6,
  1 / 2,
  1 / 2.5,
  1 / 3.2,
  1 / 4,
  1 / 5,
  1 / 6,
  1 / 8,
  1 / 10,
  1 / 13,
  1 / 15,
  1 / 20,
  1 / 25,
  1 / 30,
  1 / 40,
  1 / 50,
  1 / 60,
  1 / 80,
  1 / 100,
  1 / 125,
  1 / 160,
  1 / 200,
  1 / 250,
  1 / 320,
  1 / 400,
  1 / 500,
  1 / 640,
  1 / 800,
  1 / 1000,
  1 / 1250,
  1 / 1600,
  1 / 2000,
  1 / 2500,
  1 / 3200,
  1 / 4000,
  1 / 5000,
  1 / 6400,
  1 / 8000,
  1 / 10000,
  1 / 12800,
  1 / 16000,
  1 / 20000,
  1 / 25600,
  1 / 32000,
]
const isoFull = [25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400]
const isoThird = [
  25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000,
  2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200, 64000,
  80000, 102400,
]

function shutterLabel(seconds: number): string {
  if (seconds >= 1) return `${seconds}s`
  if (seconds > 0.25 && seconds !== 0.5) return `${seconds.toFixed(1)}s`
  return `1/${Math.round(1 / seconds)}s`
}

export function ladder(parameter: Parameter, mode: Mode): Stop[] {
  const values =
    parameter === 'aperture'
      ? mode === 'full'
        ? apertureFull
        : apertureThird
      : parameter === 'shutter'
        ? mode === 'full'
          ? shutterFull
          : shutterThird
        : mode === 'full'
          ? isoFull
          : isoThird
  return values.map((value, index) => ({
    value,
    index,
    label:
      parameter === 'aperture'
        ? `f/${value}`
        : parameter === 'shutter'
          ? shutterLabel(value)
          : `ISO ${value}`,
  }))
}

export function findStop(parameter: Parameter, mode: Mode, value: number): Stop | undefined {
  return ladder(parameter, mode).find(
    (stop) => Math.abs(stop.value - value) < Math.max(1e-10, value * 1e-9),
  )
}
