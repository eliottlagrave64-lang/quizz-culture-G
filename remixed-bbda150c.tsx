import { useState, useEffect, useRef, useCallback } from "react";

// ─── PALETTE & CONFIG ───────────────────────────────────────────────────────
const STRIPE_LINK = "https://buy.stripe.com/VOTRE_LIEN_STRIPE"; // À remplacer

const CATEGORIES = [
  { id: "monuments", label: "Monuments Antiques", emoji: "🏛️", color: "#C9783A" },
  { id: "unesco", label: "Sites UNESCO", emoji: "🌿", color: "#3A7A4A" },
  { id: "histoire", label: "Histoire & Civilisations", emoji: "📜", color: "#7A3A9A" },
  { id: "geographie", label: "Géographie Mondiale", emoji: "🌍", color: "#3A6A9A" },
  { id: "art", label: "Art & Architecture", emoji: "🎨", color: "#9A3A5A" },
  { id: "nature", label: "Nature & Merveilles", emoji: "🌋", color: "#3A8A6A" },
];

const MODES = [
  { id: "classic", label: "Quiz Classique", emoji: "🏛️", desc: "10 questions, ton rythme", free: true },
  { id: "speed", label: "Contre-la-montre", emoji: "⚡", desc: "60 secondes chrono !", free: true },
  { id: "survival", label: "Survie", emoji: "❤️", desc: "3 vies, jusqu'où iras-tu ?", free: false },
  { id: "world", label: "Tour du Monde", emoji: "🌍", desc: "Carte interactive par pays", free: false },
  { id: "daily", label: "Daily Challenge", emoji: "🏆", desc: "Classement mondial quotidien", free: false },
  { id: "duel", label: "Duel", emoji: "⚔️", desc: "Défie un ami en temps réel", free: false },
];

