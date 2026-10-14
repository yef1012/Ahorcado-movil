# Banco de palabras — etapa 4

Archivo de datos: [`src/data/palabras.js`](../../src/data/palabras.js). Consulta de fuentes: 13 de octubre de 2026.

El banco contiene **72 entradas: 18 por categoría**, con al menos cuatro alternativas en cada combinación de categoría y dificultad. Exporta `PALABRAS`; cada registro contiene `id`, `palabra`, `categoria`, `descripcion` y `dificultad`. Los identificadores no dependen del orden del arreglo.

## Distribución comprobada

| Categoría | Fácil: 4–6 letras | Medio: 7–9 letras | Difícil: 10+ letras | Total |
|---|---:|---:|---:|---:|
| Capitales | 6 | 6 | 6 | 18 |
| Animales | 6 | 6 | 6 | 18 |
| Frutas | 6 | 8 | 4 | 18 |
| Comidas típicas | 6 | 6 | 6 | 18 |
| **Total** | **24** | **26** | **22** | **72** |

Se cuentan letras Unicode del texto en NFC; los espacios no cuentan. Se conservan las tildes, la diéresis y la Ñ para mostrarlas correctamente. Por ejemplo: `PIÑA` tiene 4 letras, `CHIGÜIRO` tiene 8, `CHONTADURO` tiene 10 y `SAN JOSÉ DEL GUAVIARE` tiene 18. Las vocales acentuadas se normalizan al comparar jugadas; la Ñ debe seguir siendo distinta de N en la lógica del juego. El banco no aplica esa transformación sobre el texto visible.

Las dificultades son una clasificación calculable por longitud, no una estimación de conocimiento cultural. No se agregaron palabras artificiales para alargar los nombres de las ciudades. La selección aleatoria y la prevención de repeticiones pertenecen a la lógica de juego, no a este archivo de datos.

## Capitales

