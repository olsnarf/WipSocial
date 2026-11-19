import {
  DOORWAY_TILE,
  ENTRY_STEP_TILE,
  MAX_FURNI_Z_HEIGHT,
  ROOM_LAYOUT_PRESETS,
  type CameraState,
  type Direction,
  type FloorTheme,
  type FurnitureItem,
  type FurnitureRotation,
  type FurnitureState,
  type FurnitureType,
  type FurnitureVariantSpec,
  type RoomGameMode,
  type RoomLayoutType,
  type WallTheme,
} from '../types/lounge';

export const GRID_SIZE = 12;
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const WALL_HEIGHT = 116;

export interface RoomDimensions {
  width: number;
  height: number;
  cutoutMinX?: number;
  cutoutMinY?: number;
}

export function getRoomDimensions(
  layoutType: RoomLayoutType = 'classic_lounge'
): RoomDimensions {
  const preset = ROOM_LAYOUT_PRESETS.find((r) => r.id === layoutType);
  if (preset) {
    return {
      width: preset.width,
      height: preset.height,
      cutoutMinX: preset.cutoutMinX,
      cutoutMinY: preset.cutoutMinY,
    };
  }
  return { width: GRID_SIZE, height: GRID_SIZE };
}

export interface SeedFurnitureDef {
  id: string;
  type: FurnitureType;
  name: string;
  x: number;
  y: number;
  rotation: FurnitureRotation;
  walkable: boolean;
  zHeight?: number;
  state?: FurnitureState;
  isClubOnly?: boolean;
  variantSpec?: FurnitureVariantSpec;
}

export type SystemPublicRoomId =
  | 'velvet_lobby'
  | 'rooftop_bar'
  | 'vip_speakeasy'
  | 'turf_wars_arena'
  | 'rapid_chairs_hall'
  | 'grand_parlor_casino';

export interface PublicRoomSeedDef {
  id: SystemPublicRoomId;
  name: string;
  wallTheme: WallTheme;
  floorTheme: FloorTheme;
  ambientDim: number;
  layoutType: RoomLayoutType;
  gameMode: RoomGameMode;
  allowWalkThrough?: boolean;
  furniture: SeedFurnitureDef[];
}

