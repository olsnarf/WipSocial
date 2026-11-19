import type {
  AvatarGender,
  BottomStyle,
  HairStyle,
  HatStyle,
  ShoeStyle,
  TopStyle,
} from '../types/lounge';

export type WardrobeSlot = 'hair' | 'top' | 'bottom' | 'footwear' | 'accessory';
export type AccessoryKind = 'none' | 'watch' | 'glasses' | 'sunglasses' | 'necklace' | 'hat';

export interface WardrobeCatalogItem {
  id: string;
  gender: AvatarGender;
  slot: WardrobeSlot;
  name: string;
  subtitle: string;
  hairStyle?: HairStyle;
  topStyle?: TopStyle;
  bottomStyle?: BottomStyle;
  shoeStyle?: ShoeStyle;
  hatStyle?: HatStyle;
  accessoryKind?: AccessoryKind;
  defaultColor: string;
  accentColor?: string;
  creditsPrice: number;
  memberPointsPrice?: number;
  clubExclusive?: boolean;
  tierRewardId?: 'tier_1m' | 'tier_3m' | 'tier_6m';
  isStarter?: boolean;
}

interface ColorFinish {
  tag: string;
  hex: string;
  accent: string;
  vip?: boolean;
  price?: number;
}

const SUIT_FINISHES: ColorFinish[] = [
  { tag: 'Midnight Navy', hex: '#13243f', accent: '#d4af37', price: 0 },
  { tag: 'Charcoal Obsidian', hex: '#1e2430', accent: '#cbd5e1', price: 6 },
  { tag: 'Emerald Velvet', hex: '#0f4c45', accent: '#e5c158', price: 10 },
  { tag: 'Burgundy Wine', hex: '#5b1428', accent: '#d4af37', price: 10 },
  { tag: 'Ivory Cream', hex: '#ebe3d5', accent: '#8c6b32', vip: true, price: 14 },
  { tag: 'Royal Sapphire', hex: '#163b70', accent: '#f3d479', vip: true, price: 14 },
];

const SHIRT_FINISHES: ColorFinish[] = [
  { tag: 'Crisp Ivory', hex: '#f5efe6', accent: '#d4af37', price: 0 },
  { tag: 'Champagne Silk', hex: '#e7d2a8', accent: '#13243f', price: 8 },
  { tag: 'Teal Peacock', hex: '#0d7670', accent: '#f5efe6', price: 8 },
  { tag: 'Onyx Black', hex: '#171a21', accent: '#d4af37', price: 8 },
  { tag: 'Bordeaux', hex: '#6c1b2e', accent: '#e2c07d', price: 10 },
  { tag: 'Imperial Gold', hex: '#d4af37', accent: '#0b1324', vip: true, price: 16 },
];

const TROUSER_FINISHES: ColorFinish[] = [
  { tag: 'Charcoal', hex: '#1f2937', accent: '#9ca3af', price: 0 },
  { tag: 'Espresso Brown', hex: '#432818', accent: '#d4af37', price: 6 },
  { tag: 'Navy Wool', hex: '#111d35', accent: '#cbd5e1', price: 6 },
  { tag: 'Cream Linen', hex: '#ddd3c2', accent: '#8c6b32', price: 8 },
  { tag: 'Forest Olive', hex: '#283d32', accent: '#d4af37', price: 8 },
];

const SHOE_FINISHES: ColorFinish[] = [
  { tag: 'Polished Onyx', hex: '#111827', accent: '#d4af37', price: 0 },
  { tag: 'Cognac Leather', hex: '#7c3f1d', accent: '#e5c158', price: 6 },
  { tag: 'Oxblood', hex: '#581523', accent: '#d4af37', price: 8 },
  { tag: 'Alabaster', hex: '#e5e7eb', accent: '#0f172a', price: 8 },
  { tag: 'Gilded Brass', hex: '#b68928', accent: '#fef3c7', vip: true, price: 14 },
];

