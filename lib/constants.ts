import type { AssetType, Session, MacroSnapshot } from './types'

export const LOCAL_USER_ID = 'local'

// ── Sessions (heures Paris) ───────────────────────────────────────────────────

export const SESSIONS: Record<Session, { startH: number; startM: number; endH: number; endM: number; label: string; color: string }> = {
  asia:     { startH: 0,  startM: 0,  endH: 9,  endM: 0,  label: 'Session Asie',       color: '#a855f7' },
  london:   { startH: 8,  startM: 0,  endH: 17, endM: 0,  label: 'London Open',         color: '#00c8ff' },
  overlap:  { startH: 13, startM: 30, endH: 17, endM: 0,  label: 'London / NY Overlap', color: '#f59e0b' },
  newyork:  { startH: 13, startM: 30, endH: 22, endM: 0,  label: 'New York Open',       color: '#00e5a0' },
  off:      { startH: 22, startM: 0,  endH: 24, endM: 0,  label: 'Hors session',        color: '#374151' },
}

// ── Asset types ───────────────────────────────────────────────────────────────

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock:     'Action',
  index:     'Indice',
  fx:        'Forex',
  commodity: 'Matière première',
}

export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  stock:     '#00c8ff',
  index:     '#00e5a0',
  fx:        '#a855f7',
  commodity: '#f59e0b',
}

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  stock:     '📈',
  index:     '🏛️',
  fx:        '💱',
  commodity: '🥇',
}

// ── TradingView preset symbols ────────────────────────────────────────────────

export const TV_SYMBOL_PRESETS: Record<string, string> = {
  // ── Indices ──────────────────────────────────────────────────────────
  NAS100: 'CAPITALCOM:US100',
  US500:  'CAPITALCOM:US500',
  US30:   'CAPITALCOM:US30',
  UK100:  'CAPITALCOM:UK100',
  GER40:  'CAPITALCOM:GERMANY40',
  FRA40:  'EURONEXT:FCE1!',
  JP225:  'CAPITALCOM:JAPAN225',

  // ── Forex ────────────────────────────────────────────────────────────
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  USDJPY: 'FX:USDJPY',
  USDCHF: 'FX:USDCHF',
  AUDUSD: 'FX:AUDUSD',
  USDCAD: 'FX:USDCAD',
  NZDUSD: 'FX:NZDUSD',
  EURGBP: 'FX:EURGBP',
  EURJPY: 'FX:EURJPY',
  GBPJPY: 'FX:GBPJPY',

  // ── Commodités ───────────────────────────────────────────────────────
  XAUUSD: 'TVC:GOLD',
  XAGUSD: 'TVC:SILVER',
  USOIL:  'NYMEX:CL1!',
  UKOIL:  'NYMEX:BB1!',
  NATGAS: 'NYMEX:NG1!',

  // ── Crypto ───────────────────────────────────────────────────────────
  BTCUSD: 'BITSTAMP:BTCUSD',
  ETHUSD: 'BITSTAMP:ETHUSD',

  // ── Actions Tech ─────────────────────────────────────────────────────
  NVDA:   'NASDAQ:NVDA',
  TSLA:   'NASDAQ:TSLA',
  AAPL:   'NASDAQ:AAPL',
  MSFT:   'NASDAQ:MSFT',
  META:   'NASDAQ:META',
  AMZN:   'NASDAQ:AMZN',
  GOOGL:  'NASDAQ:GOOGL',
  AMD:    'NASDAQ:AMD',
  MU:     'NASDAQ:MU',
  INTC:   'NASDAQ:INTC',
  CRM:    'NYSE:CRM',
  ORCL:   'NYSE:ORCL',
  NFLX:   'NASDAQ:NFLX',
  UBER:   'NYSE:UBER',
  COIN:   'NASDAQ:COIN',

  // ── Finance ──────────────────────────────────────────────────────────
  JPM:    'NYSE:JPM',
  GS:     'NYSE:GS',
  BAC:    'NYSE:BAC',
  V:      'NYSE:V',

  // ── Santé ────────────────────────────────────────────────────────────
  JNJ:    'NYSE:JNJ',
  UNH:    'NYSE:UNH',

  // ── Énergie ──────────────────────────────────────────────────────────
  XOM:    'NYSE:XOM',
  CVX:    'NYSE:CVX',
}