export const INITIAL_ROOM_FURNITURE: SeedFurnitureDef[] = [
  // Grand Lobby Reception Wing (Left/Upper)
  {
    id: 'lobby_sconce_1',
    type: 'wall_sconce',
    name: 'Fluted Glass Wall Sconce',
    x: 2,
    y: 0,
    rotation: 0,
    walkable: false,
    state: 'on',
  },
  {
    id: 'lobby_painting_1',
    type: 'framed_painting',
    name: 'Golden Skyline Nocturne',
    x: 4,
    y: 0,
    rotation: 0,
    walkable: false,
    variantSpec: {
      finishId: 'gilded_gold_0',
      primaryHex: '#13243f',
      secondaryHex: '#0a1220',
      accentHex: '#d4af37',
      material: 'Oil on Canvas',
      artworkIndex: 0,
    },
  },
  {
    id: 'lobby_elevator_1',
    type: 'hotel_elevator',
    name: 'Art Deco Brass Elevator',
    x: 6,
    y: 0,
    rotation: 0,
    walkable: true,
    state: 'idle',
  },
  {
    id: 'lobby_painting_2',
    type: 'framed_painting',
    name: 'Atrium Palm Moonlight',
    x: 8,
    y: 0,
    rotation: 0,
    walkable: false,
    variantSpec: {
      finishId: 'gilded_gold_1',
      primaryHex: '#13243f',
      secondaryHex: '#0a1220',
      accentHex: '#d4af37',
      material: 'Oil on Canvas',
      artworkIndex: 1,
    },
  },
  {
    id: 'lobby_ficus_1',
    type: 'potted_ficus',
    name: 'Hotel Atrium Ficus',
    x: 1,
    y: 1,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'lobby_rec_1',
    type: 'reception_desk',
    name: 'Grand Reception Desk (Calacatta White Marble)',
    x: 2,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'lobby_rec_2',
    type: 'reception_desk',
    name: 'Grand Reception Desk (Calacatta White Marble)',
    x: 3,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'lobby_rec_3',
    type: 'reception_desk',
    name: 'Grand Reception Desk (Calacatta White Marble)',
    x: 4,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'lobby_vase_rec',
    type: 'deco_vase',
    name: 'Ming Cobalt & Gold Vase',
    x: 4,
    y: 2,
    rotation: 0,
    walkable: false,
    zHeight: 1.4,
    variantSpec: {
      finishId: 'cobalt_0',
      primaryHex: '#1d4ed8',
      secondaryHex: '#1e3a8a',
      accentHex: '#d4af37',
      material: 'Porcelain',
      artworkIndex: 0,
    },
  },
  {
    id: 'lobby_stanchion_1',
    type: 'brass_stanchion',
    name: 'Hotel Velvet Stanchion',
    x: 2,
    y: 4,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'lobby_stanchion_2',
    type: 'brass_stanchion',
    name: 'Hotel Velvet Stanchion',
    x: 3,
    y: 4,
    rotation: 0,
    walkable: false,
  },

  // Center Grand Atrium Seating & Grand Piano
  {
    id: 'lobby_rug_1',
    type: 'art_deco_rug',
    name: 'Sunburst Sapphire Runner Rug',
    x: 4,
    y: 6,
    rotation: 0,
    walkable: true,
    variantSpec: {
      finishId: 'sunburst_blue_0',
      primaryHex: '#132a4f',
      secondaryHex: '#0a162b',
      accentHex: '#d4af37',
      material: 'Wool',
      artworkIndex: 0,
    },
  },
  {
    id: 'lobby_rug_2',
    type: 'art_deco_rug',
    name: 'Sunburst Sapphire Runner Rug',
    x: 5,
    y: 6,
    rotation: 0,
    walkable: true,
    variantSpec: {
      finishId: 'sunburst_blue_0',
      primaryHex: '#132a4f',
      secondaryHex: '#0a162b',
      accentHex: '#d4af37',
      material: 'Wool',
      artworkIndex: 0,
    },
  },
  {
    id: 'lobby_rug_3',
    type: 'art_deco_rug',
    name: 'Sunburst Sapphire Runner Rug',
    x: 4,
    y: 7,
    rotation: 0,
    walkable: true,
    variantSpec: {
      finishId: 'sunburst_blue_0',
      primaryHex: '#132a4f',
      secondaryHex: '#0a162b',
      accentHex: '#d4af37',
      material: 'Wool',
      artworkIndex: 0,
    },
  },
  {
    id: 'lobby_rug_4',
    type: 'art_deco_rug',
    name: 'Sunburst Sapphire Runner Rug',
    x: 5,
    y: 7,
    rotation: 0,
    walkable: true,
    variantSpec: {
      finishId: 'sunburst_blue_0',
      primaryHex: '#132a4f',
      secondaryHex: '#0a162b',
      accentHex: '#d4af37',
      material: 'Wool',
      artworkIndex: 0,
    },
  },
  {
    id: 'lobby_chest_1',
    type: 'chesterfield_sofa',
    name: 'Tufted Chesterfield Sofa (Aged Cognac Leather)',
    x: 3,
    y: 6,
    rotation: 0,
    walkable: true,
    variantSpec: {
      finishId: 'aged_leather',
      primaryHex: '#6b3a24',
      secondaryHex: '#4a2617',
      accentHex: '#d4af37',
      material: 'Leather',
    },
  },
  {
    id: 'lobby_chest_2',
    type: 'chesterfield_sofa',
    name: 'Tufted Chesterfield Sofa (Aged Cognac Leather)',
    x: 3,
    y: 7,
    rotation: 0,
    walkable: true,
    variantSpec: {
      finishId: 'aged_leather',
      primaryHex: '#6b3a24',
      secondaryHex: '#4a2617',
      accentHex: '#d4af37',
      material: 'Leather',
    },
  },
  {
    id: 'lobby_tbl_center',
    type: 'vip_table',
    name: 'Marble Candle Table',
    x: 4,
    y: 7,
    rotation: 0,
    walkable: false,
    zHeight: 0.1,
    state: 'on',
  },
  {
    id: 'lobby_arm_1',
    type: 'velvet_armchair',
    name: 'Aurelia Club Armchair (Velvet Peacock Teal)',
    x: 6,
    y: 6,
    rotation: 180,
    walkable: true,
    variantSpec: {
      finishId: 'velvet_teal',
      primaryHex: '#0f5e5a',
      secondaryHex: '#083b39',
      accentHex: '#e5c158',
      material: 'Velvet',
    },
  },
  {
    id: 'lobby_arm_2',
    type: 'velvet_armchair',
    name: 'Aurelia Club Armchair (Velvet Peacock Teal)',
    x: 6,
    y: 7,
    rotation: 180,
    walkable: true,
    variantSpec: {
      finishId: 'velvet_teal',
      primaryHex: '#0f5e5a',
      secondaryHex: '#083b39',
      accentHex: '#e5c158',
      material: 'Velvet',
    },
  },
  {
    id: 'lobby_piano_1',
    type: 'vip_grand_piano',
    name: 'Atrium Grand Piano',
    x: 1,
    y: 9,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'lobby_chandelier_1',
    type: 'crystal_chandelier',
    name: 'Imperial Crystal Chandelier',
    x: 5,
    y: 5,
    rotation: 0,
    walkable: false,
    zHeight: 3.4,
    state: 'on',
  },
  {
    id: 'lobby_ficus_2',
    type: 'potted_ficus',
    name: 'Hotel Atrium Ficus',
    x: 1,
    y: 12,
    rotation: 0,
    walkable: false,
  },

  // Boutique Hotel Café Wing (Right Side)
  {
    id: 'cafe_barista_1',
    type: 'barista_counter',
    name: 'Marble Barista Counter',
    x: 10,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'cafe_barista_2',
    type: 'barista_counter',
    name: 'Marble Barista Counter',
    x: 11,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'cafe_barista_3',
    type: 'barista_counter',
    name: 'Marble Barista Counter',
    x: 12,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'cafe_espresso_1',
    type: 'coffee_machine',
    name: 'Commercial Espresso Machine',
    x: 11,
    y: 2,
    rotation: 0,
    walkable: false,
    zHeight: 1.4,
  },
  {
    id: 'cafe_pastry_1',
    type: 'pastry_display',
    name: 'Patisserie Glass Vitrine',
    x: 13,
    y: 2,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'cafe_vending_1',
    type: 'vending_machine',
    name: 'Illuminated Soda Automaton',
    x: 14,
    y: 1,
    rotation: 90,
    walkable: false,
  },
  {
    id: 'cafe_bistro_t1',
    type: 'bistro_table',
    name: 'Deco Cafe Bistro Table',
    x: 11,
    y: 5,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'cafe_bistro_c1',
    type: 'bistro_chair',
    name: 'Bentwood Cafe Chair',
    x: 10,
    y: 5,
    rotation: 0,
    walkable: true,
  },
  {
    id: 'cafe_bistro_c2',
    type: 'bistro_chair',
    name: 'Bentwood Cafe Chair',
    x: 12,
    y: 5,
    rotation: 180,
    walkable: true,
  },
  {
    id: 'cafe_bistro_t2',
    type: 'bistro_table',
    name: 'Deco Cafe Bistro Table',
    x: 11,
    y: 7,
    rotation: 0,
    walkable: false,
  },
  {
    id: 'cafe_bistro_c3',
    type: 'bistro_chair',
    name: 'Bentwood Cafe Chair',
    x: 10,
    y: 7,
    rotation: 0,
    walkable: true,
  },
  {
    id: 'cafe_bistro_c4',
    type: 'bistro_chair',
    name: 'Bentwood Cafe Chair',
    x: 12,
    y: 7,
    rotation: 180,
    walkable: true,
  },
  {
    id: 'cafe_sconce_2',
    type: 'wall_sconce',
    name: 'Fluted Glass Wall Sconce',
    x: 13,
    y: 0,
    rotation: 0,
    walkable: false,
    state: 'on',
  },
];

