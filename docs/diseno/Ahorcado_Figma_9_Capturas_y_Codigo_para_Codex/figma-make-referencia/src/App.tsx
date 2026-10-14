import { useEffect, useState, type ReactNode } from "react";

type Screen =
  | "splash"
  | "home"
  | "instructions"
  | "categories"
  | "game"
  | "result"
  | "stats"
  | "settings";

type IconName =
  | "play"
  | "book"
  | "chart"
  | "settings"
  | "back"
  | "bulb"
  | "heart"
  | "clock"
  | "star"
  | "sound"
  | "vibrate"
  | "palette"
  | "trash"
  | "trophy"
  | "check"
  | "map"
  | "paw"
  | "fruit"
  | "food"
  | "shuffle";

const iconPaths: Record<IconName, ReactNode> = {
  play: <path d="m9 7 8 5-8 5V7Z" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></>,
  chart: <><path d="M5 20V10" /><path d="M12 20V4" /><path d="M19 20v-7" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-2.78 2.78-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.1 1.65V21h-3.8v-.09A1.8 1.8 0 0 0 9 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06-2.78-2.78.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H3v-3.8h.09A1.8 1.8 0 0 0 4.6 9a1.8 1.8 0 0 0-.36-1.98l-.06-.06 2.78-2.78.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1.1-1.65V3h3.8v.09A1.8 1.8 0 0 0 15 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06 2.78 2.78-.06.06A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 1.65 1.1H21v3.8h-.09A1.8 1.8 0 0 0 19.4 15Z" /></>,
  back: <path d="m15 18-6-6 6-6" />,
  bulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.1 14.8A6 6 0 1 1 16 14.7c-.7.6-1 1.3-1 2.3H9c0-1-.3-1.6-.9-2.2Z" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  sound: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15 9a4 4 0 0 1 0 6" /><path d="M18 6a8 8 0 0 1 0 12" /></>,
  vibrate: <><path d="M8 5h8v14H8z" /><path d="m4 8-2 4 2 4M20 8l2 4-2 4" /></>,
  palette: <><path d="M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3.8A5.2 5.2 0 0 0 21 8.8C21 5.6 17 3 12 3Z" /><circle cx="7.5" cy="10" r=".8" /><circle cx="10" cy="6.5" r=".8" /><circle cx="15" cy="7" r=".8" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 3h6l1 4H8l1-4Z" /><path d="m6 7 1 14h10l1-14M10 11v6M14 11v6" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></>,
  paw: <><circle cx="8" cy="9" r="2" /><circle cx="16" cy="9" r="2" /><circle cx="5.5" cy="14" r="1.7" /><circle cx="18.5" cy="14" r="1.7" /><path d="M8 18c0-3 1.8-5 4-5s4 2 4 5c0 2-1.7 3-4 3s-4-1-4-3Z" /></>,
  fruit: <><path d="M12 8c-5-3-8 1-7 6 1 6 5 8 7 5 2 3 6 1 7-5 1-5-2-9-7-6Z" /><path d="M12 8c0-3 2-5 5-5M12 7c-2-3-4-3-6-2" /></>,
  food: <><path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M16 3v18M16 3c4 2 4 8 0 10" /></>,
  shuffle: <><path d="M4 7h3c5 0 5 10 10 10h3" /><path d="m17 14 3 3-3 3M4 17h3c2 0 3.2-1.5 4.2-3M14 7c1-1 2-2 3-2h3M17 2l3 3-3 3" /></>,
};

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

function PrimaryButton({ children, icon, onClick, secondary = false }: { children: ReactNode; icon?: IconName; onClick?: () => void; secondary?: boolean }) {
  return <button className={`primary-button ${secondary ? "secondary" : ""}`} onClick={onClick}>{icon && <Icon name={icon} />}{children}</button>;
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="app-header"><button className="icon-button" onClick={onBack} aria-label="Volver"><Icon name="back" /></button><div><span className="eyebrow">EL AHORCADO MÓVIL</span><strong>{title}</strong></div><div className="header-mark">A</div></header>;
}