// ── Calendar currencies ───────────────────────────────────────────────────────

export const CALENDAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']

// ── Timeframes ────────────────────────────────────────────────────────────────

export const TIMEFRAMES = [
  { label: 'M5',  tv: '5'   },
  { label: 'M15', tv: '15'  },
  { label: 'H1',  tv: '60'  },
  { label: 'H4',  tv: '240' },
  { label: 'D1',  tv: 'D'   },
]

// ── Mock macro data (remplacé par une vraie API en V2) ────────────────────────

export const MOCK_MACRO: MacroSnapshot = {
  dxy:    { symbol: 'DXY',    price: 104.23, change:  0.31, changePct:  0.30, sparkline: [103.8,103.9,104.0,104.1,104.0,104.2,104.23] },
  us10y:  { symbol: 'US10Y',  price:   4.42, change:  0.03, changePct:  0.68, sparkline: [4.38,4.39,4.40,4.41,4.40,4.42,4.42] },
  vix:    { symbol: 'VIX',    price:  18.42, change:  0.87, changePct:  4.96, sparkline: [17.5,17.8,18.0,17.9,18.2,18.4,18.42] },
  spx:    { symbol: 'SPX',    price: 5048.0, change: 12.4,  changePct:  0.25, sparkline: [5030,5035,5040,5038,5044,5046,5048] },
  nas100: { symbol: 'NAS100', price: 17842.0,change: 95.2,  changePct:  0.54, sparkline: [17720,17750,17780,17760,17800,17830,17842] },
  gold:   { symbol: 'GOLD',   price: 2318.5, change: -1.5,  changePct: -0.06, sparkline: [2322,2320,2319,2320,2318,2319,2318.5] },
  btc:    { symbol: 'BTC',    price: 67240.0,change:1521.0, changePct:  2.31, sparkline: [65500,65800,66200,66700,67000,67100,67240] },
}

// ── Mock calendar events ──────────────────────────────────────────────────────

export const MOCK_CALENDAR_EVENTS = [
  { id:'1', time:'08:30', currency:'EUR', importance:'medium' as const, title:'CPI m/m — EUR',             forecast:'0.4%', previous:'0.3%', actual:'0.2%',  impactsSymbols:['EURUSD'] },
  { id:'2', time:'10:00', currency:'USD', importance:'high'   as const, title:'NFP Report — USD',           forecast:'210K', previous:'187K', actual:null,    impactsSymbols:['EURUSD','US500','NAS100'] },
  { id:'3', time:'12:30', currency:'USD', importance:'high'   as const, title:'Fed Chair Powell Speech',    forecast:null,   previous:null,   actual:null,    impactsSymbols:['US500','NAS100','XAUUSD'] },
  { id:'4', time:'14:00', currency:'USD', importance:'medium' as const, title:'ISM Manufacturing PMI',      forecast:'51.0', previous:'50.3', actual:null,    impactsSymbols:['US500'] },
  { id:'5', time:'15:30', currency:'USD', importance:'low'    as const, title:'Crude Oil Inventories',      forecast:null,   previous:null,   actual:null,    impactsSymbols:[] },
  { id:'6', time:'20:00', currency:'USD', importance:'high'   as const, title:'FOMC Meeting Minutes',       forecast:null,   previous:null,   actual:null,    impactsSymbols:['US500','NAS100','EURUSD','XAUUSD'] },
]

// ── Briefing assets list ──────────────────────────────────────────────────────

