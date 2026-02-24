export default defineNuxtPlugin(async (nuxtApp) => {
  if (!isEeUI) {
    const ncSocket = {
      id: () => null,
      onMessage: (..._args: any[]) => null,
      offMessage: (..._args: any[]) => null,
      emitPresence: (..._args: any[]) => undefined,
      onReconnect: (..._args: any[]) => () => {},
    }
    nuxtApp.provide('ncSocket', ncSocket)
  }
})
