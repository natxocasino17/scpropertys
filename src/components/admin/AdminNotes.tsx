import { useState, useRef } from 'react'
import { Paperclip, Trash2, Loader2, FileText, ImageIcon, Download, Plus } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { uploadPrivateFile, signPrivateFile } from '../../lib/propertiesService'
import { compressImage } from '../../lib/imageCompress'
import type { AdminNote, AdminNoteFile } from '../../types/property'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AdminNotes({
  notes,
  onChange,
}: {
  notes: AdminNote[]
  onChange: (notes: AdminNote[]) => void
}) {
  const { t } = useLanguage()
  const { settings } = useSettings()
  const { user } = useAuth()
  const agents = settings.agents ?? []

  const defaultAuthor =
    agents.find(
      (a) => a.email && user?.email && a.email.toLowerCase() === user.email.toLowerCase(),
    )?.id ??
    agents[0]?.id ??
    ''

  const [text, setText] = useState('')
  const [author, setAuthor] = useState(defaultAuthor)
  const [files, setFiles] = useState<AdminNoteFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'

  function agentName(id: string) {
    return agents.find((a) => a.id === id)?.name ?? id
  }

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return
    setUploading(true)
    try {
      for (const f of Array.from(list)) {
        const toUpload = f.type.startsWith('image/') ? await compressImage(f) : f
        const meta = await uploadPrivateFile(toUpload)
        setFiles((prev) => [...prev, meta])
      }
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function addNote() {
    if (!text.trim() && files.length === 0) return
    const note: AdminNote = {
      id: uid(),
      text: text.trim(),
      author,
      files,
      created_at: new Date().toISOString(),
    }
    onChange([note, ...notes])
    setText('')
    setFiles([])
  }

  function deleteNote(id: string) {
    onChange(notes.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* New note composer */}
      <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.admin.notePlaceholder}
          className={`${input} resize-none`}
        />

        {/* Pending files */}
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-ink-700 px-2.5 py-1 text-xs text-cream/80"
              >
                {f.type.startsWith('image/') ? <ImageIcon size={13} /> : <FileText size={13} />}
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-faint hover:text-rose-300"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select value={author} onChange={(e) => setAuthor(e.target.value)} className={`${input} w-auto`}>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.pdf,.doc,.docx,.dwg"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-ink-700 px-3 py-2 text-sm text-cream transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
            {uploading ? t.admin.uploading : t.admin.attach}
          </button>

          <button
            type="button"
            onClick={addNote}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold hover:bg-gold/20"
          >
            <Plus size={15} /> {t.admin.addNote}
          </button>
        </div>
      </div>

      {/* Existing notes */}
      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-white/10 bg-ink-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-medium text-gold">
                    {agentName(note.author)}
                  </span>
                  <span className="text-faint">{new Date(note.created_at).toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-rose-300"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {note.text && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-cream/85">
                  {note.text}
                </p>
              )}
              {note.files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.files.map((f, i) => (
                    <PrivateFileChip key={i} file={f} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PrivateFileChip({ file }: { file: AdminNoteFile }) {
  const [loading, setLoading] = useState(false)

  async function open() {
    setLoading(true)
    try {
      const url = await signPrivateFile(file.path)
      if (url) window.open(url, '_blank', 'noopener')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-ink-700 px-2.5 py-1.5 text-xs text-cream/80 transition-colors hover:border-gold hover:text-gold"
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : file.type.startsWith('image/') ? (
        <ImageIcon size={13} />
      ) : (
        <FileText size={13} />
      )}
      <span className="max-w-[160px] truncate">{file.name}</span>
      <Download size={12} className="text-faint" />
    </button>
  )
}
