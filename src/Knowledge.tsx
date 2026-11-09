import type { ReactNode } from 'react'

type ChapterProps = {
  id: string
  number: string
  title: string
  summary: string
  children: ReactNode
}

function Chapter({ id, number, title, summary, children }: ChapterProps) {
  return (
    <section id={id} className="panel knowledge-chapter" aria-labelledby={id + '-title'}>
      <div className="knowledge-chapter-head">
        <span className="knowledge-number">{number}</span>
        <div>
          <h2 id={id + '-title'}>{title}</h2>
          <p>{summary}</p>
        </div>
      </div>
      <div className="knowledge-body">{children}</div>
    </section>
  )
}

function Exercise({ children }: { children: ReactNode }) {
  return <p className="knowledge-exercise"><strong>在计算器里试试：</strong>{children}</p>
}

type Scene = {
  title: string
  goal: string
  start: string
  reason: string
  check: string
  fallback: string
}

const scenes: Scene[] = [
  {
    title: '晴天人像：想要浅景深',
    goal: '让人物清楚、背景柔和，同时维持接近原来的亮度。',
    start: '教学假设：晴天 ISO 400，先从 f/16、1/400 秒出发。',
    reason: '改到 f/4 是开大四档光圈；要维持理论亮度，快门需约 1/6400 秒。若只到 1/4000 秒，画面会偏亮约 2/3 档。',
    check: '先确认人物面部亮度与高光，再检查背景虚化是否达到目的。',
    fallback: '快门不够快时，收小光圈、降低 ISO（若可用）或加 ND 减光镜；不要把 1/4000 秒误写成完全等效。',
  },
  {
    title: '运动主体：先保证凝固动作',
    goal: '减少运动模糊，让跑动中的主体更清晰。',
    start: '教学假设：已有 f/4、1/500 秒、ISO 100 的可用基准。',
    reason: '快门加快到 1/2000 秒少两档进光量。数码 ISO 从 100 提到 400，可令模型中的输出亮度趋势回到基准，但传感器收到的光仍少两档。',
    check: '放大查看主体边缘是否拖影，并观察暗部噪声与高光。',
    fallback: '如果 ISO 上限或画质要求不允许，可开大光圈、接受部分运动感，或改变拍摄时机。',
  },
  {
    title: '开放阴影人像：先测主体',
    goal: '在树荫或建筑阴影中把人物面部拍到合适亮度。',
    start: '经验起点：ISO 400、f/4、约 1/400 秒；它不是所有阴影的测光结果。',
    reason: '阴影的亮度可能比被太阳照射的背景低很多；对着亮天空测光容易让面部偏暗。',
    check: '试拍后看面部细节和高光提示，必要时对面部测光或调整目标。',
    fallback: '若 1/400 秒过暗，放慢快门、开大光圈或提高数码 ISO；同时检查手持与主体移动造成的模糊。',
  },
  {
    title: '雪地或沙滩：别把经验值当答案',
    goal: '保留明亮场景的质感，同时不让主体或大面积白色变灰。',
    start: 'f/22、约 1/ISO 秒只是阳光 16 扩展表中的一种明亮场景起点。',
    reason: '反射率、太阳角度、主体颜色和相机测光模式都会改变结果；白雪并不自动意味着要用 f/22。',
    check: '查看白色是否仍有纹理，结合直方图和高光警告检查，而不只看屏幕预览亮度。',
    fallback: '若白雪被拍灰，按测光结果尝试正向补偿并复拍；若高光溢出，则减小曝光。',
  },
  {
    title: '逆光人像：先决定保谁',
    goal: '在人物面部与明亮背景之间确定优先级。',
    start: '教学假设：对面部测得 f/4、1/400 秒、ISO 400，天空明显更亮。',
    reason: '继续按天空测光，面部可能变暗；按面部测光则天空可能溢出。单次曝光无法总是同时保住两端。',
    check: '看面部亮度与天空高光，明确要正常人像还是剪影。',
    fallback: '要保面部可补光或改拍摄角度；要剪影就按背景测光。需要时包围曝光，而不是盲目增加 ISO。',
  },
  {
    title: '室内弱光：平衡噪声与模糊',
    goal: '在较暗环境里得到可用的人像，而不误以为提高 ISO 会增加光子。',
    start: '教学假设：当前 f/2.8、1/125 秒、ISO 1600 画面亮度可用。',
    reason: '若人物移动导致模糊，改 1/250 秒会少一档进光量；数码 ISO 3200 可让模型中的输出亮度趋势接近原值，但噪声和高光余量可能变化。',
    check: '检查眼睛是否清晰、暗部噪声是否可接受，以及灯具高光是否溢出。',
    fallback: '可让主体稍停、寻找更亮位置、加稳定支撑或补光；胶片模式不能把一卷 ISO 1600 胶卷直接改为 ISO 3200。',
  },
]