export const ROOFTOP_BAR_FURNITURE: SeedFurnitureDef[] = [
  { id: 'pool_elev_1', type: 'hotel_elevator', name: 'Art Deco Brass Elevator', x: 1, y: 0, rotation: 0, walkable: true },
  { id: 'pool_spa_1', type: 'vip_hot_tub', name: 'Thermal Marble Spa Tub', x: 5, y: 2, rotation: 0, walkable: true },
  { id: 'pool_spa_2', type: 'vip_hot_tub', name: 'Thermal Marble Spa Tub', x: 6, y: 2, rotation: 0, walkable: true },
  { id: 'pool_cabana_1', type: 'cabana_canopy', name: 'VIP Poolside Cabana', x: 9, y: 2, rotation: 90, walkable: true },
  { id: 'pool_lounger_1', type: 'pool_lounger', name: 'Terrace Teak Pool Lounger', x: 2, y: 5, rotation: 90, walkable: true },
  { id: 'pool_lounger_2', type: 'pool_lounger', name: 'Terrace Teak Pool Lounger', x: 4, y: 5, rotation: 90, walkable: true },
  { id: 'pool_lounger_3', type: 'pool_lounger', name: 'Terrace Teak Pool Lounger', x: 6, y: 5, rotation: 90, walkable: true },
  { id: 'pool_bistro_1', type: 'bistro_table', name: 'Deco Cafe Bistro Table', x: 8, y: 7, rotation: 0, walkable: false },
  { id: 'pool_chair_1', type: 'bistro_chair', name: 'Bentwood Cafe Chair', x: 7, y: 7, rotation: 0, walkable: true },
  { id: 'pool_chair_2', type: 'bistro_chair', name: 'Bentwood Cafe Chair', x: 9, y: 7, rotation: 180, walkable: true },
  { id: 'pool_bar_1', type: 'barista_counter', name: 'Marble Barista Counter', x: 1, y: 9, rotation: 0, walkable: false },
  { id: 'pool_bar_2', type: 'barista_counter', name: 'Marble Barista Counter', x: 2, y: 9, rotation: 0, walkable: false },
  { id: 'pool_vending_1', type: 'vending_machine', name: 'Illuminated Soda Automaton', x: 0, y: 8, rotation: 0, walkable: false },
  { id: 'pool_ficus_1', type: 'potted_ficus', name: 'Hotel Atrium Ficus', x: 1, y: 1, rotation: 0, walkable: false },
  { id: 'pool_ficus_2', type: 'potted_ficus', name: 'Hotel Atrium Ficus', x: 10, y: 9, rotation: 0, walkable: false },
  { id: 'pool_bal_1', type: 'picket_fence', name: 'Terrace Stone Balustrade', x: 3, y: 10, rotation: 0, walkable: false },
  { id: 'pool_bal_2', type: 'picket_fence', name: 'Terrace Stone Balustrade', x: 4, y: 10, rotation: 0, walkable: false },
  { id: 'pool_bal_3', type: 'picket_fence', name: 'Terrace Stone Balustrade', x: 5, y: 10, rotation: 0, walkable: false },
];