const FALLBACK_QUESTIONS = {
  monuments: [
    { monument: "Colisée", emoji: "🏟️", loc: "Rome, Italie", q: "En quelle année le Colisée fut-il inauguré ?", answers: ["70 apr. J.-C.", "80 apr. J.-C.", "100 apr. J.-C.", "50 apr. J.-C."], correct: 1, fact: "Inauguré en 80 apr. J.-C. sous l'empereur Titus, il pouvait accueillir 80 000 spectateurs." },
    { monument: "Parthénon", emoji: "🏛️", loc: "Athènes, Grèce", q: "À quelle déesse est dédié le Parthénon ?", answers: ["Héra", "Artémis", "Athéna", "Aphrodite"], correct: 2, fact: "Dédié à Athéna Parthénos, déesse de la sagesse, il fut construit entre 447 et 432 av. J.-C." },
    { monument: "Machu Picchu", emoji: "🗻", loc: "Pérou", q: "Quel peuple a construit le Machu Picchu ?", answers: ["Aztèques", "Mayas", "Incas", "Olmèques"], correct: 2, fact: "Construit par les Incas au XVe siècle, il fut redécouvert par Hiram Bingham en 1911." },
    { monument: "Grande Pyramide", emoji: "🔺", loc: "Gizeh, Égypte", q: "Pour quel pharaon la Grande Pyramide fut-elle bâtie ?", answers: ["Ramsès II", "Toutânkhamon", "Khéops", "Chéphren"], correct: 2, fact: "La pyramide de Khéops est la plus haute des trois pyramides de Gizeh." },
    { monument: "Angkor Vat", emoji: "🛕", loc: "Cambodge", q: "Quelle religion était initialement pratiquée à Angkor Vat ?", answers: ["Bouddhisme", "Taoïsme", "Islam", "Hindouisme"], correct: 3, fact: "Temple hindou dédié à Vishnou, il devint bouddhiste au XIIIe siècle." },
    { monument: "Stonehenge", emoji: "🗿", loc: "Angleterre", q: "Stonehenge daterait d'environ combien d'années ?", answers: ["1 000 ans", "3 000 ans", "5 000 ans", "10 000 ans"], correct: 2, fact: "Les premières structures datent de 3000 av. J.-C., soit environ 5 000 ans." },
  ],
  unesco: [
    { monument: "Venise", emoji: "🚤", loc: "Italie", q: "Sur combien d'îles la ville de Venise est-elle construite ?", answers: ["50", "118", "200", "75"], correct: 1, fact: "Venise est bâtie sur 118 îles reliées par 177 canaux et 391 ponts." },
    { monument: "Mont-Saint-Michel", emoji: "🏰", loc: "Normandie, France", q: "Le Mont-Saint-Michel est classé UNESCO depuis quelle année ?", answers: ["1979", "1985", "1992", "2000"], correct: 0, fact: "Inscrit en 1979, c'est l'un des sites les plus visités de France avec 3M de visiteurs/an." },
    { monument: "Grande Barrière de Corail", emoji: "🐠", loc: "Australie", q: "Quelle est la longueur approximative de la Grande Barrière de Corail ?", answers: ["1 000 km", "2 300 km", "3 500 km", "500 km"], correct: 1, fact: "Avec ses 2 300 km, c'est la plus grande structure vivante visible depuis l'espace." },
    { monument: "Alhambra", emoji: "🕌", loc: "Grenade, Espagne", q: "Quelle civilisation a construit l'Alhambra ?", answers: ["Romaine", "Wisigothique", "Maure", "Byzantine"], correct: 2, fact: "Palais des sultans nasrides, l'Alhambra est un chef-d'œuvre de l'architecture arabo-andalouse." },
    { monument: "Serengeti", emoji: "🦁", loc: "Tanzanie", q: "Combien de gnous participent à la Grande Migration du Serengeti ?", answers: ["500 000", "1,5 million", "3 millions", "300 000"], correct: 1, fact: "1,5 million de gnous + 200 000 zèbres font cette migration chaque année." },
    { monument: "Galápagos", emoji: "🦎", loc: "Équateur", q: "Quel scientifique s'est inspiré des Galápagos pour sa théorie de l'évolution ?", answers: ["Newton", "Einstein", "Darwin", "Pasteur"], correct: 2, fact: "Darwin visita les Galápagos en 1835, ce qui l'inspira pour 'L'Origine des espèces'." },
  ],
  histoire: [
    { monument: "Tour Eiffel", emoji: "🗼", loc: "Paris, France", q: "Pour quelle occasion la Tour Eiffel a-t-elle été construite ?", answers: ["Couronnement de Napoléon", "Exposition Universelle 1889", "Révolution Française", "JO 1900"], correct: 1, fact: "Conçue par Gustave Eiffel, elle devait être démontée après l'exposition." },
    { monument: "Mur de Berlin", emoji: "🧱", loc: "Berlin, Allemagne", q: "En quelle année le Mur de Berlin est-il tombé ?", answers: ["1985", "1987", "1989", "1991"], correct: 2, fact: "Le 9 novembre 1989, la chute du Mur marqua la fin de la Guerre Froide." },
    { monument: "Versailles", emoji: "🏯", loc: "France", q: "Quel roi de France a fait construire Versailles ?", answers: ["Louis XIV", "Louis XVI", "François Ier", "Henri IV"], correct: 0, fact: "Louis XIV, le Roi-Soleil, fit de Versailles le centre du pouvoir dès 1682." },
    { monument: "Acropole", emoji: "🏛️", loc: "Athènes, Grèce", q: "Quel homme d'État supervisa la construction du Parthénon ?", answers: ["Socrate", "Alexandre", "Périclès", "Solon"], correct: 2, fact: "Périclès lança ce grand programme de reconstruction après les guerres médiques." },
    { monument: "Colonne Trajane", emoji: "🏺", loc: "Rome, Italie", q: "Quelle victoire romaine la Colonne Trajane célèbre-t-elle ?", answers: ["Contre Carthage", "Contre les Gaulois", "Contre les Daces", "Contre les Parthes"], correct: 2, fact: "Érigée en 113 ap. J.-C., elle commémore la conquête de la Dacie (actuelle Roumanie)." },
    { monument: "Versailles", emoji: "🌹", loc: "France", q: "Combien de pièces compte le château de Versailles ?", answers: ["700", "2 300", "5 000", "1 200"], correct: 1, fact: "Le château compte 2 300 pièces dont la célèbre Galerie des Glaces." },
  ],
  geographie: [
    { monument: "Himalaya", emoji: "⛰️", loc: "Asie du Sud", q: "Quelle est l'altitude de l'Everest ?", answers: ["7 849 m", "8 411 m", "8 849 m", "9 001 m"], correct: 2, fact: "L'Everest culmine à 8 849 m, réévalué en 2020 par une expédition sino-népalaise." },
    { monument: "Amazonie", emoji: "🌳", loc: "Amérique du Sud", q: "Quelle proportion d'oxygène mondial l'Amazonie produit-elle ?", answers: ["5%", "10%", "20%", "50%"], correct: 2, fact: "L'Amazonie abrite 10% de toutes les espèces vivantes connues sur Terre." },
    { monument: "Sahara", emoji: "🏜️", loc: "Afrique du Nord", q: "Quelle est la superficie du Sahara ?", answers: ["5 millions km²", "9 millions km²", "15 millions km²", "3 millions km²"], correct: 1, fact: "Plus grand désert chaud du monde, le Sahara est aussi grand que les États-Unis." },
    { monument: "Nil", emoji: "🌊", loc: "Afrique", q: "Quelle est la longueur du Nil ?", answers: ["4 130 km", "5 500 km", "6 650 km", "7 800 km"], correct: 2, fact: "Le Nil traverse 11 pays africains avant de se jeter dans la Méditerranée." },
    { monument: "Lac Baïkal", emoji: "💧", loc: "Sibérie, Russie", q: "Quelle proportion d'eau douce non gelée mondiale contient le Baïkal ?", answers: ["5%", "10%", "20%", "30%"], correct: 2, fact: "Le lac Baïkal est le plus profond du monde avec 1 642 mètres." },
    { monument: "Islande", emoji: "🌋", loc: "Atlantique Nord", q: "Sur combien de plaques tectoniques l'Islande repose-t-elle ?", answers: ["1", "2", "3", "4"], correct: 1, fact: "L'Islande chevauche les plaques eurasienne et nord-américaine." },
  ],
  art: [
    { monument: "Joconde", emoji: "🖼️", loc: "Musée du Louvre, Paris", q: "Qui a peint la Joconde ?", answers: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"], correct: 2, fact: "Peinte entre 1503 et 1519, la Joconde est le tableau le plus visité au monde." },
    { monument: "Sagrada Família", emoji: "⛪", loc: "Barcelone, Espagne", q: "Quel architecte a conçu la Sagrada Família ?", answers: ["Mies van der Rohe", "Antoni Gaudí", "Le Corbusier", "Zaha Hadid"], correct: 1, fact: "Gaudí y consacra 43 ans de sa vie. Elle devrait être achevée vers 2026." },
    { monument: "Chapelle Sixtine", emoji: "✨", loc: "Vatican", q: "Combien d'années Michel-Ange a-t-il mis à peindre le plafond de la Chapelle Sixtine ?", answers: ["2 ans", "4 ans", "10 ans", "20 ans"], correct: 1, fact: "De 1508 à 1512, Michel-Ange peignit 300 figures sur 500 m² de plafond." },
    { monument: "Louvre", emoji: "🏛️", loc: "Paris, France", q: "Combien d'œuvres le Musée du Louvre contient-il environ ?", answers: ["15 000", "35 000", "480 000", "100 000"], correct: 2, fact: "Le Louvre possède 480 000 œuvres dont seulement 35 000 sont exposées." },
    { monument: "Tour de Pise", emoji: "🗼", loc: "Pise, Italie", q: "De combien de degrés la Tour de Pise est-elle inclinée ?", answers: ["2°", "4°", "8°", "12°"], correct: 1, fact: "L'inclinaison est due à un sol instable. Des travaux ont réduit l'angle de 5,5° à 4°." },
    { monument: "Opéra de Sydney", emoji: "🎭", loc: "Australie", q: "En quelle année l'Opéra de Sydney a-t-il été inauguré ?", answers: ["1963", "1973", "1983", "1993"], correct: 1, fact: "Conçu par Jørn Utzon, il a été inscrit au patrimoine mondial de l'UNESCO en 2007." },
  ],
  nature: [
    { monument: "Grand Canyon", emoji: "🏜️", loc: "Arizona, États-Unis", q: "Quelle est la profondeur maximale du Grand Canyon ?", answers: ["800 m", "1 200 m", "1 800 m", "2 500 m"], correct: 2, fact: "Le Grand Canyon mesure 446 km de long et révèle 2 milliards d'années de géologie." },
    { monument: "Aurores Boréales", emoji: "🌌", loc: "Arctique", q: "Quel phénomène crée les aurores boréales ?", answers: ["Réfraction de la lune", "Particules solaires & champ magnétique", "Volcans sous-marins", "Cristaux de glace"], correct: 1, fact: "Les particules solaires excitent les molécules d'azote et d'oxygène de l'atmosphère." },
    { monument: "Iguazú", emoji: "💦", loc: "Argentine/Brésil", q: "Les chutes d'Iguazú sont-elles plus larges que les chutes du Niagara ?", answers: ["Oui, bien plus", "Non, moins larges", "Même largeur", "Ça dépend de la saison"], correct: 0, fact: "Iguazú s'étend sur 2,7 km contre 1,2 km pour le Niagara — Eleanor Roosevelt s'exclama : 'Pauvre Niagara !'." },
    { monument: "Forêt de Bornéo", emoji: "🦧", loc: "Indonésie/Malaisie", q: "Quelle espèce emblématique vit uniquement à Bornéo et Sumatra ?", answers: ["Gorille", "Chimpanzé", "Orang-outan", "Gibbon"], correct: 2, fact: "L'orang-outan de Bornéo est en danger critique d'extinction, victime de la déforestation." },
    { monument: "Dead Sea", emoji: "🧂", loc: "Israël/Jordanie", q: "Quelle est la salinité de la Mer Morte ?", answers: ["10%", "20%", "34%", "50%"], correct: 2, fact: "La Mer Morte est 9 fois plus salée que l'océan, ce qui la rend insupportable à la vie." },
    { monument: "Patagonie", emoji: "🏔️", loc: "Argentine/Chili", q: "Quel glacier emblématique se trouve en Patagonie argentine ?", answers: ["Fox Glacier", "Vatnajökull", "Perito Moreno", "Mer de glace"], correct: 2, fact: "Le glacier Perito Moreno avance de 2 m par jour et est l'un des rares à ne pas reculer." },
  ],
};

// ─── COMPOSANTS ─────────────────────────────────────────────────────────────

function StarRating({ score, total }) {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.8) return <span style={{ fontSize: 28 }}>⭐⭐⭐</span>;
  if (pct >= 0.5) return <span style={{ fontSize: 28 }}>⭐⭐</span>;
  return <span style={{ fontSize: 28 }}>⭐</span>;
}

