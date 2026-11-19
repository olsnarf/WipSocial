import {
  SHOP_FURNITURE_CATALOG,
  type CatalogCategory,
  type FurnitureType,
  type FurnitureVariantSpec,
  type HotelCatalogRoomGroup,
  type ShopCatalogItem,
} from '../types/lounge';

interface FinishPalette {
  id: string;
  label: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  material: string;
  vip?: boolean;
  priceDelta?: number;
}

const UPHOLSTERY_FINISHES: FinishPalette[] = [
  { id: 'aged_leather', label: 'Aged Cognac Leather', primaryHex: '#6b3a24', secondaryHex: '#4a2617', accentHex: '#d4af37', material: 'Leather' },
  { id: 'velvet_teal', label: 'Velvet Peacock Teal', primaryHex: '#0f5e5a', secondaryHex: '#083b39', accentHex: '#e5c158', material: 'Velvet' },
  { id: 'cream_linen', label: 'Warm Cream Linen', primaryHex: '#dfd3c0', secondaryHex: '#b8a892', accentHex: '#8c6b32', material: 'Linen' },
  { id: 'crimson_velvet', label: 'Imperial Crimson Velvet', primaryHex: '#6d162c', secondaryHex: '#470b1a', accentHex: '#d4af37', material: 'Velvet' },
  { id: 'sapphire_silk', label: 'Royal Sapphire Silk', primaryHex: '#15325b', secondaryHex: '#0c1d38', accentHex: '#f3d479', material: 'Silk', vip: true, priceDelta: 6 },
  { id: 'onyx_gold', label: 'Onyx & 24k Gold', primaryHex: '#181c26', secondaryHex: '#0d1017', accentHex: '#facc15', material: 'Obsidian', vip: true, priceDelta: 8 },
];

const STONE_WOOD_FINISHES: FinishPalette[] = [
  { id: 'white_marble', label: 'Calacatta White Marble', primaryHex: '#ebe4d8', secondaryHex: '#c6baa7', accentHex: '#d4af37', material: 'Marble' },
  { id: 'dark_oak', label: 'Dark Mahogany & Oak', primaryHex: '#4f2c1d', secondaryHex: '#331a10', accentHex: '#d4af37', material: 'Mahogany' },
  { id: 'brushed_brass', label: 'Brushed Brass', primaryHex: '#b68e36', secondaryHex: '#7d5f1c', accentHex: '#fef3c7', material: 'Brass', vip: true, priceDelta: 6 },
  { id: 'smoked_glass', label: 'Smoked Deco Glass', primaryHex: '#1e293b', secondaryHex: '#0f172a', accentHex: '#38bdf8', material: 'Glass' },
  { id: 'emerald_marble', label: 'Verde Guatemala Marble', primaryHex: '#17493f', secondaryHex: '#0c2b25', accentHex: '#e5c158', material: 'Marble', vip: true, priceDelta: 6 },
  { id: 'obsidian_gold', label: 'Black Nero Marquina', primaryHex: '#161922', secondaryHex: '#0a0c12', accentHex: '#d4af37', material: 'Marble', vip: true, priceDelta: 8 },
];