function Hangman({ compact = false }: { compact?: boolean }) {
  return <svg className={`hangman ${compact ? "compact" : ""}`} viewBox="0 0 220 190" role="img" aria-label="Ilustración del juego del ahorcado">
    <path className="wood" d="M30 174h160M56 174V20h92M56 48l28-28M148 20v27" />
    <circle className="rope" cx="148" cy="67" r="20" />
    <path className="rope" d="M148 87v43M148 101l-25 18M148 101l24 18M148 130l-20 30M148 130l20 30" />
    <path className="accent" d="M139 65h5M152 65h5M141 76c5 4 9 4 14 0" />
    <path className="leaf" d="M23 162c3-17 14-29 29-34-1 17-11 29-29 34ZM188 166c-1-14-10-24-23-28 0 14 8 24 23 28Z" />
  </svg>;
}

function GameLogo({ size = 48 }: { size?: number }) {
  return <svg className="game-logo" width={size} height={size} viewBox="0 0 52 52" role="img" aria-label="Logo de El Ahorcado Móvil">
    <defs><linearGradient id="logoGreen" x1="8" y1="5" x2="44" y2="47"><stop stopColor="#43B85A" /><stop offset="1" stopColor="#176B36" /></linearGradient></defs>
    <rect x="2" y="2" width="48" height="48" rx="16" fill="url(#logoGreen)" />
    <path d="M14 38h24M18 38V13h15M33 13v7" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="33" cy="25" r="5" fill="none" stroke="#DDF5DF" strokeWidth="2.8" />
    <path d="M33 30v7m0-4-4 3m4-3 4 3" fill="none" stroke="#DDF5DF" strokeWidth="2.8" strokeLinecap="round" />
    <circle cx="14" cy="13" r="2.2" fill="#F7D34A" />
  </svg>;
}

function PremiumGameArt() {
  return <svg className="premium-art" viewBox="0 0 340 208" role="img" aria-label="Ilustración vectorial de un juego del ahorcado inspirado en Colombia">
    <defs>
      <linearGradient id="sky" x1="60" y1="10" x2="260" y2="190"><stop stopColor="#F1FFF1" /><stop offset="1" stopColor="#B7E2BB" /></linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9A724B" /><stop offset="1" stopColor="#68462F" /></linearGradient>
      <filter id="artShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#175E2A" floodOpacity=".18" /></filter>
    </defs>
    <path d="M23 170c27-42 55-50 84-25 26-52 78-64 112-18 28-22 62-7 89 43H23Z" fill="url(#sky)" />
    <path d="M18 171c31-14 52-11 72 2 31-27 74-30 104-2 35-21 73-18 128 7" fill="none" stroke="#82C88A" strokeWidth="3" strokeLinecap="round" />
    <g opacity=".48" fill="none" stroke="#65B46F" strokeWidth="1.5"><path d="M271 43c15 8 23 22 24 40M277 58c9-2 16-6 20-12M286 72c-8-2-14-6-18-12" /><path d="M49 75c8-15 20-24 36-27M62 61c-1-7-3-12-8-17M72 54c5 1 11 0 17-4" /></g>
    <ellipse cx="174" cy="182" rx="108" ry="13" fill="#217B3A" opacity=".12" />
    <g filter="url(#artShadow)">
      <path d="M83 170V37h112M83 68l31-31M195 37v28" fill="none" stroke="url(#wood)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 171h51" stroke="#68462F" strokeWidth="11" strokeLinecap="round" />
      <path d="M195 37v30" stroke="#31563B" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(195 86)">
        <circle r="20" fill="#FFFDF6" stroke="#246F38" strokeWidth="4" />
        <path d="M-7-3h3m8 0h3M-8 8c5 4 11 4 16 0" fill="none" stroke="#246F38" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M0 20v43M0 32l-23 18M0 32l23 18M0 63l-19 27M0 63l19 27" fill="none" stroke="#246F38" strokeWidth="5" strokeLinecap="round" />
        <path d="M-15-18c9-8 22-5 29 2" fill="none" stroke="#F7D34A" strokeWidth="5" strokeLinecap="round" />
      </g>
    </g>
    <g transform="translate(247 104) rotate(7)" filter="url(#artShadow)">
      <rect width="59" height="48" rx="14" fill="white" />
      <path d="M0 31h59" stroke="#F4CE38" strokeWidth="4" />
      <path d="M0 38h59" stroke="#2E77B7" strokeWidth="4" />
      <path d="M0 45h59" stroke="#C94747" strokeWidth="4" />
      <text x="29.5" y="25" textAnchor="middle" fill="#26783C" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="18">A?</text>
    </g>
    <path d="M36 166c3-20 14-33 33-38-1 19-12 32-33 38Zm270 7c-2-18-12-30-29-35 1 18 10 30 29 35Z" fill="#5AB867" />
    <path d="M36 166c12-12 21-21 33-38m237 45c-8-13-18-25-29-35" fill="none" stroke="#27793C" strokeWidth="2" />
  </svg>;
}