function ProgressBar({ value, max, color = "#4A90D9" }) {
  return (
    <div style={{ height: 5, background: "#1a1a2e", borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 20, background: color + "22", color, border: `1px solid ${color}44`, marginBottom: 6 }}>
      {children}
    </span>
  );
}

// ─── APP PRINCIPALE ──────────────────────────────────────────────────────────

export default function WorldQuiz() {
  const [screen, setScreen] = useState("home"); // home | mode | quiz | result | premium | leaderboard
  const [isPremium, setIsPremium] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCat, setSelectedCat] = useState("monuments");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [streak, setStreak] = useState(3);
  const [totalPlayed, setTotalPlayed] = useState(12);
  const [showFact, setShowFact] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const timerRef = useRef(null);

  const currentQuestion = questions[currentQ];

  // ── GÉNÉRATION IA ──────────────────────────────────────────────────────────
  const generateQuestionsAI = useCallback(async (category, count = 6) => {
    setLoading(true);
    setAiError(false);
    try {
      const catLabel = CATEGORIES.find(c => c.id === category)?.label || category;
      const prompt = `Tu es un expert en culture générale spécialisé en patrimoine mondial, monuments historiques et géographie. 
Génère ${count} questions de quiz en français sur la thématique : "${catLabel}".
Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après.
Format exact :
{"questions":[{"monument":"Nom du lieu","emoji":"emoji","loc":"Ville, Pays","q":"Question ?","answers":["Réponse A","Réponse B","Réponse C","Réponse D"],"correct":0,"fact":"Fait intéressant court."}]}
- correct = index (0-3) de la bonne réponse
- Les mauvaises réponses doivent être plausibles
- Les faits doivent être surprenants et éducatifs
- Varier les niveaux de difficulté`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.questions && parsed.questions.length > 0) {
        setLoading(false);
        return parsed.questions;
      }
    } catch (e) {
      setAiError(true);
    }
    setLoading(false);
    return FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS.monuments;
  }, []);

  // ── LANCER QUIZ ────────────────────────────────────────────────────────────
  const launchQuiz = useCallback(async (mode, cat) => {
    clearInterval(timerRef.current);
    const qs = await generateQuestionsAI(cat, mode === "survival" ? 20 : 6);
    const shuffled = [...qs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setLives(3);
    setAnswered(false);
    setChosen(null);
    setShowFact(false);
    setTimeLeft(60);
    if (mode === "speed") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setScreen("result"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    setScreen("quiz");
  }, [generateQuestionsAI]);

  // Shuffle answers when question changes
  useEffect(() => {
    if (!currentQuestion) return;
    const idxs = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    setShuffledAnswers(idxs);
  }, [currentQ, questions]);

  // ── RÉPONDRE ───────────────────────────────────────────────────────────────
  const handleAnswer = (answerIdx) => {
    if (answered) return;
    setAnswered(true);
    setChosen(answerIdx);
    setShowFact(true);
    const correct = answerIdx === currentQuestion.correct;
    if (correct) {
      setScore(s => s + 1);
    } else {
      if (selectedMode === "survival") {
        setLives(l => {
          if (l - 1 <= 0) { setTimeout(() => { clearInterval(timerRef.current); setScreen("result"); }, 1400); }
          return l - 1;
        });
      }
    }
    if (selectedMode !== "speed") {
      // auto-advance for speed mode handled separately
    }
  };

  const nextQuestion = () => {
    const next = currentQ + 1;
    if (selectedMode === "classic" && next >= questions.length) {
      clearInterval(timerRef.current);
      setTotalPlayed(p => p + 1);
      setScreen("result");
      return;
    }
    if (selectedMode === "survival" && lives <= 0) {
      setScreen("result");
      return;
    }
    setCurrentQ(next % questions.length);
    setAnswered(false);
    setChosen(null);
    setShowFact(false);
  };

  const goHome = () => { clearInterval(timerRef.current); setScreen("home"); };

  // ── STYLES ─────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0a0a1a;color:#e8e4dc;font-family:'DM Sans',sans-serif}
    .app{max-width:560px;margin:0 auto;padding:20px 16px;min-height:100vh}
    h1,h2,.display{font-family:'Playfair Display',serif}
    .card{background:linear-gradient(135deg,#12122a,#1a1a38);border:1px solid #ffffff14;border-radius:20px;padding:20px}
    .btn{display:block;width:100%;padding:14px;border-radius:14px;border:none;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;transition:all 0.18s;text-align:left}
    .btn-primary{background:linear-gradient(135deg,#4A90D9,#2563B0);color:white}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px #4A90D933}
    .btn-gold{background:linear-gradient(135deg,#C9943A,#8B6010);color:white}
    .btn-gold:hover{transform:translateY(-1px);box-shadow:0 8px 24px #C9943A44}
    .btn-outline{background:transparent;border:1px solid #ffffff22;color:#e8e4dc}
    .btn-outline:hover{background:#ffffff0a}
    .answer-btn{background:#12122a;border:1.5px solid #ffffff18;color:#e8e4dc;border-radius:14px;padding:14px 16px;width:100%;font-family:'DM Sans',sans-serif;font-size:14px;text-align:left;cursor:pointer;transition:all 0.18s;margin-bottom:8px}
    .answer-btn:hover:not(:disabled){border-color:#4A90D9;background:#4A90D912}
    .answer-btn.correct{border-color:#3fa35f;background:#3fa35f18;color:#7dd99a}
    .answer-btn.wrong{border-color:#D94A4A;background:#D94A4A12;color:#ff9090}
    .answer-btn:disabled{cursor:default;opacity:0.85}
    .chip{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500}
    .screen-fade{animation:fadeIn 0.3s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .glow{text-shadow:0 0 24px #4A90D944}
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#0a0a1a} ::-webkit-scrollbar-thumb{background:#ffffff22;border-radius:2px}
  `;

  // ══════════════════════════════════════════════════════════════════════════
  // ÉCRANS
  // ══════════════════════════════════════════════════════════════════════════

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div className="app screen-fade">
      <style>{css}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🏛️</div>
        <h1 style={{ fontSize: 30, background: "linear-gradient(135deg,#e8e4dc,#C9943A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>WorldQuiz</h1>
        <p style={{ fontSize: 13, color: "#ffffff66", letterSpacing: "0.1em", textTransform: "uppercase" }}>Monuments · UNESCO · Civilisations</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#C9943A" }}>🔥 {streak}</div>
          <div style={{ fontSize: 11, color: "#ffffff55" }}>jours de suite</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#4A90D9" }}>{totalPlayed}</div>
          <div style={{ fontSize: 11, color: "#ffffff55" }}>quiz joués</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#3fa35f" }}>73%</div>
          <div style={{ fontSize: 11, color: "#ffffff55" }}>réussite</div>
        </div>
      </div>

      {/* Modes */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#ffffff44", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Modes de jeu</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {MODES.map(m => (
            <div key={m.id} className="card" onClick={() => {
              if (!m.free && !isPremium) { setScreen("premium"); return; }
              setSelectedMode(m.id);
              setScreen("mode");
            }} style={{ cursor: "pointer", padding: 16, border: m.free ? "1px solid #ffffff14" : "1px solid #C9943A33", position: "relative", transition: "all 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              {!m.free && !isPremium && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 12 }}>🔒</span>}
              <div style={{ fontSize: 22, marginBottom: 6 }}>{m.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "#ffffff55" }}>{m.desc}</div>
              <div style={{ marginTop: 8 }}>
                {m.free ? <Badge color="#3fa35f">Gratuit</Badge> : <Badge color="#C9943A">Premium</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium banner */}
      {!isPremium && (
        <div className="card" style={{ marginTop: 16, border: "1px solid #C9943A44", background: "linear-gradient(135deg,#1a120a,#2a1a0a)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#C9943A", marginBottom: 2 }}>✨ Passer Premium</div>
              <div style={{ fontSize: 12, color: "#ffffff66" }}>Tous les modes + Daily Challenge</div>
            </div>
            <button className="btn btn-gold" style={{ width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setScreen("premium")}>
              3,99 €/mois
            </button>
          </div>
        </div>
      )}
      {isPremium && (
        <div className="card" style={{ marginTop: 16, border: "1px solid #3fa35f44", background: "linear-gradient(135deg,#0a1a0a,#0a2a0a)", textAlign: "center", padding: 12 }}>
          <span style={{ fontSize: 13, color: "#7dd99a" }}>✓ Compte Premium actif</span>
        </div>
      )}
    </div>
  );

  // ── MODE / CATÉGORIE ──────────────────────────────────────────────────────
  if (screen === "mode") return (
    <div className="app screen-fade">
      <style>{css}</style>
      <button style={{ background: "none", border: "none", color: "#ffffff66", fontSize: 13, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }} onClick={goHome}>
        ← Retour
      </button>

      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Choisis une thématique</h2>
      <p style={{ fontSize: 13, color: "#ffffff55", marginBottom: 20 }}>Mode : {MODES.find(m => m.id === selectedMode)?.label}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="card" onClick={() => setSelectedCat(cat.id)}
            style={{ cursor: "pointer", padding: 14, border: selectedCat === cat.id ? `1.5px solid ${cat.color}` : "1px solid #ffffff14", background: selectedCat === cat.id ? cat.color + "18" : undefined, transition: "all 0.18s" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.label}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => launchQuiz(selectedMode, selectedCat)} style={{ textAlign: "center" }}>
        {loading ? "⏳ Génération IA en cours..." : "🚀 Lancer le quiz"}
      </button>
      {aiError && <p style={{ fontSize: 12, color: "#ff9090", marginTop: 8, textAlign: "center" }}>⚠️ Questions locales utilisées (pas de connexion)</p>}
    </div>
  );

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    if (loading) return (
      <div className="app" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <style>{css}</style>
        <div style={{ fontSize: 40, marginBottom: 16, animation: "fadeIn 0.5s ease" }}>🌍</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Génération IA en cours…</h2>
        <p style={{ fontSize: 13, color: "#ffffff55" }}>Claude prépare tes questions</p>
      </div>
    );

    if (!currentQuestion) return null;

    const catColor = CATEGORIES.find(c => c.id === selectedCat)?.color || "#4A90D9";

    return (
      <div className="app screen-fade">
        <style>{css}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button style={{ background: "none", border: "none", color: "#ffffff44", fontSize: 13, cursor: "pointer" }} onClick={goHome}>✕</button>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {selectedMode === "survival" && (
              <span style={{ fontSize: 14 }}>{"❤️".repeat(lives)}{"🖤".repeat(Math.max(0, 3 - lives))}</span>
            )}
            {selectedMode === "speed" && (
              <span style={{ fontSize: 14, color: timeLeft <= 15 ? "#D94A4A" : "#4A90D9", fontWeight: 700 }}>⏱ {timeLeft}s</span>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: catColor }}>Score : {score}</span>
          </div>
        </div>

        {/* Progress */}
        {selectedMode === "classic" && <ProgressBar value={currentQ} max={questions.length} color={catColor} />}
        {selectedMode === "speed" && <ProgressBar value={timeLeft} max={60} color={timeLeft <= 15 ? "#D94A4A" : "#4A90D9"} />}

        {/* Monument card */}
        <div className="card" style={{ marginBottom: 16, display: "flex", gap: 14, alignItems: "center", border: `1px solid ${catColor}33`, background: `linear-gradient(135deg,${catColor}0a,#12122a)` }}>
          <span style={{ fontSize: 36 }}>{currentQuestion.emoji}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{currentQuestion.monument}</div>
            <div style={{ fontSize: 12, color: "#ffffff55" }}>📍 {currentQuestion.loc}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#ffffff33" }}>
            {selectedMode === "classic" ? `${currentQ + 1}/${questions.length}` : `#${currentQ + 1}`}
          </div>
        </div>

        {/* Question */}
        <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 16, fontWeight: 500 }}>{currentQuestion.q}</p>

        {/* Answers */}
        <div style={{ marginBottom: 12 }}>
          {shuffledAnswers.map(idx => {
            let cls = "answer-btn";
            if (answered) {
              if (idx === currentQuestion.correct) cls += " correct";
              else if (idx === chosen && chosen !== currentQuestion.correct) cls += " wrong";
            }
            return (
              <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={answered}>
                <span style={{ marginRight: 10, fontSize: 12, opacity: 0.5, fontFamily: "monospace" }}>
                  {["A", "B", "C", "D"][[0,1,2,3].indexOf(shuffledAnswers.indexOf(idx))]}
                </span>
                {currentQuestion.answers[idx]}
              </button>
            );
          })}
        </div>

        {/* Fact */}
        {showFact && (
          <div className="card screen-fade" style={{ marginBottom: 14, border: chosen === currentQuestion.correct ? "1px solid #3fa35f55" : "1px solid #D94A4A55", background: chosen === currentQuestion.correct ? "#3fa35f0a" : "#D94A4A0a", padding: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 4, fontWeight: 600, color: chosen === currentQuestion.correct ? "#7dd99a" : "#ff9090" }}>
              {chosen === currentQuestion.correct ? "✓ Correct !" : "✗ Raté !"}
            </div>
            <div style={{ fontSize: 13, color: "#ffffff99", lineHeight: 1.5 }}>💡 {currentQuestion.fact}</div>
          </div>
        )}

        {/* Next button */}
        {answered && selectedMode !== "speed" && (
          <button className="btn btn-primary screen-fade" onClick={nextQuestion} style={{ textAlign: "center" }}>
            {selectedMode === "classic" && currentQ + 1 >= questions.length ? "Voir mes résultats →" : "Question suivante →"}
          </button>
        )}
      </div>
    );
  }

  // ── RÉSULTATS ─────────────────────────────────────────────────────────────
  if (screen === "result") {
    const total = selectedMode === "classic" ? questions.length : currentQ;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const catColor = CATEGORIES.find(c => c.id === selectedCat)?.color || "#4A90D9";

    return (
      <div className="app screen-fade">
        <style>{css}</style>

        <div className="card" style={{ textAlign: "center", padding: 32, marginBottom: 16, border: `1px solid ${catColor}44` }}>
          <StarRating score={score} total={total} />
          <div style={{ fontSize: 52, fontFamily: "'Playfair Display',serif", fontWeight: 700, margin: "12px 0 4px", background: `linear-gradient(135deg,#e8e4dc,${catColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {score}<span style={{ fontSize: 28, opacity: 0.6 }}>/{total}</span>
          </div>
          <div style={{ fontSize: 13, color: "#ffffff55", marginBottom: 8 }}>bonnes réponses</div>
          <div style={{ fontSize: 15, color: "#ffffff99", marginBottom: 20 }}>
            {pct >= 80 ? "🏆 Excellent ! Tu es un expert." : pct >= 50 ? "👏 Très bien ! Continue comme ça." : "📚 Explore encore le monde !"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[["✅", score, "Correctes"], ["❌", total - score, "Ratées"], ["📊", pct + "%", "Réussite"]].map(([icon, val, label]) => (
              <div key={label} style={{ background: "#0a0a1a", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 16 }}>{icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{val}</div>
                <div style={{ fontSize: 11, color: "#ffffff44" }}>{label}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => launchQuiz(selectedMode, selectedCat)} style={{ textAlign: "center", marginBottom: 8 }}>
            🔄 Rejouer
          </button>
          <button className="btn btn-outline" onClick={goHome} style={{ textAlign: "center" }}>
            🏠 Accueil
          </button>
        </div>

        {!isPremium && (
          <div className="card" style={{ border: "1px solid #C9943A44", background: "linear-gradient(135deg,#1a120a,#2a1a0a)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#C9943A", marginBottom: 6 }}>✨ Débloquer Premium</div>
            <div style={{ fontSize: 13, color: "#ffffff66", marginBottom: 12 }}>Accède à tous les modes, le Daily Challenge, les classements et des explications détaillées.</div>
            <button className="btn btn-gold" onClick={() => setScreen("premium")} style={{ textAlign: "center" }}>
              Essayer pour 3,99 €/mois
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── PREMIUM ───────────────────────────────────────────────────────────────
  if (screen === "premium") return (
    <div className="app screen-fade">
      <style>{css}</style>
      <button style={{ background: "none", border: "none", color: "#ffffff44", fontSize: 13, cursor: "pointer", marginBottom: 20 }} onClick={() => setScreen("home")}>← Retour</button>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
        <h1 style={{ fontSize: 26, background: "linear-gradient(135deg,#e8e4dc,#C9943A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>WorldQuiz Premium</h1>
        <p style={{ fontSize: 13, color: "#ffffff55" }}>Le patrimoine mondial sans limites</p>
      </div>

      <div className="card" style={{ border: "1px solid #C9943A44", background: "linear-gradient(135deg,#1a120a,#2a1a0a)", marginBottom: 16 }}>
        {[
          ["🌍", "Carte du monde interactive", "Explore par pays et région"],
          ["🏆", "Daily Challenge mondial", "Classement quotidien"],
          ["❤️", "Mode Survie", "3 vies, jusqu'où iras-tu ?"],
          ["⚔️", "Mode Duel", "Défie tes amis en temps réel"],
          ["📖", "Explications détaillées", "Apprends en jouant"],
          ["📊", "Stats & progression", "Suis ton évolution"],
          ["🚫", "Sans publicité", "Expérience pure"],
          ["♾️", "Questions illimitées", "Générées par IA Claude"],
        ].map(([icon, title, sub]) => (
          <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #ffffff08" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#ffffff55" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#C9943A18", border: "1px solid #C9943A44", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#C9943A", fontFamily: "'Playfair Display',serif" }}>3,99 €</div>
        <div style={{ fontSize: 13, color: "#ffffff66", marginBottom: 4 }}>par mois · résiliation à tout moment</div>
        <div style={{ fontSize: 12, color: "#3fa35f" }}>= 1 café par mois ☕</div>
      </div>

      <button className="btn btn-gold" style={{ textAlign: "center", marginBottom: 10 }} onClick={() => { setIsPremium(true); setScreen("home"); }}>
        🚀 S'abonner maintenant (demo)
      </button>
      <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
        <button className="btn btn-outline" style={{ textAlign: "center", fontSize: 12, color: "#ffffff44" }}>
          Payer via Stripe (prod)
        </button>
      </a>
      <p style={{ fontSize: 11, color: "#ffffff33", textAlign: "center", marginTop: 10 }}>Sécurisé par Stripe · Annulation à tout moment</p>
    </div>
  );

  return null;
}
