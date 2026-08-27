export type Estudio = {
  slug: string
  titulo: string
  descripcion?: string
  portada?: string
  pdf: string
  categoria?: string
}

export const ESTUDIOS: Estudio[] = [
  {
    slug: 'aguila-blanca',
    titulo: 'Águila Blanca',
    portada: '/docs/portada-aguila.jpg',
    pdf: '/docs/aguila-blanca.pdf',
    categoria: 'Mensajes'
  }
]