export default function Knowledge() {
  return (
    <div className="page knowledge-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">THE FIELD GUIDE / 03</span>
          <h1>曝光知识库</h1>
          <p>从光线如何形成照片，到现场如何做取舍。先读核心，再展开进阶说明。</p>
        </div>
        <span className="chip">完全离线可读</span>
      </div>

      <div className="hero-lesson">
        <div>
          <span className="eyebrow">START HERE</span>
          <h2>曝光等效，<br />画面表达不等同。</h2>
          <p>光圈、快门和 ISO 的组合可以给出相近的亮度，但景深、运动感、噪声和实际进光量未必相同。</p>
        </div>
        <div className="hero-equation" aria-label="相对亮度模型：曝光时间乘以 ISO，再除以光圈 f 值的平方">
          <span>RELATIVE BRIGHTNESS</span>
          <strong>t × ISO<br />─────<br />N²</strong>
          <small>固定场景下的理论趋势</small>
        </div>
      </div>

      <nav className="panel knowledge-toc" aria-label="知识库目录">
        <div>
          <span className="eyebrow">READING PATH</span>
          <h2>按顺序读，也可以直接查</h2>
          <p>前 3 章建立概念与档位计算；中间 4 章解释测光和交换；最后用场景练习判断。</p>
        </div>
        <ol>
          <li><a href="#chapter-model">先建立曝光模型</a></li>
          <li><a href="#chapter-triangle">光圈、快门、ISO 分别做什么</a></li>
          <li><a href="#chapter-stops">一档与 1/3 档的数学</a></li>
          <li><a href="#chapter-ev">EV、测光与曝光补偿</a></li>
          <li><a href="#chapter-equivalence">曝光等效与创作取舍</a></li>
          <li><a href="#chapter-sunny-16">阳光 16 与天气扩展</a></li>
          <li><a href="#chapter-film">数码与胶片的决策</a></li>
          <li><a href="#chapter-scenes">场景实战</a></li>
        </ol>
      </nav>

      <div className="knowledge-chapters">
        <Chapter id="chapter-model" number="01" title="先建立曝光模型" summary="先分清现场的光、相机收到的光，以及照片最后显示出来的亮度。">
          <h3>照片亮不亮，先取决于现场</h3>
          <p>场景给出的光线和主体反射率，是参数之外的起点。同样使用 f/4、1/500 秒、ISO 100，晴天白墙与阴影中的深色衣服不可能得到同样的像素亮度。计算器只能比较<strong>同一场景、同一构图和相近处理条件</strong>下的相对变化。</p>
          <div className="knowledge-flow" aria-label="场景光线经过光圈与快门形成曝光，再由 ISO 和处理形成输出亮度">
            <span>现场光线<br /><small>亮度、反射率</small></span><b>→</b><span>镜头与快门<br /><small>t / N²</small></span><b>→</b><span>感光介质<br /><small>收到的光</small></span><b>→</b><span>输出影像<br /><small>ISO 与处理</small></span>
          </div>
          <h3>本软件比较的两个量</h3>
          <p><strong>理论进光量变化</strong>用曝光时间 t 除以光圈 f 值 N 的平方来比较；它不含 ISO。<strong>按 ISO 推算的亮度变化</strong>再把 ISO 比值纳入，只是数码输出的简化趋势。两者都以基准组合为参照，显示为档位或倍数。</p>
          <div className="knowledge-example"><strong>算一算</strong><p>固定 f/4 和 1/500 秒，把数码 ISO 100 改成 200：理论进光量仍是 100%，模型中的输出亮度趋势为 +1 EV。若光线本来不足，调高 ISO 不能补回原本没收到的光子。</p></div>
          <details className="knowledge-advanced"><summary>进阶：这个模型忽略了什么？</summary><p>不同镜头的透光率、ND 滤镜、场景光照变化、传感器响应、胶片显影和相机/软件的色调处理都会影响最终照片。因此这里的“理论”不是测光表，也不预测真实照片的像素值。</p></details>
          <Exercise>保持光圈和快门不动，只改变数码 ISO，观察结果区的进光量与亮度变化是否分开显示。</Exercise>
        </Chapter>

        <Chapter id="chapter-triangle" number="02" title="光圈、快门、ISO 分别做什么" summary="三者都能改变结果，却各自带来不同的画面代价。">
          <h3>光圈：通光面积与景深</h3>
          <p>f 值是焦距与入瞳直径之比。数字越小，开口通常越大；从 f/4 到 f/2.8 约多一档光。在焦距、对焦距离和构图条件相近时，开大光圈通常使景深变浅，但景深不能只凭 f 值单独判断。</p>
          <h3>快门：收光时间与运动</h3>
          <p>1/250 秒的时间是 1/500 秒的两倍，因此在其他条件不变时多一档光。更慢的快门也会记录更多手抖和主体位移。防抖可缓解相机抖动，却不能让移动中的人物停住。</p>
          <h3>ISO：数码亮度设置与胶卷标称值</h3>
          <p>数码 ISO 提高通常让相机给出更亮的影像，或允许在自动曝光中选更快快门；在光圈和快门固定时，它不会让传感器收到更多光。高 ISO 的噪声与高光余量影响因相机和处理而异。胶片 ISO 是胶卷的标称感光度，装入后不能像数码 ISO 那样逐张改变。</p>
          <div className="knowledge-table-wrap"><table><caption>只改一个参数：以 f/4、1/500 秒、ISO 100 为基准</caption><thead><tr><th>改动</th><th>理论进光量</th><th>输出亮度趋势</th><th>常见画面影响</th></tr></thead><tbody>
            <tr><td>f/4 → f/2.8</td><td>约 2 倍</td><td>约 +1 EV</td><td>景深趋浅</td></tr>
            <tr><td>1/500 → 1/250 秒</td><td>2 倍</td><td>+1 EV</td><td>运动模糊风险增加</td></tr>
            <tr><td>ISO 100 → 200</td><td>不变</td><td>+1 EV</td><td>噪声或高光余量可能改变</td></tr>
          </tbody></table></div>
          <details className="knowledge-advanced"><summary>进阶：为什么不说“提高 ISO 让传感器更敏感”？</summary><p>日常教学常用“感光度”简写，但数码相机固定光圈和快门时，入射光子数不因 ISO 设定而增加。不同机型可在模拟增益、数字增益及输出映射上实现 ISO，故具体噪声表现不能仅用一个通式预测。</p></details>
          <Exercise>分别只改光圈、快门和 ISO 一档，比较“进光量”“亮度”与画面提示。</Exercise>
        </Chapter>

        <Chapter id="chapter-stops" number="03" title="一档与 1/3 档的数学" summary="一档是倍数关系；1/3 档是把一次倍增分成三步。">
          <p>曝光多一档意味着理论光量变成 2 倍，少一档就是 1/2。1/3 档的倍率是 2 的三次方根，约 1.26；连续三次 1/3 档才约等于一整档。</p>
          <div className="knowledge-table-wrap"><table><caption>同一场景、其他参数固定时</caption><thead><tr><th>参数</th><th>多一档光或亮度</th><th>少一档光或亮度</th></tr></thead><tbody>
            <tr><td>光圈</td><td>f 值除以 √2，例如 f/4 → f/2.8</td><td>f 值乘以 √2，例如 f/4 → f/5.6</td></tr>
            <tr><td>快门</td><td>时间乘 2，例如 1/500 → 1/250 秒</td><td>时间除以 2，例如 1/500 → 1/1000 秒</td></tr>
            <tr><td>数码 ISO</td><td>数值乘 2，例如 100 → 200；仅亮度趋势</td><td>数值除以 2，例如 200 → 100；仅亮度趋势</td></tr>
          </tbody></table></div>
          <div className="knowledge-example"><strong>完整交换：一步一步看</strong><ol><li>基准 f/4、1/500 秒、ISO 100。</li><li>开到 f/2.8：标准档位上多一档光。</li><li>快到 1/1000 秒：少一档光。</li><li>合计 0 档，属于<strong>档位等效</strong>；按标称数值 t/N² 计算，仍约有 <strong>+0.029 EV</strong> 的微小差异。</li></ol></div>
          <p>相机显示的 f/2.8、f/5.6、1/125 秒等是方便使用的标称值，不总是数学上的精确值。本软件用规范化档位索引判断标准交换，同时另外显示按输入数值计算的偏差；手动填入非标准正数时按真实输入值计算。</p>
          <details className="knowledge-advanced"><summary>进阶：为什么 f 值每档乘 √2？</summary><p>在简化模型中，通光面积与开口直径平方成正比，而 f 值与开口直径成反比。要让面积减半，f 值就乘 √2。1/3 档的 f 值相邻倍率则约为 2 的六次方根。</p></details>
          <Exercise>在两个计算器中各做一次 f/4 到 f/2.8 的交换，留意“档位等效”和数值偏差。</Exercise>
        </Chapter>

        <Chapter id="chapter-ev" number="04" title="EV、测光与曝光补偿" summary="同样叫 EV，传统曝光值与本软件的相对亮度差有不同的方向。">
          <h3>先认清两个 EV 用法</h3>
          <p>摄影中的传统曝光值常写作 EV = log₂(N²/t)，描述某组光圈与快门；在同一 ISO 的约定下，EV 数值越高，该组合给出的曝光越少。本软件结果区的相对 ΔEV 则以基准为 0，正数表示模型中的输出更亮、负数表示更暗。它还把 ISO 比值纳入，不能把两个数字不加说明地互换。</p>
          <div className="knowledge-example"><strong>目标不是一次真实曝光</strong><p>以 f/4、1/500 秒、ISO 100 为基准，希望 +1 EV 且 ISO 固定，可以保持 f/4、把快门改成 1/250 秒。若光圈、快门和 ISO 都没变，只在软件里设了 +1 EV 目标，实际仍是基准曝光，结果应显示还差 +1 EV。</p></div>
          <h3>测光为什么需要人的判断</h3>
          <p>反射式测光读到的是主体反射回来的光。大面积雪景、深色背景、逆光人物会改变相机读数；现代相机的测光算法能处理不少场景，但并非每次都符合你想保留的主体。先决定要让脸、天空还是白雪呈现什么样，再按现场试拍和高光警告调整。</p>
          <p>相机自动曝光模式中的“曝光补偿”通常通过改变其自动选择的快门、光圈或自动 ISO 来实现；在全手动且 ISO 固定时，目标刻度本身不能改变光量。本软件把补偿当成目标，并展示自动交换的剩余 EV；锁定或设备范围阻止调整时，就不能宣称已经等效。</p>
          <details className="knowledge-advanced"><summary>进阶：雪景究竟要加多少补偿？</summary><p>没有通用的固定数字。若相机把大面积白色拍灰，可从小幅正向补偿试拍并检查直方图；若已有高光溢出，反而要减少曝光。测光模式、主体、光线与相机处理都会改变所需调整。</p></details>
          <Exercise>锁定快门和 ISO，再设 +1 EV 目标；查看未达成的残差与受限提示。</Exercise>
        </Chapter>

        <Chapter id="chapter-equivalence" number="05" title="曝光等效与创作取舍" summary="等效是亮度关系，不是画面表达或画质完全相同。">
          <p>固定场景下，光圈多一档而快门少一档，理论进光量可互相抵消。把 ISO 纳入后，两组参数也可能在输出亮度模型中等效，却收到不同数量的光。先决定景深和运动，再选择能达到目标的其余参数。</p>
          <div className="knowledge-table-wrap"><table><caption>以 f/4、1/500 秒、ISO 100 为教学基准</caption><thead><tr><th>组合</th><th>亮度关系</th><th>取舍</th></tr></thead><tbody>
            <tr><td>f/4 · 1/500 · ISO 100</td><td>基准</td><td>参照点</td></tr>
            <tr><td>f/2.8 · 1/1000 · ISO 100</td><td>标准档位等效</td><td>景深趋浅，动作更易凝固</td></tr>
            <tr><td>f/5.6 · 1/250 · ISO 100</td><td>标准档位等效</td><td>景深趋深，运动模糊风险上升</td></tr>
            <tr><td>f/4 · 1/1000 · ISO 200</td><td>输出亮度趋势等效</td><td>实际进光量只有基准一半</td></tr>
          </tbody></table></div>
          <p>“等效”也有边界：不同镜头的透光率、胶片倒易律失效、极短快门与闪光同步限制、机身档位范围、主体移动和画面后期都可能让实拍结果偏离这个简化模型。</p>
          <div className="knowledge-example"><strong>怎么做决定？</strong><p>如果你拍跑步者，先选能凝固动作的快门，再看能否开大光圈或提高数码 ISO；如果你拍静物并想留更多景深，可以收小光圈，再用三脚架放慢快门。两种做法的目标不同。</p></div>
          <details className="knowledge-advanced"><summary>进阶：同样亮为什么噪声可能不同？</summary><p>例如最后一行让快门少收一档光，再用 ISO 提高一档来补偿输出趋势。相机收到的光子更少，暗部质量可能不同。具体结果仍取决于机身、场景和处理。</p></details>
          <Exercise>比较表中四组组合的“进光量”和“按 ISO 推算的亮度”两行。</Exercise>
        </Chapter>

        <Chapter id="chapter-sunny-16" number="06" title="阳光 16 与天气扩展" summary="没有测光表时，用它建立可试拍的起点，而不是宣称已经得到准确曝光。">
          <p>直射晴天下，经验规则是光圈 f/16、快门时间约 1/ISO 秒。ISO 400 的理论组合为 f/16、1/400 秒；1/3 档列表可以直接选 1/400 秒，完整 1 档列表常取 1/500 秒，按时间比计算约 <strong>−0.32 EV</strong>。这种取整差异应在结果里说明。</p>
          <div className="knowledge-table-wrap"><table><caption>天气扩展：快门仍先取约 1/ISO 秒，以下光圈只作经验起点</caption><thead><tr><th>环境</th><th>起点光圈</th><th>现场提醒</th></tr></thead><tbody>
            <tr><td>直射晴天</td><td>f/16</td><td>检查主体是否真在直射光中</td></tr>
            <tr><td>薄云或轻度阴天</td><td>f/11</td><td>薄云厚度变化很快</td></tr>
            <tr><td>明亮阴天</td><td>f/8</td><td>天空亮不代表主体一样亮</td></tr>
            <tr><td>厚云阴天</td><td>f/5.6</td><td>需要留意快门是否足够快</td></tr>
            <tr><td>开放阴影</td><td>f/4</td><td>阴影深浅受周围反射影响</td></tr>
            <tr><td>特别明亮的雪地或沙滩</td><td>f/22</td><td>只是一种经验起点，须现场检查</td></tr>
          </tbody></table></div>
          <div className="knowledge-flow knowledge-steps" aria-label="阳光 16 使用流程"><span>判断主体所处光线</span><b>→</b><span>选 ISO 与起点光圈</span><b>→</b><span>取 1/ISO 附近快门</span><b>→</b><span>试拍并检查主体和高光</span></div>
          <p>想要浅景深或更快快门时，再做等效交换。晴天人像从 f/16 改到 f/4 是开大四档；若 ISO 不变，理论快门也需快四档。超过机身快门上限时可考虑 ND、收回一部分光圈或降低 ISO。</p>
          <details className="knowledge-advanced"><summary>进阶：为什么雪地 f/22 不是铁律？</summary><p>阳光 16 的扩展表依据环境经验分组，不是对主体亮度的实时测量。雪地反射方向、主体是否背光、天空与地面的比例都会改变合适曝光；相机的反射测光也可能把白雪拍灰。以主体和高光检查结果为准。</p></details>
          <Exercise>在阳光 16 面板里选晴天、ISO 400，切换“理论精确”和“最接近档位”，比较快门和误差。</Exercise>
        </Chapter>

        <Chapter id="chapter-film" number="07" title="数码与胶片的决策" summary="数码可以逐张设置 ISO；胶片的标称 ISO 固定，EI 只是测光选择。">
          <h3>数码：ISO 的作用与代价</h3>
          <p>在 f/4、1/500 秒固定时，ISO 100 → 200 使本软件亮度模型增加一档，理论进光量仍不变。若相机处于自动曝光，ISO 变化还可能让相机改选其他参数；因此要区分“固定参数的模型比较”和“真实相机自动工作”。</p>
          <h3>胶片：ISO 与 EI 不同</h3>
          <p>胶卷 ISO 400 是胶卷的标称感光度。把测光 EI 设为 800，测光目标会比按 ISO 400 少一档曝光：例如在相同光线下从 1/400 秒改为约 1/800 秒，或从 f/16 收至约 f/22。<strong>EI 800 不会把胶卷变成 ISO 800</strong>，也不会让进光量自动改变；你仍须实际调整光圈或快门。</p>
          <div className="knowledge-example"><strong>胶片操作案例</strong><p>胶卷 ISO 400、按 EI 800 测光，若按原建议是 f/8、1/250 秒，新的目标约少一档，可用 f/8、1/500 秒。负片可能需要相应的显影安排，但是否推片、推多少，应由胶卷、实验室和你的画面目标决定；软件不会替你假定显影结果。</p></div>
          <p>胶片换卷前，优先检查胶卷盒上的 ISO、相机测光 EI、所选快门和镜头实际可用光圈。设 EI 是主动选择不同曝光目标，拍摄记录和冲洗说明也要一致。</p>
          <details className="knowledge-advanced"><summary>进阶：数码 ISO 和胶片 EI 能直接比较吗？</summary><p>它们都用数字帮助决定曝光，但物理意义和后续处理不同。数码输出受增益与映射影响；胶片的曝光量取决于照射到乳剂上的光，显影方式再影响密度、反差和颗粒。不要用一个等效公式推断最终画质。</p></details>
          <Exercise>切到胶片模式，设胶卷 ISO 400、测光 EI 800，观察目标变化后光圈/快门如何补偿。</Exercise>
        </Chapter>

        <Chapter id="chapter-scenes" number="08" title="场景实战" summary="先定主体和画面意图，再选参数；以下数字均为教学假设或经验起点。">
          <p>每个场景先说清楚要保留什么，再从可试拍的组合出发。现场光线、镜头、测光方式和被摄体都可能让最终数值不同；试拍与检查永远是最后一步。</p>
          <div className="scene-grid">
            {scenes.map((scene, index) => (
              <article className="scene-case" key={scene.title}>
                <span className="knowledge-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{scene.title}</h3>
                <dl>
                  <dt>目标</dt><dd>{scene.goal}</dd>
                  <dt>起始组合</dt><dd>{scene.start}</dd>
                  <dt>为什么这样改</dt><dd>{scene.reason}</dd>
                  <dt>检查什么</dt><dd>{scene.check}</dd>
                  <dt>不够用时</dt><dd>{scene.fallback}</dd>
                </dl>
              </article>
            ))}
          </div>
          <details className="knowledge-advanced"><summary>进阶：如何建立自己的案例库？</summary><p>记下现场光线、主体位置、基准组合、你最想保留的画面效果，以及最终为何改动某个参数。对照照片查看高光、暗部、锐度和运动感，比死记某个“万能参数”更可靠。</p></details>
          <Exercise>选一个与你拍摄最接近的案例，把起始组合设为基准，再改一个参数并观察结果解释。</Exercise>
        </Chapter>
      </div>
    </div>
  )
}