export const VIP_SPEAKEASY_FURNITURE: SeedFurnitureDef[] = [
  { id: 'suite_elev_1', type: 'hotel_elevator', name: 'Art Deco Brass Elevator', x: 1, y: 0, rotation: 0, walkable: true },
  { id: 'suite_bed_1', type: 'four_poster_bed', name: 'Four-Poster Canopy Bed', x: 4, y: 2, rotation: 90, walkable: true },
  { id: 'suite_night_1', type: 'nightstand', name: 'Suite Bedside Nightstand', x: 3, y: 2, rotation: 0, walkable: false },
  { id: 'suite_night_2', type: 'nightstand', name: 'Suite Bedside Nightstand', x: 5, y: 2, rotation: 0, walkable: false },
  { id: 'suite_wardrobe', type: 'wardrobe_cabinet', name: 'Grand Armoire Wardrobe', x: 1, y: 3, rotation: 0, walkable: false },
  { id: 'suite_suitcase', type: 'suitcase_stand', name: 'Brass Luggage Stand', x: 1, y: 5, rotation: 0, walkable: false },
  { id: 'suite_tv', type: 'flat_screen_tv', name: 'Suite Console Flat-Screen TV', x: 8, y: 1, rotation: 90, walkable: false, state: 'on' },
  { id: 'suite_fridge', type: 'mini_fridge', name: 'Cabinetry Mini-Fridge', x: 10, y: 1, rotation: 0, walkable: false },
  { id: 'suite_sofa', type: 'chesterfield_sofa', name: 'Tufted Chesterfield Sofa', x: 8, y: 4, rotation: 270, walkable: true },
  { id: 'suite_rug', type: 'art_deco_rug', name: 'Chevron Emerald & Gold Rug', x: 8, y: 3, rotation: 0, walkable: true, variantSpec: { finishId: 'chevron_emerald', primaryHex: '#0f4c45', secondaryHex: '#072b27', accentHex: '#e5c158', material: 'Silk', artworkIndex: 1 } },
  { id: 'suite_board_1', type: 'boardroom_table', name: 'Executive Boardroom Table', x: 3, y: 8, rotation: 0, walkable: false },
  { id: 'suite_exec_1', type: 'executive_chair', name: 'Executive Swivel Armchair', x: 2, y: 8, rotation: 0, walkable: true },
  { id: 'suite_exec_2', type: 'executive_chair', name: 'Executive Swivel Armchair', x: 4, y: 8, rotation: 180, walkable: true },
  { id: 'suite_paint_1', type: 'framed_painting', name: 'Sunburst Metropolis', x: 6, y: 0, rotation: 0, walkable: false, variantSpec: { finishId: 'gilded_gold_3', primaryHex: '#13243f', secondaryHex: '#0a1220', accentHex: '#d4af37', material: 'Oil on Canvas', artworkIndex: 3 } },
  { id: 'suite_books', type: 'cozy_bookshelf', name: 'Salon Library Bookcase', x: 10, y: 8, rotation: 180, walkable: false },
];

export const TURF_WARS_FURNITURE: SeedFurnitureDef[] = [
  { id: 'turf_sb_1', type: 'arena_scoreboard', name: 'Arena Scoreboard', x: 5, y: 0, rotation: 0, walkable: false },
  { id: 'turf_sconce_1', type: 'wall_sconce', name: 'Fluted Glass Wall Sconce', x: 2, y: 0, rotation: 0, walkable: false, state: 'on' },
  { id: 'turf_sconce_2', type: 'wall_sconce', name: 'Fluted Glass Wall Sconce', x: 9, y: 0, rotation: 0, walkable: false, state: 'on' },
  { id: 'turf_post_1', type: 'brass_stanchion', name: 'Hotel Velvet Stanchion', x: 0, y: 11, rotation: 0, walkable: false },
  { id: 'turf_post_2', type: 'brass_stanchion', name: 'Hotel Velvet Stanchion', x: 11, y: 11, rotation: 0, walkable: false },
];

export const RAPID_CHAIRS_FURNITURE: SeedFurnitureDef[] = [
  { id: 'rc_sb_1', type: 'arena_scoreboard', name: 'Arena Scoreboard', x: 6, y: 1, rotation: 0, walkable: false },
  { id: 'rc_piano_1', type: 'vip_grand_piano', name: 'Atrium Grand Piano', x: 2, y: 1, rotation: 0, walkable: false },
  { id: 'rc_rope_1', type: 'brass_stanchion', name: 'Hotel Velvet Stanchion', x: 2, y: 3, rotation: 90, walkable: false },
  { id: 'rc_rope_2', type: 'brass_stanchion', name: 'Hotel Velvet Stanchion', x: 2, y: 4, rotation: 90, walkable: false },
  { id: 'rc_rope_3', type: 'brass_stanchion', name: 'Hotel Velvet Stanchion', x: 2, y: 5, rotation: 90, walkable: false },
  { id: 'rc_chand_1', type: 'crystal_chandelier', name: 'Imperial Crystal Chandelier', x: 6, y: 6, rotation: 0, walkable: false, zHeight: 3.4, state: 'on' },
];