function buildMaleWardrobe(): WardrobeCatalogItem[] {
  const items: WardrobeCatalogItem[] = [];

  // 1. Hair (12 distinct styles + color editions = 20 items)
  const maleHairs: Array<{
    id: string;
    name: string;
    hairStyle: HairStyle;
    color: string;
    vip?: boolean;
    price: number;
    starter?: boolean;
  }> = [
    { id: 'm_hair_undercut', name: 'Tailored Undercut', hairStyle: 'undercut', color: '#271911', price: 0, starter: true },
    { id: 'm_hair_pompadour', name: 'Deco Pompadour', hairStyle: 'pompadour', color: '#18181b', price: 0, starter: true },
    { id: 'm_hair_side_part', name: 'Executive Side Part', hairStyle: 'side_part', color: '#3b2417', price: 0, starter: true },
    { id: 'm_hair_buzz', name: 'Crisp Buzz Cut', hairStyle: 'buzz', color: '#18181b', price: 0, starter: true },
    { id: 'm_hair_man_bun', name: 'Artisan Man-Bun', hairStyle: 'man_bun', color: '#3b2417', vip: true, price: 12 },
    { id: 'm_hair_long_waves', name: 'Long Wavy Sweep', hairStyle: 'long_waves', color: '#6b4423', price: 8 },
    { id: 'm_hair_curly_crop', name: 'Curly Textured Crop', hairStyle: 'curly_crop', color: '#1f1612', price: 8 },
    { id: 'm_hair_slick_back', name: 'Gatsby Slick Back', hairStyle: 'slick_back', color: '#111827', vip: true, price: 14 },
    { id: 'm_hair_fade', name: 'Clean Taper Fade', hairStyle: 'fade', color: '#18181b', price: 6 },
    { id: 'm_hair_tousled', name: 'Riviera Tousled', hairStyle: 'tousled', color: '#9c6e3b', price: 8 },
    { id: 'm_hair_spiky', name: 'Sculpted Spike', hairStyle: 'spiky', color: '#27272a', price: 6 },
    { id: 'm_hair_curls', name: 'Velvet Ringlets', hairStyle: 'curls', color: '#4a2c1d', vip: true, price: 12 },
    { id: 'm_hair_pomp_plat', name: 'Platinum Pompadour', hairStyle: 'pompadour', color: '#e2d9c8', vip: true, price: 16 },
    { id: 'm_hair_slick_silver', name: 'Silver Fox Slick Back', hairStyle: 'slick_back', color: '#cbd5e1', vip: true, price: 16 },
    { id: 'm_hair_side_auburn', name: 'Auburn Side Part', hairStyle: 'side_part', color: '#7c2d12', price: 8 },
    { id: 'm_hair_tousled_gold', name: 'Sunlit Tousled Blonde', hairStyle: 'tousled', color: '#d4af37', price: 10 },
    { id: 'm_hair_fade_espresso', name: 'Espresso Temple Fade', hairStyle: 'fade', color: '#3b2214', price: 8 },
    { id: 'm_hair_bun_onyx', name: 'Onyx Atelier Bun', hairStyle: 'man_bun', color: '#0f172a', vip: true, price: 14 },
    { id: 'm_hair_wave_chestnut', name: 'Chestnut Riviera Waves', hairStyle: 'long_waves', color: '#5c3820', price: 10 },
    { id: 'm_hair_afro_retro', name: 'Heritage Crown Afro', hairStyle: 'afro', color: '#18181b', price: 12 },
  ];
  for (const h of maleHairs) {
    items.push({
      id: h.id,
      gender: 'male',
      slot: 'hair',
      name: h.name,
      subtitle: h.vip ? 'VIP Salon Cut · Custom colorable' : 'Boutique Salon Cut · Custom colorable',
      hairStyle: h.hairStyle,
      defaultColor: h.color,
      creditsPrice: h.price,
      memberPointsPrice: h.price > 0 ? h.price * 25 : 0,
      clubExclusive: h.vip,
      isStarter: h.starter,
    });
  }

  // 2. Tops (42 items across tailored hotel silhouettes)
  const maleTopArchetypes: Array<{
    key: string;
    label: string;
    topStyle: TopStyle;
    finishes: ColorFinish[];
  }> = [
    { key: 'polo', label: 'Designer Polo', topStyle: 'polo', finishes: SHIRT_FINISHES },
    { key: 'blazer', label: 'Slim-Fit Blazer', topStyle: 'suit', finishes: SUIT_FINISHES },
    { key: 'turtleneck', label: 'Merino Turtleneck', topStyle: 'turtleneck', finishes: SHIRT_FINISHES.slice(0, 5) },
    { key: 'silk', label: 'Silk Button-Up', topStyle: 'silk_shirt', finishes: SHIRT_FINISHES },
    { key: 'henley', label: 'Tailored Henley', topStyle: 'henley', finishes: SHIRT_FINISHES.slice(0, 4) },
    { key: 'varsity', label: 'Heritage Varsity Jacket', topStyle: 'varsity', finishes: SUIT_FINISHES.slice(0, 4) },
    { key: 'tux', label: 'Gilded Tuxedo Jacket', topStyle: 'tuxedo', finishes: SUIT_FINISHES },
    { key: 'cashmere', label: 'Cashmere Crewneck', topStyle: 'cashmere', finishes: SHIRT_FINISHES.slice(0, 4) },
    { key: 'leather', label: 'Bespoke Moto Leather', topStyle: 'leather', finishes: SUIT_FINISHES.slice(0, 3) },
  ];
  for (const arch of maleTopArchetypes) {
    arch.finishes.forEach((fin, idx) => {
      const basePrice = fin.price ?? 8;
      items.push({
        id: `m_top_${arch.key}_${idx}`,
        gender: 'male',
        slot: 'top',
        name: `${fin.tag} ${arch.label}`,
        subtitle: fin.vip ? 'VIP Atelier Tailoring' : 'Boutique Menswear',
        topStyle: arch.topStyle,
        defaultColor: fin.hex,
        accentColor: fin.accent,
        creditsPrice: arch.key === 'tux' ? Math.max(12, basePrice + 6) : basePrice,
        memberPointsPrice: (arch.key === 'tux' ? Math.max(12, basePrice + 6) : basePrice) * 25,
        clubExclusive: Boolean(fin.vip || (arch.key === 'tux' && idx >= 2)),
        isStarter: basePrice === 0 && (arch.key === 'polo' || arch.key === 'blazer'),
      });
    });
  }

  // 3. Bottoms (21 items)
  const maleBottomArch: Array<{
    key: string;
    label: string;
    bottomStyle: BottomStyle;
    finishes: ColorFinish[];
  }> = [
    { key: 'chinos', label: 'Tailored Chinos', bottomStyle: 'chinos', finishes: TROUSER_FINISHES },
    { key: 'jeans', label: 'Selvedge Designer Jeans', bottomStyle: 'jeans', finishes: TROUSER_FINISHES.slice(0, 4) },
    { key: 'slacks', label: 'Pleated Wool Slacks', bottomStyle: 'slacks', finishes: TROUSER_FINISHES },
    { key: 'cargo', label: 'Atelier Cargo Trousers', bottomStyle: 'cargo', finishes: TROUSER_FINISHES.slice(0, 4) },
    { key: 'shorts', label: 'Riviera Tailored Shorts', bottomStyle: 'shorts', finishes: TROUSER_FINISHES.slice(0, 3) },
  ];
  for (const arch of maleBottomArch) {
    arch.finishes.forEach((fin, idx) => {
      const price = fin.price ?? 6;
      items.push({
        id: `m_bot_${arch.key}_${idx}`,
        gender: 'male',
        slot: 'bottom',
        name: `${fin.tag} ${arch.label}`,
        subtitle: 'Boutique Menswear Bottoms',
        bottomStyle: arch.bottomStyle,
        defaultColor: fin.hex,
        accentColor: fin.accent,
        creditsPrice: price,
        memberPointsPrice: price * 25,
        isStarter: price === 0 && (arch.key === 'chinos' || arch.key === 'slacks'),
      });
    });
  }

  // 4. Footwear (16 items)
  const maleShoeArch: Array<{
    key: string;
    label: string;
    shoeStyle: ShoeStyle;
    finishes: ColorFinish[];
  }> = [
    { key: 'loafers', label: 'Penny Loafers', shoeStyle: 'loafers', finishes: SHOE_FINISHES.slice(0, 4) },
    { key: 'chelsea', label: 'Chelsea Boots', shoeStyle: 'boots', finishes: SHOE_FINISHES.slice(0, 4) },
    { key: 'sneakers', label: 'Minimalist High-Tops', shoeStyle: 'sneakers', finishes: SHOE_FINISHES.slice(0, 3) },
    { key: 'oxfords', label: 'Classic Oxfords', shoeStyle: 'oxfords', finishes: SHOE_FINISHES.slice(0, 3) },
    { key: 'espadrilles', label: 'Terrace Espadrilles', shoeStyle: 'espadrilles', finishes: SHOE_FINISHES.slice(0, 2) },
  ];
  for (const arch of maleShoeArch) {
    arch.finishes.forEach((fin, idx) => {
      const price = fin.price ?? 6;
      items.push({
        id: `m_shoe_${arch.key}_${idx}`,
        gender: 'male',
        slot: 'footwear',
        name: `${fin.tag} ${arch.label}`,
        subtitle: fin.vip ? 'VIP Bespoke Cobbler' : 'Boutique Footwear',
        shoeStyle: arch.shoeStyle,
        defaultColor: fin.hex,
        accentColor: fin.accent,
        creditsPrice: price,
        memberPointsPrice: price * 25,
        clubExclusive: Boolean(fin.vip),
        isStarter: price === 0 && (arch.key === 'loafers' || arch.key === 'oxfords'),
      });
    });
  }

  // 5. Accessories & Hats (14 items)
  const maleAccs: Array<{
    id: string;
    name: string;
    sub: string;
    kind: AccessoryKind;
    hat?: HatStyle;
    hex: string;
    price: number;
    vip?: boolean;
    tier?: 'tier_1m';
    starter?: boolean;
  }> = [
    { id: 'm_acc_none', name: 'Clean Unadorned', sub: 'No headwear or eyewear', kind: 'none', hat: 'none', hex: '#d4af37', price: 0, starter: true },
    { id: 'm_acc_watch_gold', name: 'Aurelia Chronograph Watch', sub: 'Brushed 18k gold wrist timepiece', kind: 'watch', hex: '#d4af37', price: 10 },
    { id: 'm_acc_watch_silver', name: 'Platinum Dress Watch', sub: 'Steel & sapphire dial timepiece', kind: 'watch', hex: '#cbd5e1', price: 8 },
    { id: 'm_acc_glasses_tortoise', name: 'Tortoise Optical Frames', sub: 'Scholar round hotel spectacles', kind: 'glasses', hex: '#78350f', price: 8 },
    { id: 'm_acc_glasses_wire', name: 'Gold Rimless Spectacles', sub: 'Fine brushed brass eyeglasses', kind: 'glasses', hex: '#d4af37', price: 10 },
    { id: 'm_acc_shades_aviator', name: 'Riviera Brass Aviators', sub: 'Smoked amber tinted sunglasses', kind: 'sunglasses', hex: '#1e293b', price: 10 },
    { id: 'm_acc_shades_noir', name: 'Noir Wayfarer Shades', sub: 'Matte onyx privacy sunglasses', kind: 'sunglasses', hex: '#0f172a', price: 10 },
    { id: 'm_acc_chain_gold', name: 'Cuban Link Gold Chain', sub: 'Polished 18k collar chain', kind: 'necklace', hex: '#e5c158', price: 12 },
    { id: 'm_acc_fedora', name: 'Borsalino Deco Fedora', sub: 'Structured felt fedora with silk band', kind: 'hat', hat: 'fedora', hex: '#292524', price: 10 },
    { id: 'm_acc_snapback', name: 'Atelier Wool Cap', sub: 'Tailored flannel cap', kind: 'hat', hat: 'snapback', hex: '#13243f', price: 8 },
    { id: 'm_acc_beanie', name: 'Cashmere Watch Beanie', sub: 'Ribbed midnight knit beanie', kind: 'hat', hat: 'beanie', hex: '#1e293b', price: 6 },
    { id: 'm_acc_tophat', name: 'Art Deco Top Hat', sub: '1-Month VIP Milestone Silk Top Hat', kind: 'hat', hat: 'tophat', hex: '#111827', price: 24, vip: true, tier: 'tier_1m' },
    { id: 'm_acc_crown', name: 'Sovereign Gold Crown', sub: 'VIP Royal Hotel Crest', kind: 'hat', hat: 'crown', hex: '#fbbf24', price: 35, vip: true },
    { id: 'm_acc_halo', name: 'Diamond Aureole', sub: 'Prismatic VIP Crest', kind: 'hat', hat: 'halo', hex: '#bae6fd', price: 40, vip: true },
  ];
  for (const a of maleAccs) {
    items.push({
      id: a.id,
      gender: 'male',
      slot: 'accessory',
      name: a.name,
      subtitle: a.sub,
      accessoryKind: a.kind,
      hatStyle: a.hat ?? 'none',
      defaultColor: a.hex,
      creditsPrice: a.price,
      memberPointsPrice: a.price > 0 ? a.price * 25 : 0,
      clubExclusive: a.vip,
      tierRewardId: a.tier,
      isStarter: a.starter,
    });
  }

  return items;
}

