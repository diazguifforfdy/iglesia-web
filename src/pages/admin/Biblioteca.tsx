import { useEffect, useRef, useState, type FormEvent } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import Papa from 'papaparse'
import { useNotification } from '../../context/NotificationContext'
import { addCollectionDoc, addCollectionDocsBatch, deleteDocument, getCollectionWhereOrdered, updateDocument } from '../../services/firestore'
import { BookOpen, ExternalLink, FileSpreadsheet, ListPlus, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { inputClass, labelClass, cardClass } from './adminUi'

const BIBLIOTECA_COLLECTION = 'biblioteca'
const CATEGORIAS = ['Himnario', 'Mensaje', 'Escuelita', 'Jóvenes'] as const
type Categoria = typeof CATEGORIAS[number]

type Recurso = {
  id: string
  titulo: string
  categoria: Categoria
  descripcion: string
  enlaceDrive: string
  createdAt?: any
}

type FormRow = { titulo: string; categoria: Categoria; descripcion: string; enlaceDrive: string }

const emptyForm: FormRow = { titulo: '', categoria: CATEGORIAS[0], descripcion: '', enlaceDrive: '' }
const emptyRow = (): FormRow => ({ titulo: '', categoria: CATEGORIAS[0], descripcion: '', enlaceDrive: '' })

function isValidDriveLink(url: string) {
  try {
    const u = new URL(url)
    return u.hostname.includes('drive.google.com') || u.hostname.includes('docs.google.com')
  } catch {
    return false
  }
}

function normalizeCategoria(input: string | undefined): Categoria {
  const value = (input ?? '').trim().toLowerCase()
  const match = CATEGORIAS.find(c => c.toLowerCase() === value || c.toLowerCase().startsWith(value.slice(0, 4)))
  return match ?? CATEGORIAS[0]
}

type Tab = 'individual' | 'multiple' | 'csv'

export default function BibliotecaAdmin() {
  const { addNotification } = useNotification()
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<Tab>('individual')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Pestaña "Subida Individual"
  const [form, setForm] = useState<FormRow>(emptyForm)

  // Pestaña "Múltiples Filas"
  const [rows, setRows] = useState<FormRow[]>([emptyRow()])

  // Pestaña "Subir Excel/CSV"
  const [csvRows, setCsvRows] = useState<FormRow[]>([])
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [filtro, setFiltro] = useState<'Todos' | Categoria>('Todos')

  const fetchRecursos = async () => {
    setLoading(true)
    try {
      const data = await getCollectionWhereOrdered(BIBLIOTECA_COLLECTION, undefined, undefined, undefined, 'createdAt', 'desc')
      setRecursos(data as Recurso[])
    } catch (err) {
      console.error('Error fetching biblioteca:', err)
      addNotification({ type: 'error', message: 'Error al cargar la biblioteca' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecursos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(r: Recurso) {
    setTab('individual')
    setEditingId(r.id)
    setForm({ titulo: r.titulo, categoria: r.categoria, descripcion: r.descripcion, enlaceDrive: r.enlaceDrive })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) return addNotification({ type: 'error', message: 'El título es obligatorio' })
    if (!form.enlaceDrive.trim() || !isValidDriveLink(form.enlaceDrive.trim())) {
      return addNotification({ type: 'error', message: 'Ingresa un enlace válido de Google Drive' })
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateDocument(BIBLIOTECA_COLLECTION, editingId, {
          titulo: form.titulo.trim(),
          categoria: form.categoria,
          descripcion: form.descripcion.trim(),
          enlaceDrive: form.enlaceDrive.trim()
        })
        addNotification({ type: 'success', message: 'Recurso actualizado correctamente' })
      } else {
        await addCollectionDoc(BIBLIOTECA_COLLECTION, {
          titulo: form.titulo.trim(),
          categoria: form.categoria,
          descripcion: form.descripcion.trim(),
          enlaceDrive: form.enlaceDrive.trim(),
          createdAt: serverTimestamp()
        })
        addNotification({ type: 'success', message: 'Recurso agregado a la biblioteca' })
      }
      resetForm()
      fetchRecursos()
    } catch (err) {
      console.error('Error saving biblioteca item:', err)
      addNotification({ type: 'error', message: 'Error al guardar el recurso' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(r: Recurso) {
    if (!window.confirm(`¿Eliminar "${r.titulo}" de la biblioteca?`)) return
    try {
      await deleteDocument(BIBLIOTECA_COLLECTION, r.id)
      addNotification({ type: 'success', message: `"${r.titulo}" eliminado correctamente` })
      if (editingId === r.id) resetForm()
      fetchRecursos()
    } catch (err) {
      console.error('Error deleting biblioteca item:', err)
      addNotification({ type: 'error', message: 'Error al eliminar el recurso' })
    }
  }

  // --- Múltiples filas ---
  function updateRow(index: number, field: keyof FormRow, value: string) {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addRow() {
    setRows(prev => [...prev, emptyRow()])
  }

  function removeRow(index: number) {
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  async function saveRows() {
    const valid = rows.filter(r => r.titulo.trim() && isValidDriveLink(r.enlaceDrive.trim()))
    if (valid.length === 0) {
      return addNotification({ type: 'error', message: 'Agrega al menos una fila con título y enlace de Drive válidos' })
    }
    setSaving(true)
    try {
      await addCollectionDocsBatch(
        BIBLIOTECA_COLLECTION,
        valid.map(r => ({
          titulo: r.titulo.trim(),
          categoria: r.categoria,
          descripcion: r.descripcion.trim(),
          enlaceDrive: r.enlaceDrive.trim(),
          createdAt: serverTimestamp()
        }))
      )
      addNotification({ type: 'success', message: `${valid.length} recurso(s) agregados correctamente` })
      setRows([emptyRow()])
      fetchRecursos()
    } catch (err) {
      console.error('Error saving batch rows:', err)
      addNotification({ type: 'error', message: 'Error al guardar las filas' })
    } finally {
      setSaving(false)
    }
  }

  // --- CSV/Excel ---
  function handleCsvFile(file: File) {
    setCsvFileName(file.name)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const parsed: FormRow[] = results.data.map(row => {
          const titulo = row['Título'] ?? row['Titulo'] ?? row['titulo'] ?? ''
          const categoria = row['Categoría'] ?? row['Categoria'] ?? row['categoria'] ?? ''
          const descripcion = row['Descripción'] ?? row['Descripcion'] ?? row['descripcion'] ?? ''
          const enlaceDrive = row['Enlace'] ?? row['enlace'] ?? row['Enlace Drive'] ?? row['enlaceDrive'] ?? ''
          return {
            titulo: titulo.trim(),
            categoria: normalizeCategoria(categoria),
            descripcion: descripcion.trim(),
            enlaceDrive: enlaceDrive.trim()
          }
        }).filter(r => r.titulo)
        setCsvRows(parsed)
        if (parsed.length === 0) {
          addNotification({ type: 'error', message: 'No se encontraron filas válidas. Verifica las columnas: Título, Categoría, Descripción, Enlace' })
        }
      },
      error: err => {
        console.error('CSV parse error', err)
        addNotification({ type: 'error', message: 'No se pudo leer el archivo CSV' })
      }
    })
  }

  async function importCsvRows() {
    const valid = csvRows.filter(r => r.titulo.trim() && isValidDriveLink(r.enlaceDrive.trim()))
    if (valid.length === 0) {
      return addNotification({ type: 'error', message: 'No hay filas válidas para importar (revisa los enlaces de Drive)' })
    }
    setSaving(true)
    try {
      await addCollectionDocsBatch(
        BIBLIOTECA_COLLECTION,
        valid.map(r => ({
          titulo: r.titulo,
          categoria: r.categoria,
          descripcion: r.descripcion,
          enlaceDrive: r.enlaceDrive,
          createdAt: serverTimestamp()
        }))
      )
      addNotification({ type: 'success', message: `${valid.length} recurso(s) importados desde CSV` })
      setCsvRows([])
      setCsvFileName(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchRecursos()
    } catch (err) {
      console.error('Error importing CSV:', err)
      addNotification({ type: 'error', message: 'Error al importar el CSV' })
    } finally {
      setSaving(false)
    }
  }

  const visibles = filtro === 'Todos' ? recursos : recursos.filter(r => r.categoria === filtro)

  const tabs: { id: Tab; label: string; icon: typeof Upload }[] = [
    { id: 'individual', label: 'Subida Individual', icon: Upload },
    { id: 'multiple', label: 'Múltiples Filas', icon: ListPlus },
    { id: 'csv', label: 'Subir Excel/CSV', icon: FileSpreadsheet }
  ]

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3">
        <BookOpen className="text-primary" size={26} />
        <h1 className="text-2xl font-bold text-primary">Biblioteca (Himnarios y Documentos)</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Registra enlaces de Google Drive. Los archivos no se almacenan en el servidor, solo se guarda la referencia.
      </p>

      <div className="mt-6 max-w-3xl">
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className={`${cardClass} rounded-t-none mt-0`}>
          {tab === 'individual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-semibold text-gray-800">{editingId ? 'Editar recurso' : 'Nuevo recurso'}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Título</label>
                  <input className={inputClass} value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} disabled={saving} />
                </div>
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select className={inputClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value as Categoria })} disabled={saving}>
                    {CATEGORIAS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea className={inputClass} rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} disabled={saving} />
              </div>
              <div>
                <label className={labelClass}>Enlace de Google Drive</label>
                <input
                  className={inputClass}
                  value={form.enlaceDrive}
                  onChange={e => setForm({ ...form, enlaceDrive: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  disabled={saving}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-60"
                >
                  <Plus size={16} />
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar recurso'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}

          {tab === 'multiple' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800">Agregar varios enlaces a la vez</h2>
              <div className="space-y-4">
                {rows.map((row, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 space-y-3 relative">
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(index)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-red-600"
                        title="Eliminar fila"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        className={inputClass}
                        placeholder="Título"
                        value={row.titulo}
                        onChange={e => updateRow(index, 'titulo', e.target.value)}
                      />
                      <select className={inputClass} value={row.categoria} onChange={e => updateRow(index, 'categoria', e.target.value)}>
                        {CATEGORIAS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Descripción (opcional)"
                      value={row.descripcion}
                      onChange={e => updateRow(index, 'descripcion', e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="https://drive.google.com/..."
                      value={row.enlaceDrive}
                      onChange={e => updateRow(index, 'enlaceDrive', e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={addRow}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} /> Añadir otro
                </button>
                <button
                  onClick={saveRows}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar todas las filas'}
                </button>
              </div>
            </div>
          )}

          {tab === 'csv' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800">Importar desde Excel/CSV</h2>
              <p className="text-sm text-gray-500">
                El archivo debe incluir las columnas: <strong>Título, Categoría, Descripción, Enlace</strong>.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={e => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {csvFileName && <p className="text-xs text-gray-500">Archivo: {csvFileName} · {csvRows.length} fila(s) detectadas</p>}

              {csvRows.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-3 py-2">Título</th>
                        <th className="text-left px-3 py-2">Categoría</th>
                        <th className="text-left px-3 py-2">Descripción</th>
                        <th className="text-left px-3 py-2">Enlace válido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {csvRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">{row.titulo}</td>
                          <td className="px-3 py-2">{row.categoria}</td>
                          <td className="px-3 py-2 max-w-xs truncate">{row.descripcion}</td>
                          <td className="px-3 py-2">
                            {isValidDriveLink(row.enlaceDrive) ? (
                              <span className="text-emerald-600 font-medium">Sí</span>
                            ) : (
                              <span className="text-red-500 font-medium">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={importCsvRows}
                disabled={saving || csvRows.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-60"
              >
                {saving ? 'Importando...' : 'Confirmar e importar'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">Recursos ({visibles.length})</h2>
          <div className="flex flex-wrap gap-2">
            {(['Todos', ...CATEGORIAS] as const).map(c => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filtro === c ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-gray-500 text-sm">Cargando recursos...</p>
          ) : visibles.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay recursos registrados en esta categoría.</p>
          ) : (
            visibles.map(r => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-100 bg-white shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{r.titulo}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-light font-medium">{r.categoria}</span>
                  </div>
                  {r.descripcion && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{r.descripcion}</p>}
                  <a
                    href={r.enlaceDrive}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
                  >
                    Abrir en Google Drive <ExternalLink size={12} />
                  </a>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(r)}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

