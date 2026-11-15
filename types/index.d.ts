export type Watch = { tools: number; turns: number; lastSeconds: number | null }

declare module 'claude-code' {
  interface PluginState {
    'gotham-night': { isOn: boolean; isStorm: boolean; isBandHidden: boolean; watch: Watch }
  }
}