function Splash({ go }: { go: (s: Screen) => void }) {
  const [loading, setLoading] = useState(18);
  useEffect(() => {
    const timer = window.setInterval(() => setLoading(value => Math.min(value + 8, 100)), 140);
    return () => window.clearInterval(timer);
  }, []);
  return <main className="screen splash-screen premium-splash">
    <div className="splash-brand"><GameLogo size={78} /></div>
    <div className="splash-copy"><p className="overline">UN RETO HECHO EN COLOMBIA</p><h1>El Ahorcado<br /><em>Móvil</em></h1><p>Palabras, cultura y diversión en cada partida.</p></div>
    <div className="splash-art"><PremiumGameArt /></div>
    <div className="loading-block"><div><span>Cargando experiencia</span><b>{loading}%</b></div><i><span style={{ width: `${loading}%` }} /></i></div>
    <button className="splash-enter" onClick={() => go("home")}>{loading === 100 ? "ENTRAR AL JUEGO" : "CONTINUAR"} <Icon name="play" size={18} /></button>
  </main>;
}

function Home({ go }: { go: (s: Screen) => void }) {
  const [playerName, setPlayerName] = useState(() => typeof window !== "undefined" ? window.localStorage.getItem("playerName") : null);
  const [draftName, setDraftName] = useState("");
  const items: { label: string; caption: string; icon: IconName; screen: Screen }[] = [
    { label: "Instrucciones", caption: "Aprende las reglas", icon: "book", screen: "instructions" },
    { label: "Estadísticas", caption: "Consulta tu progreso", icon: "chart", screen: "stats" },
    { label: "Configuración", caption: "Personaliza tu juego", icon: "settings", screen: "settings" },
  ];
  const saveName = () => {
    const cleanName = draftName.trim();
    if (!cleanName) return;
    window.localStorage.setItem("playerName", cleanName);
    setPlayerName(cleanName);
  };
  return <main className="screen home-screen">
    <header className="premium-header">
      <div className="brand-lockup"><GameLogo /><div><span>EL AHORCADO</span><strong>Móvil</strong></div></div>
      <button className="profile-button" aria-label="Perfil del jugador">{playerName ? playerName.charAt(0).toUpperCase() : <Icon name="settings" size={19} />}</button>
    </header>
    <div className="welcome-copy"><span>HOLA{playerName ? `, ${playerName.toUpperCase()}` : ""}</span><h1>¿Qué palabra<br />descubrimos hoy?</h1></div>
    <section className="premium-hero">
      <div className="colombia-label"><span /><b>DESAFÍO COLOMBIANO</b></div>
      <PremiumGameArt />
      <div className="hero-message"><small>NUEVA PARTIDA</small><strong>Explora Colombia<br />letra por letra</strong></div>
    </section>
    <button className="play-now" onClick={() => go("categories")}><span className="play-glyph"><Icon name="play" size={25} /></span><span><b>JUGAR AHORA</b><small>Elige categoría y dificultad</small></span><i>›</i></button>
    <section className="premium-menu">{items.map(item => <button key={item.label} className="premium-menu-card" onClick={() => go(item.screen)}><span className={`custom-icon icon-${item.icon}`}><Icon name={item.icon} /></span><span><strong>{item.label}</strong><small>{item.caption}</small></span><span className="menu-arrow">›</span></button>)}</section>
    {!playerName && <div className="name-overlay"><div className="name-card"><GameLogo size={58} /><span className="eyebrow">ANTES DE COMENZAR</span><h2>¿Cómo te llamas?</h2><p>Usaremos tu nombre para personalizar la experiencia.</p><label>Nombre del jugador<input value={draftName} onChange={event => setDraftName(event.target.value)} onKeyDown={event => event.key === "Enter" && saveName()} placeholder="Escribe tu nombre" maxLength={20} autoFocus /></label><PrimaryButton icon="play" onClick={saveName}>Guardar y continuar</PrimaryButton></div></div>}
  </main>;
}

