import { Link } from "react-router-dom";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Inicio", to: "/", active: true },
  { label: "Vende Recargas", to: "#", active: false },
  { label: "Registra tu Línea", to: "#", active: false },
  { label: "Conócenos", to: "#", active: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand border-b border-white/10 mb-3">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 sm:gap-5 shrink-0 px-2 sm:px-5">
          <Link to="/">
            <img
              src="/assets/logo-megatae.png"
              alt="Megatae Global"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>
          <div className="hidden sm:flex h-16 items-center gap-2.5 px-3">
            <SocialLink href="#" label="Facebook" icon={<IconFacebook />} />
            <SocialLink href="#" label="Instagram" icon={<IconInstagram />} />
            <SocialLink href="#" label="TikTok" icon={<IconTikTok />} />
            <SocialLink href="#" label="WhatsApp" icon={<IconWhatsApp />} />
          </div>
        </div>

        {/* Links - desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((l) =>
            l.active ? (
              <Link key={l.label} to={l.to} className="text-white font-medium">
                {l.label}
              </Link>
            ) : (
              <span
                key={l.label}
                className="text-white/50 cursor-default select-none"
                title="Próximamente"
              >
                {l.label}
              </span>
            )
          )}
        </div>

        {/* CTA - solo desktop */}
        <button className="hidden md:flex shrink-0 items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
          <IconUser />
          Ser socio
        </button>

        {/* Botón hamburgues */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 shrink-0"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <IconMenu />
        </button>
      </div>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* Panel derecha */}
      <div
        className={`fixed top-0 right-0 h-full w-64 max-w-[80%] bg-brand z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
          <img
            src="/assets/logo-megatae.png"
            alt="Megatae Global"
            className="h-8 w-auto object-contain"
          />
          <button
            className="flex items-center justify-center w-10 h-10"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <IconClose />
          </button>
        </div>

        {/* Contenido: ocupa el resto del alto disponible */}
        <div className="flex flex-col flex-1 px-4 py-6">
          {/* Links arriba */}
          <div className="flex flex-col gap-4 text-sm">
            {NAV_LINKS.map((l) =>
              l.active ? (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-white font-medium"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <span
                  key={l.label}
                  className="text-white/50 cursor-default select-none"
                  title="Próximamente"
                >
                  {l.label}
                </span>
              )
            )}
          </div>

          {/* Botón + redes abajo */}
          <div className="mt-auto flex flex-col gap-4">
            <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <IconUser />
              Ser socio
            </button>

            <div className="flex items-center gap-4 pt-5 border-t border-white/10">
              <SocialLink href="#" label="Facebook" icon={<IconFacebook />} />
              <SocialLink href="#" label="Instagram" icon={<IconInstagram />} />
              <SocialLink href="#" label="TikTok" icon={<IconTikTok />} />
              <SocialLink href="#" label="WhatsApp" icon={<IconWhatsApp />} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
    >
      {icon}
    </a>
  );
}

function IconUser() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.091.542 4.05 1.489 5.747L0 24l6.448-1.462A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.015-1.374l-.36-.213-3.728.845.875-3.626-.234-.373A9.818 9.818 0 0 1 12 2.182c5.428 0 9.818 4.39 9.818 9.818S17.428 21.818 12 21.818z" />
    </svg>
  );
}


function IconMenu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}