import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Copy, Loader2, Search, Sparkles } from 'lucide-react'

type Verse = {
  text: string
  ref: string
  verse: number
  bookName?: string
  chapter?: number
}

type BibleBook = { name: string; chapters: number }
type FontSize = 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'
type ThemeVerse = { book: string; chapter: number; verse: number }

const THEMES: Record<string, ThemeVerse[]> = {
  Ansiedad: [{ book: 'Filipenses', chapter: 4, verse: 6 }, { book: 'Salmos', chapter: 55, verse: 22 }, { book: 'Mateo', chapter: 6, verse: 34 }],
  Fe: [{ book: 'Hebreos', chapter: 11, verse: 1 }, { book: 'Marcos', chapter: 11, verse: 24 }, { book: 'Romanos', chapter: 10, verse: 17 }],
  Matrimonio: [{ book: 'Génesis', chapter: 2, verse: 24 }, { book: 'Efesios', chapter: 5, verse: 25 }, { book: '1 Corintios', chapter: 13, verse: 4 }],
  Perdón: [{ book: '1 Juan', chapter: 1, verse: 9 }, { book: 'Efesios', chapter: 4, verse: 32 }, { book: 'Colosenses', chapter: 3, verse: 13 }],
  Sanidad: [{ book: 'Isaías', chapter: 53, verse: 5 }, { book: 'Salmos', chapter: 147, verse: 3 }, { book: 'Jeremías', chapter: 17, verse: 14 }]
}