function buildFemaleWardrobe(): WardrobeCatalogItem[] {
  const items: WardrobeCatalogItem[] = [];

  // 1. Hair (12 distinct styles + color editions = 20 items)
  const femaleHairs: Array<{
    id: string;
    name: string;
    hairStyle: HairStyle;
    color: string;
    vip?: boolean;
    price: number;
    starter?: boolean;
  }> = [
    { id: 'f_hair_bob', name: 'Art Deco Sleek Bob', hairStyle: 'bob', color: '#18181b', price: 0, starter: true },
    { id: 'f_hair_long_waves', name: 'Long Layered Silk', hairStyle: 'long_waves', color: '#4a2c1d', price: 0, starter: true },
    { id: 'f_hair_beach_waves', name: 'Riviera Beach Waves', hairStyle: 'beach_waves', color: '#b47b3a', price: 0, starter: true },
    { id: 'f_hair_pixie', name: 'Parisian Pixie', hairStyle: 'pixie', color: '#271911', price: 0, starter: true },
    { id: 'f_hair_pigtails', name: 'Framed Twin Tails', hairStyle: 'pigtails', color: '#5c3820', price: 8 },
    { id: 'f_hair_braids', name: 'Crown Box Braids', hairStyle: 'braids', color: '#18181b', vip: true, price: 12 },
    { id: 'f_hair_afro_puff', name: 'Sculpted Afro Puff', hairStyle: 'afro_puff', color: '#1f1612', vip: true, price: 12 },
    { id: 'f_hair_chignon', name: 'Grand Ballroom Chignon', hairStyle: 'chignon', color: '#3b2417', vip: true, price: 14 },
    { id: 'f_hair_high_pony', name: 'Velvet High Ponytail', hairStyle: 'high_ponytail', color: '#18181b', price: 8 },
    { id: 'f_hair_curtain', name: 'Curtain Bangs Layered', hairStyle: 'curtain_bangs', color: '#7c4d25', price: 8 },
    { id: 'f_hair_curls', name: 'Bouncy Couture Curls', hairStyle: 'curls', color: '#4a2c1d', vip: true, price: 12 },
    { id: 'f_hair_bob_champagne', name: 'Champagne Blonde Bob', hairStyle: 'bob', color: '#e2c07d', price: 10 },
    { id: 'f_hair_wave_crimson', name: 'Venetian Auburn Waves', hairStyle: 'long_waves', color: '#7f1d1d', price: 10 },
    { id: 'f_hair_chignon_plat', name: 'Platinum Gala Chignon', hairStyle: 'chignon', color: '#e5e7eb', vip: true, price: 16 },
    { id: 'f_hair_braids_espresso', name: 'Espresso Braided Crown', hairStyle: 'braids', color: '#3b2214', vip: true, price: 14 },
    { id: 'f_hair_pony_gold', name: 'Honey Blonde Ponytail', hairStyle: 'high_ponytail', color: '#c89b54', price: 10 },
    { id: 'f_hair_pixie_silver', name: 'Silver Satin Pixie', hairStyle: 'pixie', color: '#cbd5e1', vip: true, price: 14 },
    { id: 'f_hair_beach_rose', name: 'Rosewood Beach Waves', hairStyle: 'beach_waves', color: '#831843', price: 10 },
    { id: 'f_hair_curtain_noir', name: 'Midnight Curtain Bangs', hairStyle: 'curtain_bangs', color: '#0f172a', price: 10 },
    { id: 'f_hair_afro_retro', name: 'Heritage Disco Crown', hairStyle: 'afro', color: '#271911', price: 12 },
  ];
  for (const h of femaleHairs) {
    items.push({
      id: h.id,
      gender: 'female',
      slot: 'hair',
      name: h.name,
      subtitle: h.vip ? 'VIP Salon Coiffure · Custom colorable' : 'Boutique Salon Coiffure · Custom colorable',
      hairStyle: h.hairStyle,
      defaultColor: h.color,
      creditsPrice: h.price,
      memberPointsPrice: h.price > 0 ? h.price * 25 : 0,
      clubExclusive: h.vip,
      isStarter: h.starter,
    });
  }

  // 2. Tops (42 items)
  const femaleTopArch: Array<{
    key: string;
    label: string;
    topStyle: TopStyle;
    finishes: ColorFinish[];
  }> = [
    { key: 'blouse', label: 'Silk Drape Blouse', topStyle: 'silk_blouse', finishes: SHIRT_FINISHES },
    { key: 'blazer', label: 'Tailored Atelier Blazer', topStyle: 'suit', finishes: SUIT_FINISHES },
    { key: 'crop', label: 'Bouclé Crop Jacket', topStyle: 'crop', finishes: SHIRT_FINISHES },
    { key: 'halter', label: 'Gala Satin Halter', topStyle: 'halter', finishes: SHIRT_FINISHES },
    { key: 'turtleneck', label: 'Cashmere Turtleneck', topStyle: 'turtleneck', finishes: SHIRT_FINISHES.slice(0, 5) },
    { key: 'cashmere', label: 'Fine Knit Cardigan', topStyle: 'cashmere', finishes: SHIRT_FINISHES.slice(0, 4) },
    { key: 'tux', label: 'Evening Smoking Jacket', topStyle: 'tuxedo', finishes: SUIT_FINISHES },
    { key: 'leather', label: 'Cropped Moto Leather', topStyle: 'leather', finishes: SUIT_FINISHES.slice(0, 3) },
    { key: 'tank', label: 'Silk Camisole', topStyle: 'tank', finishes: SHIRT_FINISHES.slice(0, 4) },
  ];
  for (const arch of femaleTopArch) {
    arch.finishes.forEach((fin, idx) => {
      const basePrice = fin.price ?? 8;
      items.push({
        id: `f_top_${arch.key}_${idx}`,
        gender: 'female',
        slot: 'top',
        name: `${fin.tag} ${arch.label}`,
        subtitle: fin.vip ? 'VIP Couture Atelier' : 'Boutique Womenswear',
        topStyle: arch.topStyle,
        defaultColor: fin.hex,
        accentColor: fin.accent,
        creditsPrice: arch.key === 'tux' ? Math.max(12, basePrice + 6) : basePrice,
        memberPointsPrice: (arch.key === 'tux' ? Math.max(12, basePrice + 6) : basePrice) * 25,
        clubExclusive: Boolean(fin.vip || (arch.key === 'tux' && idx >= 2)),
        isStarter: basePrice === 0 && (arch.key === 'blouse' || arch.key === 'blazer'),
      });
    });
  }

  // 3. Bottoms (21 items)
  const femaleBottomArch: Array<{
    key: string;
    label: string;
    bottomStyle: BottomStyle;
    finishes: ColorFinish[];
  }> = [
    { key: 'midi', label: 'Pleated Satin Midi Skirt', bottomStyle: 'midi_skirt', finishes: TROUSER_FINISHES },
    { key: 'skirt', label: 'Tailored Pencil Skirt', bottomStyle: 'skirt', finishes: TROUSER_FINISHES },
    { key: 'slacks', label: 'High-Waist Wide Slacks', bottomStyle: 'slacks', finishes: TROUSER_FINISHES },
    { key: 'jeans', label: 'Couture Denim Trousers', bottomStyle: 'jeans', finishes: TROUSER_FINISHES.slice(0, 3) },
    { key: 'shorts', label: 'Resort Linen Shorts', bottomStyle: 'shorts', finishes: TROUSER_FINISHES.slice(0, 3) },
  ];
  for (const arch of femaleBottomArch) {
    arch.finishes.forEach((fin, idx) => {
      const price = fin.price ?? 6;
      items.push({
        id: `f_bot_${arch.key}_${idx}`,
        gender: 'female',
        slot: 'bottom',
        name: `${fin.tag} ${arch.label}`,
        subtitle: 'Boutique Womenswear Bottoms',
        bottomStyle: arch.bottomStyle,
        defaultColor: fin.hex,
        accentColor: fin.accent,
        creditsPrice: price,
        memberPointsPrice: price * 25,
        isStarter: price === 0 && (arch.key === 'midi' || arch.key === 'slacks'),
      });
    });
  }

  // 4. Footwear (16 items)
  const femaleShoeArch: Array<{
    key: string;
    label: string;
    shoeStyle: ShoeStyle;
    finishes: ColorFinish[];
  }> = [
    { key: 'heels', label: 'Evening Stiletto Heels', shoeStyle: 'heels', finishes: SHOE_FINISHES },
    { key: 'loafers', label: 'Suede Tassel Loafers', shoeStyle: 'loafers', finishes: SHOE_FINISHES.slice(0, 4) },
    { key: 'boots', label: 'Ankle Dress Boots', shoeStyle: 'boots', finishes: SHOE_FINISHES.slice(0, 4) },
    { key: 'espadrilles', label: 'Riviera Wedge Espadrilles', shoeStyle: 'espadrilles', finishes: SHOE_FINISHES.slice(0, 3) },
  ];
  for (const arch of femaleShoeArch) {
    arch.finishes.forEach((fin, idx) => {
      const price = fin.price ?? 6;
      items.push({
        id: `f_shoe_${arch.key}_${idx}`,
        gender: 'female',
        slot: 'footwear',
        name: `${fin.tag} ${arch.label}`,
        subtitle: fin.vip ? 'VIP Couture Footwear' : 'Boutique Footwear',
        shoeStyle: arch.shoeStyle,
        defaultColor: fin.hex,
        accentColor: fin.accent,
        creditsPrice: price,
        memberPointsPrice: price * 25,
        clubExclusive: Boolean(fin.vip),
        isStarter: price === 0 && (arch.key === 'heels' || arch.key === 'loafers'),
      });
    });
  }

  // 5. Accessories & Hats (14 items)
  const femaleAccs: Array<{
    id: string;
    name: string;
    sub: string;
    kind: AccessoryKind;
    hat?: HatStyle;
    hex: string;
    price: number;
    vip?: boolean;
    tier?: 'tier_1m';
    starter?: boolean;
  }> = [
    { id: 'f_acc_none', name: 'Clean Unadorned', sub: 'No headwear or jewelry', kind: 'none', hat: 'none', hex: '#d4af37', price: 0, starter: true },
    { id: 'f_acc_pearls', name: 'Aurelia Double Pearls', sub: 'Lustrous South Sea pearl choker', kind: 'necklace', hex: '#f5efe6', price: 10 },
    { id: 'f_acc_pendant', name: 'Art Deco Emerald Pendant', sub: '18k gold & cut emerald drop', kind: 'necklace', hex: '#10b981', price: 12 },
    { id: 'f_acc_watch', name: 'Petite Gold Tank Watch', sub: 'Brushed brass dress bracelet', kind: 'watch', hex: '#d4af37', price: 10 },
    { id: 'f_acc_glasses', name: 'Cat-Eye Optical Frames', sub: 'Tortoiseshell & brass reading frames', kind: 'glasses', hex: '#78350f', price: 8 },
    { id: 'f_acc_shades_riviera', name: 'Riviera Oversized Shades', sub: 'Champagne acetate sunnies', kind: 'sunglasses', hex: '#1c1917', price: 10 },
    { id: 'f_acc_shades_teal', name: 'Monte Carlo Cat-Eye Shades', sub: 'Deep sapphire smoke lenses', kind: 'sunglasses', hex: '#0f172a', price: 10 },
    { id: 'f_acc_beret', name: 'Velvet Parisian Beret', sub: 'Crimson velour hotel beret', kind: 'hat', hat: 'beret', hex: '#7f1d1d', price: 10 },
    { id: 'f_acc_cloche', name: '1920s Gilded Cloche', sub: 'Art Deco bell hat with brass ribbon', kind: 'hat', hat: 'cloche', hex: '#1e293b', price: 14, vip: true },
    { id: 'f_acc_fascinator', name: 'Silk Feather Fascinator', sub: '1-Month VIP Milestone Cocktail Hat', kind: 'hat', hat: 'fascinator', hex: '#d4af37', price: 24, vip: true, tier: 'tier_1m' },
    { id: 'f_acc_fedora', name: 'Ivory Panama Fedora', sub: 'Woven terrace sun hat', kind: 'hat', hat: 'fedora', hex: '#e7e0d2', price: 10 },
    { id: 'f_acc_tophat', name: 'Atelier Silk Top Hat', sub: '1-Month VIP Milestone Gala Hat', kind: 'hat', hat: 'tophat', hex: '#111827', price: 24, vip: true, tier: 'tier_1m' },
    { id: 'f_acc_crown', name: 'Sovereign Diadem Crown', sub: 'VIP Royal Hotel Crest', kind: 'hat', hat: 'crown', hex: '#fbbf24', price: 35, vip: true },
    { id: 'f_acc_halo', name: 'Diamond Aureole', sub: 'Prismatic VIP Crest', kind: 'hat', hat: 'halo', hex: '#bae6fd', price: 40, vip: true },
  ];
  for (const a of femaleAccs) {
    items.push({
      id: a.id,
      gender: 'female',
      slot: 'accessory',
      name: a.name,
      subtitle: a.sub,
      accessoryKind: a.kind,
      hatStyle: a.hat ?? 'none',
      defaultColor: a.hex,
      creditsPrice: a.price,
      memberPointsPrice: a.price > 0 ? a.price * 25 : 0,
      clubExclusive: a.vip,
      tierRewardId: a.tier,
      isStarter: a.starter,
    });
  }

  return items;
}

export const MALE_WARDROBE_CATALOG: WardrobeCatalogItem[] = buildMaleWardrobe();
export const FEMALE_WARDROBE_CATALOG: WardrobeCatalogItem[] = buildFemaleWardrobe();
export const WARDROBE_CATALOG: WardrobeCatalogItem[] = [
  ...MALE_WARDROBE_CATALOG,
  ...FEMALE_WARDROBE_CATALOG,
];

const WARDROBE_MAP = new Map<string, WardrobeCatalogItem>(
  WARDROBE_CATALOG.map((item) => [item.id, item])
);

export function getWardrobeItemById(id?: string): WardrobeCatalogItem | undefined {
  if (!id) return undefined;
  return WARDROBE_MAP.get(id);
}

export function getAccessoryVisual(accessoryId?: string): {
  kind: AccessoryKind;
  color: string;
} {
  if (!accessoryId) return { kind: 'none', color: '#d4af37' };
  const item = WARDROBE_MAP.get(accessoryId);
  if (!item || !item.accessoryKind) return { kind: 'none', color: '#d4af37' };
  return { kind: item.accessoryKind, color: item.defaultColor };
}
