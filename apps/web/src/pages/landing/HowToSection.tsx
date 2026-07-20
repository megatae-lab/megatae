const STEPS = [
  {
    img: "/assets/icon-registro.png",
    title: "Paso 1",
    desc: "Regístrate y elige tu compañía favorita.",
  },
  {
    img: "/assets/icon-pago.png",
    title: "Paso 2",
    desc: "Realiza tu pago y adjunta comprobante.",
  },
  {
    img: "/assets/icon-activacion.png",
    title: "Paso 3",
    desc: "Validamos tu pago.",
  },
  {
    img: "/assets/icon-recibe.png",
    title: "Paso 4",
    desc: "¡Recibe tu eSIM por correo!",
  },
];

export function HowToSection() {
  return (
    <section className="bg-navy-900 py-16 px-4">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-white font-black text-3xl md:text-5xl mb-2">
          ¿Cómo obtener tu eSIM?
        </h2>
        <p className="text-white/60 mb-12">Sigue estos 4 sencillos pasos</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <img
                src={step.img}
                alt={step.title}
                className="w-24 h-24 object-contain drop-shadow-lg"
              />
              <p className="text-brand font-bold text-2xl">{step.title}</p>
              <p className="text-white/95 text-base leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block border-2 border-brand text-white hover:bg-brand font-bold px-8 py-3 rounded-full text-sm transition-colors"
          >
            Me interesa
          </a>
        </div>
      </div>
    </section>
  );
}
