/**
 * Banco colombiano para partidas reales. Las tildes y la Ñ se conservan.
 * La dificultad cuenta letras, no espacios: fácil 4–6, medio 7–9, difícil 10+.
 * Fuentes y revisión editorial: docs/diseno/fuentes-palabras.md.
 * @typedef {'capitales' | 'animales' | 'frutas' | 'comidas'} CategoriaPalabra
 * @typedef {'facil' | 'medio' | 'dificil'} DificultadPalabra
 * @typedef {{id: string, palabra: string, categoria: CategoriaPalabra, descripcion: string, dificultad: DificultadPalabra}} Palabra
 */

/** @type {Palabra[]} */
export const PALABRAS = [
  // Capitales: nombres reales, sin extenderlos para cambiar su dificultad.
  { id: 'capitales-bogota', palabra: 'BOGOTÁ', categoria: 'capitales', descripcion: 'Es la capital de Colombia.', dificultad: 'facil' },
  { id: 'capitales-cali', palabra: 'CALI', categoria: 'capitales', descripcion: 'Capital del Valle del Cauca.', dificultad: 'facil' },
  { id: 'capitales-pasto', palabra: 'PASTO', categoria: 'capitales', descripcion: 'Capital del departamento de Nariño.', dificultad: 'facil' },
  { id: 'capitales-tunja', palabra: 'TUNJA', categoria: 'capitales', descripcion: 'Capital del departamento de Boyacá.', dificultad: 'facil' },
  { id: 'capitales-neiva', palabra: 'NEIVA', categoria: 'capitales', descripcion: 'Capital del departamento del Huila.', dificultad: 'facil' },
  { id: 'capitales-quibdo', palabra: 'QUIBDÓ', categoria: 'capitales', descripcion: 'Capital del departamento del Chocó.', dificultad: 'facil' },
  { id: 'capitales-medellin', palabra: 'MEDELLÍN', categoria: 'capitales', descripcion: 'Capital del departamento de Antioquia.', dificultad: 'medio' },
  { id: 'capitales-armenia', palabra: 'ARMENIA', categoria: 'capitales', descripcion: 'Capital del departamento del Quindío.', dificultad: 'medio' },
  { id: 'capitales-pereira', palabra: 'PEREIRA', categoria: 'capitales', descripcion: 'Capital del departamento de Risaralda.', dificultad: 'medio' },
  { id: 'capitales-popayan', palabra: 'POPAYÁN', categoria: 'capitales', descripcion: 'Capital del departamento del Cauca.', dificultad: 'medio' },
  { id: 'capitales-sincelejo', palabra: 'SINCELEJO', categoria: 'capitales', descripcion: 'Capital del departamento de Sucre.', dificultad: 'medio' },
  { id: 'capitales-monteria', palabra: 'MONTERÍA', categoria: 'capitales', descripcion: 'Capital del departamento de Córdoba.', dificultad: 'medio' },
  { id: 'capitales-barranquilla', palabra: 'BARRANQUILLA', categoria: 'capitales', descripcion: 'Capital del departamento del Atlántico.', dificultad: 'dificil' },
  { id: 'capitales-bucaramanga', palabra: 'BUCARAMANGA', categoria: 'capitales', descripcion: 'Capital del departamento de Santander.', dificultad: 'dificil' },
  { id: 'capitales-villavicencio', palabra: 'VILLAVICENCIO', categoria: 'capitales', descripcion: 'Capital del departamento del Meta.', dificultad: 'dificil' },
  { id: 'capitales-santa-marta', palabra: 'SANTA MARTA', categoria: 'capitales', descripcion: 'Capital del departamento del Magdalena.', dificultad: 'dificil' },
  { id: 'capitales-puerto-carreno', palabra: 'PUERTO CARREÑO', categoria: 'capitales', descripcion: 'Capital del departamento del Vichada.', dificultad: 'dificil' },
  { id: 'capitales-san-jose-del-guaviare', palabra: 'SAN JOSÉ DEL GUAVIARE', categoria: 'capitales', descripcion: 'Capital del departamento del Guaviare.', dificultad: 'dificil' },

  // Fauna presente en Colombia; nombres comunes reconocidos.
  { id: 'animales-jaguar', palabra: 'JAGUAR', categoria: 'animales', descripcion: 'Gran felino americano de pelaje con manchas en rosetas.', dificultad: 'facil' },
  { id: 'animales-puma', palabra: 'PUMA', categoria: 'animales', descripcion: 'Felino de pelaje uniforme, también llamado león de montaña.', dificultad: 'facil' },
  { id: 'animales-danta', palabra: 'DANTA', categoria: 'animales', descripcion: 'Mamífero herbívoro con una pequeña trompa flexible.', dificultad: 'facil' },
  { id: 'animales-nutria', palabra: 'NUTRIA', categoria: 'animales', descripcion: 'Mamífero nadador que habita ríos y se alimenta de peces.', dificultad: 'facil' },
  { id: 'animales-neque', palabra: 'ÑEQUE', categoria: 'animales', descripcion: 'Roedor terrestre también conocido como guatín.', dificultad: 'facil' },
  { id: 'animales-iguana', palabra: 'IGUANA', categoria: 'animales', descripcion: 'Reptil de cola larga y cresta sobre el dorso.', dificultad: 'facil' },
  { id: 'animales-chiguiro', palabra: 'CHIGÜIRO', categoria: 'animales', descripcion: 'Gran roedor de los Llanos que suele vivir cerca del agua.', dificultad: 'medio' },
  { id: 'animales-armadillo', palabra: 'ARMADILLO', categoria: 'animales', descripcion: 'Mamífero cuyo cuerpo está protegido por un caparazón.', dificultad: 'medio' },
  { id: 'animales-ocelote', palabra: 'OCELOTE', categoria: 'animales', descripcion: 'Felino silvestre de tamaño mediano con pelaje manchado.', dificultad: 'medio' },
  { id: 'animales-perezoso', palabra: 'PEREZOSO', categoria: 'animales', descripcion: 'Mamífero arborícola conocido por sus movimientos lentos.', dificultad: 'medio' },
  { id: 'animales-anaconda', palabra: 'ANACONDA', categoria: 'animales', descripcion: 'Gran serpiente acuática que mata sus presas por constricción.', dificultad: 'medio' },
  { id: 'animales-guacamaya', palabra: 'GUACAMAYA', categoria: 'animales', descripcion: 'Ave de pico curvo, cola larga y plumaje colorido.', dificultad: 'medio' },
  { id: 'animales-oso-de-anteojos', palabra: 'OSO DE ANTEOJOS', categoria: 'animales', descripcion: 'También llamado oso andino; habita bosques de montaña.', dificultad: 'dificil' },
  { id: 'animales-delfin-rosado', palabra: 'DELFÍN ROSADO', categoria: 'animales', descripcion: 'Cetáceo de agua dulce presente en la Amazonía colombiana.', dificultad: 'dificil' },
  { id: 'animales-mono-aullador', palabra: 'MONO AULLADOR', categoria: 'animales', descripcion: 'Primate reconocido por sus fuertes vocalizaciones.', dificultad: 'dificil' },
  { id: 'animales-caiman-llanero', palabra: 'CAIMÁN LLANERO', categoria: 'animales', descripcion: 'Cocodrilo de agua dulce de la cuenca del Orinoco.', dificultad: 'dificil' },
  { id: 'animales-tortuga-carey', palabra: 'TORTUGA CAREY', categoria: 'animales', descripcion: 'Tortuga marina presente en los mares de Colombia.', dificultad: 'dificil' },
  { id: 'animales-titi-cabeciblanco', palabra: 'TITÍ CABECIBLANCO', categoria: 'animales', descripcion: 'Pequeño primate del norte colombiano con una cresta blanca.', dificultad: 'dificil' },

  // Frutas cultivadas o consumidas en Colombia; no se afirma endemismo.
  { id: 'frutas-pina', palabra: 'PIÑA', categoria: 'frutas', descripcion: 'Fruta tropical de cáscara rugosa y corona de hojas.', dificultad: 'facil' },
  { id: 'frutas-lulo', palabra: 'LULO', categoria: 'frutas', descripcion: 'Fruta de cáscara naranja y pulpa ácida usada en jugos.', dificultad: 'facil' },
  { id: 'frutas-borojo', palabra: 'BOROJÓ', categoria: 'frutas', descripcion: 'Fruto del Pacífico colombiano de pulpa marrón.', dificultad: 'facil' },
  { id: 'frutas-uchuva', palabra: 'UCHUVA', categoria: 'frutas', descripcion: 'Pequeño fruto amarillo protegido por un cáliz seco.', dificultad: 'facil' },
  { id: 'frutas-feijoa', palabra: 'FEIJOA', categoria: 'frutas', descripcion: 'Fruta aromática de cáscara verde cultivada en zonas frías.', dificultad: 'facil' },
  { id: 'frutas-gulupa', palabra: 'GULUPA', categoria: 'frutas', descripcion: 'Fruta de cáscara morada emparentada con el maracuyá.', dificultad: 'facil' },
  { id: 'frutas-guanabana', palabra: 'GUANÁBANA', categoria: 'frutas', descripcion: 'Fruta grande de piel verde y pulpa blanca.', dificultad: 'medio' },
  { id: 'frutas-maracuya', palabra: 'MARACUYÁ', categoria: 'frutas', descripcion: 'Fruta de pulpa ácida y aromática con numerosas semillas.', dificultad: 'medio' },
  { id: 'frutas-guayaba', palabra: 'GUAYABA', categoria: 'frutas', descripcion: 'Fruta utilizada para preparar el tradicional bocadillo.', dificultad: 'medio' },
  { id: 'frutas-aguacate', palabra: 'AGUACATE', categoria: 'frutas', descripcion: 'Fruto de pulpa cremosa y una semilla grande.', dificultad: 'medio' },
  { id: 'frutas-pitahaya', palabra: 'PITAHAYA', categoria: 'frutas', descripcion: 'Fruto de cactus con pequeñas semillas en su pulpa.', dificultad: 'medio' },
  { id: 'frutas-mandarina', palabra: 'MANDARINA', categoria: 'frutas', descripcion: 'Cítrico de gajos y cáscara que se retira fácilmente.', dificultad: 'medio' },
  { id: 'frutas-tamarindo', palabra: 'TAMARINDO', categoria: 'frutas', descripcion: 'Fruto en vaina de pulpa agridulce usado en bebidas.', dificultad: 'medio' },
  { id: 'frutas-ciruela', palabra: 'CIRUELA', categoria: 'frutas', descripcion: 'Fruta de hueso central cultivada en zonas andinas.', dificultad: 'medio' },
  { id: 'frutas-granadilla', palabra: 'GRANADILLA', categoria: 'frutas', descripcion: 'Fruta de cáscara quebradiza y pulpa dulce con semillas.', dificultad: 'dificil' },
  { id: 'frutas-chontaduro', palabra: 'CHONTADURO', categoria: 'frutas', descripcion: 'Fruto de palma que suele comerse cocido.', dificultad: 'dificil' },
  { id: 'frutas-tomate-de-arbol', palabra: 'TOMATE DE ÁRBOL', categoria: 'frutas', descripcion: 'Fruta andina ovalada muy utilizada para preparar jugos.', dificultad: 'dificil' },
  { id: 'frutas-mango-de-azucar', palabra: 'MANGO DE AZÚCAR', categoria: 'frutas', descripcion: 'Variedad pequeña y dulce, popular en el Caribe colombiano.', dificultad: 'dificil' },

  // Preparaciones tradicionales; las pistas describen versiones habituales.
  { id: 'comidas-arepa', palabra: 'AREPA', categoria: 'comidas', descripcion: 'Preparación redonda de masa de maíz.', dificultad: 'facil' },
  { id: 'comidas-tamal', palabra: 'TAMAL', categoria: 'comidas', descripcion: 'Masa con relleno que se cocina envuelta en hojas.', dificultad: 'facil' },
  { id: 'comidas-ajiaco', palabra: 'AJIACO', categoria: 'comidas', descripcion: 'Sopa bogotana con papas, pollo, mazorca y guascas.', dificultad: 'facil' },
  { id: 'comidas-mute', palabra: 'MUTE', categoria: 'comidas', descripcion: 'Sopa santandereana con maíz y carnes.', dificultad: 'facil' },
  { id: 'comidas-cocada', palabra: 'COCADA', categoria: 'comidas', descripcion: 'Dulce tradicional elaborado con coco.', dificultad: 'facil' },
  { id: 'comidas-oblea', palabra: 'OBLEA', categoria: 'comidas', descripcion: 'Galleta delgada que suele rellenarse con arequipe.', dificultad: 'facil' },
  { id: 'comidas-sancocho', palabra: 'SANCOCHO', categoria: 'comidas', descripcion: 'Sopa con carnes, tubérculos y plátano.', dificultad: 'medio' },
  { id: 'comidas-lechona', palabra: 'LECHONA', categoria: 'comidas', descripcion: 'Preparación tolimense de cerdo relleno y horneado.', dificultad: 'medio' },
  { id: 'comidas-bunuelo', palabra: 'BUÑUELO', categoria: 'comidas', descripcion: 'Bola frita de masa con queso.', dificultad: 'medio' },
  { id: 'comidas-pandebono', palabra: 'PANDEBONO', categoria: 'comidas', descripcion: 'Amasijo valluno horneado con queso y almidón de yuca.', dificultad: 'medio' },
  { id: 'comidas-empanada', palabra: 'EMPANADA', categoria: 'comidas', descripcion: 'Masa doblada que encierra un relleno salado.', dificultad: 'medio' },
  { id: 'comidas-changua', palabra: 'CHANGUA', categoria: 'comidas', descripcion: 'Caldo con leche, huevo, cebolla y cilantro.', dificultad: 'medio' },
  { id: 'comidas-bandeja-paisa', palabra: 'BANDEJA PAISA', categoria: 'comidas', descripcion: 'Plato antioqueño con fríjoles, arroz, carnes y acompañamientos.', dificultad: 'dificil' },
  { id: 'comidas-arroz-con-coco', palabra: 'ARROZ CON COCO', categoria: 'comidas', descripcion: 'Acompañamiento caribeño cocinado con leche de este fruto.', dificultad: 'dificil' },
  { id: 'comidas-mote-de-queso', palabra: 'MOTE DE QUESO', categoria: 'comidas', descripcion: 'Sopa caribeña preparada con ñame y queso costeño.', dificultad: 'dificil' },
  { id: 'comidas-arepa-de-huevo', palabra: 'AREPA DE HUEVO', categoria: 'comidas', descripcion: 'Fritura caribeña de maíz con un huevo dentro.', dificultad: 'dificil' },
  { id: 'comidas-sobrebarriga', palabra: 'SOBREBARRIGA', categoria: 'comidas', descripcion: 'Corte de res preparado sudado, entre otras formas.', dificultad: 'dificil' },
  { id: 'comidas-aborrajado', palabra: 'ABORRAJADO', categoria: 'comidas', descripcion: 'Plátano maduro con queso, rebozado y frito.', dificultad: 'dificil' },
];