const METAL_TECH_FINISHES: FinishPalette[] = [
  { id: 'brushed_brass', label: 'Brushed Brass', primaryHex: '#c49b3b', secondaryHex: '#7d5d19', accentHex: '#fef08a', material: 'Brass' },
  { id: 'dark_bronze', label: 'Oil-Rubbed Bronze', primaryHex: '#463125', secondaryHex: '#271b14', accentHex: '#d4af37', material: 'Bronze' },
  { id: 'polished_chrome', label: 'Polished Silver Chrome', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#38bdf8', material: 'Chrome' },
  { id: 'rose_gold', label: 'Champagne Rose Gold', primaryHex: '#c98a73', secondaryHex: '#8a5543', accentHex: '#fde68a', material: 'Rose Gold', vip: true, priceDelta: 6 },
  { id: 'royal_enamel', label: 'Sapphire & Gold Enamel', primaryHex: '#143360', secondaryHex: '#0b1d38', accentHex: '#facc15', material: 'Enamel', vip: true, priceDelta: 8 },
];

interface ArchetypeBlueprint {
  slug: string;
  type: FurnitureType;
  baseName: string;
  category: CatalogCategory;
  roomGroup: HotelCatalogRoomGroup;
  walkable: boolean;
  baseCredits: number;
  tagline: string;
  description: string;
  toggleable?: boolean;
  clubOnlyAll?: boolean;
  palettes: FinishPalette[];
}

const HOTEL_ARCHETYPES: ArchetypeBlueprint[] = [
  // ================= LOBBY =================
  {
    slug: 'reception_desk',
    type: 'reception_desk',
    baseName: 'Grand Reception Desk',
    category: 'tables_surfaces',
    roomGroup: 'Lobby',
    walkable: false,
    baseCredits: 32,
    tagline: 'Check-in centerpiece · Stackable counter',
    description: 'Boutique concierge reception desk with fluted paneling, brass key rack, and service bell.',
    palettes: STONE_WOOD_FINISHES,
  },
  {
    slug: 'chesterfield',
    type: 'chesterfield_sofa',
    baseName: 'Tufted Chesterfield Sofa',
    category: 'seating',
    roomGroup: 'Lobby',
    walkable: true,
    baseCredits: 28,
    tagline: 'Deep button-tufted lounge sofa · Sittable',
    description: 'Hand-tufted Art Deco Chesterfield sofa with rolled arms and brass caster legs.',
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'velvet_chair',
    type: 'velvet_armchair',
    baseName: 'Aurelia Club Armchair',
    category: 'seating',
    roomGroup: 'Lobby',
    walkable: true,
    baseCredits: 16,
    tagline: 'Scalloped hotel armchair · Sittable',
    description: 'Tailored lobby reading armchair with brass piping.',
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'brass_stanchion',
    type: 'brass_stanchion',
    baseName: 'Hotel Velvet Stanchion',
    category: 'dividers_walls',
    roomGroup: 'Lobby',
    walkable: false,
    baseCredits: 14,
    tagline: 'Braided queue post · Lobby crowd guide',
    description: 'Weighted Art Deco stanchion post with heavy braided silk barrier cord.',
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'potted_ficus',
    type: 'potted_ficus',
    baseName: 'Hotel Atrium Ficus',
    category: 'lighting_decor',
    roomGroup: 'Lobby',
    walkable: false,
    baseCredits: 15,
    tagline: 'Architectural indoor tree in Deco planter',
    description: 'Lush manicured ficus tree in a fluted geometric hotel urn.',
    palettes: STONE_WOOD_FINISHES.slice(0, 5),
  },
  {
    slug: 'elevator',
    type: 'hotel_elevator',
    baseName: 'Art Deco Brass Elevator',
    category: 'games_wired',
    roomGroup: 'Lobby',
    walkable: true,
    baseCredits: 48,
    tagline: 'Click to animate sliding doors & floor warp',
    description: 'Illuminated hotel lift with brass grille doors, Up indicator, and instant hotel floor travel.',
    toggleable: true,
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'piano',
    type: 'vip_grand_piano',
    baseName: 'Atrium Grand Piano',
    category: 'club_exclusives',
    roomGroup: 'Lobby',
    walkable: false,
    baseCredits: 58,
    tagline: 'Click to play live floating notes',
    description: 'Concert grand piano with propped lid and animated golden musical notes.',
    toggleable: true,
    clubOnlyAll: true,
    palettes: STONE_WOOD_FINISHES.slice(0, 4),
  },

  // ================= GUEST ROOM =================
  {
    slug: 'four_poster',
    type: 'four_poster_bed',
    baseName: 'Four-Poster Canopy Bed',
    category: 'seating',
    roomGroup: 'Guest Room',
    walkable: true,
    baseCredits: 38,
    tagline: 'Plush hotel suite bed · Lie down',
    description: 'Tall carved four-poster bed dressed in crisp hotel linens and upholstered headboard.',
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'nightstand',
    type: 'nightstand',
    baseName: 'Suite Bedside Nightstand',
    category: 'tables_surfaces',
    roomGroup: 'Guest Room',
    walkable: false,
    baseCredits: 14,
    tagline: 'Brass lamp & drawer table · Stackable',
    description: 'Compact Deco bedside table topped with a warm alabaster shade lamp.',
    palettes: STONE_WOOD_FINISHES,
  },
  {
    slug: 'flat_tv',
    type: 'flat_screen_tv',
    baseName: 'Suite Console Flat-Screen TV',
    category: 'lighting_decor',
    roomGroup: 'Guest Room',
    walkable: false,
    baseCredits: 24,
    tagline: 'Double-tap to switch screen On/Off',
    description: 'Wide-format hotel entertainment screen mounted atop a Deco credenza.',
    toggleable: true,
    palettes: STONE_WOOD_FINISHES.slice(0, 4),
  },
  {
    slug: 'mini_fridge',
    type: 'mini_fridge',
    baseName: 'Cabinetry Mini-Fridge',
    category: 'tables_surfaces',
    roomGroup: 'Guest Room',
    walkable: false,
    baseCredits: 18,
    tagline: 'Chilled suite refreshment bar · Stackable',
    description: 'Discreet paneled hotel minibar stocked with sparkling waters and crystal glassware.',
    palettes: STONE_WOOD_FINISHES.slice(0, 5),
  },
  {
    slug: 'suitcase_stand',
    type: 'suitcase_stand',
    baseName: 'Brass Luggage Stand',
    category: 'tables_surfaces',
    roomGroup: 'Guest Room',
    walkable: false,
    baseCredits: 12,
    tagline: 'Folding rack with leather steamer trunk',
    description: 'Polished brass luggage rack holding a vintage strapped hotel valise.',
    palettes: UPHOLSTERY_FINISHES.slice(0, 5),
  },
  {
    slug: 'wardrobe',
    type: 'wardrobe_cabinet',
    baseName: 'Grand Armoire Wardrobe',
    category: 'dividers_walls',
    roomGroup: 'Guest Room',
    walkable: false,
    baseCredits: 26,
    tagline: 'Tall inlaid suite closet cabinet',
    description: 'Double-door Art Deco armoire with sunburst veneer and brass pulls.',
    palettes: STONE_WOOD_FINISHES.slice(0, 5),
  },

  // ================= CAFE =================
  {
    slug: 'coffee_machine',
    type: 'coffee_machine',
    baseName: 'Commercial Espresso Machine',
    category: 'games_wired',
    roomGroup: 'Cafe',
    walkable: false,
    baseCredits: 30,
    tagline: 'Click to brew animated steaming espresso',
    description: 'Dual-group Italian brass espresso machine that steams and serves fresh espresso on tap.',
    toggleable: true,
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'barista_counter',
    type: 'barista_counter',
    baseName: 'Marble Barista Counter',
    category: 'tables_surfaces',
    roomGroup: 'Cafe',
    walkable: false,
    baseCredits: 26,
    tagline: 'Modular cafe bar · Stack coffee machines on top',
    description: 'Sleek stone-topped cafe counter with fluted brass apron.',
    palettes: STONE_WOOD_FINISHES,
  },
  {
    slug: 'bistro_table',
    type: 'bistro_table',
    baseName: 'Deco Cafe Bistro Table',
    category: 'tables_surfaces',
    roomGroup: 'Cafe',
    walkable: false,
    baseCredits: 14,
    tagline: 'Round marble cafe table · Stackable',
    description: 'Intimate pedestal cafe table with brass rim and ceramic service.',
    palettes: STONE_WOOD_FINISHES,
  },
  {
    slug: 'bistro_chair',
    type: 'bistro_chair',
    baseName: 'Bentwood Cafe Chair',
    category: 'seating',
    roomGroup: 'Cafe',
    walkable: true,
    baseCredits: 10,
    tagline: 'Classic curved cafe chair · Sittable',
    description: 'Parisian hotel cafe chair with upholstered seat pad.',
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'vending_machine',
    type: 'vending_machine',
    baseName: 'Illuminated Soda Automaton',
    category: 'games_wired',
    roomGroup: 'Cafe',
    walkable: false,
    baseCredits: 32,
    tagline: 'Click to animate soda can drop & collect drink',
    description: 'Lit glass-front boutique beverage dispenser with animated falling chilled soda cans.',
    toggleable: true,
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'pastry_display',
    type: 'pastry_display',
    baseName: 'Patisserie Glass Vitrine',
    category: 'tables_surfaces',
    roomGroup: 'Cafe',
    walkable: false,
    baseCredits: 22,
    tagline: 'Tiered French pastry cabinet · Stackable',
    description: 'Brass-framed refrigerated glass case displaying croissants, macarons, and tarts.',
    palettes: METAL_TECH_FINISHES.slice(0, 4),
  },

  // ================= CASINO =================
  {
    slug: 'poker_table',
    type: 'poker_table',
    baseName: 'High-Stakes Poker Table',
    category: 'games_wired',
    roomGroup: 'Casino',
    walkable: false,
    baseCredits: 40,
    tagline: 'Padded rail felt table with dealer cards',
    description: 'Monte Carlo oval poker table trimmed in walnut rail and plush casino baize.',
    palettes: UPHOLSTERY_FINISHES.slice(0, 5),
  },
  {
    slug: 'roulette_table',
    type: 'roulette_table',
    baseName: 'Monte Carlo Roulette Table',
    category: 'games_wired',
    roomGroup: 'Casino',
    walkable: false,
    baseCredits: 46,
    tagline: 'Gilded spinning brass wheel & betting layout',
    description: 'Full-size European roulette table with lacquered mahogany bowl and brass turret.',
    palettes: STONE_WOOD_FINISHES.slice(0, 5),
  },
  {
    slug: 'slot_machine',
    type: 'slot_machine',
    baseName: 'Aurelia Gilded Slot Machine',
    category: 'games_wired',
    roomGroup: 'Casino',
    walkable: false,
    baseCredits: 36,
    tagline: 'Click to spin animated reels (10 Tokens / spin)',
    description: 'Classic Deco one-armed bandit with illuminated marquee and 3 spinning pixel reels.',
    toggleable: true,
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'craps_table',
    type: 'craps_table',
    baseName: 'Grand Velvet Craps Table',
    category: 'games_wired',
    roomGroup: 'Casino',
    walkable: false,
    baseCredits: 44,
    tagline: 'High-wall casino dice tub',
    description: 'Deep cushioned dice arena trimmed in brass rail guards.',
    palettes: UPHOLSTERY_FINISHES.slice(1, 6),
  },
  {
    slug: 'poker_chips',
    type: 'poker_chips',
    baseName: 'Clay Poker Chip Rack',
    category: 'tables_surfaces',
    roomGroup: 'Casino',
    walkable: false,
    baseCredits: 10,
    tagline: 'Stackable tabletop casino chips',
    description: 'Precision-stacked clay hotel chips ready to sit atop any poker or cocktail table.',
    palettes: METAL_TECH_FINISHES.slice(0, 4),
  },

  // ================= POOL =================
  {
    slug: 'pool_lounger',
    type: 'pool_lounger',
    baseName: 'Terrace Teak Pool Lounger',
    category: 'seating',
    roomGroup: 'Pool',
    walkable: true,
    baseCredits: 18,
    tagline: 'Reclining poolside chaise · Lie down',
    description: 'Slatted teak sunbed with rolled bolster pillow for the thermal pool terrace.',
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'cabana_canopy',
    type: 'cabana_canopy',
    baseName: 'VIP Poolside Cabana',
    category: 'seating',
    roomGroup: 'Pool',
    walkable: true,
    baseCredits: 38,
    tagline: 'Draped linen sun pavilion · Relax inside',
    description: 'Four-corner draped resort pavilion with plush day cushion.',
    palettes: UPHOLSTERY_FINISHES.slice(1, 6),
  },
  {
    slug: 'thermal_spa',
    type: 'vip_hot_tub',
    baseName: 'Thermal Marble Spa Tub',
    category: 'club_exclusives',
    roomGroup: 'Pool',
    walkable: true,
    baseCredits: 52,
    tagline: 'Heated bubbling terrace pool · Relax inside',
    description: 'Steaming mineral spa pool framed in carved hotel marble.',
    clubOnlyAll: true,
    palettes: STONE_WOOD_FINISHES.slice(0, 4),
  },

  // ================= MEETING =================
  {
    slug: 'boardroom_table',
    type: 'boardroom_table',
    baseName: 'Executive Boardroom Table',
    category: 'tables_surfaces',
    roomGroup: 'Meeting',
    walkable: false,
    baseCredits: 34,
    tagline: 'Inlaid conference centerpiece · Stackable',
    description: 'Hand-rubbed conference table with brass inlay and brass desk blotter.',
    palettes: STONE_WOOD_FINISHES,
  },
  {
    slug: 'executive_chair',
    type: 'executive_chair',
    baseName: 'Executive Swivel Armchair',
    category: 'seating',
    roomGroup: 'Meeting',
    walkable: true,
    baseCredits: 20,
    tagline: 'High-back boardroom seat · Sittable',
    description: 'Ergonomic tufted conference chair on a brushed brass base.',
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'bookshelf',
    type: 'cozy_bookshelf',
    baseName: 'Salon Library Bookcase',
    category: 'lighting_decor',
    roomGroup: 'Meeting',
    walkable: false,
    baseCredits: 22,
    tagline: 'Leather-bound volumes & brass clock',
    description: 'Floor-to-ceiling meeting room library shelf.',
    palettes: STONE_WOOD_FINISHES.slice(0, 4),
  },

  // ================= DECORATIONS (Chandeliers & Sconces) =================
  {
    slug: 'wall_sconce',
    type: 'wall_sconce',
    baseName: 'Fluted Glass Wall Sconce',
    category: 'lighting_decor',
    roomGroup: 'Decorations',
    walkable: false,
    baseCredits: 12,
    tagline: 'Double-tap to toggle warm ambient light',
    description: 'Frosted fluted torch sconce set in polished Art Deco brass.',
    toggleable: true,
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'crystal_chandelier',
    type: 'crystal_chandelier',
    baseName: 'Imperial Crystal Chandelier',
    category: 'lighting_decor',
    roomGroup: 'Decorations',
    walkable: false,
    baseCredits: 42,
    tagline: 'Suspended tiered crystal fixture · Toggle glow',
    description: 'Cascading prism crystal chandelier casting warm golden ambient light.',
    toggleable: true,
    palettes: METAL_TECH_FINISHES,
  },
  {
    slug: 'cocktail_table',
    type: 'vip_table',
    baseName: 'Marble Candle Table',
    category: 'tables_surfaces',
    roomGroup: 'Decorations',
    walkable: false,
    baseCredits: 16,
    tagline: 'Side table with brass hurricane candle',
    description: 'Compact Deco accent table with toggleable candle flame.',
    toggleable: true,
    palettes: STONE_WOOD_FINISHES.slice(0, 5),
  },

  // ================= VIP EXCLUSIVES (50+ Member-Locked Items across archetypes & suites) =================
  {
    slug: 'gold_throne',
    type: 'gold_throne',
    baseName: 'Gold-Plated Sovereign Throne',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: true,
    baseCredits: 65,
    tagline: 'VIP Sovereign chair · Sittable',
    description: 'Sculpted 24k gold-leaf Art Deco throne upholstered in jewel-toned velvet.',
    clubOnlyAll: true,
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'jet_tile',
    type: 'jet_interior_tile',
    baseName: 'Private Jet Cabin Suite Tile',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: true,
    baseCredits: 48,
    tagline: 'VIP Charter cabin seat & porthole · Sittable',
    description: 'First-class Gulfstream leather recliner module with illuminated fuselage porthole.',
    clubOnlyAll: true,
    palettes: UPHOLSTERY_FINISHES,
  },
  {
    slug: 'vip_lounge_door',
    type: 'vip_lounge_door',
    baseName: 'VIP Membership Lounge Door',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: true,
    baseCredits: 45,
    tagline: 'Members-only gilded archway · Double-tap lock',
    description: 'Ornate Art Deco bronze portal admitting active VIP Club guests into private chambers.',
    toggleable: true,
    clubOnlyAll: true,
    palettes: METAL_TECH_FINISHES,
  },

  {
    slug: 'emerald_throne',
    type: 'vip_emerald_throne',
    baseName: 'Imperial Royal Throne',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: true,
    baseCredits: 48,
    tagline: 'VIP High-back velvet throne · Sittable',
    description: 'Tall fluted velvet throne reserved for hotel members.',
    clubOnlyAll: true,
    palettes: UPHOLSTERY_FINISHES.slice(0, 5),
  },
  {
    slug: 'golden_trophy',
    type: 'vip_golden_trophy',
    baseName: 'Aurelia Founders Cup',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: false,
    baseCredits: 28,
    tagline: 'Stackable solid trophy on marble plinth',
    description: 'Engraved championship hotel chalice.',
    clubOnlyAll: true,
    palettes: METAL_TECH_FINISHES.slice(0, 4),
  },
  {
    slug: 'high_roller_poker',
    type: 'poker_table',
    baseName: 'High-Roller Monte Carlo Poker',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: false,
    baseCredits: 56,
    tagline: 'VIP salon high-limit baize table',
    description: 'Private-suite poker table inlaid with gold trim.',
    clubOnlyAll: true,
    palettes: UPHOLSTERY_FINISHES.slice(2, 6),
  },
  {
    slug: 'high_roller_roulette',
    type: 'roulette_table',
    baseName: 'High-Roller Gold Roulette',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: false,
    baseCredits: 62,
    tagline: 'VIP salon bespoke roulette wheel',
    description: 'Hand-balanced brass roulette wheel for private high-stakes suites.',
    clubOnlyAll: true,
    palettes: STONE_WOOD_FINISHES.slice(2, 6),
  },
  {
    slug: 'high_roller_slot',
    type: 'slot_machine',
    baseName: 'Diamond Jackpot Slot Machine',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: false,
    baseCredits: 50,
    tagline: 'VIP interactive slot machine · Spin reels',
    description: 'Gold-plated high-limit hotel slot cabinet.',
    toggleable: true,
    clubOnlyAll: true,
    palettes: METAL_TECH_FINISHES.slice(2, 5),
  },
  {
    slug: 'vip_daybed_suite',
    type: 'vip_daybed',
    baseName: 'Penthouse Salon Daybed',
    category: 'club_exclusives',
    roomGroup: 'VIP Exclusives',
    walkable: true,
    baseCredits: 40,
    tagline: 'VIP lounge chaise daybed · Lie down',
    description: 'Oversized tufted silk daybed for VIP penthouse terraces.',
    clubOnlyAll: true,
    palettes: UPHOLSTERY_FINISHES.slice(1, 6),
  },
];

// 24 distinct Pixel-Art Framed Paintings (Decorations)
const PAINTING_TITLES = [
  'Golden Skyline Nocturne',
  'Atrium Palm Moonlight',
  'Riviera Sailboat Study',
  'Sunburst Metropolis',
  'Sapphire Harbor Dawn',
  'Crimson Jazz Quartet',
  'Emerald Conservatory',
  'Velvet Staircase Study',
  'Alpine Chalet Dusk',
  'Gilded Masquerade',
  'Parisian Rain Boulevard',
  'Grand Foyer Chandelier',
  'Mediterranean Cypress',
  'Autumn Chestnut Walk',
  'Terrace Champagne Still Life',
  'Ocean Liner 1929',
  'Moonlit Venetian Canal',
  'Geometric Deco Zenith',
  'Orchid Porcelain Study',
  'Midnight Express Silhouette',
  'Amber Sunset Cliffs',
  'Winter Conservatory Snow',
  'Sovereign Crest Abstract',
  'Aurora Over Onyx Bay',
];

const PAINTING_PALETTES: FinishPalette[] = [
  { id: 'gilded_gold', label: '24k Gilded Frame', primaryHex: '#13243f', secondaryHex: '#0a1220', accentHex: '#d4af37', material: 'Oil on Canvas' },
  { id: 'dark_walnut', label: 'Walnut & Brass Frame', primaryHex: '#4f2c1d', secondaryHex: '#28150d', accentHex: '#e5c158', material: 'Oil on Canvas' },
  { id: 'museum_ivory', label: 'Ivory Museum Frame', primaryHex: '#ebe4d8', secondaryHex: '#c6baa7', accentHex: '#8c6b32', material: 'Gouache' },
  { id: 'vip_ebony', label: 'VIP Ebony & Gold Leaf', primaryHex: '#111827', secondaryHex: '#090d16', accentHex: '#facc15', material: 'Collector Print', vip: true, priceDelta: 10 },
];

// 12 Art Deco Vases
const VASE_SPECS: Array<{ title: string; p: FinishPalette }> = [
  { title: 'Ming Cobalt & Gold Vase', p: { id: 'cobalt', label: 'Cobalt Porcelain', primaryHex: '#1d4ed8', secondaryHex: '#1e3a8a', accentHex: '#d4af37', material: 'Porcelain' } },
  { title: 'Celadon Jade Amphora', p: { id: 'celadon', label: 'Celadon Glaze', primaryHex: '#10b981', secondaryHex: '#065f46', accentHex: '#f3d479', material: 'Ceramic' } },
  { title: 'Alabaster Fluted Urn', p: { id: 'alabaster', label: 'Alabaster Stone', primaryHex: '#ebe4d8', secondaryHex: '#cbbda8', accentHex: '#d4af37', material: 'Marble' } },
  { title: 'Crimson Cloisonné Vase', p: { id: 'cloisonne', label: 'Crimson Enamel', primaryHex: '#9f1239', secondaryHex: '#4c0519', accentHex: '#e5c158', material: 'Enamel' } },
  { title: 'Onyx Sunburst Urn', p: { id: 'onyx', label: 'Black Basalt', primaryHex: '#18181b', secondaryHex: '#09090b', accentHex: '#d4af37', material: 'Stoneware' } },
  { title: 'Brushed Brass Lotus Vase', p: { id: 'brass', label: 'Spun Brass', primaryHex: '#ca8a04', secondaryHex: '#854d0e', accentHex: '#fef08a', material: 'Brass' } },
  { title: 'Teal Peacock Amphora', p: { id: 'teal', label: 'Peacock Glaze', primaryHex: '#0d9488', secondaryHex: '#134e4a', accentHex: '#fde68a', material: 'Ceramic' } },
  { title: 'Sapphire Crystal Vessel', p: { id: 'crystal', label: 'Cut Crystal', primaryHex: '#38bdf8', secondaryHex: '#0369a1', accentHex: '#ffffff', material: 'Crystal', vip: true, priceDelta: 8 } },
  { title: 'Terracotta Greco Urn', p: { id: 'terracotta', label: 'Terracotta', primaryHex: '#c2410c', secondaryHex: '#7c2d12', accentHex: '#fde68a', material: 'Terracotta' } },
  { title: 'Champagne Fluted Vase', p: { id: 'champagne', label: 'Champagne Glass', primaryHex: '#e7d2a8', secondaryHex: '#a88a55', accentHex: '#ffffff', material: 'Glass' } },
  { title: 'Amethyst Lalique Vessel', p: { id: 'amethyst', label: 'Pressed Crystal', primaryHex: '#7e22ce', secondaryHex: '#3b0764', accentHex: '#f5d0fe', material: 'Crystal', vip: true, priceDelta: 8 } },
  { title: '24k Gold Leaf Amphora', p: { id: 'gold24', label: '24k Gilded', primaryHex: '#eab308', secondaryHex: '#a16207', accentHex: '#fffbeb', material: 'Gold Leaf', vip: true, priceDelta: 12 } },
];

// 12 Art Deco Rugs
const RUG_SPECS: Array<{ title: string; p: FinishPalette }> = [
  { title: 'Sunburst Sapphire Runner Rug', p: { id: 'sunburst_blue', label: 'Royal Wool', primaryHex: '#132a4f', secondaryHex: '#0a162b', accentHex: '#d4af37', material: 'Wool' } },
  { title: 'Chevron Emerald & Gold Rug', p: { id: 'chevron_emerald', label: 'Hand-Tufted Silk', primaryHex: '#0f4c45', secondaryHex: '#072b27', accentHex: '#e5c158', material: 'Silk' } },
  { title: 'Grand Crimson Medallion Rug', p: { id: 'crimson_med', label: 'Persian Wool', primaryHex: '#6b1227', secondaryHex: '#3f0815', accentHex: '#e7d2a8', material: 'Wool' } },
  { title: 'Ivory & Onyx Geometric Rug', p: { id: 'ivory_onyx', label: 'Cream & Obsidian', primaryHex: '#e6dccb', secondaryHex: '#1e2430', accentHex: '#d4af37', material: 'Wool' } },
  { title: 'Gilded Fan Arch Deco Rug', p: { id: 'fan_arch', label: 'Silk & Wool', primaryHex: '#231f20', secondaryHex: '#3d342b', accentHex: '#eab308', material: 'Silk' } },
  { title: 'Teal Peacock Geometric Rug', p: { id: 'teal_geo', label: 'Bouclé Pile', primaryHex: '#115e59', secondaryHex: '#042f2e', accentHex: '#f5efe6', material: 'Wool' } },
  { title: 'Champagne & Bronze Mosaic Rug', p: { id: 'champagne', label: 'Atelier Silk', primaryHex: '#c8b496', secondaryHex: '#6d573a', accentHex: '#f8fafc', material: 'Silk' } },
  { title: 'Burgundy & Gold Chevron Rug', p: { id: 'burgundy', label: 'Velvet Pile', primaryHex: '#54132d', secondaryHex: '#2e0817', accentHex: '#f3d479', material: 'Velvet' } },
  { title: 'Slate & Brass Lattice Rug', p: { id: 'slate_brass', label: 'Woven Slate', primaryHex: '#273142', secondaryHex: '#141923', accentHex: '#d4af37', material: 'Wool' } },
  { title: 'Sovereign Gold-Weave Carpet', p: { id: 'sovereign_gold', label: 'Gold Thread', primaryHex: '#85641b', secondaryHex: '#423009', accentHex: '#fef08a', material: 'Silk', vip: true, priceDelta: 10 } },
  { id: 'monaco', title: 'Monte Carlo Velvet Rug', p: { id: 'monaco', label: 'High-Pile Velvet', primaryHex: '#3b0764', secondaryHex: '#1e0338', accentHex: '#facc15', material: 'Velvet', vip: true, priceDelta: 8 } } as unknown as { title: string; p: FinishPalette },
  { title: 'Diamond Atrium Parquet Rug', p: { id: 'diamond_atrium', label: 'VIP Atelier', primaryHex: '#0c2340', secondaryHex: '#1e3a5f', accentHex: '#bae6fd', material: 'Silk', vip: true, priceDelta: 10 } },
];

function buildHotelCatalog(): ShopCatalogItem[] {
  const catalog: ShopCatalogItem[] = [];
  const seenIds = new Set<string>();

  const pushItem = (item: ShopCatalogItem) => {
    const id = item.id || `${item.type}_${catalog.length}`;
    if (seenIds.has(id)) return;
    seenIds.add(id);
    catalog.push({ ...item, id });
  };

  // 1. Expand every hotel archetype across material/upholstery finishes (~215 items)
  for (const arch of HOTEL_ARCHETYPES) {
    arch.palettes.forEach((pal) => {
      const credits = arch.baseCredits + (pal.priceDelta || 0);
      const isClub = Boolean(arch.clubOnlyAll || pal.vip);
      const variantSpec: FurnitureVariantSpec = {
        finishId: pal.id,
        primaryHex: pal.primaryHex,
        secondaryHex: pal.secondaryHex,
        accentHex: pal.accentHex,
        material: pal.material,
      };
      pushItem({
        id: `hotel_${arch.slug}_${pal.id}`,
        type: arch.type,
        name: `${arch.baseName} (${pal.label})`,
        category: isClub && arch.roomGroup === 'VIP Exclusives' ? 'club_exclusives' : arch.category,
        roomGroup: arch.roomGroup,
        walkable: arch.walkable,
        creditsPrice: credits,
        tokensPrice: credits * 50,
        memberPointsPrice: credits * 20,
        tagline: `${pal.material} · ${arch.tagline}`,
        description: `${arch.description} Finished in ${pal.label}.`,
        clubExclusive: isClub,
        toggleable: arch.toggleable,
        variantSpec,
      });
    });
  }

  // 2. 24 Framed Paintings × 4 frames = 96 distinct framed artworks
  PAINTING_TITLES.forEach((title, artIdx) => {
    PAINTING_PALETTES.forEach((frame, fIdx) => {
      const credits = 14 + (fIdx === 3 ? 10 : fIdx * 2);
      const isClub = Boolean(frame.vip || artIdx >= 20);
      pushItem({
        id: `decor_painting_${artIdx}_${frame.id}`,
        type: 'framed_painting',
        name: `${title} — ${frame.label}`,
        category: isClub ? 'club_exclusives' : 'lighting_decor',
        roomGroup: 'Decorations',
        walkable: false,
        creditsPrice: credits,
        tokensPrice: credits * 50,
        memberPointsPrice: credits * 20,
        tagline: `Original Art #${artIdx + 1} · Stackable wall/plinth display`,
        description: `Framed pixel-art gallery piece "${title}" mounted in ${frame.label}.`,
        clubExclusive: isClub,
        variantSpec: {
          finishId: `${frame.id}_${artIdx}`,
          primaryHex: frame.primaryHex,
          secondaryHex: frame.secondaryHex,
          accentHex: frame.accentHex,
          material: frame.material,
          artworkIndex: artIdx,
        },
      });
    });
  });

  // 3. 12 Art Deco Vases × 2 sizes/editions = 24 vases
  VASE_SPECS.forEach((spec, idx) => {
    (['Classic', 'Grand Gallery'] as const).forEach((edition, eIdx) => {
      const credits = 12 + eIdx * 6 + (spec.p.priceDelta || 0);
      const isClub = Boolean(spec.p.vip || eIdx === 1 && idx >= 8);
      pushItem({
        id: `decor_vase_${idx}_${eIdx}`,
        type: 'deco_vase',
        name: `${spec.title} (${edition})`,
        category: isClub ? 'club_exclusives' : 'lighting_decor',
        roomGroup: 'Decorations',
        walkable: false,
        creditsPrice: credits,
        tokensPrice: credits * 50,
        memberPointsPrice: credits * 20,
        tagline: `${spec.p.material} · Stackable on desks & tables`,
        description: `Handcrafted ${spec.p.material.toLowerCase()} Art Deco vessel with gilded lip.`,
        clubExclusive: isClub,
        variantSpec: {
          finishId: `${spec.p.id}_${eIdx}`,
          primaryHex: spec.p.primaryHex,
          secondaryHex: spec.p.secondaryHex,
          accentHex: spec.p.accentHex,
          material: spec.p.material,
          artworkIndex: idx,
        },
      });
    });
  });

  // 4. 12 Art Deco Rugs × 2 trims = 24 rugs
  RUG_SPECS.forEach((spec, idx) => {
    (['Standard', 'Gold-Fringed'] as const).forEach((trim, tIdx) => {
      const credits = 12 + tIdx * 6 + (spec.p.priceDelta || 0);
      const isClub = Boolean(spec.p.vip || tIdx === 1 && idx >= 7);
      pushItem({
        id: `decor_rug_${idx}_${tIdx}`,
        type: 'art_deco_rug',
        name: `${spec.title} (${trim})`,
        category: isClub ? 'club_exclusives' : 'lighting_decor',
        roomGroup: 'Decorations',
        walkable: true,
        creditsPrice: credits,
        tokensPrice: credits * 50,
        memberPointsPrice: credits * 20,
        tagline: 'Floor-layer rug · Stack chairs & tables above',
        description: `Woven ${spec.p.material.toLowerCase()} Art Deco carpet with ${trim.toLowerCase()} geometric border.`,
        clubExclusive: isClub,
        variantSpec: {
          finishId: `${spec.p.id}_${tIdx}`,
          primaryHex: spec.p.primaryHex,
          secondaryHex: spec.p.secondaryHex,
          accentHex: spec.p.accentHex,
          material: spec.p.material,
          artworkIndex: idx,
        },
      });
    });
  });

  // 5. Additional Stackable Hotel Accessories, Dividers & Lounge Variants (~40 items to comfortably exceed 400+)
  const wiredAndClassicFinishes = STONE_WOOD_FINISHES.slice(0, 4);
  const classicRoomAdditions: Array<{
    slug: string;
    type: FurnitureType;
    name: string;
    category: CatalogCategory;
    roomGroup: HotelCatalogRoomGroup;
    walkable: boolean;
    credits: number;
    tagline: string;
    desc: string;
    toggleable?: boolean;
  }> = [
    { slug: 'loft_chair', type: 'loft_armchair', name: 'Sunlit Bouclé Armchair', category: 'seating', roomGroup: 'Guest Room', walkable: true, credits: 14, tagline: 'Relaxed suite chair · Sittable', desc: 'Plush reading chair for guest bedrooms.' },
    { slug: 'vip_sofa_mod', type: 'vip_sofa', name: 'Corner Lounge Booth', category: 'seating', roomGroup: 'Lobby', walkable: true, credits: 24, tagline: 'Modular curved banquette · Sittable', desc: 'Buttoned corner booth seating for lounges and bars.' },
    { slug: 'bar_mod', type: 'bar_counter', name: 'Hotel Salon Bar Counter', category: 'tables_surfaces', roomGroup: 'Cafe', walkable: false, credits: 28, tagline: 'Modular service bar · Stackable', desc: 'Inlaid marble-top hotel cocktail bar module.' },
    { slug: 'bar_corner_mod', type: 'bar_corner', name: 'Salon Bar Corner Module', category: 'tables_surfaces', roomGroup: 'Cafe', walkable: false, credits: 30, tagline: 'L-shaped bar corner · Stackable', desc: 'Seamless corner counter joining hotel bar runs.' },
    { slug: 'tray_service', type: 'cocktail_tray', name: 'Silver Room-Service Tray', category: 'tables_surfaces', roomGroup: 'Guest Room', walkable: false, credits: 10, tagline: 'Stackable tabletop service tray', desc: 'Crystal cloche and chilled service glasses.' },
    { slug: 'glass_div', type: 'glass_partition', name: 'Etched Deco Glass Divider', category: 'dividers_walls', roomGroup: 'Meeting', walkable: false, credits: 20, tagline: 'Frosted architectural partition', desc: 'Translucent etched glass screen with brass channel frame.' },
    { slug: 'balustrade', type: 'picket_fence', name: 'Terrace Stone Balustrade', category: 'dividers_walls', roomGroup: 'Pool', walkable: false, credits: 14, tagline: 'Low poolside marble railing', desc: 'Carved terrace parapet ideal for pools and balconies.' },
    { slug: 'brass_lamp', type: 'neon_lamp', name: 'Art Deco Floor Torchiere', category: 'lighting_decor', roomGroup: 'Decorations', walkable: false, credits: 16, tagline: 'Double-tap to toggle warm glow', desc: 'Tall brass torchiere casting warm amber pools.', toggleable: true },
    { slug: 'tele_lift', type: 'teleporter_booth', name: 'Linked Pneumatic Teleporter', category: 'games_wired', roomGroup: 'Wired & Games', walkable: true, credits: 28, tagline: 'Step inside to warp across rooms', desc: 'Brass pneumatic capsule linking Channels 1–6.' },
    { slug: 'floor_plate', type: 'pressure_plate', name: 'Brass Floor Switch', category: 'games_wired', roomGroup: 'Wired & Games', walkable: true, credits: 18, tagline: 'Step on to toggle paired lights/gates', desc: 'Recessed brass trigger plate wired to Channels 1–6.', toggleable: true },
    { slug: 'turnstile', type: 'one_way_gate', name: 'Brass Hotel Turnstile', category: 'games_wired', roomGroup: 'Wired & Games', walkable: true, credits: 22, tagline: 'One-way directional gate', desc: 'Admits guests in the arrow direction only.' },
    { slug: 'casino_die_set', type: 'casino_dice', name: 'Ivory & Gold Casino Die', category: 'games_wired', roomGroup: 'Casino', walkable: false, credits: 18, tagline: 'Double-tap to roll 1–6', desc: 'Precision casino die announcing synced rolls.', toggleable: true },
    { slug: 'dance_gilded', type: 'dance_floor_tile', name: 'Gilded Ballroom Floor Tile', category: 'lighting_decor', roomGroup: 'Lobby', walkable: true, credits: 12, tagline: 'Reactive brass-inlaid floor tile', desc: 'Walkable ballroom tile with subtle warm shimmer.' },
  ];

  for (const add of classicRoomAdditions) {
    wiredAndClassicFinishes.forEach((fin) => {
      const credits = add.credits + (fin.priceDelta || 0);
      pushItem({
        id: `hotel_add_${add.slug}_${fin.id}`,
        type: add.type,
        name: `${add.name} (${fin.label})`,
        category: fin.vip ? 'club_exclusives' : add.category,
        roomGroup: add.roomGroup,
        walkable: add.walkable,
        creditsPrice: credits,
        tokensPrice: credits * 50,
        memberPointsPrice: credits * 20,
        tagline: `${fin.material} · ${add.tagline}`,
        description: `${add.desc} Finished in ${fin.label}.`,
        clubExclusive: Boolean(fin.vip),
        toggleable: add.toggleable,
        variantSpec: {
          finishId: fin.id,
          primaryHex: fin.primaryHex,
          secondaryHex: fin.secondaryHex,
          accentHex: fin.accentHex,
          material: fin.material,
        },
      });
    });
  }

  // 6. Include legacy base items cleanly mapped to room groups so backward compatibility stays 100% intact
  for (const legacy of SHOP_FURNITURE_CATALOG) {
    const legacyId = legacy.id || `legacy_${legacy.type}`;
    if (seenIds.has(legacyId)) continue;
    let roomGroup: HotelCatalogRoomGroup = 'Wired & Games';
    if (legacy.clubExclusive) roomGroup = 'VIP Exclusives';
    else if (legacy.category === 'seating') roomGroup = 'Lobby';
    else if (legacy.category === 'tables_surfaces') roomGroup = 'Cafe';
    else if (legacy.category === 'lighting_decor') roomGroup = 'Decorations';
    else if (legacy.category === 'dividers_walls') roomGroup = 'Meeting';

    pushItem({
      ...legacy,
      id: legacyId,
      roomGroup: legacy.roomGroup || roomGroup,
      memberPointsPrice: legacy.memberPointsPrice ?? legacy.creditsPrice * 20,
    });
  }

  return catalog;
}

export const HOTEL_CATALOG_ITEMS: ShopCatalogItem[] = buildHotelCatalog();

export const HOTEL_ROOM_GROUPS: Array<{
  id: HotelCatalogRoomGroup;
  label: string;
  subtitle: string;
}> = [
  { id: 'Lobby', label: 'Grand Lobby', subtitle: 'Reception desks, Chesterfields, brass lifts & pianos' },
  { id: 'Guest Room', label: 'Guest Suites', subtitle: 'Four-poster beds, nightstands, TVs & armoires' },
  { id: 'Cafe', label: 'Hotel Café', subtitle: 'Coffee machines, baristas, bistros & vending' },
  { id: 'Casino', label: 'Monte Carlo Casino', subtitle: 'Poker, roulette, craps & animated slots' },
  { id: 'Pool', label: 'Thermal Pool Terrace', subtitle: 'Teak loungers, cabanas & heated spas' },
  { id: 'Meeting', label: 'Executive Boardroom', subtitle: 'Boardroom tables, swivel chairs & libraries' },
  { id: 'Decorations', label: 'Art, Vases & Rugs', subtitle: '24 framed paintings, 12 vases, 12 rugs & lighting' },
  { id: 'VIP Exclusives', label: 'VIP Club Vault', subtitle: '50+ Member-locked Gold Thrones, Private Jets & more' },
  { id: 'Wired & Games', label: 'Wired & Architecture', subtitle: 'Teleporters, turnstiles, gates & switches' },
];

const HOTEL_CATALOG_MAP = new Map<string, ShopCatalogItem>(
  HOTEL_CATALOG_ITEMS.map((item) => [item.id || item.type, item])
);

export function getHotelCatalogItemById(id?: string): ShopCatalogItem | undefined {
  if (!id) return undefined;
  return HOTEL_CATALOG_MAP.get(id);
}