export const PARLOR_CASINO_FURNITURE: SeedFurnitureDef[] = [
  { id: 'par_elev_1', type: 'hotel_elevator', name: 'Art Deco Brass Elevator', x: 1, y: 0, rotation: 0, walkable: true },
  { id: 'par_bar_1', type: 'bar_corner', name: 'Salon Bar Corner Module', x: 8, y: 1, rotation: 0, walkable: false },
  { id: 'par_bar_2', type: 'bar_counter', name: 'Hotel Salon Bar Counter', x: 9, y: 1, rotation: 0, walkable: false },
  { id: 'par_bar_3', type: 'bar_counter', name: 'Hotel Salon Bar Counter', x: 10, y: 1, rotation: 0, walkable: false },
  { id: 'par_trophy_1', type: 'vip_golden_trophy', name: 'Aurelia Founders Cup', x: 9, y: 1, rotation: 0, walkable: false, zHeight: 1.8 },
  { id: 'par_poker_1', type: 'poker_table', name: 'High-Stakes Poker Table', x: 3, y: 4, rotation: 0, walkable: false },
  { id: 'par_chr_1', type: 'executive_chair', name: 'Executive Swivel Armchair', x: 2, y: 4, rotation: 0, walkable: true },
  { id: 'par_chr_2', type: 'executive_chair', name: 'Executive Swivel Armchair', x: 4, y: 4, rotation: 180, walkable: true },
  { id: 'par_chips_1', type: 'poker_chips', name: 'Clay Poker Chip Rack', x: 3, y: 4, rotation: 0, walkable: false, zHeight: 1.2 },
  { id: 'par_roulette_1', type: 'roulette_table', name: 'Monte Carlo Roulette Table', x: 8, y: 5, rotation: 0, walkable: false },
  { id: 'par_craps_1', type: 'craps_table', name: 'Grand Velvet Craps Table', x: 4, y: 8, rotation: 0, walkable: false },
  { id: 'par_slot_1', type: 'slot_machine', name: 'Aurelia Gilded Slot Machine', x: 11, y: 3, rotation: 180, walkable: false },
  { id: 'par_slot_2', type: 'slot_machine', name: 'Aurelia Gilded Slot Machine', x: 11, y: 4, rotation: 180, walkable: false },
  { id: 'par_slot_3', type: 'slot_machine', name: 'Diamond Jackpot Slot Machine', x: 11, y: 5, rotation: 180, walkable: false },
  { id: 'par_chand_1', type: 'crystal_chandelier', name: 'Imperial Crystal Chandelier', x: 6, y: 5, rotation: 0, walkable: false, zHeight: 3.4, state: 'on' },
];

export const OWNER_SANCTUARY_FURNITURE: SeedFurnitureDef[] = [
  { id: 'sanc_throne', type: 'gold_throne', name: 'Gold-Plated Sovereign Throne', x: 9, y: 2, rotation: 90, walkable: true },
  { id: 'sanc_piano', type: 'vip_grand_piano', name: 'Atrium Grand Piano', x: 2, y: 2, rotation: 0, walkable: false },
  { id: 'sanc_spa', type: 'vip_hot_tub', name: 'Thermal Marble Spa Tub', x: 16, y: 3, rotation: 0, walkable: true },
  { id: 'sanc_vase', type: 'deco_vase', name: 'Art Deco Gilded Urn', x: 8, y: 3, rotation: 0, walkable: false },
  { id: 'sanc_jet', type: 'jet_interior_tile', name: 'Private Jet Cabin Suite Tile', x: 14, y: 2, rotation: 90, walkable: true },
  { id: 'sanc_chest_1', type: 'chesterfield_sofa', name: 'Tufted Chesterfield Sofa', x: 5, y: 8, rotation: 0, walkable: true },
  { id: 'sanc_chest_2', type: 'chesterfield_sofa', name: 'Tufted Chesterfield Sofa', x: 6, y: 8, rotation: 0, walkable: true },
  { id: 'sanc_rug_1', type: 'art_deco_rug', name: 'Sovereign Gold-Weave Carpet', x: 5, y: 9, rotation: 0, walkable: true, variantSpec: { finishId: 'sovereign_gold', primaryHex: '#85641b', secondaryHex: '#423009', accentHex: '#fef08a', material: 'Silk', artworkIndex: 9 } },
  { id: 'sanc_tbl', type: 'vip_table', name: 'Marble Candle Table', x: 5, y: 9, rotation: 0, walkable: false, zHeight: 0.1, state: 'on' },
  { id: 'sanc_bar_1', type: 'barista_counter', name: 'Marble Barista Counter', x: 14, y: 12, rotation: 0, walkable: false },
  { id: 'sanc_coffee', type: 'coffee_machine', name: 'Commercial Espresso Machine', x: 14, y: 12, rotation: 0, walkable: false, zHeight: 1.4 },
  { id: 'sanc_chand', type: 'crystal_chandelier', name: 'Imperial Crystal Chandelier', x: 9, y: 6, rotation: 0, walkable: false, zHeight: 3.4, state: 'on' },
];

export const PUBLIC_ROOMS_SEED: PublicRoomSeedDef[] = [
  {
    id: 'velvet_lobby',
    name: 'The Aurelia — Grand Lobby & Café',
    wallTheme: 'art_deco_brass',
    floorTheme: 'veined_marble_gold',
    ambientDim: 0,
    layoutType: 'vip_duplex_loft',
    gameMode: 'hangout',
    furniture: INITIAL_ROOM_FURNITURE,
  },
  {
    id: 'rooftop_bar',
    name: 'Thermal Pool Terrace',
    wallTheme: 'emerald_terrace',
    floorTheme: 'emerald_terrazzo',
    ambientDim: 0,
    layoutType: 'classic_lounge',
    gameMode: 'hangout',
    furniture: ROOFTOP_BAR_FURNITURE,
  },
  {
    id: 'vip_speakeasy',
    name: 'Presidential Guest Suite',
    wallTheme: 'mahogany_lobby',
    floorTheme: 'art_deco_chevron',
    ambientDim: 4,
    layoutType: 'classic_lounge',
    gameMode: 'hangout',
    furniture: VIP_SPEAKEASY_FURNITURE,
  },
  {
    id: 'turf_wars_arena',
    name: 'Grand Ballroom Arena',
    wallTheme: 'sapphire_salon',
    floorTheme: 'ivory_travertine',
    ambientDim: 4,
    layoutType: 'classic_lounge',
    gameMode: 'turf_wars',
    furniture: TURF_WARS_FURNITURE,
  },
  {
    id: 'rapid_chairs_hall',
    name: 'Imperial Chandelier Hall',
    wallTheme: 'art_deco_brass',
    floorTheme: 'art_deco_chevron',
    ambientDim: 4,
    layoutType: 'classic_lounge',
    gameMode: 'rapid_chairs',
    furniture: RAPID_CHAIRS_FURNITURE,
  },
  {
    id: 'grand_parlor_casino',
    name: 'Monte Carlo Parlor & Casino',
    wallTheme: 'casino_gilded',
    floorTheme: 'sapphire_carpet',
    ambientDim: 6,
    layoutType: 'classic_lounge',
    gameMode: 'parlor_casino',
    furniture: PARLOR_CASINO_FURNITURE,
  },
];