export const BRIEFING_ASSETS = [
  { symbol:'EURUSD', label:'EUR/USD',    cat:'Forex',   icon:'💱' },
  { symbol:'XAUUSD', label:'XAU/USD',    cat:'Métal',   icon:'🥇' },
  { symbol:'TSLA',   label:'TESLA',      cat:'Action',  icon:'⚡' },
  { symbol:'NVDA',   label:'NVIDIA',     cat:'Action',  icon:'🎮' },
  { symbol:'AMD',    label:'AMD',        cat:'Action',  icon:'💻' },
  { symbol:'MU',     label:'MU',         cat:'Action',  icon:'🔧' },
  { symbol:'NAS100', label:'NAS100',     cat:'Indice',  icon:'📈' },
  { symbol:'US500',  label:'US500',      cat:'Indice',  icon:'🇺🇸' },
  { symbol:'AAPL',   label:'APPLE',      cat:'Action',  icon:'🍎' },
  { symbol:'META',   label:'META',       cat:'Action',  icon:'🌐' },
  { symbol:'AMZN',   label:'AMAZON',     cat:'Action',  icon:'📦' },
  { symbol:'MSFT',   label:'MICROSOFT',  cat:'Action',  icon:'🪟' },
  { symbol:'GOOGL',  label:'GOOGLE',     cat:'Action',  icon:'🔍' },
]

// ── Demo briefing ─────────────────────────────────────────────────────────────

