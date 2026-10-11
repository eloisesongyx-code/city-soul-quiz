import { useState, type RefObject } from 'react'
import {
  downloadBlob,
  nodeToPngBlob,
  tryShareBlob,
} from '../../lib/image-export'

export interface ExportActionsProps {
  nodeRef: RefObject<HTMLElement | null>
  fileName: string
  label?: string
}

type Status = 'idle' | 'generating' | 'shared' | 'downloaded' | 'cancelled' | 'error'

export default function ExportActions({
  nodeRef,
  fileName,
  label = '保存 / 分享结果长图',
}: ExportActionsProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function handleExport() {
    const node = nodeRef.current
    if (!node) {
      setStatus('error')
      return
    }
    setStatus('generating')
    setPreviewUrl(null)
    try {
      const blob = await nodeToPngBlob(node)
      const outcome = await tryShareBlob(blob, fileName)
      if (outcome === 'shared') {
        setStatus('shared')
      } else if (outcome === 'cancelled') {
        // 用户取消系统分享：保留预览，便于手动保存
        setPreviewUrl(URL.createObjectURL(blob))
        setStatus('cancelled')
      } else {
        // 不支持文件分享：直接下载，并保留预览供长按保存
        downloadBlob(blob, fileName)
        setPreviewUrl(URL.createObjectURL(blob))
        setStatus('downloaded')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={status === 'generating'}
        className="w-full bg-ink text-paper py-3.5 text-[15px] tracking-wider rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'generating' ? '正在生成图片…' : label}
      </button>

      {status === 'shared' && (
        <p className="mt-3 text-sm text-sub" role="status">
          已打开系统分享面板，请选择保存位置或分享对象。
        </p>
      )}
      {status === 'downloaded' && (
        <p className="mt-3 text-sm text-sub" role="status">
          图片已开始下载；若未自动保存，可长按下方预览图保存。
        </p>
      )}
      {status === 'cancelled' && (
        <p className="mt-3 text-sm text-sub" role="status">
          已取消分享；可长按下方预览图保存到相册。
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-[#B23A2E]" role="alert">
          图片生成失败，请重试。
        </p>
      )}

      {previewUrl && (
        <div className="mt-5 border hairline rounded-sm overflow-hidden bg-white">
          <img src={previewUrl} alt="结果长图预览" className="w-full h-auto" />
          <p className="px-4 py-3 text-xs text-sub border-t hairline">
            手机端：长按图片即可保存到相册。
          </p>
        </div>
      )}
    </div>
  )
}