export function isSystemPublicRoomId(roomId: string): boolean {
  return PUBLIC_ROOMS_SEED.some((r) => r.id === roomId);
}

export function getSeedFurnitureForRoom(roomId: string): SeedFurnitureDef[] {
  if (roomId === 'owner_sanctuary') return OWNER_SANCTUARY_FURNITURE;
  const found = PUBLIC_ROOMS_SEED.find((r) => r.id === roomId);
  return found ? found.furniture : [];
}

export function isSeatFurniture(type: FurnitureType): boolean {
  return (
    type === 'velvet_armchair' ||
    type === 'loft_armchair' ||
    type === 'vip_sofa' ||
    type === 'vip_emerald_throne' ||
    type === 'vip_hot_tub' ||
    type === 'tie_dye_beanbag' ||
    type === 'shag_velvet_sofa' ||
    type === 'chesterfield_sofa' ||
    type === 'bistro_chair' ||
    type === 'executive_chair' ||
    type === 'gold_throne' ||
    type === 'jet_interior_tile'
  );
}

export function isBedFurniture(type: FurnitureType): boolean {
  return (
    type === 'vip_daybed' ||
    type === 'four_poster_bed' ||
    type === 'pool_lounger' ||
    type === 'cabana_canopy'
  );
}

export function getFurnitureStackTop(type: FurnitureType): number {
  switch (type) {
    case 'club_rug':
    case 'dance_floor_tile':
    case 'tie_dye_rug':
    case 'art_deco_rug':
      return 0.1;
    case 'vip_table':
    case 'neon_cocktail_table':
    case 'cafe_bistro_table':
    case 'bistro_table':
    case 'nightstand':
    case 'suitcase_stand':
    case 'boardroom_table':
      return 1.0;
    case 'reception_desk':
    case 'barista_counter':
    case 'mini_fridge':
      return 1.4;
    case 'bar_counter':
    case 'bar_corner':
    case 'espresso_bar':
    case 'dj_console':
    case 'vip_grand_piano':
    case 'poker_table':
    case 'roulette_table':
    case 'craps_table':
    case 'pastry_display':
      return 1.8;
    case 'cozy_bookshelf':
    case 'wardrobe_cabinet':
      return 2.5;
    case 'arena_scoreboard':
    case 'peace_neon_art':
    case 'flat_screen_tv':
    case 'framed_painting':
      return 1.5;
    case 'rope_barrier':
    case 'picket_fence':
    case 'glass_partition':
    case 'velvet_stanchion':
    case 'brass_stanchion':
    case 'laser_gate':
      return 0.6;
    case 'velvet_armchair':
    case 'loft_armchair':
    case 'vip_sofa':
    case 'vip_daybed':
    case 'vip_emerald_throne':
    case 'vip_hot_tub':
    case 'tie_dye_beanbag':
    case 'shag_velvet_sofa':
    case 'chesterfield_sofa':
    case 'bistro_chair':
    case 'executive_chair':
    case 'gold_throne':
    case 'jet_interior_tile':
    case 'four_poster_bed':
    case 'pool_lounger':
    case 'cabana_canopy':
      return 0.5;
    case 'beaded_curtain':
    case 'hotel_elevator':
    case 'vip_lounge_door':
      return 0.0;
    case 'potted_monstera':
    case 'potted_ficus':
    case 'cocktail_tray':
    case 'casino_dice':
    case 'poker_chips':
    case 'deco_vase':
    case 'vip_golden_trophy':
    case 'lava_lamp':

    default:
      return 1.0;
  }
}

export function getAutoStackZHeight(
  furniture: FurnitureItem[],
  x: number,
  y: number,
  excludeItemId?: string
): number {
  let maxTop = 0;
  for (const item of furniture) {
    if (excludeItemId && item.id === excludeItemId) continue;
    if (item.x === x && item.y === y) {
      const top = (item.zHeight ?? 0) + getFurnitureStackTop(item.type);
      if (top > maxTop) maxTop = top;
    }
  }
  return Math.max(0, Math.min(MAX_FURNI_Z_HEIGHT, Math.round(maxTop * 10) / 10));
}

