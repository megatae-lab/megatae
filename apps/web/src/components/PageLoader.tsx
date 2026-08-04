import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function PageLoader() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 380)
    return () => clearTimeout(t)
  }, [location.pathname])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-9998 bg-blue-950 flex items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <img src="./assets/logo.png" alt="" style={{ display: 'block', width: 180 }} />

        {/* Nombre */}
        <p
          className="font-anton text-[11px] tracking-[0.5em] uppercase mt-4.5"
        >
          Megatae
        </p>

        {/* Dots */}
        <div className="flex gap-2 mt-4.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`block w-2 h-2 bg-amber-50 sp-dot-${n}`}
              style={{ border: '1.5px solid #000', boxShadow: '2px 2px 0px #000' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
