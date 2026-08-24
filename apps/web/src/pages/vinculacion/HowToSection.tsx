const STEPS = [
  {
    img: "/assets/icon-identificador.png",
    title: "Paso 1",
    desc: "Identifica  tu compañía.",
  },
  {
    img: "/assets/icon-oficial.png",
    title: "Paso 2",
    desc: "Accede al portal oficial.",
  },
  {
    img: "/assets/icon-formulario.png",
    title: "Paso 3",
    desc: "Completa el formulario.",
  },
  {
    img: "/assets/icon-confirmacion.png",
    title: "Paso 4",
    desc: "Confirma y activa",
  },
  {
    img: "/assets/icon-solicitud.png",
    title: "Paso 5",
    desc: "Solicita tu recarga y listo",
  },
];

export function HowToSection() {
  return (
    <section className="bg-navy-900 py-12 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-white font-black text-2xl md:text-4xl mb-1">
          ¿Cómo registrar tu Línea?
        </h2>
        <p className="text-white/60 text-sm mb-10">Sigue estos 5 sencillos pasos</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <img
                src={step.img}
                alt={step.title}
                className="w-32 h-36 object-contain rounded-xl drop-shadow-lg"
              />
              <p className="text-brand font-bold text-xl">{step.title}</p>
              <p className="text-white text-sm leading-snug">{step.desc}</p>
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
            Registar Ahora
          </a>
        </div>
      </div>

    </section>
  );
}





