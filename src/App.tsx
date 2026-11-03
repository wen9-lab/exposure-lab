import { useEffect, useMemo, useState } from 'react'
import {
  evaluate,
  makeSetting,
  makeValue,
  moveAndCompensate,
  rangeWarnings,
  remap,
  sunScenes,
  sunny16,
  type ExposureSetting,
  type Mode,
  type Parameter,
  type SunScene,
} from './core/exposure'
import { ladder } from './core/ladders'
import {
  defaultData,
  loadData,
  parseBackup,
  saveData,
  type AppData,
  type CalculatorData,
} from './data'

type Page = 'full' | 'third' | 'learn' | 'reference' | 'settings'
const names: Record<Parameter, string> = { aperture: '光圈', shutter: '快门', iso: 'ISO' }
const nav: { id: Page; icon: string; label: string; sub: string }[] = [
  { id: 'full', icon: '◉', label: '完整档计算器', sub: '1 档 · 快速交换' },
  { id: 'third', icon: '◎', label: '精细档计算器', sub: '1/3 档 · 精确控制' },
  { id: 'learn', icon: '▤', label: '曝光知识库', sub: '从原理到应用' },
  { id: 'reference', icon: '▦', label: '档位速查表', sub: '完整数列与关系' },
  { id: 'settings', icon: '⚙', label: '设置与预设', sub: '离线保存与备份' },
]
function formatNumber(n: number, digits = 2) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`
}
function shutterText(seconds: number, decimal = false): string {
  if (decimal) return `${seconds.toFixed(seconds < 0.01 ? 5 : 3)} 秒`
  if (seconds >= 1) return `${seconds} 秒`
  if (seconds > 0.25 && seconds !== 0.5) return `${seconds.toFixed(1)} 秒`
  return `1/${Math.round(1 / seconds)} 秒`
}
function valueText(setting: ExposureSetting, parameter: Parameter, decimal = false): string {
  return parameter === 'aperture'
    ? `f/${setting.aperture.value}`
    : parameter === 'shutter'
      ? shutterText(setting.shutter.value, decimal)
      : `ISO ${setting.iso.value}`
}
function combo(setting: ExposureSetting): string {
  return `f/${setting.aperture.value} · ${shutterText(setting.shutter.value)} · ISO ${setting.iso.value}`
}
function chip(text: string) {
  return <span className="chip">{text}</span>
}

interface CalculatorProps {
  mode: Mode
  calc: CalculatorData
  data: AppData
  update: (fn: (calc: CalculatorData) => CalculatorData) => void
  savePreset: (setting: ExposureSetting, mode: Mode) => void
  addHistory: (setting: ExposureSetting, mode: Mode, note: string) => void
}
function Calculator({ mode, calc, data, update, savePreset, addHistory }: CalculatorProps) {
  const [scene, setScene] = useState<SunScene>('sunny')
  const [sunISO, setSunISO] = useState(400)
  const [sunStyle, setSunStyle] = useState<'exact' | 'standard'>('standard')
  const [manual, setManual] = useState<Parameter | null>(null)
  const target = calc.targetEV - (calc.camera === 'film' ? Math.log2(calc.ei / calc.filmISO) : 0)
  const result = useMemo(
    () => evaluate(calc.base, calc.current, target, false, mode),
    [calc, target, mode],
  )
  const hardwareWarnings = rangeWarnings(calc.current, data.ranges)
  const shownStatus =
    hardwareWarnings.length || (Math.abs(result.residualEV) > 1e-8 && calc.preferred !== 'none')
      ? 'limited'
      : result.status
  const statusLabel = {
    exact: '数值等效',
    nominal: '档位等效 · 数值近似',
    approximate: '近似等效',
    different: '非等效',
    limited: hardwareWarnings.length ? '超出设备范围' : '受限制 · 未完全补偿',
  }[shownStatus]
  const change = (parameter: Parameter, value: number) => {
    if (calc.locks.includes(parameter) || (calc.camera === 'film' && parameter === 'iso')) return
    update((c) => {
      const next = moveAndCompensate(
        {
          base: c.base,
          current: c.current,
          mode,
          camera: c.camera,
          targetEV: c.targetEV - (c.camera === 'film' ? Math.log2(c.ei / c.filmISO) : 0),
          preferred: c.preferred,
          locks: c.locks,
          ranges: data.ranges,
        },
        parameter,
        value,
      )
      return { ...c, current: next.current, warnings: next.reasons }
    })
  }
  const step = (parameter: Parameter, direction: number) => {
    const items = ladder(parameter, mode)
    const current = calc.current[parameter]
    const index =
      current.index ??
      items.reduce(
        (best, item) =>
          Math.abs(Math.log2(item.value / current.value)) <
          Math.abs(Math.log2(items[best].value / current.value))
            ? item.index
            : best,
        0,
      )
    const next = items[Math.max(0, Math.min(items.length - 1, index + direction))]
    change(parameter, next.value)
  }
  const setBaseline = (setting: ExposureSetting) =>
    update((c) => ({ ...c, base: setting, current: setting, warnings: [] }))
  const notes = [
    result.lightEV > 0.05
      ? '理论进光量增加'
      : result.lightEV < -0.05
        ? '理论进光量减少'
        : '理论进光量基本不变',
    calc.current.aperture.value < calc.base.aperture.value
      ? '景深趋浅'
      : calc.current.aperture.value > calc.base.aperture.value
        ? '景深趋深'
        : '景深趋势不变',
    calc.current.shutter.value < calc.base.shutter.value
      ? '运动凝固能力提高'
      : calc.current.shutter.value > calc.base.shutter.value
        ? '运动模糊风险提高'
        : '运动凝固能力不变',
    calc.current.iso.value > calc.base.iso.value
      ? 'ISO 提高不会增加进光量'
      : 'ISO 不改变场景进光量',
  ]
  return (
    <div className="page calculator-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">EXPOSURE CALCULATOR / {mode === 'full' ? '01' : '02'}</span>
          <h1>{mode === 'full' ? '完整 1 档计算器' : '精细 1/3 档计算器'}</h1>
          <p>改变一个参数，观察曝光与画面表达如何一起变化。</p>
        </div>
        {chip(mode === 'full' ? '每次调整 1 档' : '每次调整 1/3 档')}
      </div>
      <div className="calculator-layout">
        <div className="main-column">
          <section className="panel controls-panel">
            <div className="section-top">
              <div>
                <h2>当前拍摄参数</h2>
                <p>点按 ± 调整档位，或直接从列表中选择。</p>
              </div>
              <span className="live-dot">实时计算</span>
            </div>
            <div className="camera-switch">
              <button
                className={calc.camera === 'digital' ? 'selected' : ''}
                onClick={() => update((c) => ({ ...c, camera: 'digital' }))}
              >
                数码相机
              </button>
              <button
                className={calc.camera === 'film' ? 'selected' : ''}
                onClick={() =>
                  update((c) => ({
                    ...c,
                    camera: 'film',
                    filmISO: c.current.iso.value,
                    ei: c.current.iso.value,
                    preferred: c.preferred === 'iso' ? 'shutter' : c.preferred,
                  }))
                }
              >
                胶片相机
              </button>
            </div>
            {calc.camera === 'film' && (
              <div className="film-strip">
                <label>
                  胶卷 ISO{' '}
                  <input
                    type="number"
                    min="1"
                    value={calc.filmISO}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      if (n > 0)
                        update((c) => ({
                          ...c,
                          filmISO: n,
                          ei: n,
                          base: { ...c.base, iso: makeValue('iso', n, mode) },
                          current: { ...c.current, iso: makeValue('iso', n, mode) },
                        }))
                    }}
                  />
                </label>
                <label>
                  测光 EI{' '}
                  <input
                    type="number"
                    min="1"
                    value={calc.ei}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      if (n > 0) update((c) => ({ ...c, ei: n }))
                    }}
                  />
                </label>
                <small>EI 改变测光目标，不改变胶卷感光度。</small>
              </div>
            )}
            <div className="param-stack">
              {(['aperture', 'shutter', 'iso'] as Parameter[]).map((parameter) => {
                const locked =
                  calc.locks.includes(parameter) || (calc.camera === 'film' && parameter === 'iso')
                const items = ladder(parameter, mode).filter((s) => {
                  const [min, max] = data.ranges[parameter] ?? [0, Infinity]
                  return data.showExtended || (s.value >= min && s.value <= max)
                })
                const current = calc.current[parameter]
                const delta =
                  current.index !== null && calc.base[parameter].index !== null
                    ? ((parameter === 'iso' ? 1 : -1) *
                        (current.index - calc.base[parameter].index!)) /
                      (mode === 'third' ? 3 : 1)
                    : null
                return (
                  <div className="param-card" key={parameter}>
                    <div className="param-head">
                      <span>{names[parameter]}</span>
                      <span className="param-delta">
                        {delta === null
                          ? '自定义值'
                          : `${formatNumber(delta, mode === 'third' ? 2 : 0)} 档`}
                      </span>
                    </div>
                    <div className="param-row">
                      <button
                        className="step-btn"
                        aria-label={`${names[parameter]}前一档`}
                        disabled={locked}
                        onClick={() => step(parameter, -1)}
                      >
                        −
                      </button>
                      <div className="param-center">
                        <strong>
                          {valueText(calc.current, parameter, data.shutterFormat === 'decimal')}
                        </strong>
                        <select
                          aria-label={`选择${names[parameter]}`}
                          value={current.index === null ? 'manual' : String(current.index)}
                          disabled={locked}
                          onChange={(e) => {
                            if (e.target.value === 'manual') setManual(parameter)
                            else
                              change(
                                parameter,
                                ladder(parameter, mode)[Number(e.target.value)].value,
                              )
                          }}
                        >
                          <option value="manual">自定义数值</option>
                          {items.map((item) => (
                            <option value={item.index} key={item.index}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="step-btn"
                        aria-label={`${names[parameter]}后一档`}
                        disabled={locked}
                        onClick={() => step(parameter, 1)}
                      >
                        +
                      </button>
                      <button
                        className={`lock-btn ${locked ? 'on' : ''}`}
                        title={locked ? '解锁' : '锁定'}
                        disabled={calc.camera === 'film' && parameter === 'iso'}
                        onClick={() =>
                          update((c) => ({
                            ...c,
                            locks: c.locks.includes(parameter)
                              ? c.locks.filter((p) => p !== parameter)
                              : [...c.locks, parameter],
                          }))
                        }
                      >
                        {locked ? '🔒' : '🔓'}
                      </button>
                    </div>
                    {manual === parameter && (
                      <div className="manual-row">
                        <input
                          autoFocus
                          type="number"
                          min="0.000001"
                          step="any"
                          placeholder="输入正数"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const n = Number(e.currentTarget.value)
                              if (n > 0) {
                                change(parameter, n)
                                setManual(null)
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const n = Number(
                              (e.currentTarget.previousElementSibling as HTMLInputElement).value,
                            )
                            if (n > 0) {
                              change(parameter, n)
                              setManual(null)
                            }
                          }}
                        >
                          应用
                        </button>
                        <button onClick={() => setManual(null)}>取消</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="automation">
              <label>
                自动补偿参数
                <select
                  value={calc.preferred}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      preferred: e.target.value as CalculatorData['preferred'],
                      warnings: [],
                    }))
                  }
                >
                  <option value="none">关闭自动补偿</option>
                  <option value="shutter">优先快门</option>
                  <option value="aperture">优先光圈</option>
                  {calc.camera === 'digital' && <option value="iso">优先 ISO</option>}
                </select>
              </label>
              <label>
                曝光目标 <span>{formatNumber(calc.targetEV, mode === 'third' ? 2 : 0)} EV</span>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step={mode === 'third' ? 1 / 3 : 1}
                  value={calc.targetEV}
                  onChange={(e) => update((c) => ({ ...c, targetEV: Number(e.target.value) }))}
                />
              </label>
            </div>
            <div className="action-row">
              <button onClick={() => setBaseline(calc.current)}>设当前为基准</button>
              <button
                onClick={() =>
                  setBaseline(
                    makeSetting(4, 1 / 500, calc.camera === 'film' ? calc.filmISO : 100, mode),
                  )
                }
              >
                恢复默认基准
              </button>
              <button onClick={() => update((c) => ({ ...c, current: c.base, warnings: [] }))}>
                重置当前
              </button>
              <button onClick={() => savePreset(calc.current, mode)}>保存预设</button>
              <button onClick={() => addHistory(calc.current, mode, '手动记录')}>记入历史</button>
            </div>
          </section>
          <section className="panel sun-panel">
            <div className="section-top">
              <div>
                <h2>阳光 16 · 快速建立基准</h2>
                <p>经验起点，不能替代现场测光。</p>
              </div>
              <span className="sun-symbol">☀</span>
            </div>
            <div className="sun-grid">
              <label>
                光照条件
                <select value={scene} onChange={(e) => setScene(e.target.value as SunScene)}>
                  {Object.entries(sunScenes).map(([id, item]) => (
                    <option value={id} key={id}>
                      {item.label} · f/{item.aperture}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                ISO
                <input
                  type="number"
                  min="1"
                  value={sunISO}
                  onChange={(e) => setSunISO(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <label>
                快门方式
                <select
                  value={sunStyle}
                  onChange={(e) => setSunStyle(e.target.value as 'exact' | 'standard')}
                >
                  <option value="standard">最接近当前标准档位</option>
                  <option value="exact">理论精确 1/ISO</option>
                </select>
              </label>
            </div>
            <div className="sun-result">
              <div>
                <span>理论基准</span>
                <strong>
                  f/{sunScenes[scene].aperture} · {shutterText(1 / sunISO)} · ISO {sunISO}
                </strong>
              </div>
              <div>
                <span>应用组合</span>
                <strong>{combo(sunny16(scene, sunISO, mode, sunStyle))}</strong>
              </div>
              <button
                className="primary"
                onClick={() => setBaseline(sunny16(scene, sunISO, mode, sunStyle))}
              >
                应用为基准 →
              </button>
            </div>
            {sunStyle === 'standard' && (
              <p className="micro">
                标准快门取整差异：
                {formatNumber(
                  Math.log2(sunny16(scene, sunISO, mode, 'standard').shutter.value * sunISO),
                  2,
                )}{' '}
                EV。晴天 ISO 400 在 1/3 档可选 1/400 秒。
              </p>
            )}
          </section>
        </div>
        <aside className="side-column">
          <section className="panel result-panel">
            <div className="section-top">
              <h2>曝光计算结果</h2>
              {chip(mode === 'full' ? '1 档模式' : '1/3 档模式')}
            </div>
            <div className="comparison">
              <div>
                <span>原始基准</span>
                <strong>f/{calc.base.aperture.value}</strong>
                <b>{shutterText(calc.base.shutter.value)}</b>
                <small>ISO {calc.base.iso.value}</small>
              </div>
              <div>
                <span>调整结果</span>
                <strong>f/{calc.current.aperture.value}</strong>
                <b>{shutterText(calc.current.shutter.value)}</b>
                <small>ISO {calc.current.iso.value}</small>
              </div>
            </div>
            <div className="result-status">
              <span>曝光结论</span>
              <strong
                className={shownStatus === 'limited' || shownStatus === 'different' ? 'warn' : ''}
              >
                {statusLabel}
              </strong>
            </div>
            <div className="result-line">
              <span>标准档位差</span>
              <b>
                {result.nominalEV === null ? '非标准数值' : `${formatNumber(result.nominalEV)} EV`}
              </b>
            </div>
            <div className="result-line">
              <span>按数值计算的差异</span>
              <b>{formatNumber(result.actualEV, 3)} EV</b>
            </div>
            <div className="result-line">
              <span>理论进光量变化</span>
              <b>
                {formatNumber(result.lightEV, 2)} EV · {(result.lightRatio * 100).toFixed(0)}%
              </b>
            </div>
            <div className="result-line">
              <span>按 ISO 推算的亮度</span>
              <b>{(result.brightnessRatio * 100).toFixed(0)}%</b>
            </div>
            <div className="result-line">
              <span>相对目标剩余偏差</span>
              <b className={Math.abs(result.residualEV) > 0.01 ? 'warn' : ''}>
                {formatNumber(result.residualEV, 2)} EV
              </b>
            </div>
            {[...new Set([...hardwareWarnings, ...calc.warnings])].length > 0 && (
              <div className="warning-list">
                {[...new Set([...hardwareWarnings, ...calc.warnings])].join('；')}
              </div>
            )}
            <div className="insight">
              <span className="insight-mark">↗</span>
              <p>
                {notes.join('；')}。以上为理论趋势，实际照片还受场景、镜头透光率与相机处理影响。
              </p>
            </div>
          </section>
          <section className="panel tip-panel">
            <span className="eyebrow">理解曝光交换</span>
            <h3>光量与亮度，不是一回事</h3>
            <p>光圈和快门决定模型中的进光量；ISO 改变亮度推算，不会让更多光子进入相机。</p>
            <div className="mini-chart">
              <span>景深</span>
              <div
                style={{
                  width: `${Math.max(10, Math.min(100, (calc.current.aperture.value / 32) * 100))}%`,
                }}
              />
            </div>
            <div className="mini-chart">
              <span>凝固运动</span>
              <div
                style={{
                  width: `${Math.max(10, Math.min(100, (Math.log2(30 / calc.current.shutter.value) / 20) * 100))}%`,
                }}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

const lessons = [
  {
    title: '阳光 16 法则',
    tag: '户外起点',
    text: '晴天直射阳光下，以 f/16、快门约 1/ISO 秒作为经验曝光起点。天气、地面反射和主体明暗会改变合适曝光。',
    detail:
      '例如 ISO 400 的理论快门是 1/400 秒。完整档位相机常选 1/500 秒，比理论值少约 0.32 档；1/3 档相机可直接选 1/400 秒。',
  },
  {
    title: '光圈、快门、ISO',
    tag: '三要素',
    text: '光圈控制通光口径和景深趋势；快门控制曝光时间与运动凝固；ISO 是感光度设置或胶卷标称值。',
    detail:
      '数码相机提高 ISO 不会增加到达传感器的光量。胶片的 ISO 是胶卷属性，拍摄中不能像数码设置那样随意改变。',
  },
  {
    title: '一档 Stop 的数学',
    tag: '核心概念',
    text: '曝光变化一档，表示模型中的光量乘以 2 或除以 2；光圈 f 值每完整档约乘以 √2。',
    detail: '由 f/4 开到 f/2.8 约增加一档进光量；把 1/500 秒改为 1/1000 秒约减少一档，两者可抵消。',
  },
  {
    title: 'EV 与曝光补偿',
    tag: '目标与结果',
    text: '本软件结果中的“亮度差 EV”表示相对基准的理论档位差。曝光补偿是希望达到的目标，不是独立的进光量按钮。',
    detail: '全手动且 ISO 固定时，设定 +1 EV 目标后，还须实际改变光圈或快门，才能达到更亮的曝光。',
  },
  {
    title: '曝光等效交换',
    tag: '取舍',
    text: '不同光圈与快门组合可以在标准档位上等效，同时改变景深与运动表现。',
    detail:
      'f/4、1/500 秒与 f/2.8、1/1000 秒在完整档位上等效；按标称 f 值直接计算仍有约 +0.029 EV 的差异。',
  },
  {
    title: '进光量与输出亮度',
    tag: '避免误解',
    text: '理论像面曝光比例可用 t/N² 估算；将 ISO 纳入后，可推算数码亮度的相对趋势。',
    detail:
      '镜头 T 值、减光镜、光照变化、传感器与照片处理都会影响真实图像。因此这里展示理论关系，不预测最终照片的像素亮度。',
  },
  {
    title: '数码与胶片',
    tag: '介质差异',
    text: '数码模式可调光圈、快门、ISO。胶片模式把胶卷 ISO 固定，曝光交换主要靠光圈与快门。',
    detail:
      'EI 是测光指数。胶卷 ISO 400 按 EI 800 测光，目标比按 ISO 400 测光少一档曝光，并不改变胶片物理感光度。',
  },
  {
    title: '典型场景',
    tag: '实用例子',
    text: '晴天人像可先按阳光 16 建立基准，再开大光圈并加快快门；运动场景则优先确保快门速度。',
    detail:
      '阴影中的人像与雪地场景均需依据现场亮度和主体反射率调整。雪地 f/22 只是一种经验起点，不能当作通用测光结果。',
  },
]
function Knowledge() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">THE FIELD GUIDE / 03</span>
          <h1>曝光知识库</h1>
          <p>把公式变成拍摄时可以使用的判断。</p>
        </div>
        {chip('完全离线可读')}
      </div>
      <div className="hero-lesson">
        <div>
          <span className="eyebrow">START HERE</span>
          <h2>
            曝光等效，
            <br />
            画面表达不等同。
          </h2>
          <p>光圈开大一档、快门加快一档，亮度可以保持接近；景深变浅，运动却更容易凝固。</p>
        </div>
        <div className="hero-equation">
          <span>EXPOSURE RELATION</span>
          <strong>
            t × ISO
            <br />
            ──────
            <br />
            N²
          </strong>
          <small>相对基准的理论亮度模型</small>
        </div>
      </div>
      <div className="lesson-grid">
        {lessons.map((item, i) => (
          <details className="panel lesson" key={item.title} open={i === 0}>
            <summary>
              <span className="lesson-index">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <small>{item.tag}</small>
                <strong>{item.title}</strong>
              </span>
              <span className="lesson-toggle">＋</span>
            </summary>
            <p>{item.text}</p>
            <div className="lesson-detail">{item.detail}</div>
          </details>
        ))}
      </div>
    </div>
  )
}

function Reference() {
  const [mode, setMode] = useState<Mode>('full')
  const [parameter, setParameter] = useState<Parameter>('aperture')
  const [anchor, setAnchor] = useState(0)
  const items = ladder(parameter, mode)
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">STOP REFERENCE / 04</span>
          <h1>曝光档位速查表</h1>
          <p>显示值用于操作，档位索引用于标准等效交换。</p>
        </div>
        {chip(`${items.length} 个档位`)}
      </div>
      <div className="panel reference-panel">
        <div className="reference-toolbar">
          <div className="segmented">
            <button
              className={mode === 'full' ? 'selected' : ''}
              onClick={() => {
                setMode('full')
                setAnchor(0)
              }}
            >
              完整 1 档
            </button>
            <button
              className={mode === 'third' ? 'selected' : ''}
              onClick={() => {
                setMode('third')
                setAnchor(0)
              }}
            >
              精细 1/3 档
            </button>
          </div>
          <div className="segmented">
            {(['aperture', 'shutter', 'iso'] as Parameter[]).map((p) => (
              <button
                key={p}
                className={parameter === p ? 'selected' : ''}
                onClick={() => {
                  setParameter(p)
                  setAnchor(0)
                }}
              >
                {names[p]}
              </button>
            ))}
          </div>
          <label>
            比较基准
            <select value={anchor} onChange={(e) => setAnchor(Number(e.target.value))}>
              {items.map((item) => (
                <option value={item.index} key={item.index}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>档位</th>
                <th>上一档</th>
                <th>下一档</th>
                <th>相对基准</th>
                <th>模型中的影响</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const delta =
                  (i - anchor) * (mode === 'third' ? 1 / 3 : 1) * (parameter === 'iso' ? 1 : -1)
                return (
                  <tr key={i} className={i === anchor ? 'current-row' : ''}>
                    <td>
                      <strong>{item.label}</strong>
                      {i === anchor && <span className="table-badge">基准</span>}
                    </td>
                    <td>{items[i - 1]?.label ?? '—'}</td>
                    <td>{items[i + 1]?.label ?? '—'}</td>
                    <td>{formatNumber(delta, mode === 'third' ? 2 : 0)} EV</td>
                    <td>
                      {parameter === 'iso'
                        ? `推算亮度 ×${(2 ** delta).toFixed(2)}，进光量不变`
                        : `理论进光量 ×${(2 ** delta).toFixed(2)}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="comp-scale">
          <h3>曝光补偿刻度</h3>
          <div>
            {Array.from(
              { length: mode === 'full' ? 11 : 31 },
              (_, i) => (i - (mode === 'full' ? 5 : 15)) * (mode === 'full' ? 1 : 1 / 3),
            ).map((ev, i) => (
              <span key={i}>{formatNumber(ev, mode === 'full' ? 0 : 2)}</span>
            ))}
          </div>
          <p>这是希望达到的亮度目标；必须通过光圈、快门或数码 ISO 的实际调整来实现。</p>
        </div>
        <p className="micro">
          相邻标准档位的 EV 变化按索引计算。标称快门与 f 值经过取整，实际数值比值可能略有偏差。
        </p>
      </div>
    </div>
  )
}