function Instructions({ go }: { go: (s: Screen) => void }) {
  const rules = [
    ["01", "Elige tu desafío", "Selecciona una categoría colombiana y un nivel de dificultad.", "map"],
    ["02", "Descubre las letras", "Toca una letra: si aparece, se revelarán todas sus posiciones.", "check"],
    ["03", "Evita seis errores", "Cada fallo completa una etapa. Al sexto, termina la partida.", "heart"],
    ["04", "Usa pistas con estrategia", "Las pistas revelan una letra, pero reducen el puntaje final.", "bulb"],
    ["05", "Gana y suma puntos", "Completa la palabra antes de agotar tus oportunidades.", "trophy"],
  ] as const;
  return <main className="screen scroll-screen"><Header title="Cómo jugar" onBack={() => go("home")} /><div className="page-intro"><h1>Aprender es parte del juego</h1><p>Reglas sencillas para convertirte en experto.</p></div>
    <div className="rule-list">{rules.map(([n, title, text, icon]) => <article className="rule-card" key={n}><span className="rule-number">{n}</span><div className="rule-icon"><Icon name={icon} /></div><div><strong>{title}</strong><p>{text}</p></div></article>)}</div>
    <section className="difficulty-info enhanced"><span className="tag">NIVELES Y PUNTUACIÓN</span><div><b>Fácil</b><i>2 pistas · x1</i><b>Medio</b><i>1 pista · x2</i><b>Difícil</b><i>90 s · x3</i></div></section>
    <PrimaryButton icon="play" onClick={() => go("categories")}>¡Entendido, a jugar!</PrimaryButton>
  </main>;
}

