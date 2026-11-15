import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

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
<g class="cloud" fill="#1a2233" opacity=".85"><ellipse cx="1220" cy="205" rx="270" ry="26"/><ellipse cx="420" cy="300" rx="320" ry="30"/></g>
<g class="cloud b" fill="#131a28" opacity=".85"><ellipse cx="900" cy="140" rx="340" ry="24"/><ellipse cx="1450" cy="330" rx="240" ry="22"/></g>
<g class="beam"><polygon points="250,900 270,900 400,230 140,230" fill="url(#beam)"/>
<ellipse cx="270" cy="210" rx="135" ry="92" fill="url(#disc)"/><ellipse cx="270" cy="210" rx="135" ry="92" fill="none" stroke="#f5c518" stroke-opacity=".28" stroke-width="2"/>
<g transform="translate(180,218) scale(5)" fill="#05070c" opacity=".92"><path d="${BAT}"/></g></g>
<g class="bats" fill="#04060a"><g transform="translate(0,300)"><path class="flap" d="${BAT}"/></g><g transform="translate(60,340) scale(.7)"><path class="flap" d="${BAT}"/></g><g transform="translate(-50,360) scale(.8)"><path class="flap" d="${BAT}"/></g></g>
<g class="bats b" fill="#04060a"><g transform="translate(0,200) scale(.6)"><path class="flap" d="${BAT}"/></g><g transform="translate(70,230) scale(.5)"><path class="flap" d="${BAT}"/></g></g>
<g fill="#111828">
<rect x="40" y="560" width="70" height="340"/><polygon points="40,560 75,480 110,560"/><rect x="210" y="520" width="50" height="380"/><rect x="390" y="580" width="90" height="320"/>
<polygon points="390,580 435,520 480,580"/><rect x="600" y="500" width="60" height="400"/><rect x="627" y="430" width="6" height="70"/><rect x="880" y="540" width="80" height="360"/>
<rect x="1080" y="490" width="55" height="410"/><polygon points="1080,490 1107,410 1135,490"/><rect x="1290" y="560" width="90" height="340"/><rect x="1480" y="510" width="60" height="390"/>
</g>
<g fill="#070a10">
<rect x="0" y="700" width="90" height="200"/><rect x="80" y="640" width="70" height="260"/><polygon points="80,640 115,590 150,640"/><rect x="150" y="720" width="110" height="180"/>
<rect x="260" y="590" width="60" height="310"/><polygon points="260,590 290,500 320,590"/><rect x="288" y="450" width="4" height="60"/><rect x="320" y="680" width="120" height="220"/>
<rect x="440" y="620" width="80" height="280"/><polygon points="440,620 450,600 460,620 470,600 480,620 490,600 500,620 510,600 520,620"/><rect x="520" y="730" width="140" height="170"/><rect x="660" y="650" width="70" height="250"/>
<rect x="730" y="520" width="90" height="380"/><polygon points="730,520 775,420 820,520"/><rect x="773" y="370" width="4" height="60"/><rect x="820" y="700" width="130" height="200"/>
<rect x="950" y="610" width="75" height="290"/><polygon points="950,610 987,560 1025,610"/><rect x="1025" y="740" width="120" height="160"/><rect x="1145" y="580" width="85" height="320"/>
<polygon points="1145,580 1155,560 1165,580 1177,560 1188,580 1199,560 1210,580 1220,560 1230,580"/><rect x="1230" y="690" width="120" height="210"/><rect x="1350" y="630" width="80" height="270"/>
<polygon points="1350,630 1390,570 1430,630"/><rect x="1430" y="720" width="100" height="180"/><rect x="1530" y="660" width="70" height="240"/>
</g>
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

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 8, tint: '#0a0c11', opacity: 0.74 } },
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
      const set = await $.theme.set(LOOK)

      $.ui.status(set.isDrawn ? 'Gotham night: on watch' : set.reason)
    }

    return next(e)
  })

  on('command.run', { command: 'gotham' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'on') {
      await update($, isOn, () => true)
      await $.theme.set(LOOK)
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
    if (e.props.scene !== SCENE_NAME || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
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