La relación departamento–capital se comprobó en la tabla del [Ministerio de Educación, Ciencias Sociales, grado 3, página 81](https://contenidos.mineducacion.gov.co/ntg/men/archivos/Referentes_Calidad/Modelos_Flexibles/Escuela_Nueva/Guias_para_estudiantes/CS_Grado3_01.pdf), contrastada con la lista de [capitales departamentales del IGAC](https://www.igac.gov.co/sites/default/files/2024-11/SPB_Urbano_VF.pdf).

| Nivel | Entradas |
|---|---|
| Fácil | Bogotá, Cali, Pasto, Tunja, Neiva, Quibdó |
| Medio | Medellín, Armenia, Pereira, Popayán, Sincelejo, Montería |
| Difícil | Barranquilla, Bucaramanga, Villavicencio, Santa Marta, Puerto Carreño, San José del Guaviare |

Bogotá usa una pista sobre su condición de capital nacional. Puerto Carreño y San José del Guaviare también están identificadas como capitales en el [informe del DANE para Guaviare](https://www.dane.gov.co/files/investigaciones/planes-departamentos-ciudades/210521-InfoDane-Guaviare-San-Jose-del-Guaviare-etnico.pdf). No se incluyeron municipios que no sean capitales.

## Animales

Se usan nombres comunes de fauna presente en Colombia. No se afirma que todos sean endémicos ni se presentan cifras de población o estados de amenaza susceptibles de cambiar. Las pistas son descripciones breves originales.

| Entradas verificadas | Fuentes primarias |
|---|---|
| Jaguar, puma, danta, nutria, perezoso, anaconda, guacamaya y mono aullador | [Fauna del Parque Nacional Natural Tinigua](https://www.parquesnacionales.gov.co/nuestros-parques/pnn-tinigua/) y [registros de mamíferos del río Claro, Instituto Humboldt](https://i2d.humboldt.org.co/ceiba/resource?r=mamiferos_rio-claro&v=1.0) |
| Ñeque, chigüiro, armadillo y ocelote | [CAR: caracterización de fauna, POMCA del río Seco, página 99](https://www.car.gov.co/uploads/files/63f7c23aadb35.pdf) |
| Iguana | [Parques Nacionales: registro de fauna de la reserva Club Campestre de Cali](https://old.parquesnacionales.gov.co/portal/wp-content/uploads/2015/11/Resol_0182_231115_sgm.pdf) |
| Oso de anteojos | [Instituto Humboldt: ecología del oso andino](https://www.humboldt.org.co/noticias/pensar-en-la-conservacion-del-oso-andino-es-pensar-en-la-conservacion-de-los-bosques-de-los-paramos-y-de-nosotros-mismos-como-humanos) |
| Delfín rosado | [Parque Nacional Natural Amacayacu](https://www.parquesnacionales.gov.co/nuestros-parques/pnn-amacayacu/) |
| Caimán llanero | [Parques Nacionales: recuperación en el río Tomo](https://www.parquesnacionales.gov.co/sala-prensa/noticias/una-nueva-esperanza-para-el-caiman-llanero-parque-nacional-natural-el-tuparro-lidera-su-reintroduccion/) |
| Tortuga carey | [Parques Nacionales: investigación en Utría](https://www.parquesnacionales.gov.co/sala-prensa/monitoreo-e-investigacion-de-la-tortuga-carey-en-el-parque-nacional-natural-utria/) |
| Tití cabeciblanco | [Fundación Proyecto Tití: observación de sus poblaciones silvestres](https://proyectotiti.com/News/titi-tidbits-191cu225nto-tiempo-puede-vivir-un-tit237-cabeciblanco) |

Se conservó «oso de anteojos» como nombre común reconocido y su pista aclara el nombre «oso andino»; no se afirma que todos los individuos tengan marcas alrededor de ambos ojos. «Ñeque» corresponde al nombre común también registrado como guatín. «Chigüiro» conserva la diéresis.

## Frutas

La categoría agrupa frutas cultivadas o consumidas en Colombia; no exige un origen exclusivo colombiano.

- Piña, lulo, borojó, uchuva, feijoa, gulupa, guanábana, aguacate, pitahaya, granadilla, chontaduro, tomate de árbol y mango de azúcar están documentados en [ProColombia: frutas de Colombia](https://colombia.travel/es/frutas-de-colombia-riqueza-de-sabores).
- Maracuyá, guayaba y tamarindo figuran en el recorrido de [ProColombia por las frutas tropicales y sus regiones](https://colombia.travel/en/blog/discover-the-tropical-fruits-of-Colombia-and-the-wonderful-places-where-they-come-from).
- Mandarina y ciruela, incluidas como cultivos colombianos, se contrastaron con [AGROSAVIA: frutas tropicales de Colombia para el mundo](https://repository.agrosavia.co/server/api/core/bitstreams/df91b562-a1c2-4961-85ea-ca24c3375d57/content) y el [plan de Cundinamarca publicado por Minciencias](https://minciencias.gov.co/sites/default/files/upload/paginas/pedcti-cundinamarca.pdf).
- El uso de guayaba para bocadillo está documentado por [AGROSAVIA en su proyecto guayaba–bocadillo](https://vivo.agrosavia.co/display/proinv305). El consumo cocido del chontaduro se confirma en [AGROSAVIA: cultivos de oportunidad](https://www.agrosavia.co/noticias/colombia-ya-eligi%C3%B3-sus-cultivos-de-oportunidad-chontaduro-y-sidra).

## Comidas típicas

Las pistas describen preparaciones habituales, sin imponer una receta única a todas las regiones.

La fuente principal es el [Inventario de recetas de cocinas tradicionales colombianas del Ministerio de Cultura](https://patrimonio.mincultura.gov.co/SiteAssets/Paginas/INVENTARIO-DE-RECETAS-DE-COCINAS-TRADICIONALES-COLOMBIANAS/Matriz%20inventario%20actualizada.pdf). Se consultaron sus registros para arepas, tamales, ajiaco, mute, cocadas, sancocho, lechona, buñuelos, empanadas, changua, bandeja paisa, arroz con coco, mote de queso, sobrebarriga y aborrajados.

Referencias complementarias:

- [ProColombia: cinco comidas tradicionales](https://colombia.travel/en/blog/five-traditional-foods-tell-you-everything-about-colombia): bandeja paisa, ajiaco y tamal.
- [ProColombia: país de regiones](https://colombia.travel/es/blog/revista-colombia/pais-de-regiones): arepa de huevo y mote de queso.
- [Evaluación de características físicas y texturales del pandebono, investigación indexada por Minciencias](https://kujane.minciencias.gov.co/Record/UDEA2_ac7dc313a6690a943c994d32f4989c6d/Description): almidón de yuca y queso. Su presencia en la cocina valluna también está recogida en la [Biblioteca básica de cocinas tradicionales, tomo 3](https://patrimonio.mincultura.gov.co/SiteAssets/Paginas/Publicaciones-biblioteca-cocinas/biblioteca%203.pdf).
- [Biblioteca Nacional, Biblioteca básica de cocinas tradicionales, documento 221](https://siise.bibliotecanacional.gov.co/BBCC/Documents/View/221): obleas y acompañamiento con arequipe.

## Auditoría de los datos

Se ejecutó una comprobación de Node con aserciones sobre los 72 registros: identificadores únicos, palabras únicas, mayúsculas, normalización NFC, alfabeto español válido, descripciones no vacías, longitud compatible con dificultad, mínimo 15 entradas por categoría y varias alternativas por cada nivel. Todas las aserciones pasaron. También pasó ESLint para `src/data/palabras.js`.

Esta auditoría comprueba el banco. El funcionamiento de selección, teclado, pistas, temporizador, puntuación y navegación se valida por separado en las pruebas del juego.