export const DEMO_BRIEFING = {
  generated_at: '14:00',
  isDemo: true,
  macro_summary: "La Fed maintient son ton hawkish après des données CPI supérieures aux attentes à 3.2% YoY, réduisant les espoirs de baisses de taux au T1 2026. Le DXY consolide autour de 104.50, exerçant une pression sur les paires majeures et les matières premières. Le sentiment global reste risk-off avec une rotation sectorielle vers les valeurs défensives, bien que le secteur tech reste porté par l'IA — NVIDIA et MSFT en tête. Les marchés actions américains évoluent en range pré-NFP avec des volumes réduits.",
  assets: [
    { symbol:'EURUSD', bias:'bearish',  conviction:7,  analysis:"La paire évolue sous la résistance clé des 1.0880 après un rejet en H4 sur l'Order Block baissier. La structure de marché reste orientée à la baisse avec une série de Lower Highs. Le différentiel de taux Fed/BCE continue de peser sur l'EUR.", support:'1.0780', resistance:'1.0880', catalysts:['CPI EUR','Fed Minutes','NFP demain'], setup:'Short sur rejet OB H1 vers 1.0860 — TP 1.0790 / SL 1.0895' },
    { symbol:'XAUUSD', bias:'range',    conviction:5,  analysis:"L'or consolide dans un range 2290–2340 en attendant les données NFP. La pression du DXY fort limite les hausses, mais la demande des banques centrales soutient les baisses. Aucun biais directionnel clair avant le rapport emploi.", support:'2290', resistance:'2340', catalysts:['NFP demain','DXY','Géopolitique'], setup:'Attendre cassure de range — Long >2342 ou Short <2288' },
    { symbol:'TSLA',   bias:'bearish',  conviction:6,  analysis:"Tesla recule sous pression des révisions à la baisse des livraisons Q1 2026. La structure technique en H4 montre un Break of Structure baissier sous les 185$. Le sentiment EV reste négatif avec la compétition chinoise.", support:'172.00', resistance:'188.50', catalysts:['Livraisons Q1','Concurrence EV','Taux Fed'], setup:'Short sur pullback vers 185–186 — TP 172 / SL 190' },
    { symbol:'NVDA',   bias:'bullish',  conviction:9,  analysis:"NVIDIA reste le leader incontesté de l'IA avec une demande GPU H100/H200 qui dépasse l'offre. Structure D1 haussière, support solide sur EMA 20. Les résultats Q4 attendus la semaine prochaine devraient confirmer les guidances record.", support:'820.00', resistance:'875.00', catalysts:['Earnings Q4','Demande IA','Contrats datacenter'], setup:'Long sur pullback OB H4 vers 825–830 — TP 870 / SL 812' },
    { symbol:'AMD',    bias:'bullish',  conviction:7,  analysis:"AMD bénéficie du halo IA avec ses GPU MI300X. Le titre consolide en flag haussier sur H4 après le breakout des 170$. La rotation sectorielle tech favorise les semi-conducteurs IA.", support:'168.00', resistance:'182.00', catalysts:['MI300X adoption','Earnings AMD','Secteur semi'], setup:'Long sur retest du breakout 170 — TP 180 / SL 165' },
    { symbol:'MU',     bias:'bullish',  conviction:6,  analysis:"Micron profite du supercycle mémoire DRAM/HBM lié à l'IA. Les prix DRAM remontent depuis 3 mois consécutifs. Structure haussière mais momentum ralentit — pullback attendu.", support:'112.00', resistance:'128.00', catalysts:['Prix DRAM','HBM IA','Inventaires'], setup:'Long sur pullback vers 112–114 — TP 125 / SL 108' },
    { symbol:'NAS100', bias:'bullish',  conviction:7,  analysis:"Le Nasdaq 100 reste en tendance haussière portée par les Magnificent 7. Le niveau 21 200 constitue un support clé. Les rotations intra-sectorielles créent des opportunités mais le trend macro reste positif.", support:'21200', resistance:'21850', catalysts:['Earnings Tech','NFP','Fed pivot'], setup:'Long sur pullback vers 21200–21300 — TP 21800 / SL 20950' },
    { symbol:'US500',  bias:'range',    conviction:5,  analysis:"Le S&P 500 consolide entre 4980 et 5100 en attente des catalyseurs macro. Le marché digère des earnings mitigés hors-tech. La largeur du marché reste faible avec seulement 40% des titres au-dessus de leur MA 50j.", support:'4980', resistance:'5100', catalysts:['NFP','Fed Meeting','Earnings S&P'], setup:'Range trade — Long >4985 TP 5085 / Short <5095 TP 4990' },
    { symbol:'AAPL',   bias:'range',    conviction:5,  analysis:"Apple consolide après des ventes iPhone en Chine décevantes (-15% YoY). Le titre manque de catalyseur fort avant la WWDC en juin. Rectangle de consolidation en H4 entre 168 et 178$.", support:'168.00', resistance:'178.00', catalysts:['Ventes Chine','WWDC juin','Rachat actions'], setup:'Neutre — attendre breakout du range 168–178 pour signal directionnel' },
    { symbol:'META',   bias:'bullish',  conviction:8,  analysis:"Meta performe grâce à la monétisation Reels et l'accélération de la publicité digitale. Le titre a cassé un ATH et reste en uptrend H4 propre. Les investissements IA (Llama 3) sont bien reçus.", support:'492.00', resistance:'520.00', catalysts:['Pub digitale','IA Llama 3','Engagement Reels'], setup:'Long sur pullback OB H4 vers 492–495 — TP 518 / SL 485' },
    { symbol:'AMZN',   bias:'bullish',  conviction:7,  analysis:"Amazon bénéficie de la forte croissance d'AWS (+17% YoY) et de la rentabilité retrouvée du retail. Structure D1 clairement haussière avec Higher Highs propres. Le segment pub dépasse désormais 50Mds$ annuels.", support:'185.00', resistance:'198.00', catalysts:['AWS growth','Prime Day','Pub segment'], setup:'Long sur pullback EMA 20 H4 vers 185–187 — TP 196 / SL 181' },
    { symbol:'MSFT',   bias:'bullish',  conviction:8,  analysis:"Microsoft est le grand bénéficiaire de l'intégration Copilot IA dans Office 365. Azure Cloud affiche +28% de croissance. Structure technique impeccable en uptrend.", support:'408.00', resistance:'430.00', catalysts:['Copilot adoption','Azure Q4','Dividende'], setup:'Long sur tout pullback vers 408–412 — TP 428 / SL 402' },
    { symbol:'GOOGL',  bias:'bullish',  conviction:6,  analysis:"Google rebondit après les craintes IA. Gemini Ultra gagne en adoption et Search reste dominante à 90% de parts de marché. P/E attractif vs pairs. Attention au procès antitrust DOJ.", support:'162.00', resistance:'175.00', catalysts:['Gemini IA','Antitrust DOJ','Search dominance'], setup:'Long sur support 162–163 — TP 173 / SL 158' },
  ]
}