function Categories({ go }: { go: (s: Screen) => void }) {
  const [category, setCategory] = useState("Capitales");
  const [difficulty, setDifficulty] = useState("Medio");
  const categories: [string, string, IconName][] = [["Capitales", "Ciudades de Colombia", "map"], ["Animales", "Fauna colombiana", "paw"], ["Frutas", "Sabores tropicales", "fruit"], ["Comidas típicas", "Nuestra cocina", "food"], ["Aleatoria", "Una sorpresa colombiana", "shuffle"]];
  const details: Record<string, string[]> = {
    Fácil: ["4–6 letras", "2 pistas", "Sin límite", "x1"],
    Medio: ["7–9 letras", "1 pista", "Sin límite", "x2"],
    Difícil: ["10+ letras", "Sin pistas", "90 segundos", "x3"],
  };
  return <main className="screen scroll-screen"><Header title="Nueva partida" onBack={() => go("home")} /><div className="page-intro compact-intro"><span className="step">PASO 1 DE 2</span><h1>Elige una categoría</h1><p>¿Sobre qué quieres jugar hoy?</p></div>
    <div className="category-grid">{categories.map(([name, caption, icon]) => <button className={`category-card ${category === name ? "selected" : ""}`} key={name} onClick={() => setCategory(name)}><span><Icon name={icon} /></span><strong>{name}</strong><small>{caption}</small>{category === name && <i><Icon name="check" size={14} /></i>}</button>)}</div>
    <div className="difficulty-select"><span className="step">PASO 2 DE 2</span><h2>Elige la dificultad</h2><div>{["Fácil", "Medio", "Difícil"].map(level => <button className={difficulty === level ? "active" : ""} onClick={() => setDifficulty(level)} key={level}>{level}</button>)}</div><div className="level-details">{details[difficulty].map((detail, index) => <span key={detail}><b>{index === 3 ? "BONO" : ["PALABRAS", "PISTAS", "TIEMPO"][index]}</b>{detail}</span>)}</div></div>
    <div className="selection-summary"><Icon name="check" size={17} /><span><small>SELECCIÓN ACTUAL</small><strong>{category} · {difficulty}</strong></span></div>
    <PrimaryButton icon="play" onClick={() => go("game")}>Comenzar partida</PrimaryButton>
  </main>;
}

function GameHangman({ errors }: { errors: number }) {
  return <svg className="stage-hangman" viewBox="0 0 220 190" aria-label={`${errors} de 6 errores`}>
    <path className="stage-wood" d="M28 176h165M54 176V18h102M54 50l32-32M156 18v36" />
    {errors >= 1 && <circle cx="156" cy="72" r="19" />}
    {errors >= 2 && <path d="M156 91v45" />}
    {errors >= 3 && <path d="m156 104-27 20" />}
    {errors >= 4 && <path d="m156 104 27 20" />}
    {errors >= 5 && <path d="m156 136-22 32" />}
    {errors >= 6 && <path d="m156 136 22 32" />}
    {errors > 0 && <path className="stage-face" d="M149 69h2m10 0h2m-12 10c4-3 8-3 12 0" />}
    <path className="stage-ground" d="M19 177c34-8 63-7 88 0 30-10 61-9 94 1" />
  </svg>;
}

