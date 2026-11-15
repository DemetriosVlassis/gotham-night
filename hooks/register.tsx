import { atom, read, update } from 'claude-code'
import type { Register, ThemeResult, ThemeSetArgs } from 'claude-code'

import type { Watch } from '../types'
import { makeColors } from './make-colors.js'

// A city at night: blue-black surfaces, cold grey text, one signal-yellow accent.
const { theme, problems } = makeColors({
  label: 'Gotham night',
  only: 'dark',
  roles: { accent: '#f5c518', danger: '#d1423a', success: '#4f9d69', warning: '#e08a1e', pro: '#7f8fd6' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a0c11',
        'surface-1': '#10131a',
        'surface-2': '#161a23',
        'surface-3': '#1b202b',
        'text-primary': '#e8eaf0',
        'text-secondary': '#b9bfcc',
        'text-muted': '#9199a8',
      },
    },
  },
})

const SCENE_NAME = 'gotham-skyline'

const isOn = atom({ plugin: 'gotham-night', key: 'isOn' } as const, true)
const isStorm = atom({ plugin: 'gotham-night', key: 'isStorm' } as const, true)
const isBandHidden = atom({ plugin: 'gotham-night', key: 'isBandHidden' } as const, false)
const watch = atom({ plugin: 'gotham-night', key: 'watch' } as const, { tools: 0, turns: 0, lastSeconds: null })

const SPINNER_WORDS = [
  'Patrolling the rooftops',
  'Following the trail',
  'Analysing the evidence',
  'Watching from the shadows',
  'Scanning the city',
  'Working the case',
  'Running the forensics',
  'Gliding across town',
]

const BAT = 'M0,0 q7,-9 14,-2 q2,-5 4,-1 q2,-4 4,1 q7,-7 14,2 q-9,-2 -13,5 q-3,-4 -5,0 q-2,-4 -5,0 q-4,-7 -13,-5z'

const STORM = `
<g class="rain" stroke="#8ea0c4" stroke-width="1.4" opacity=".28">
<g class="fall"><path d="M100,-900 l-40,160 M300,-820 l-40,160 M520,-880 l-40,160 M760,-780 l-40,160 M980,-860 l-40,160 M1200,-800 l-40,160 M1420,-890 l-40,160 M1580,-760 l-40,160 M200,-560 l-40,160 M430,-480 l-40,160 M650,-540 l-40,160 M880,-460 l-40,160 M1090,-520 l-40,160 M1320,-440 l-40,160 M1500,-560 l-40,160 M60,-260 l-40,160 M360,-200 l-40,160 M590,-280 l-40,160 M820,-180 l-40,160 M1040,-240 l-40,160 M1260,-160 l-40,160 M1470,-250 l-40,160 M150,40 l-40,160 M400,120 l-40,160 M700,60 l-40,160 M930,140 l-40,160 M1150,80 l-40,160 M1380,160 l-40,160 M1560,60 l-40,160 M250,360 l-40,160 M500,420 l-40,160 M780,380 l-40,160 M1010,440 l-40,160 M1230,400 l-40,160 M1450,460 l-40,160 M90,640 l-40,160 M340,700 l-40,160 M610,660 l-40,160 M860,720 l-40,160 M1100,680 l-40,160 M1340,740 l-40,160 M1540,680 l-40,160"/></g>
</g>
<rect class="flash" width="1600" height="900" fill="#cfd8ff" opacity="0"/>
<polyline class="bolt" points="1010,0 985,120 1030,130 990,260 1040,270 1005,400" fill="none" stroke="#e8ecff" stroke-width="3" opacity="0"/>`

