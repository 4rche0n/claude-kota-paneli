# kota-paneli

Claude Code için kullanım kotası paneli. Sohbetin yanında, Claude aboneliğinin **5 saatlik** ve **haftalık** limit pencerelerini dolum çubuğu, yüzde ve sıfırlanmaya kalan süreyle gösterir. Durum satırına da kısa bir özet yazar (`5sa %23 · hafta %41`).

A usage-quota pane for Claude Code: shows your subscription's 5-hour and weekly rate-limit windows beside the chat, with a bar, percentage and time until reset, plus a short status-line summary. (Labels are in Turkish.)

## Özellikler

- 5 saatlik ve haftalık pencere: çubuk, yüzde, sıfırlanma süresi
- Renkler: yeşil, %70'ten sonra sarı, %90'dan sonra kırmızı
- Bu oturumun API karşılığı ($)
- Yenile düğmesi, `/kota` komutuyla paneli tekrar açma

Rakamlar Claude'un her yanıtından sonra güncellenir. Yeni oturumda ilk yanıta kadar panel boş olabilir. Yalnızca Claude aboneliğiyle (Pro/Max) çalışır; API anahtarıyla kullanımda kota penceresi yoktur.

## Kurulum / Install

Claude Code terminalinde:

```
/plugin install kota-paneli --marketplace 4rche0n/claude-kota-paneli
```

`Add marketplace?` sorusuna `y`, ardından kapsam olarak user'ı seçin.

Kabuktan:

```bash
claude plugin install kota-paneli --marketplace 4rche0n/claude-kota-paneli
```

Masaüstü uygulamasında (`/plugin` çalışmaz): istem kutusunun yanındaki **+** → **Plugins** → **Add marketplace** ile `4rche0n/claude-kota-paneli`, sonra **Add plugin**.

## Lisans

MIT