export function buildCollisionSet(furniture: FurnitureItem[]): Set<string> {
  const blocked = new Set<string>();
  for (const item of furniture) {
    if (isSeatFurniture(item.type) || isBedFurniture(item.type)) {
      continue;
    }
    if (
      item.type === 'club_rug' ||
      item.type === 'tie_dye_rug' ||
      item.type === 'art_deco_rug' ||
      item.type === 'dance_floor_tile' ||
      item.type === 'teleporter_booth' ||
      item.type === 'hotel_elevator' ||
      item.type === 'vip_lounge_door' ||
      item.type === 'one_way_gate' ||
      item.type === 'pressure_plate' ||
      item.type === 'beaded_curtain'
    ) {
      continue;
    }
    if (item.type === 'custom_sprite' && (item.walkable || item.customSpriteSpec?.shape === 'rug')) {
      continue;
    }
    if (item.type === 'vip_rope_gate' || item.type === 'laser_gate') {
      const isOpen = item.state === 'open' || item.walkable === true;
      if (!isOpen) blocked.add(`${item.x},${item.y}`);
      continue;
    }
    if (!item.walkable) {
      blocked.add(`${item.x},${item.y}`);
    }
  }
  return blocked;
}

export function buildOneWayGateMap(
  furniture: FurnitureItem[]
): Map<string, FurnitureRotation> {
  const gates = new Map<string, FurnitureRotation>();
  for (const item of furniture) {
    if (item.type === 'one_way_gate') {
      gates.set(`${item.x},${item.y}`, item.rotation);
    }
  }
  return gates;
}

export function isDoorwayTile(x: number, y: number): boolean {
  return x === DOORWAY_TILE.x && y === DOORWAY_TILE.y;
}

export function isEntryStepTile(x: number, y: number): boolean {
  return x === ENTRY_STEP_TILE.x && y === ENTRY_STEP_TILE.y;
}

export function isBuildRestrictedTile(
  x: number,
  y: number,
  itemType: FurnitureType,
  walkable: boolean,
  furniture: FurnitureItem[],
  excludeItemId?: string
): { restricted: boolean; reason: string | null } {
  if (isDoorwayTile(x, y)) {
    return { restricted: true, reason: 'Cannot build inside the entry doorway.' };
  }
  const isPassable =
    walkable ||
    isSeatFurniture(itemType) ||
    isBedFurniture(itemType) ||
    itemType === 'club_rug' ||
    itemType === 'tie_dye_rug' ||
    itemType === 'art_deco_rug' ||
    itemType === 'dance_floor_tile' ||
    itemType === 'beaded_curtain' ||
    itemType === 'pressure_plate' ||
    itemType === 'teleporter_booth' ||
    itemType === 'hotel_elevator' ||
    itemType === 'vip_lounge_door' ||
    itemType === 'one_way_gate';

  if (isEntryStepTile(x, y) && !isPassable) {
    return {
      restricted: true,
      reason: 'Doorway exit tile (0, 0) must stay clear of blocking furniture.',
    };
  }

  if (!isPassable) {
    const hasTeleporterOnTile = furniture.some(
      (f) =>
        f.id !== excludeItemId &&
        f.x === x &&
        f.y === y &&
        (f.type === 'teleporter_booth' || f.type === 'hotel_elevator')
    );
    if (hasTeleporterOnTile) {
      return {
        restricted: true,
        reason: 'Cannot place blocking furniture on a teleporter or elevator exit tile.',
      };
    }
  }

  return { restricted: false, reason: null };
}

export function isInBounds(
  x: number,
  y: number,
  layoutType: RoomLayoutType = 'classic_lounge',
  includeDoorway = true
): boolean {
  if (includeDoorway && isDoorwayTile(x, y)) return true;
  const dims = getRoomDimensions(layoutType);
  if (x < 0 || x >= dims.width || y < 0 || y >= dims.height) return false;
  if (
    dims.cutoutMinX !== undefined &&
    dims.cutoutMinY !== undefined &&
    x >= dims.cutoutMinX &&
    y >= dims.cutoutMinY
  ) {
    return false;
  }
  return true;
}

export function isTileWalkable(
  x: number,
  y: number,
  blockedSet: Set<string>,
  layoutType: RoomLayoutType = 'classic_lounge'
): boolean {
  if (isDoorwayTile(x, y)) return true;
  if (!isInBounds(x, y, layoutType)) return false;
  return !blockedSet.has(`${x},${y}`);
}

export function computeTurfKnockbackTile(
  kickerX: number,
  kickerY: number,
  targetX: number,
  targetY: number,
  blockedSet: Set<string>,
  layoutType: RoomLayoutType = 'classic_lounge'
): { x: number; y: number } {
  const dxRaw = targetX - kickerX;
  const dyRaw = targetY - kickerY;
  let stepX = 0;
  let stepY = 0;
  if (Math.abs(dxRaw) >= Math.abs(dyRaw)) {
    stepX = dxRaw >= 0 ? 1 : -1;
  } else {
    stepY = dyRaw >= 0 ? 1 : -1;
  }
  let destX = Math.round(targetX);
  let destY = Math.round(targetY);
  for (let step = 1; step <= 2; step++) {
    const nx = destX + stepX;
    const ny = destY + stepY;
    if (isInBounds(nx, ny, layoutType, false) && !blockedSet.has(`${nx},${ny}`)) {
      destX = nx;
      destY = ny;
    } else {
      break;
    }
  }
  return { x: destX, y: destY };
}

export function gridToScreen(
  x: number,
  y: number,
  camera: CameraState
): { sx: number; sy: number } {
  const isoX = (x - y) * (TILE_WIDTH / 2);
  const isoY = (x + y) * (TILE_HEIGHT / 2);
  return {
    sx: camera.originX + camera.panX + isoX * camera.zoom,
    sy: camera.originY + camera.panY + isoY * camera.zoom,
  };
}