// Original art: moon, clouds, a searchlight throwing a bat-shaped signal on the clouds, two skyline layers with spires, bats, fog and a storm.
function buildScene(hasStorm: boolean): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
<style>
.cloud{animation:drift 90s linear infinite alternate}
.cloud.b{animation-duration:140s;animation-direction:alternate-reverse}
.cloud.c{animation-duration:200s}
.beam{transform-origin:260px 900px;animation:sweep 24s ease-in-out infinite alternate}
.w{animation:blink 7s ease-in-out infinite}
.w.d2{animation-delay:2.5s}.w.d3{animation-delay:4.5s}
.star{animation:blink 5s ease-in-out infinite}
.bats{animation:fly 46s linear infinite}
.bats.b{animation-duration:70s;animation-delay:-30s}
.flap{animation:flap .5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
.fog{animation:drift 60s ease-in-out infinite alternate}
.fall{animation:fall 1.1s linear infinite}
.flash{animation:flash 17s linear infinite}
.bolt{animation:bolt 17s linear infinite}
.beacon{animation:blink 2.2s ease-in-out infinite}
@keyframes drift{from{transform:translateX(-160px)}to{transform:translateX(160px)}}
@keyframes sweep{from{transform:rotate(-7deg)}to{transform:rotate(9deg)}}
@keyframes blink{0%,100%{opacity:.8}50%{opacity:.25}}
@keyframes fly{from{transform:translate(-200px,60px)}to{transform:translate(1800px,-90px)}}
@keyframes flap{from{transform:scaleY(1)}to{transform:scaleY(.45)}}
@keyframes fall{from{transform:translate(0,0)}to{transform:translate(-75px,300px)}}
@keyframes flash{0%,91%,93.5%,96%,100%{opacity:0}92%{opacity:.22}94.5%{opacity:.12}}
@keyframes bolt{0%,91%,93.5%,100%{opacity:0}92%{opacity:.9}93%{opacity:.4}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070c"/><stop offset=".65" stop-color="#0b111e"/><stop offset="1" stop-color="#18213a"/></linearGradient>
<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f5e9b0" stop-opacity=".38"/><stop offset="1" stop-color="#f5e9b0" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f5c518" stop-opacity=".26"/><stop offset="1" stop-color="#f5c518" stop-opacity="0"/></linearGradient>
<filter id="soft" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
<g id="clb"><ellipse cx="0" cy="0" rx="120" ry="20"/><ellipse cx="-72" cy="7" rx="80" ry="14"/><ellipse cx="82" cy="8" rx="92" ry="14"/><ellipse cx="-22" cy="-14" rx="58" ry="17"/><ellipse cx="42" cy="-11" rx="50" ry="14"/><ellipse cx="-110" cy="12" rx="60" ry="9"/><ellipse cx="130" cy="13" rx="70" ry="8"/></g>
<g id="cl"><use href="#clb" y="-6" fill="#33426a"/><use href="#clb" fill="#151d2f"/></g>
<pattern id="win" width="22" height="28" patternUnits="userSpaceOnUse"><rect x="7" y="9" width="7" height="11" fill="#121a2c"/></pattern>
<pattern id="winfar" width="18" height="24" patternUnits="userSpaceOnUse"><rect x="6" y="8" width="5" height="9" fill="#18223a"/></pattern>
<radialGradient id="disc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f7d95a" stop-opacity=".5"/><stop offset=".8" stop-color="#f5c518" stop-opacity=".3"/><stop offset="1" stop-color="#f5c518" stop-opacity=".1"/></radialGradient>
<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27324d" stop-opacity="0"/><stop offset="1" stop-color="#27324d" stop-opacity=".55"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#sky)"/>
<g fill="#cdd6f0">
<circle class="star" cx="140" cy="90" r="1.4"/><circle class="star" cx="380" cy="50" r="1.1" style="animation-delay:1s"/><circle class="star" cx="610" cy="120" r="1.5" style="animation-delay:2s"/>
<circle class="star" cx="820" cy="60" r="1.2" style="animation-delay:3s"/><circle class="star" cx="1040" cy="100" r="1.3"/><circle class="star" cx="1520" cy="70" r="1.4" style="animation-delay:1.5s"/>
<circle class="star" cx="260" cy="210" r="1.1" style="animation-delay:2.5s"/><circle class="star" cx="1120" cy="260" r="1.2" style="animation-delay:3.5s"/>
</g>
<circle cx="1320" cy="170" r="220" fill="url(#halo)"/>
<circle cx="1320" cy="170" r="64" fill="#efe6bd" opacity=".88"/>
<circle cx="1300" cy="155" r="10" fill="#d9cf9f" opacity=".5"/><circle cx="1342" cy="190" r="14" fill="#d9cf9f" opacity=".4"/>
<g filter="url(#soft)" opacity=".92">
<g class="cloud"><use href="#cl" transform="translate(1240,222) scale(1.7)"/><use href="#cl" transform="translate(430,300) scale(1.9)"/><use href="#cl" transform="translate(700,255) scale(.9)"/></g>
<g class="cloud b"><use href="#cl" transform="translate(880,130) scale(2)"/><use href="#cl" transform="translate(1490,120) scale(1.1)"/></g>
<g class="cloud c"><use href="#cl" transform="translate(1040,340) scale(1.2)"/><use href="#cl" transform="translate(130,120)"/><use href="#cl" transform="translate(1500,330) scale(1.4)"/></g>
</g>
<g class="beam"><polygon points="250,900 270,900 400,230 140,230" fill="url(#beam)"/>
<ellipse cx="270" cy="210" rx="135" ry="92" fill="url(#disc)"/><ellipse cx="270" cy="210" rx="135" ry="92" fill="none" stroke="#f5c518" stroke-opacity=".28" stroke-width="2"/>
<g transform="translate(180,218) scale(5)" fill="#05070c" opacity=".92"><path d="${BAT}"/></g></g>
<g class="bats" fill="#04060a"><g transform="translate(0,300)"><path class="flap" d="${BAT}"/></g><g transform="translate(60,340) scale(.7)"><path class="flap" d="${BAT}"/></g><g transform="translate(-50,360) scale(.8)"><path class="flap" d="${BAT}"/></g></g>
<g class="bats b" fill="#04060a"><g transform="translate(0,200) scale(.6)"><path class="flap" d="${BAT}"/></g><g transform="translate(70,230) scale(.5)"><path class="flap" d="${BAT}"/></g></g>
<path d="M1150,640 Q1195,560 1236,474 Q1396,700 1556,474 Q1585,540 1600,570 M1316,559 V640 M1356,576 V640 M1396,587 V640 M1436,576 V640 M1476,559 V640 M1276,524 V640 M1516,524 V640" fill="none" stroke="#141c2f" stroke-width="2.5"/>
<defs><g id="farb">
<rect x="40" y="560" width="70" height="340"/><rect x="210" y="520" width="50" height="380"/><rect x="390" y="580" width="90" height="320"/>
<rect x="600" y="500" width="60" height="400"/><rect x="880" y="540" width="80" height="360"/><rect x="1080" y="490" width="55" height="410"/>
</g></defs>
<use href="#farb" fill="#111828"/><use href="#farb" fill="url(#winfar)"/>
<g fill="#111828">
<polygon points="40,560 75,480 110,560"/><polygon points="210,520 235,470 260,520"/><polygon points="390,580 435,520 480,580"/><rect x="627" y="430" width="6" height="70"/>
<polygon points="600,500 630,470 660,500"/><rect x="880" y="530" width="80" height="10"/><rect x="905" y="505" width="30" height="25"/><polygon points="1080,490 1107,410 1135,490"/>
<rect x="1225" y="470" width="22" height="430"/><rect x="1545" y="470" width="22" height="430"/><rect x="1150" y="640" width="450" height="9"/>
<rect x="1221" y="462" width="30" height="8"/><rect x="1541" y="462" width="30" height="8"/>
</g>
<defs><g id="frontb">
<rect x="0" y="700" width="90" height="200"/><rect x="80" y="640" width="70" height="260"/><rect x="150" y="720" width="110" height="180"/>
<rect x="260" y="590" width="60" height="310"/><rect x="320" y="680" width="120" height="220"/><rect x="440" y="620" width="80" height="280"/>
<rect x="520" y="730" width="140" height="170"/><rect x="660" y="650" width="70" height="250"/><rect x="730" y="520" width="90" height="380"/>
<rect x="820" y="700" width="130" height="200"/><rect x="950" y="610" width="75" height="290"/><rect x="1025" y="740" width="120" height="160"/>
<rect x="1145" y="580" width="85" height="320"/><rect x="1230" y="690" width="120" height="210"/><rect x="1350" y="560" width="44" height="340"/>
<rect x="1486" y="560" width="44" height="340"/><rect x="1394" y="650" width="92" height="250"/><rect x="1530" y="690" width="70" height="210"/>
</g></defs>
<use href="#frontb" fill="#070a10"/><use href="#frontb" fill="url(#win)"/>
<g fill="#070a10">
<rect x="30" y="650" width="3" height="50"/><rect x="22" y="662" width="19" height="2"/><rect x="0" y="694" width="94" height="6"/>
<polygon points="80,640 115,590 150,640"/><rect x="188" y="682" width="36" height="24" rx="3"/><polygon points="186,682 206,668 226,682"/>
<rect x="191" y="706" width="3" height="14"/><rect x="218" y="706" width="3" height="14"/><rect x="146" y="714" width="118" height="6"/>
<polygon points="260,590 290,500 320,590"/><rect x="288" y="450" width="4" height="60"/><polygon points="256,590 262,572 268,590"/><polygon points="312,590 318,572 324,590"/>
<rect x="316" y="674" width="128" height="6"/><rect x="350" y="656" width="26" height="18"/><rect x="400" y="662" width="4" height="12"/>
<polygon points="440,620 450,600 460,620 470,600 480,620 490,600 500,620 510,600 520,620"/><rect x="516" y="724" width="148" height="6"/>
<rect x="560" y="708" width="30" height="16" rx="2"/><rect x="620" y="700" width="3" height="24"/><polygon points="660,650 695,625 730,650"/>
<polygon points="730,520 775,420 820,520"/><rect x="773" y="370" width="4" height="60"/><polygon points="726,520 733,496 740,520"/><polygon points="810,520 817,496 824,520"/>
<rect x="726" y="630" width="98" height="5"/><rect x="816" y="694" width="138" height="6"/><rect x="850" y="676" width="34" height="18" rx="2"/><rect x="915" y="668" width="3" height="26"/>
<polygon points="950,610 987,560 1025,610"/><rect x="985" y="536" width="3" height="28"/><rect x="1021" y="734" width="128" height="6"/><rect x="1060" y="716" width="28" height="18"/>
<polygon points="1145,580 1155,560 1165,580 1177,560 1188,580 1199,560 1210,580 1220,560 1230,580"/><rect x="1186" y="520" width="3" height="42"/>
<rect x="1226" y="684" width="128" height="6"/><rect x="1262" y="664" width="34" height="20" rx="3"/><polygon points="1260,664 1279,652 1298,664"/>
<polygon points="1350,560 1372,450 1394,560"/><polygon points="1486,560 1508,450 1530,560"/><polygon points="1394,650 1440,590 1486,650"/>
<rect x="1371" y="428" width="3" height="26"/><rect x="1507" y="428" width="3" height="26"/><rect x="1438" y="566" width="4" height="30"/>
<polygon points="1346,560 1351,540 1356,560"/><polygon points="1388,560 1393,540 1398,560"/><polygon points="1482,560 1487,540 1492,560"/><polygon points="1524,560 1529,540 1534,560"/>
<rect x="1548" y="655" width="34" height="24" rx="3"/><polygon points="1546,655 1565,642 1584,655"/><rect x="1551" y="679" width="3" height="11"/><rect x="1576" y="679" width="3" height="11"/>
</g>
<circle cx="1440" cy="705" r="21" fill="#f1e3a0" opacity=".6"/><path d="M1419,705 h42 M1440,684 v42 M1425,690 l30,30 M1455,690 l-30,30" stroke="#070a10" stroke-width="2.5" fill="none"/><circle cx="1440" cy="705" r="6" fill="#070a10"/>
<path d="M1424,900 v-52 a16,16 0 0 1 32,0 v52z" fill="#111a2c"/>
<g fill="#f5c518" opacity=".55"><rect x="1368" y="600" width="8" height="28" rx="4"/><rect x="1504" y="600" width="8" height="28" rx="4"/><rect x="286" y="560" width="8" height="24" rx="4"/></g>
<g stroke="#1b2740" stroke-width="2" opacity=".8"><path d="M820,520 V900 M1230,580 V900 M1530,560 V900 M150,640 V900 M320,590 V900 M520,620 V900 M1025,610 V900 M1394,560 V650" fill="none"/></g>
<circle cx="775" cy="580" r="26" fill="#f1e3a0" opacity=".85"/><path d="M775,580 v-17 M775,580 h12" stroke="#070a10" stroke-width="3" fill="none"/>
<circle class="beacon" cx="775" cy="370" r="4" fill="#d1423a"/><circle class="beacon" cx="290" cy="450" r="3.5" fill="#d1423a" style="animation-delay:1.1s"/>
<g fill="#f5c518">
<rect class="w" x="98" y="668" width="8" height="10"/><rect class="w d2" x="278" y="630" width="8" height="10"/><rect class="w d3" x="296" y="700" width="8" height="10"/>
<rect class="w d2" x="462" y="660" width="8" height="10"/><rect class="w" x="490" y="720" width="8" height="10"/><rect class="w d3" x="682" y="690" width="8" height="10"/>
<rect class="w" x="752" y="660" width="8" height="10"/><rect class="w d2" x="790" y="720" width="8" height="10"/><rect class="w d3" x="972" y="650" width="8" height="10"/>
<rect class="w" x="1166" y="620" width="8" height="10"/><rect class="w d2" x="1204" y="700" width="8" height="10"/><rect class="w d3" x="1372" y="670" width="8" height="10"/>
<rect class="w" x="1552" y="700" width="8" height="10"/><rect class="w d2" x="180" y="760" width="8" height="10"/><rect class="w d3" x="560" y="770" width="8" height="10"/>
<rect class="w" x="870" y="740" width="8" height="10"/><rect class="w d2" x="1060" y="780" width="8" height="10"/><rect class="w d3" x="1270" y="730" width="8" height="10"/><rect class="w" x="1460" y="760" width="8" height="10"/>
</g>
<rect class="fog" x="-200" y="640" width="2000" height="260" fill="url(#fog)"/>${hasStorm ? STORM : ''}
</svg>`
}


// Builds of the app differ on the backdrop's key: this one names it `scene`, another `id`.
// Send the one this build's types name first, and the other where that is refused.
const GLASS = { blur: 8, tint: '#0a0c11', opacity: 0.74 }
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: GLASS },
}
const LOOK_BY_ID = { colors: theme, backdrop: { id: SCENE_NAME, glass: GLASS } } as unknown as ThemeSetArgs

type ThemeSetter = { theme: { set: (look: ThemeSetArgs) => Promise<ThemeResult> } }

async function setLook($: ThemeSetter): Promise<ThemeResult> {
  try {
    return await $.theme.set(LOOK)
  } catch {
    return $.theme.set(LOOK_BY_ID)
  }
}

const HELP = [
  'Gotham night commands:',
  '/gotham on - put the look on',
  '/gotham off - take the look off',
  '/gotham storm - rain and lightning on',
  '/gotham calm - clear night, no rain',
  '/gotham band - show or hide the night-watch band',
  '/gotham status - what is on right now',
].join('\n')

export const register: Register = on => {
  let startedAt = 0

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'gotham',
      description: 'Gotham night look: on, off, storm, calm, band, status',
    })

    if (await read($, isOn)) {
      const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

      if (unpainted !== undefined) {
        $.ui.toast(unpainted)
      }
      const set = await setLook($)

      $.ui.status(set.isDrawn ? 'Gotham night: on watch' : set.reason)
    }

    return next(e)
  })

  on('command.run', { command: 'gotham' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'on') {
      await update($, isOn, () => true)
      await setLook($)
      $.ui.status('Gotham night: on watch')

      return { text: 'Gotham night is on. The city is yours.' }
    }

    if (arg === 'off') {
      await update($, isOn, () => false)
      await $.theme.clear()
      $.ui.status(undefined)

      return { text: 'Gotham night is off. Back to the normal look.' }
    }

    if (arg === 'storm' || arg === 'calm') {
      await update($, isStorm, () => arg === 'storm')

      return { text: arg === 'storm' ? 'Storm rolling in: rain and lightning on.' : 'Clear night: rain and lightning off.' }
    }

    if (arg === 'band') {
      const hidden = await read($, isBandHidden)
      await update($, isBandHidden, () => !hidden)

      return { text: hidden ? 'Night-watch band shown.' : 'Night-watch band hidden.' }
    }

    if (arg === 'status') {
      const w = await read($, watch)

      return {
        text: [
          `Look: ${(await read($, isOn)) ? 'on' : 'off'}`,
          `Weather: ${(await read($, isStorm)) ? 'storm' : 'calm'}`,
          `Band: ${(await read($, isBandHidden)) ? 'hidden' : 'shown'}`,
          `Tonight: ${w.turns} turns, ${w.tools} tool calls`,
        ].join('\n'),
      }
    }

    return { text: HELP }
  })

  on('prompt.submit', async ($, e, next) => {
    startedAt = await $.clock.now()

    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    await update($, watch, (w: Watch) => ({ ...w, tools: w.tools + 1 }))

    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)

    if (ran.deny === undefined && ran.isError === true && (await read($, isOn))) {
      $.ui.toast('Trouble in the city: a command failed')
    }

    return ran
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const seconds = startedAt === 0 ? null : Math.round(((await $.clock.now()) - startedAt) / 1000)
    await update($, watch, (w: Watch) => ({ ...w, turns: w.turns + 1, lastSeconds: seconds }))

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const named = e.props as { scene?: string; id?: string }

    if ((named.scene ?? named.id) !== SCENE_NAME || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const hasStorm = await read($, isStorm)

    return (
      <Svg
        source={buildScene(hasStorm)}
        alt={hasStorm ? 'A gothic city skyline in a night storm' : 'A gothic city skyline under a clear moon'}
      />
    )
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const isGeneric = e.surface === 'terminal' || e.props.word === 'Working'

    if (!isGeneric || e.props.message !== null || !(await read($, isOn))) {
      return next(e)
    }

    const w = await read($, watch)
    const word = SPINNER_WORDS[w.turns % SPINNER_WORDS.length] ?? e.props.word

    return next({ ...e, props: { ...e.props, word } })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const isQuiet = e.props.hasSurvey || (await read($, isBandHidden)) || !(await read($, isOn))

    if (isQuiet) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const w = await read($, watch)
    const hasStorm = await read($, isStorm)
    const last = w.lastSeconds === null ? '' : `, last one ${w.lastSeconds}s`

    return (
      <Box>
        <Text bold>NIGHT WATCH </Text>
        <Text dimColor>
          {e.props.isWorking ? 'on patrol' : 'standing by'} | {w.turns} turns, {w.tools} tool calls{last}{' '}
        </Text>
        <Button
          key="weather"
          label={hasStorm ? 'Calm night' : 'Storm'}
          onPress={() => update($, isStorm, () => !hasStorm)}
        />
        <Button key="hide" label="Hide" onPress={() => update($, isBandHidden, () => true)} />
      </Box>
    )
  })
}
