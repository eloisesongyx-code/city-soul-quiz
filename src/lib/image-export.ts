import { toPng } from 'html-to-image'

export async function nodeToPngBlob(node: HTMLElement): Promise<Blob> {
  // 等待字体等依赖就绪
  try {
    await document.fonts?.ready
  } catch {
    // ignore
  }
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#F6F3ED',
  })
  const res = await fetch(dataUrl)
  return await res.blob()
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export type ShareOutcome = 'shared' | 'cancelled' | 'unsupported'

type ShareNavigator = Navigator & {
  canShare?: (data: ShareData) => boolean
}

export function canShareFiles(): boolean {
  const nav = navigator as ShareNavigator
  if (typeof navigator.share !== 'function') return false
  const file = new File([''], 'test.png', { type: 'image/png' })
  return typeof nav.canShare === 'function' && nav.canShare({ files: [file] })
}

export async function tryShareBlob(blob: Blob, fileName: string): Promise<ShareOutcome> {
  if (!canShareFiles()) return 'unsupported'
  const file = new File([blob], fileName, { type: 'image/png' })
  try {
    await navigator.share({ files: [file], title: '城市灵魂测评结果' })
    return 'shared'
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    return 'unsupported'
  }
}
