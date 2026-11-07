export type Pencere = { kind: string; percentUsed: number; resetsAt?: string }
export type Olcum = { pencereler: Pencere[]; usd?: number; olculdu: number }

declare module 'claude-code' {
  interface PluginState {
    'kota-paneli': { olcum: Shaped<Olcum | null> }
  }
}
