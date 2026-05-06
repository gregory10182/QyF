export const SUBJECTS = [
  {
    title: "Química General",
    description: "Conceptos fundamentales: estructura atómica, enlaces, estequiometría, soluciones y gases.",
    slug: "quimica-general",
    icon: "🧪",
    subtopics: [
      { title: "Estructura atómica y tabla periódica", slug: "estructura-atomica" },
      { title: "Enlaces químicos y geometría molecular", slug: "enlaces-quimicos" },
      { title: "Estequiometría y cálculos químicos", slug: "estequiometria" },
      { title: "Gases, líquidos y sólidos", slug: "estados-materia" },
      { title: "Soluciones y concentraciones", slug: "soluciones" }
    ]
  },
  {
    title: "Química Inorgánica",
    description: "Compuestos inorgánicos, ácidos y bases, coordinación y cristalografía.",
    slug: "quimica-inorganica",
    icon: "💎",
    subtopics: [
      { title: "Ácidos y bases", slug: "acidos-bases" },
      { title: "Química de coordinación", slug: "coordinacion" },
      { title: "Metales de transición", slug: "metales-transicion" },
      { title: "Simetría y teoría de grupos", slug: "simetria" },
      { title: "Estado sólido y cristalografía", slug: "cristalografia" }
    ]
  },
  {
    title: "Química Orgánica",
    description: "Nomenclatura, estereoquímica, grupos funcionales y mecanismos de reacción.",
    slug: "quimica-organica",
    icon: "⬡",
    subtopics: [
      { title: "Nomenclatura orgánica", slug: "nomenclatura" },
      { title: "Estereoquímica e isómeros", slug: "estereoquimica" },
      { title: "Hidrocarburos", slug: "hidrocarburos" },
      { title: "Sustitución y eliminación", slug: "sustitucion-eliminacion" },
      { title: "Alcoholes, éteres y aminas", slug: "alcoholes-aminas" },
      { title: "Compuestos aromáticos", slug: "aromaticos" }
    ]
  },
  {
    title: "Química Analítica",
    description: "Volumetrías, gravimetría, equilibrios e instrumentación analítica.",
    slug: "quimica-analitica",
    icon: "⚖️",
    subtopics: [
      { title: "Equilibrio químico", slug: "equilibrio-quimico" },
      { title: "Volumetrías ácido-base", slug: "volumetria-acido-base" },
      { title: "Volumetrías redox", slug: "volumetria-redox" },
      { title: "Gravimetría", slug: "gravimetria" },
      { title: "Instrumentación analítica", slug: "instrumentacion" }
    ]
  },
  {
    title: "Biología Celular",
    description: "Estructura celular, organelos, metabolismo y división celular.",
    slug: "biologia-celular",
    icon: "🔬",
    subtopics: [
      { title: "Membrana celular y transporte", slug: "membrana" },
      { title: "Respiración celular y mitocondrias", slug: "respiracion" },
      { title: "Ciclo celular, mitosis y meiosis", slug: "ciclo-celular" },
      { title: "Dogma central (ADN a Proteína)", slug: "dogma-central" },
      { title: "Señalización celular", slug: "senalizacion" }
    ]
  },
  {
    title: "Bioquímica",
    description: "Proteínas, enzimas, metabolismo intermediario y rutas bioquímicas.",
    slug: "bioquimica",
    icon: "🧬",
    subtopics: [
      { title: "Aminoácidos y proteínas", slug: "aminoacidos-proteinas" },
      { title: "Enzimas y cinética enzimática", slug: "enzimas" },
      { title: "Glucólisis y gluconeogénesis", slug: "glucolisis" },
      { title: "Ciclo de Krebs y cadena respiratoria", slug: "krebs" },
      { title: "Metabolismo de lípidos", slug: "lipidos" }
    ]
  }
];

export const NOMENCLATURE_TOPICS = [
  { title: "Química General", slug: "quimica-general", items: [
    { title: "Óxidos e hidruros", slug: "oxidos-hidruros" },
    { title: "Hidróxidos", slug: "hidroxidos" },
    { title: "Oxoácidos", slug: "oxoacidos" },
    { title: "Sales oxisales", slug: "sales-oxisales" },
    { title: "Sales haloideas", slug: "sales-haloideas" },
  ]},
  { title: "Química Orgánica", slug: "quimica-organica", items: [
    { title: "Alcanos, alquenos y alquinos", slug: "hidrocarburos" },
    { title: "Alcoholes, fenoles y éteres", slug: "alcoholes-fenoles" },
    { title: "Aldehídos y cetonas", slug: "aldehidos-cetonas" },
    { title: "Ácidos carboxílicos y derivados", slug: "acidos-carboxilicos" },
    { title: "Aminas y amidas", slug: "aminas-amidas" },
    { title: "Compuestos aromáticos", slug: "aromaticos" },
  ]},
  { title: "Química Inorgánica", slug: "quimica-inorganica", items: [
    { title: "Compuestos de coordinación", slug: "coordinacion" },
    { title: "Oxoácidos y oxisales de transición", slug: "oxoacidos-transicion" },
    { title: "Ácidos y bases (nomenclatura)", slug: "acidos-bases" },
  ]},
];