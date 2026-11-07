import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit, EngineInterface } from 'claude-code'

import type { Olcum } from '../types'

const PANE = 'kota-paneli'
const BASLIK = 'Kota'
const olcum = atom({ plugin: 'kota-paneli', key: 'olcum' } as const, null, { shape: 'olcum-1' })

const AD: Record<string, string> = {
  five_hour: '5 saatlik pencere',
  seven_day: 'Haftalık',
  spend_limit: 'Harcama limiti',
}

function kalan(resetsAt: string | undefined, simdi: number): string {
  if (!resetsAt) return ''
  const ms = Date.parse(resetsAt) - simdi
  if (!(ms > 0)) return 'sıfırlanıyor'
  const dk = Math.round(ms / 60000)
  const g = Math.floor(dk / 1440), s = Math.floor((dk % 1440) / 60), d = dk % 60
  if (g > 0) return `${g} g ${s} sa sonra sıfırlanır`
  if (s > 0) return `${s} sa ${d} dk sonra sıfırlanır`
  return `${d} dk sonra sıfırlanır`
}

function cubuk(p: number, n = 20): string {
  const dolu = Math.max(0, Math.min(n, Math.round((p / 100) * n)))
  return '█'.repeat(dolu) + '░'.repeat(n - dolu)
}

function renk(p: number): string {
  return p >= 90 ? 'error' : p >= 70 ? 'warning' : 'success'
}

function durumSatiri(list: SessionRateLimit[]): string | undefined {
  if (!list.length) return undefined
  return list
    .map(r => `${r.kind === 'five_hour' ? '5sa' : r.kind === 'seven_day' ? 'hafta' : r.kind} %${Math.round(r.percentUsed)}`)
    .join(' · ')
}

async function kaydet($: EngineInterface, list: SessionRateLimit[], usd: number | undefined) {
  const simdi = await $.clock.now()
  const yeni: Olcum = {
    pencereler: list.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    usd,
    olculdu: simdi,
  }
  await update($, olcum, () => yeni)
  $.ui.status(durumSatiri(list))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command.register({ name: 'kota', description: 'Kullanım kotası panelini aç' })
    try {
      const u = await $.session.usage()
      if (u.rateLimits.length) await kaydet($, u.rateLimits, u.cost?.usd)
    } catch {}
    void $.ui.open({ id: PANE, title: BASLIK })
    return r
  })

  on('command.run', { command: 'kota' }, async $ => {
    await $.ui.open({ id: PANE, title: BASLIK })
    return { text: 'Kota paneli açıldı.' }
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits') || e.changed.includes('cost')) {
      await kaydet($, e.rateLimits, e.cost?.usd)
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const o = await read($, olcum)
    const simdi = await $.clock.now()

    const yenile = async () => {
      const u = await $.session.usage()
      await kaydet($, u.rateLimits, u.cost?.usd)
    }

    if (!o || o.pencereler.length === 0) {
      return (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>Henüz kota okuması yok. İlk yanıttan sonra burada görünür.</Text>
          <Button onPress={yenile}>Yenile</Button>
        </Box>
      )
    }

    const dk = Math.max(0, Math.round((simdi - o.olculdu) / 60000))
    return (
      <Box flexDirection="column" gap={1}>
        {o.pencereler.map(p => (
          <Box flexDirection="column">
            <Text weight="semibold">{AD[p.kind] ?? p.kind}</Text>
            <Text mono color={renk(p.percentUsed)}>
              {cubuk(p.percentUsed)} %{p.percentUsed}
            </Text>
            {p.resetsAt && <Text dimColor size="footnote">{kalan(p.resetsAt, simdi)}</Text>}
          </Box>
        ))}
        {o.usd !== undefined && (
          <Text dimColor size="footnote">Bu oturumun API karşılığı: ${o.usd.toFixed(2)}</Text>
        )}
        <Text dimColor size="footnote">{dk === 0 ? 'Az önce güncellendi' : `${dk} dk önce güncellendi`}</Text>
        <Button onPress={yenile}>Yenile</Button>
      </Box>
    )
  })
}