const BOOKS: BibleBook[] = [
  { name: 'Génesis', chapters: 50 }, { name: 'Éxodo', chapters: 40 }, { name: 'Levítico', chapters: 27 }, { name: 'Números', chapters: 36 }, { name: 'Deuteronomio', chapters: 34 }, { name: 'Josué', chapters: 24 }, { name: 'Jueces', chapters: 21 }, { name: 'Rut', chapters: 4 }, { name: '1 Samuel', chapters: 31 }, { name: '2 Samuel', chapters: 24 }, { name: '1 Reyes', chapters: 22 }, { name: '2 Reyes', chapters: 25 }, { name: '1 Crónicas', chapters: 29 }, { name: '2 Crónicas', chapters: 36 }, { name: 'Esdras', chapters: 10 }, { name: 'Nehemías', chapters: 13 }, { name: 'Ester', chapters: 10 }, { name: 'Job', chapters: 42 }, { name: 'Salmos', chapters: 150 }, { name: 'Proverbios', chapters: 31 }, { name: 'Eclesiastés', chapters: 12 }, { name: 'Cantares', chapters: 8 }, { name: 'Isaías', chapters: 66 }, { name: 'Jeremías', chapters: 52 }, { name: 'Lamentaciones', chapters: 5 }, { name: 'Ezequiel', chapters: 48 }, { name: 'Daniel', chapters: 12 }, { name: 'Oseas', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amós', chapters: 9 }, { name: 'Abdías', chapters: 1 }, { name: 'Jonás', chapters: 4 }, { name: 'Miqueas', chapters: 7 }, { name: 'Nahúm', chapters: 3 }, { name: 'Habacuc', chapters: 3 }, { name: 'Sofonías', chapters: 3 }, { name: 'Hageo', chapters: 2 }, { name: 'Zacarías', chapters: 14 }, { name: 'Malaquías', chapters: 4 },
  { name: 'Mateo', chapters: 28 }, { name: 'Marcos', chapters: 16 }, { name: 'Lucas', chapters: 24 }, { name: 'Juan', chapters: 21 }, { name: 'Hechos', chapters: 28 }, { name: 'Romanos', chapters: 16 }, { name: '1 Corintios', chapters: 16 }, { name: '2 Corintios', chapters: 13 }, { name: 'Gálatas', chapters: 6 }, { name: 'Efesios', chapters: 6 }, { name: 'Filipenses', chapters: 4 }, { name: 'Colosenses', chapters: 4 }, { name: '1 Tesalonicenses', chapters: 5 }, { name: '2 Tesalonicenses', chapters: 3 }, { name: '1 Timoteo', chapters: 6 }, { name: '2 Timoteo', chapters: 4 }, { name: 'Tito', chapters: 3 }, { name: 'Filemón', chapters: 1 }, { name: 'Hebreos', chapters: 13 }, { name: 'Santiago', chapters: 5 }, { name: '1 Pedro', chapters: 5 }, { name: '2 Pedro', chapters: 3 }, { name: '1 Juan', chapters: 5 }, { name: '2 Juan', chapters: 1 }, { name: '3 Juan', chapters: 1 }, { name: 'Judas', chapters: 1 }, { name: 'Apocalipsis', chapters: 22 }
]

const API_BASE = 'https://bolls.life'

function parseVerses(data: any, fallbackBook = '', fallbackChapter = ''): Verse[] {
  const items = Array.isArray(data) ? data : data.verses ?? []
  return items.map((verse: any) => {
    const rawBook = verse.book_name ?? verse.book ?? fallbackBook
    const bookNumber = Number(rawBook)
    const bookName = Number.isInteger(bookNumber) && bookNumber >= 1 && bookNumber <= BOOKS.length
      ? BOOKS[bookNumber - 1].name
      : String(rawBook)

    return {
    verse: Number(verse.verse),
    text: String(verse.text ?? '').trim(),
    bookName,
    chapter: Number(verse.chapter ?? fallbackChapter),
    ref: `${bookName} ${verse.chapter ?? fallbackChapter}:${verse.verse}`.trim()
    }
  })
}

function sanitizeVerseHtml(value: string) {
  return value
    .replace(/<(?!\/?(?:mark|br)\b)[^>]*>/gi, '')
    .replace(/<mark\b[^>]*>/gi, '<mark>')
}

function normalizeBookName(name: string) {
  const normalized = name.trim().toLowerCase().replace(/^salmo$/, 'salmos')
  return BOOKS.find(book => book.name.toLowerCase() === normalized)?.name ?? null
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function parseReference(value: string) {
  const match = value.trim().match(/^(.+?)\s+(\d+)(?::(\d+))?$/)
  if (!match) return null
  const bookName = normalizeBookName(match[1])
  if (!bookName) return null
  return { bookName, chapter: Number(match[2]), verse: match[3] ? Number(match[3]) : undefined }
}

async function fetchBible(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`La Biblia no está disponible (${response.status})`)
  return response.json()
}

export default function BibleViewer() {
  const [selectedBook, setSelectedBook] = useState(BOOKS[0].name)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Verse[]>([])
  const [searching, setSearching] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [error, setError] = useState('')
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<FontSize>('text-lg')
  const [favoriteRefs, setFavoriteRefs] = useState<string[]>([])
  const [highlightedRef, setHighlightedRef] = useState<string | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null>(null)

  const book = BOOKS.find(item => item.name === selectedBook) ?? BOOKS[0]
  const chapters = useMemo(() => Array.from({ length: book.chapters }, (_, index) => index + 1), [book])
  const hasSearch = searchTerm.trim().length > 0

  useEffect(() => {
    try {
      setFavoriteRefs(JSON.parse(localStorage.getItem('biblia-favoritos') ?? '[]'))
    } catch {
      setFavoriteRefs([])
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const bookNumber = BOOKS.findIndex(item => item.name === selectedBook) + 1

    fetchBible(`${API_BASE}/get-chapter/RV1960/${bookNumber}/${selectedChapter}/`)
      .then(data => {
        if (active) setVerses(parseVerses(data, selectedBook, selectedChapter.toString()))
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar el capítulo')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [selectedBook, selectedChapter])

  useEffect(() => {
    if (!hasSearch) {
      setSearchResults([])
      return
    }

    const timer = window.setTimeout(() => {
      const reference = parseReference(searchTerm)
      if (reference) {
        setSelectedBook(reference.bookName)
        setSelectedChapter(reference.chapter)
        setHighlightedRef(reference.verse ? `${reference.bookName} ${reference.chapter}:${reference.verse}` : null)
        setSearchTerm('')
        setActiveTheme(null)
        return
      }
      setSearching(true)
      fetchBible(`${API_BASE}/search/RV1960/?search=${encodeURIComponent(normalizeSearch(searchTerm))}`)
        .then(data => setSearchResults(parseVerses(data)))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false))
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchTerm, verses, hasSearch])

  useEffect(() => {
    if (!highlightedRef || loading) return
    const element = document.getElementById(`verse-${highlightedRef.replace(/[^a-zA-Z0-9]/g, '-')}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = window.setTimeout(() => setHighlightedRef(null), 3000)
    return () => window.clearTimeout(timer)
  }, [highlightedRef, loading, verses])

  const goToChapter = (direction: -1 | 1) => {
    const next = selectedChapter + direction
    if (next >= 1 && next <= book.chapters) setSelectedChapter(next)
  }

  const copyVerse = async (verse: Verse) => {
    await navigator.clipboard.writeText(`${verse.ref} - ${verse.text}`)
    setCopiedRef(verse.ref)
    window.setTimeout(() => setCopiedRef(null), 1800)
  }

  const openSearchResult = (verse: Verse) => {
    navigateToReference(verse.bookName, verse.chapter, verse.ref)
  }

  const navigateToReference = (bookName?: string, chapter?: number, reference?: string) => {
    const targetBook = BOOKS.find(item => item.name.toLowerCase() === bookName?.toLowerCase())
    if (targetBook && chapter) {
      setSelectedBook(targetBook.name)
      setSelectedChapter(chapter)
      setHighlightedRef(reference ?? null)
    }
    setSearchTerm('')
    setSearchResults([])
    setActiveTheme(null)
  }

  const toggleFavorite = (verse: Verse) => {
    const next = favoriteRefs.includes(verse.ref)
      ? favoriteRefs.filter(ref => ref !== verse.ref)
      : [...favoriteRefs, verse.ref]
    setFavoriteRefs(next)
    localStorage.setItem('biblia-favoritos', JSON.stringify(next))
  }

  const loadTheme = async (theme: string) => {
    setActiveTheme(theme)
    setSearchTerm('')
    setSearching(true)
    try {
      const results = await Promise.all(THEMES[theme].map(async item => {
        const bookNumber = BOOKS.findIndex(bookItem => bookItem.name === item.book) + 1
        const data = await fetchBible(`${API_BASE}/get-chapter/RV1960/${bookNumber}/${item.chapter}/`)
        return parseVerses(data, item.book, item.chapter.toString()).find(verse => verse.verse === item.verse)
      }))
      setSearchResults(results.filter((verse): verse is Verse => Boolean(verse)))
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const clearTheme = () => {
    setActiveTheme(null)
    setSearchResults([])
    setSearching(false)
  }

  const favoriteReferences = favoriteRefs
    .map(ref => ({ ref, parsed: parseReference(ref) }))
    .filter(item => item.parsed)

  return (
    <section className="min-h-screen bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl md:px-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-200"><BookOpen size={15} /> Reina Valera 1960</div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">La Palabra</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">Lee, explora y encuentra inspiración en las Escrituras desde un solo lugar.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300"><Sparkles size={16} className="text-amber-300" /> Biblia en español</div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="bible-book">Libro</label>
            <select id="bible-book" value={selectedBook} onChange={event => { setSelectedBook(event.target.value); setSelectedChapter(1); setSearchTerm('') }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <optgroup label="Antiguo Testamento">{BOOKS.slice(0, 39).map(item => <option key={item.name}>{item.name}</option>)}</optgroup>
              <optgroup label="Nuevo Testamento">{BOOKS.slice(39).map(item => <option key={item.name}>{item.name}</option>)}</optgroup>
            </select>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="bible-chapter">Capítulo</label>
            <select id="bible-chapter" value={selectedChapter} onChange={event => setSelectedChapter(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              {chapters.map(chapter => <option key={chapter} value={chapter}>{chapter}</option>)}
            </select>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => goToChapter(-1)} disabled={selectedChapter === 1} className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /> Anterior</button>
              <button onClick={() => goToChapter(1)} disabled={selectedChapter === book.chapters} className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">Siguiente <ChevronRight size={16} /></button>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Temas</h3>
                {activeTheme && <button onClick={clearTheme} className="text-xs font-medium text-blue-600 hover:text-blue-800">Limpiar filtro</button>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(THEMES).map(theme => (
                  <button key={theme} onClick={() => activeTheme === theme ? clearTheme() : loadTheme(theme)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${activeTheme === theme ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-5">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><Bookmark size={14} /> Favoritos</h3>
              {favoriteReferences.length === 0 ? (
                <p className="mt-3 text-xs leading-5 text-slate-400">Tus versículos guardados aparecerán aquí.</p>
              ) : (
                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                  {favoriteReferences.map(({ ref, parsed }) => (
                    <button key={ref} onClick={() => navigateToReference(parsed?.bookName, parsed?.chapter, ref)} className="block w-full truncate rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-amber-50 hover:text-amber-700">
                      <Bookmark size={13} className="mr-1 inline text-amber-500" fill="currentColor" />{ref}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Lectura actual</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">{selectedBook} {selectedChapter}</h2></div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                      placeholder="Buscar en toda la Biblia..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                    {searchFocused && hasSearch && (searching || searchResults.length > 0) && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                        {searching ? (
                          <div className="flex items-center gap-2 px-3 py-4 text-xs text-slate-500"><Loader2 size={15} className="animate-spin text-blue-600" /> Buscando coincidencias...</div>
                        ) : (
                          searchResults.slice(0, 8).map(result => (
                            <button
                              key={`${result.ref}-${result.verse}`}
                              onMouseDown={event => { event.preventDefault(); openSearchResult(result); setSearchFocused(false) }}
                              className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-blue-50"
                            >
                              <span className="block text-xs font-bold text-slate-900">{result.ref}</span>
                              <span className="mt-0.5 block truncate text-xs text-slate-500" dangerouslySetInnerHTML={{ __html: sanitizeVerseHtml(result.text) }} />
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setFontSize(size => size === 'text-base' ? 'text-base' : size === 'text-lg' ? 'text-base' : 'text-lg')} aria-label="Reducir tamaño del texto" title="Reducir texto" className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">A-</button>
                  <button onClick={() => setFontSize(size => size === 'text-2xl' ? 'text-2xl' : size === 'text-xl' ? 'text-2xl' : size === 'text-lg' ? 'text-xl' : 'text-lg')} aria-label="Aumentar tamaño del texto" title="Aumentar texto" className="rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">A+</button>
                </div>
              </div>

              {hasSearch ? (
                <div className="mt-6"><p className="mb-4 text-sm text-slate-500">Resultados en toda la Biblia para <strong className="text-slate-800">{searchTerm}</strong></p>{searching ? <LoadingState label="Buscando en toda la Biblia..." /> : <VerseList verses={searchResults} empty="No encontramos versículos coincidentes." fontSize={fontSize} onCopy={copyVerse} onFavorite={toggleFavorite} favorites={favoriteRefs} copiedRef={copiedRef} onSelect={openSearchResult} />}</div>
              ) : activeTheme ? (
                <div className="mt-6"><p className="mb-4 text-sm text-slate-500">Versículos para <strong className="text-slate-800">{activeTheme}</strong></p>{searching ? <LoadingState label="Preparando versículos..." /> : <VerseList verses={searchResults} empty="No encontramos versículos para este tema." fontSize={fontSize} onCopy={copyVerse} onFavorite={toggleFavorite} favorites={favoriteRefs} copiedRef={copiedRef} onSelect={openSearchResult} />}</div>
              ) : (
                <div className="mt-6">{loading ? <LoadingState label="Cargando capítulo..." /> : error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}. Comprueba tu conexión e inténtalo de nuevo.</p> : <VerseList verses={verses} empty="No hay versículos disponibles para este capítulo." fontSize={fontSize} onCopy={copyVerse} onFavorite={toggleFavorite} favorites={favoriteRefs} copiedRef={copiedRef} highlightedRef={highlightedRef} />}</div>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

function LoadingState({ label }: { label: string }) { return <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500"><Loader2 size={20} className="animate-spin text-blue-600" />{label}</div> }

function VerseList({ verses, empty, fontSize = 'text-lg', onCopy, onFavorite, favorites, copiedRef, highlightedRef, onSelect }: { verses: Verse[]; empty: string; fontSize?: FontSize; onCopy: (verse: Verse) => void; onFavorite: (verse: Verse) => void; favorites: string[]; copiedRef: string | null; highlightedRef?: string | null; onSelect?: (verse: Verse) => void }) {
  if (!verses.length) return <p className="py-16 text-center text-sm text-slate-500">{empty}</p>
  return <div className="divide-y divide-slate-100">{verses.map(verse => <article id={`verse-${verse.ref.replace(/[^a-zA-Z0-9]/g, '-')}`} key={`${verse.ref}-${verse.verse}`} className={`group flex gap-4 rounded-xl px-3 py-5 transition hover:bg-slate-50 ${highlightedRef === verse.ref ? 'bg-amber-50 ring-2 ring-amber-300' : ''} ${onSelect ? 'cursor-pointer' : ''}`} onClick={() => onSelect?.(verse)}><span className="mt-1 flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-50 px-2 text-xs font-bold text-blue-700">{verse.verse}</span><div className="flex-1"><p className="font-serif text-sm font-bold text-slate-900">{verse.ref}</p><p className={`font-serif ${fontSize} leading-relaxed text-slate-700 transition group-hover:text-slate-950`} dangerouslySetInnerHTML={{ __html: sanitizeVerseHtml(verse.text) }} /></div><div className="mt-1 flex shrink-0 items-start gap-1"><button onClick={event => { event.stopPropagation(); onFavorite(verse) }} title={favorites.includes(verse.ref) ? 'Quitar marcador' : 'Guardar marcador'} aria-label={favorites.includes(verse.ref) ? 'Quitar marcador' : 'Guardar marcador'} className={`rounded-lg p-2 transition ${favorites.includes(verse.ref) ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}><Bookmark size={17} fill={favorites.includes(verse.ref) ? 'currentColor' : 'none'} /></button><button onClick={event => { event.stopPropagation(); onCopy(verse) }} title={copiedRef === verse.ref ? 'Copiado' : 'Copiar versículo'} aria-label={copiedRef === verse.ref ? 'Versículo copiado' : 'Copiar versículo'} className={`rounded-lg p-2 transition ${copiedRef === verse.ref ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>{copiedRef === verse.ref ? <Check size={17} /> : <Copy size={17} />}</button></div></article>)}</div>
}