function Game({ go, finish }: { go: (s: Screen) => void; finish: (won: boolean, score: number, lives: number) => void }) {
  const [letters, setLetters] = useState<string[]>([]);
  const [confirmExit, setConfirmExit] = useState(false);
  const target = "BOGOTA";
  const correctLetters = [...new Set(target.split(""))];
  const errors = letters.filter(letter => !target.includes(letter)).length;
  const score = Math.max(0, letters.filter(letter => target.includes(letter)).length * 180 - errors * 40);
  const keyboard = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  const selectLetter = (letter: string) => {
    if (letters.includes(letter)) return;
    const next = [...letters, letter];
    setLetters(next);
    const nextErrors = next.filter(item => !target.includes(item)).length;
    const completed = correctLetters.every(item => next.includes(item));
    if (completed) window.setTimeout(() => finish(true, score + 180, 6 - nextErrors), 300);
    if (nextErrors >= 6) window.setTimeout(() => finish(false, score, 0), 300);
  };
  const useHint = () => {
    const missing = correctLetters.find(letter => !letters.includes(letter));
    if (missing) selectLetter(missing);
  };
  return <main className="screen game-screen"><header className="game-header"><button className="icon-button" onClick={() => setConfirmExit(true)}><Icon name="back" /></button><div><span>CAPITALES DE COLOMBIA</span><strong>Nivel medio · x2</strong></div><button className="score-chip"><Icon name="star" size={16} /> {score}</button></header>
    <div className="game-status"><span><Icon name="heart" size={18} /> <b>{6 - errors}</b> vidas</span><span className="error-dots">{[0,1,2,3,4,5].map(index => <i className={index < errors ? "lost" : ""} key={index} />)}</span><span><Icon name="clock" size={18} /> <b>01:24</b></span></div>
    <div className="hangman-stage"><GameHangman errors={errors} /><span className="progress-label">{errors} / 6 errores</span></div>
    <section className="word-area"><span className="eyebrow">ADIVINA LA CAPITAL</span><div className="word">{target.split("").map((letter, index) => <span key={index} className={letters.includes(letter) ? "revealed" : ""}>{letters.includes(letter) ? (index === 5 ? "Á" : letter) : ""}</span>)}</div><p>Pista: Está ubicada en la región Andina</p></section>
    <div className="keyboard">{keyboard.map(letter => { const used = letters.includes(letter); const correct = used && target.includes(letter); return <button disabled={used} className={correct ? "used correct" : used ? "used wrong" : ""} key={letter} onClick={() => selectLetter(letter)}>{letter}</button>; })}</div>
    <button className="hint-button" onClick={useHint}><Icon name="bulb" size={19} /> Usar pista <small>1 disponible</small></button>
    {confirmExit && <div className="confirm-overlay"><div><span className="setting-icon"><Icon name="back" /></span><h2>¿Salir de la partida?</h2><p>El progreso de esta ronda no se guardará.</p><PrimaryButton onClick={() => go("categories")}>Salir de la partida</PrimaryButton><button className="text-button" onClick={() => setConfirmExit(false)}>Seguir jugando</button></div></div>}
  </main>;
}

function Result({ go, won, score, lives }: { go: (s: Screen) => void; won: boolean; score: number; lives: number }) {
  return <main className="screen result-screen">
    {won && <div className="confetti"><i /><i /><i /><i /><i /><i /></div>}<div className={`result-badge ${won ? "" : "defeat"}`}><Icon name={won ? "trophy" : "heart"} size={46} /></div>
    <span className="eyebrow">{won ? "DESAFÍO COMPLETADO" : "FIN DE LA RONDA"}</span><h1>{won ? "¡LO LOGRASTE!" : "SE TERMINÓ LA PARTIDA"}</h1><p className="result-sub">{won ? "Descubriste la palabra correcta" : "No te rindas, cada intento enseña"}</p>
    <div className="answer-card"><small>LA PALABRA ERA</small><strong>BOGOTÁ</strong><p>Capital de Colombia</p></div>
    <div className="points"><span><Icon name="star" /><b>{score}</b><small>Puntos</small></span><span><Icon name="clock" /><b>01:32</b><small>Tiempo</small></span><span><Icon name="heart" /><b>{lives}</b><small>Vidas</small></span></div>
    <div className="streak-card"><div><Icon name={won ? "trophy" : "bulb"} /></div><p><strong>{won ? "¡Gran conocimiento!" : "Consejo para la próxima"}</strong><span>{won ? "Sigue explorando palabras de Colombia" : "Prueba una vocal antes de usar tu pista"}</span></p></div>
    <PrimaryButton icon="play" onClick={() => go("categories")}>{won ? "Jugar de nuevo" : "Reintentar"}</PrimaryButton><button className="text-button" onClick={() => go("home")}>Volver al inicio</button>
  </main>;
}

