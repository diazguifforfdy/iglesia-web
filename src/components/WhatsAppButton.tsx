export default function WhatsAppButton() {
  const phone = '0000000000'
  const message = encodeURIComponent('Hola, me gustaría más información')
  const href = `https://wa.me/${phone}?text=${message}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full px-4 py-3 shadow-lg hover:bg-green-600"
      aria-label="WhatsApp"
    >
      WhatsApp
    </a>
  )
}
