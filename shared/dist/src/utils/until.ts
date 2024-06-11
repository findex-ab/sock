export type UntilFunction = () => boolean

export const until = (fun: UntilFunction, interval: number = 500, timeout: number = 60000) => {
  const started = performance.now()
  let timer: ReturnType<typeof setInterval> | undefined = undefined
  return new Promise<boolean>((resolve, reject) => {
    timer = setInterval(() => {
      if (fun()) {
        clearInterval(timer)
        resolve(true)
      }

      const now = performance.now()
      const elapsed = now - started
      if (elapsed >= timeout) {
        clearInterval(timer)
        reject(false)
      }
    }, interval)
  })
}