export function screenToGrid(
  px: number,
  py: number,
  camera: CameraState,
  offsetLeft = 0,
  offsetTop = 0
): { gx: number; gy: number; floatX: number; floatY: number } {
  const canvasX = px - offsetLeft;
  const canvasY = py - offsetTop;
  const relX = (canvasX - camera.originX - camera.panX) / camera.zoom;
  const relY = (canvasY - camera.originY - camera.panY) / camera.zoom;

  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;

  const floatX = (relX / halfW + relY / halfH) / 2;
  const floatY = (relY / halfH - relX / halfW) / 2;

  return {
    gx: Math.floor(floatX),
    gy: Math.floor(floatY),
    floatX,
    floatY,
  };
}

export function getDirectionFromStep(dx: number, dy: number, fallback: Direction = 'SE'): Direction {
  if (dx === 0 && dy < 0) return 'NE';
  if (dx < 0 && dy === 0) return 'NW';
  if (dx > 0 && dy === 0) return 'SE';
  if (dx === 0 && dy > 0) return 'SW';
  if (dx > 0 && dy < 0) return 'NE';
  if (dx < 0 && dy < 0) return 'NW';
  if (dx > 0 && dy > 0) return 'SE';
  if (dx < 0 && dy > 0) return 'SW';
  return fallback;
}

export function getDirectionFromRotation(rotation: FurnitureRotation): Direction {
  if (rotation === 0) return 'SE';
  if (rotation === 90) return 'SW';
  if (rotation === 180) return 'NW';
  return 'NE';
}

export interface GridPoint {
  x: number;
  y: number;
}

export function getDirectionVectorFromRotation(
  rotation: FurnitureRotation
): GridPoint {
  if (rotation === 0) return { x: 1, y: 0 };
  if (rotation === 90) return { x: 0, y: 1 };
  if (rotation === 180) return { x: -1, y: 0 };
  return { x: 0, y: -1 };
}

interface AStarNode {
  x: number;
  y: number;
  g: number;
  f: number;
}

const CARDINAL_DIRS: GridPoint[] = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
];

export function findPathAStar(
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  blockedSet: Set<string>,
  layoutType: RoomLayoutType = 'classic_lounge',
  oneWayGates?: Map<string, FurnitureRotation>
): GridPoint[] {
  const sx = Math.round(startX);
  const sy = Math.round(startY);
  const gx = Math.round(goalX);
  const gy = Math.round(goalY);

  if (!isTileWalkable(gx, gy, blockedSet, layoutType) || (sx === gx && sy === gy)) {
    return [];
  }

  const startKey = `${sx},${sy}`;
  const goalKey = `${gx},${gy}`;

  const openMap = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, string>();

  openMap.set(startKey, {
    x: sx,
    y: sy,
    g: 0,
    f: Math.abs(gx - sx) + Math.abs(gy - sy),
  });

  while (openMap.size > 0) {
    let currentKey = '';
    let currentNode: AStarNode | null = null;
    for (const [key, node] of openMap.entries()) {
      if (!currentNode || node.f < currentNode.f) {
        currentNode = node;
        currentKey = key;
      }
    }

    if (!currentNode) break;
    if (currentKey === goalKey) {
      const path: GridPoint[] = [];
      let traceKey: string | undefined = goalKey;
      while (traceKey && traceKey !== startKey) {
        const [px, py] = traceKey.split(',').map(Number);
        path.push({ x: px, y: py });
        traceKey = cameFrom.get(traceKey);
      }
      path.reverse();
      return path;
    }

    openMap.delete(currentKey);
    closedSet.add(currentKey);

    for (const dir of CARDINAL_DIRS) {
      const nx = currentNode.x + dir.x;
      const ny = currentNode.y + dir.y;
      const nKey = `${nx},${ny}`;

      if (!isTileWalkable(nx, ny, blockedSet, layoutType) || closedSet.has(nKey)) {
        continue;
      }

      if (oneWayGates && oneWayGates.has(nKey)) {
        const gateRot = oneWayGates.get(nKey)!;
        const allowedDir = getDirectionVectorFromRotation(gateRot);
        if (dir.x !== allowedDir.x || dir.y !== allowedDir.y) {
          continue;
        }
      }

      const tentativeG = currentNode.g + 1;
      const existingNode = openMap.get(nKey);
      if (!existingNode || tentativeG < existingNode.g) {
        cameFrom.set(nKey, currentKey);
        const h = Math.abs(gx - nx) + Math.abs(gy - ny);
        openMap.set(nKey, {
          x: nx,
          y: ny,
          g: tentativeG,
          f: tentativeG + h,
        });
      }
    }
  }

  return [];
}

export function getSpawnTile(
  _blockedSet?: Set<string>,
  _layoutType: RoomLayoutType = 'classic_lounge'
): GridPoint {
  return { x: DOORWAY_TILE.x, y: DOORWAY_TILE.y };
}

export function getFallbackSafeTile(
  blockedSet: Set<string>,
  layoutType: RoomLayoutType = 'classic_lounge'
): GridPoint {
  if (isTileWalkable(ENTRY_STEP_TILE.x, ENTRY_STEP_TILE.y, blockedSet, layoutType)) {
    return { x: ENTRY_STEP_TILE.x, y: ENTRY_STEP_TILE.y };
  }
  return { x: DOORWAY_TILE.x, y: DOORWAY_TILE.y };
}