interface SettingsProps {
  data: AppData
  setData: (fn: (data: AppData) => AppData) => void
  notify: (text: string) => void
}
function Settings({ data, setData, notify }: SettingsProps) {
  const exportJson = async () => {
    const file = new File([JSON.stringify(data, null, 2)], 'exposure-lab-backup.json', {
      type: 'application/json',
    })
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Exposure Lab 备份' })
        return
      }
    } catch {
      /* fall through to download */
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importJson = async (file?: File) => {
    if (!file) return
    try {
      const next = parseBackup(await file.text())
      setData(() => next)
      notify('配置导入成功')
    } catch (e) {
      notify(`导入失败：${e instanceof Error ? e.message : '文件无效'}`)
    }
  }
  const defaults: Record<Parameter, [number, number]> = {
    aperture: [1, 32],
    shutter: [1 / 32000, 30],
    iso: [25, 102400],
  }
  const setRange = (parameter: Parameter, side: 0 | 1, text: string) => {
    const n = text === '' ? defaults[parameter][side] : Number(text)
    if (!Number.isFinite(n) || n <= 0) return
    setData((d) => {
      const next: [number, number] = [...(d.ranges[parameter] ?? defaults[parameter])]
      next[side] = n
      if (next[0] > next[1]) {
        notify('最小值不能大于最大值')
        return d
      }
      const ranges = {
        ...d.ranges,
        [parameter]:
          next[0] === defaults[parameter][0] && next[1] === defaults[parameter][1]
            ? undefined
            : next,
      }
      return { ...d, ranges }
    })
  }
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">PERSONAL WORKSPACE / 05</span>
          <h1>设置与个人预设</h1>
          <p>所有配置只存储在当前设备；可通过 JSON 手动备份。</p>
        </div>
        {chip('本地保存')}
      </div>
      <div className="settings-grid">
        <section className="panel settings-panel">
          <h2>使用偏好</h2>
          <div className="settings-row">
            <div>
              <strong>外观主题</strong>
              <small>适应暗光环境或明亮桌面</small>
            </div>
            <select
              value={data.theme}
              onChange={(e) =>
                setData((d) => ({ ...d, theme: e.target.value as AppData['theme'] }))
              }
            >
              <option value="dark">深色</option>
              <option value="light">浅色</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>默认档位</strong>
              <small>进入应用时打开的计算器</small>
            </div>
            <select
              value={data.defaultMode}
              onChange={(e) => setData((d) => ({ ...d, defaultMode: e.target.value as Mode }))}
            >
              <option value="full">完整 1 档</option>
              <option value="third">精细 1/3 档</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>默认相机类型</strong>
              <small>同时应用到两个计算器</small>
            </div>
            <select
              value={data.defaultCamera}
              onChange={(e) => {
                const camera = e.target.value as AppData['defaultCamera']
                setData((d) => ({
                  ...d,
                  defaultCamera: camera,
                  full: {
                    ...d.full,
                    camera,
                    filmISO: d.full.current.iso.value,
                    ei: d.full.current.iso.value,
                  },
                  third: {
                    ...d.third,
                    camera,
                    filmISO: d.third.current.iso.value,
                    ei: d.third.current.iso.value,
                  },
                }))
              }}
            >
              <option value="digital">数码相机</option>
              <option value="film">胶片相机</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>快门显示</strong>
              <small>分数或十进制秒数</small>
            </div>
            <select
              value={data.shutterFormat}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  shutterFormat: e.target.value as AppData['shutterFormat'],
                }))
              }
            >
              <option value="fraction">分数</option>
              <option value="decimal">秒数</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>显示设备范围外档位</strong>
              <small>仍会按设备限制计算自动补偿</small>
            </div>
            <input
              type="checkbox"
              checked={data.showExtended}
              onChange={(e) => setData((d) => ({ ...d, showExtended: e.target.checked }))}
            />
          </div>
          <h3>设备可用范围</h3>
          <p className="micro">
            留空表示使用完整内置档位。范围只限制自动补偿，不修改已保存的基准。
          </p>
          {(['aperture', 'shutter', 'iso'] as Parameter[]).map((p) => (
            <div className="range-row" key={p}>
              <strong>{names[p]}</strong>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="最小值"
                value={
                  data.ranges[p] && data.ranges[p]![0] !== defaults[p][0] ? data.ranges[p]![0] : ''
                }
                onChange={(e) => setRange(p, 0, e.target.value)}
              />
              <span>至</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="最大值"
                value={
                  data.ranges[p] && data.ranges[p]![1] !== defaults[p][1] ? data.ranges[p]![1] : ''
                }
                onChange={(e) => setRange(p, 1, e.target.value)}
              />
            </div>
          ))}
          <p className="micro">快门范围填写秒数，例如最短 1/8000 秒输入 0.000125。</p>
        </section>
        <div className="settings-side">
          <section className="panel settings-panel">
            <h2>
              我的预设 <span>{data.presets.length}</span>
            </h2>
            {data.presets.length ? (
              data.presets.map((p) => (
                <div className="saved-row" key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.mode === 'full' ? '完整档' : '1/3 档'} · {combo(p.setting)}
                    </small>
                  </div>
                  <button
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        [p.mode]: {
                          ...d[p.mode],
                          base: remap(p.setting, p.mode),
                          current: remap(p.setting, p.mode),
                        },
                      }))
                    }
                  >
                    应用
                  </button>
                  <button
                    className="subtle"
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        presets: d.presets.filter((item) => item.id !== p.id),
                      }))
                    }
                  >
                    删除
                  </button>
                </div>
              ))
            ) : (
              <p className="empty">在计算器中点击“保存预设”，这里就会出现你的常用组合。</p>
            )}
          </section>
          <section className="panel settings-panel">
            <h2>
              计算历史 <span>{data.history.length}</span>
            </h2>
            {data.history.slice(0, 8).map((h) => (
              <div className="saved-row" key={h.id}>
                <div>
                  <strong>{combo(h.setting)}</strong>
                  <small>
                    {h.at} · {h.mode === 'full' ? '完整档' : '1/3 档'}
                  </small>
                </div>
                <button
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      [h.mode]: { ...d[h.mode], current: remap(h.setting, h.mode) },
                    }))
                  }
                >
                  载入
                </button>
              </div>
            ))}
            {!data.history.length && (
              <p className="empty">在计算器中点击“记入历史”保存一次计算。</p>
            )}
            {data.history.length > 0 && (
              <button className="subtle" onClick={() => setData((d) => ({ ...d, history: [] }))}>
                清空历史
              </button>
            )}
          </section>
          <section className="panel settings-panel">
            <h2>备份与恢复</h2>
            <p className="micro">JSON 包含设置、预设与历史；导入会替换当前本地数据。</p>
            <div className="action-row">
              <button className="primary" onClick={exportJson}>
                导出 JSON
              </button>
              <label className="file-label">
                导入 JSON
                <input
                  hidden
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    void importJson(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>
              <button
                className="subtle"
                onClick={() => {
                  if (confirm('恢复所有默认设置并删除本地预设和历史？'))
                    setData(() => defaultData())
                }}
              >
                恢复默认
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [data, setDataState] = useState<AppData>(loadData)
  const [page, setPage] = useState<Page>(() => loadData().defaultMode)
  const [toast, setToast] = useState('')
  const setData = (fn: (data: AppData) => AppData) => setDataState((previous) => fn(previous))
  useEffect(() => {
    try {
      saveData(data)
    } catch {
      setToast('本地存储失败，请导出 JSON 备份')
    }
  }, [data])
  useEffect(() => {
    document.documentElement.dataset.theme = data.theme
  }, [data.theme])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(timer)
  }, [toast])
  const updateCalc = (mode: Mode, fn: (calc: CalculatorData) => CalculatorData) => {
    const id = crypto.randomUUID()
    const at = new Date().toLocaleString('zh-CN')
    setData((d) => {
      const next = fn(d[mode])
      const changed = (['aperture', 'shutter', 'iso'] as Parameter[]).some(
        (parameter) => next.current[parameter].value !== d[mode].current[parameter].value,
      )
      return {
        ...d,
        [mode]: next,
        history: changed
          ? [{ id, at, mode, setting: next.current, note: '参数调整' }, ...d.history].slice(0, 100)
          : d.history,
      }
    })
  }
  const savePreset = (setting: ExposureSetting, mode: Mode) => {
    const name = prompt('给这组曝光起一个名字：')
    if (!name?.trim()) return
    setData((d) => ({
      ...d,
      presets: [...d.presets, { id: crypto.randomUUID(), name: name.trim(), mode, setting }],
    }))
    setToast('预设已保存到本机')
  }
  const addHistory = (setting: ExposureSetting, mode: Mode, note: string) => {
    setData((d) => ({
      ...d,
      history: [
        { id: crypto.randomUUID(), at: new Date().toLocaleString('zh-CN'), mode, setting, note },
        ...d.history,
      ].slice(0, 100),
    }))
    setToast('已记入本地历史')
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">◉</div>
          <div>
            <strong>Exposure Lab</strong>
            <span>摄影曝光实验室</span>
          </div>
        </div>
        <div className="nav-heading">
          WORKSPACE <span>工作区</span>
        </div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.sub}</small>
              </span>
              {page === item.id && <i>↗</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="offline-indicator">● 完全离线计算</span>
          <p>
            理解每一次参数变化，
            <br />
            做出有意识的拍摄选择。
          </p>
          <small>EXPOSURE LAB · V0.1</small>
        </div>
      </aside>
      <main className="content">
        {page === 'full' || page === 'third' ? (
          <Calculator
            mode={page}
            calc={data[page]}
            data={data}
            update={(fn) => updateCalc(page, fn)}
            savePreset={savePreset}
            addHistory={addHistory}
          />
        ) : page === 'learn' ? (
          <Knowledge />
        ) : page === 'reference' ? (
          <Reference />
        ) : (
          <Settings data={data} setData={setData} notify={setToast} />
        )}
      </main>
      <nav className="mobile-nav">
        {nav.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? 'active' : ''}
            onClick={() => setPage(item.id)}
          >
            <span>{item.icon}</span>
            <small>
              {item.id === 'full'
                ? '1档'
                : item.id === 'third'
                  ? '1/3档'
                  : item.id === 'learn'
                    ? '知识'
                    : item.id === 'reference'
                      ? '速查'
                      : '设置'}
            </small>
          </button>
        ))}
      </nav>
      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
    </div>
  )
}