function Stats({ go }: { go: (s: Screen) => void }) {
  const ranking = [["1", "Laura M.", "9.840"], ["2", "Andrés C.", "9.210"], ["3", "Sofía R.", "8.760"], ["4", "Tú", "8.420"], ["5", "Mateo G.", "7.980"], ["6", "Valentina P.", "7.620"]];
  return <main className="screen scroll-screen"><Header title="Estadísticas" onBack={() => go("home")} /><div className="stats-hero"><div><span>PORCENTAJE DE VICTORIAS</span><strong>78<small>%</small></strong><p>¡Vas por buen camino!</p></div><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16" /><circle className="fill" cx="21" cy="21" r="16" /></svg></div>
    <div className="stat-grid"><div><Icon name="play" /><strong>48</strong><span>Partidas</span></div><div><Icon name="trophy" /><strong>37</strong><span>Victorias</span></div><div><Icon name="heart" /><strong>11</strong><span>Derrotas</span></div><div><Icon name="star" /><strong>5</strong><span>Mejor racha</span></div></div>
    <div className="section-title"><div><span className="eyebrow">CLASIFICACIÓN</span><h2>Mejores puntajes</h2></div><span>Top 10</span></div>
    <div className="ranking">{ranking.map(([pos, name, score]) => <div className={name === "Tú" ? "you" : ""} key={pos}><span className="position">{pos}</span><span className="avatar">{name[0]}</span><strong>{name}{name === "Tú" && <small>TU POSICIÓN</small>}</strong><b>{score} pts</b></div>)}</div>
  </main>;
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return <button aria-label={active ? "Desactivar" : "Activar"} className={`toggle ${active ? "on" : ""}`} onClick={onClick}><span /></button>;
}

function Settings({ go }: { go: (s: Screen) => void }) {
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [theme, setTheme] = useState("Claro");
  return <main className="screen scroll-screen"><Header title="Configuración" onBack={() => go("home")} /><div className="page-intro compact-intro"><h1>A tu manera</h1><p>Personaliza tu experiencia de juego.</p></div>
    <section className="settings-group"><span className="group-label">SONIDO Y RESPUESTA</span><div className="setting-row"><span className="setting-icon"><Icon name="sound" /></span><div><strong>Sonidos</strong><small>Efectos y música del juego</small></div><Toggle active={sound} onClick={() => setSound(!sound)} /></div><div className="setting-row"><span className="setting-icon"><Icon name="vibrate" /></span><div><strong>Vibración</strong><small>Respuesta al tocar letras</small></div><Toggle active={vibration} onClick={() => setVibration(!vibration)} /></div></section>
    <section className="settings-group"><span className="group-label">APARIENCIA</span><div className="setting-heading"><span className="setting-icon"><Icon name="palette" /></span><div><strong>Tema visual</strong><small>Elige cómo quieres ver la app</small></div></div><div className="theme-picker">{["Claro", "Oscuro", "Sistema"].map(item => <button className={theme === item ? "active" : ""} onClick={() => setTheme(item)} key={item}><i className={item.toLowerCase()} />{item}{theme === item && <Icon name="check" size={15} />}</button>)}</div></section>
    <section className="settings-group danger-zone"><span className="group-label">DATOS</span><button className="delete-row"><span className="setting-icon"><Icon name="trash" /></span><div><strong>Borrar estadísticas</strong><small>Elimina todo tu progreso</small></div><span>›</span></button></section>
    <div className="about-card"><div className="mini-logo">¿A?</div><p><strong>El Ahorcado Móvil</strong><span>Versión 1.0.0 · Hecho en Colombia</span></p></div>
  </main>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [result, setResult] = useState({ won: true, score: 0, lives: 0 });
  const finishGame = (won: boolean, score: number, lives: number) => {
    setResult({ won, score, lives });
    setScreen("result");
  };
  const screens: Record<Screen, ReactNode> = {
    splash: <Splash go={setScreen} />, home: <Home go={setScreen} />, instructions: <Instructions go={setScreen} />,
    categories: <Categories go={setScreen} />, game: <Game go={setScreen} finish={finishGame} />, result: <Result go={setScreen} {...result} />,
    stats: <Stats go={setScreen} />, settings: <Settings go={setScreen} />,
  };
  return <div className="app-shell"><div className="phone-frame">{screens[screen]}</div></div>;
}
