import { useEffect, useState } from 'react'
import sample from '../data/bible_sample'
import { getDocData } from '../services/firestore'

type Verse = { text: string; ref: string }

export default function BibleViewer() {
  const [books, setBooks] = useState<string[]>([])
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [chapters, setChapters] = useState<number[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])

  useEffect(() => {
    ;(async () => {
      // Try Firestore first
      const data = await getDocData('biblia', 'index')
      if (data && data.books) {
        setBooks(Object.keys(data.books))
      } else {
        setBooks(Object.keys(sample))
      }
    })()
  }, [])

  useEffect(() => {
    if (!selectedBook) return
    const src = sample[selectedBook] || {}
    const chs = Object.keys(src).map(k => parseInt(k, 10)).sort((a,b)=>a-b)
    setChapters(chs)
    setSelectedChapter(chs[0] ?? null)
  }, [selectedBook])

  useEffect(() => {
    if (!selectedBook || !selectedChapter) return
    const src = sample[selectedBook] || {}
    const v = (src[selectedChapter] || []).map((t:string,i:number)=>({ text: t, ref: `${selectedBook} ${selectedChapter}:${i+1}` }))
    setVerses(v)
  }, [selectedBook, selectedChapter])

  return (
    <section className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Biblia (Visor)</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm">Libro</label>
          <select className="mt-2 border px-3 py-2 rounded w-full" onChange={e=>setSelectedBook(e.target.value)} value={selectedBook ?? ''}>
            <option value="">Seleccione</option>
            {books.map(b=> <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Capítulo</label>
          <select className="mt-2 border px-3 py-2 rounded w-full" onChange={e=>setSelectedChapter(Number(e.target.value))} value={selectedChapter ?? ''}>
            <option value="">-</option>
            {chapters.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded p-4 border h-64 overflow-auto">
            {verses.map(v => (
              <p key={v.ref} className="mb-2"><strong className="mr-2">{v.ref}</strong>{v.text}</p>
            ))}
            {!verses.length && <p className="text-slate-600">Selecciona un libro y capítulo para ver los versículos.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
