export function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/10 py-6 text-center text-white/50 text-sm">
      <p>2025 Megatae. Todos los derechos reservados.</p>
      <div className="mt-1 flex items-center justify-center gap-4">
        <a href="#" className="hover:text-white transition-colors">
          Términos y Condiciones
        </a>
        <span>·</span>
        <a href="#" className="hover:text-white transition-colors">
          Aviso de Privacidad
        </a>
      </div>
    </footer>
  );
}
