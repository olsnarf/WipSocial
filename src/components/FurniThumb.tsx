import type { CustomSpriteSpec, FurnitureType, FurnitureVariantSpec } from '../types/lounge';

export function FurniThumb({
  type,
  size = 'md',
  customSpriteSpec,
  variantSpec,
}: {
  type: FurnitureType;
  size?: 'sm' | 'md';
  customSpriteSpec?: CustomSpriteSpec;
  variantSpec?: FurnitureVariantSpec;
}) {
  const cls = size === 'sm' ? 'w-6 h-6 shrink-0' : 'w-8 h-8 shrink-0';
  const p = variantSpec?.primaryHex;
  const s = variantSpec?.secondaryHex;
  const a = variantSpec?.accentHex;

  if (type === 'custom_sprite') {
    const primary = customSpriteSpec?.primaryHex || '#22d3ee';
    const secondary = customSpriteSpec?.secondaryHex || '#0f172a';
    const glow = customSpriteSpec?.glowHex || '#e879f9';
    const shape = customSpriteSpec?.shape || 'chair';

    if (shape === 'rug') {
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,10 32,18 18,26 4,18" fill={primary} stroke={glow} strokeWidth="1.4" />
          <polygon points="18,13 26,18 18,23 10,18" fill={secondary} />
        </svg>
      );
    }
    if (shape === 'lamp') {
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="18" cy="29" rx="7" ry="3.5" fill={secondary} stroke={glow} strokeWidth="1" />
          <rect x="16.8" y="15" width="2.4" height="14" fill="#94a3b8" />
          <polygon points="12,15 24,15 21,7 15,7" fill={primary} stroke={glow} strokeWidth="1.4" />
        </svg>
      );
    }
    if (shape === 'table') {
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16.5" y="16" width="3" height="12" fill={secondary} />
          <ellipse cx="18" cy="29" rx="7" ry="3.5" fill={secondary} />
          <ellipse cx="18" cy="14" rx="12" ry="6" fill={primary} stroke={glow} strokeWidth="1.4" />
        </svg>
      );
    }
    if (shape === 'pillar') {
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,5 28,10 18,15 8,10" fill={glow} />
          <polygon points="8,10 18,15 18,30 8,25" fill={primary} />
          <polygon points="28,10 18,15 18,30 28,25" fill={secondary} />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <polygon points="18,7 30,13 18,19 6,13" fill={primary} stroke={glow} strokeWidth="1" />
        <polygon points="6,13 18,19 18,28 6,22" fill={secondary} />
        <polygon points="30,13 18,19 18,28 30,22" fill={primary} />
      </svg>
    );
  }

  switch (type) {
    case 'reception_desk':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 32,14.5 18,21 4,14.5" fill={p || '#ebe4d8'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <polygon points="4,14.5 18,21 18,30 4,23.5" fill={s || '#331a10'} stroke={a || '#d4af37'} strokeWidth="0.8" />
          <polygon points="32,14.5 18,21 18,30 32,23.5" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="0.8" />
          <circle cx="18" cy="12" r="2.2" fill="#d4af37" />
        </svg>
      );
    case 'chesterfield_sofa':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 31,13.5 18,20 5,13.5" fill={p || '#6b3a24'} stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="5,13.5 18,20 18,29 5,22.5" fill={s || '#4a2617'} />
          <polygon points="31,13.5 18,20 18,29 31,22.5" fill={p || '#6b3a24'} />
          <circle cx="14" cy="14" r="1" fill={a || '#d4af37'} />
          <circle cx="22" cy="14" r="1" fill={a || '#d4af37'} />
        </svg>
      );
    case 'brass_stanchion':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="8" y="11" width="3" height="18" rx="1" fill={p || '#d4af37'} />
          <rect x="25" y="11" width="3" height="18" rx="1" fill={p || '#d4af37'} />
          <circle cx="9.5" cy="10" r="2.3" fill={a || '#fef08a'} />
          <circle cx="26.5" cy="10" r="2.3" fill={a || '#fef08a'} />
          <path d="M10.5 15 Q18 23 25.5 15" fill="none" stroke="#881337" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'potted_ficus':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="12,22 24,22 22,31 14,31" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1" />
          <rect x="17" y="15" width="2" height="8" fill="#5c3a21" />
          <circle cx="14" cy="13" r="4.5" fill="#15803d" />
          <circle cx="22" cy="13" r="4.5" fill="#166534" />
          <circle cx="18" cy="9" r="5" fill="#22c55e" />
        </svg>
      );
    case 'hotel_elevator':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="8" y="6" width="20" height="25" rx="1.5" fill={s || '#161922'} stroke={p || '#d4af37'} strokeWidth="1.6" />
          <rect x="11" y="11" width="6.5" height="19" fill="#94a3b8" />
          <rect x="18.5" y="11" width="6.5" height="19" fill="#cbd5e1" />
          <polygon points="18,7 20.5,10 15.5,10" fill={a || '#fde047'} />
        </svg>
      );
    case 'four_poster_bed':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <line x1="7" y1="6" x2="7" y2="28" stroke={a || '#d4af37'} strokeWidth="2" />
          <line x1="29" y1="6" x2="29" y2="28" stroke={a || '#d4af37'} strokeWidth="2" />
          <line x1="6" y1="7" x2="30" y2="7" stroke={p || '#4f2c1d'} strokeWidth="2" />
          <polygon points="18,13 30,19 18,25 6,19" fill={p || '#dfd3c0'} stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="6,19 18,25 18,29 6,23" fill={s || '#0f5e5a'} />
          <polygon points="30,19 18,25 18,29 30,23" fill="#083b39" />
        </svg>
      );
    case 'nightstand':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,11 28,16 18,21 8,16" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="8,16 18,21 18,29 8,24" fill={s || '#331a10'} />
          <polygon points="28,16 18,21 18,29 28,24" fill={p || '#4f2c1d'} />
          <polygon points="14,11 22,11 20,6 16,6" fill="#fef3c7" stroke={a || '#d4af37'} strokeWidth="1" />
        </svg>
      );
    case 'flat_screen_tv':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="6" y="8" width="24" height="15" rx="1.5" fill="#0f172a" stroke={a || '#d4af37'} strokeWidth="1.5" />
          <rect x="8" y="10" width="20" height="11" fill="#1e3a5f" />
          <rect x="16" y="23" width="4" height="5" fill="#475569" />
          <ellipse cx="18" cy="29" rx="7" ry="2.2" fill={s || '#1e293b'} />
        </svg>
      );
    case 'mini_fridge':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 27,11.5 18,16 9,11.5" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="9,11.5 18,16 18,30 9,25.5" fill={s || '#331a10'} />
          <polygon points="27,11.5 18,16 18,30 27,25.5" fill={p || '#1e293b'} stroke={a || '#d4af37'} strokeWidth="0.9" />
          <line x1="21" y1="18" x2="21" y2="23" stroke={a || '#d4af37'} strokeWidth="1.6" />
        </svg>
      );
    case 'suitcase_stand':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <line x1="10" y1="20" x2="15" y2="30" stroke={a || '#d4af37'} strokeWidth="2" />
          <line x1="26" y1="20" x2="21" y2="30" stroke={a || '#d4af37'} strokeWidth="2" />
          <rect x="9" y="11" width="18" height="10" rx="2" fill={p || '#6b3a24'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <path d="M15 11 V8 H21 V11" fill="none" stroke={a || '#d4af37'} strokeWidth="1.5" />
        </svg>
      );
    case 'wardrobe_cabinet':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,4 28,9 18,14 8,9" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="8,9 18,14 18,31 8,26" fill={s || '#331a10'} />
          <polygon points="28,9 18,14 18,31 28,26" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="0.9" />
          <line x1="23" y1="12" x2="23" y2="28" stroke={a || '#d4af37'} strokeWidth="1.2" />
        </svg>
      );
    case 'coffee_machine':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="9" y="10" width="18" height="19" rx="2" fill={p || '#c49b3b'} stroke="#0f172a" strokeWidth="1.2" />
          <rect x="12" y="16" width="12" height="8" fill="#1e293b" />
          <rect x="14" y="19" width="3.5" height="4.5" fill="#f5efe6" />
          <rect x="19" y="19" width="3.5" height="4.5" fill="#f5efe6" />
          <path d="M15 7 Q16 5 18 7 M20 7 Q21 5 23 7" fill="none" stroke="#fef3c7" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'barista_counter':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 31,14.5 18,21 5,14.5" fill={p || '#ebe4d8'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <polygon points="5,14.5 18,21 18,30 5,23.5" fill={s || '#4f2c1d'} />
          <polygon points="31,14.5 18,21 18,30 31,23.5" fill="#331a10" />
        </svg>
      );
    case 'bistro_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16.8" y="15" width="2.4" height="13" fill={a || '#d4af37'} />
          <ellipse cx="18" cy="29" rx="6" ry="2.8" fill={s || '#1e293b'} />
          <ellipse cx="18" cy="14" rx="11" ry="5.2" fill={p || '#ebe4d8'} stroke={a || '#d4af37'} strokeWidth="1.3" />
        </svg>
      );
    case 'bistro_chair':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="18" cy="20" rx="8" ry="4" fill={p || '#6b3a24'} stroke={a || '#d4af37'} strokeWidth="1.1" />
          <path d="M12 20 V9 C12 6 24 6 24 9 V20" fill="none" stroke={s || '#4f2c1d'} strokeWidth="2.2" />
          <line x1="13" y1="22" x2="12" y2="30" stroke="#331a10" strokeWidth="1.8" />
          <line x1="23" y1="22" x2="24" y2="30" stroke="#331a10" strokeWidth="1.8" />
        </svg>
      );
    case 'vending_machine':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="9" y="5" width="18" height="26" rx="2" fill={s || '#161922'} stroke={a || '#d4af37'} strokeWidth="1.4" />
          <rect x="12" y="8" width="10" height="14" fill="#bae6fd" fillOpacity="0.28" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="15" cy="12" r="1.4" fill="#ef4444" />
          <circle cx="19" cy="12" r="1.4" fill="#22c55e" />
          <circle cx="15" cy="17" r="1.4" fill="#fbbf24" />
          <circle cx="19" cy="17" r="1.4" fill="#38bdf8" />
          <rect x="12" y="25" width="12" height="3.5" rx="0.8" fill="#0f172a" stroke={a || '#d4af37'} strokeWidth="0.9" />
        </svg>
      );
    case 'pastry_display':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 30,13 18,19 6,13" fill="#bae6fd" fillOpacity="0.4" stroke={a || '#d4af37'} strokeWidth="1.2" />
          <polygon points="6,13 18,19 18,29 6,23" fill={s || '#331a10'} />
          <polygon points="30,13 18,19 18,29 30,23" fill={p || '#4f2c1d'} />
          <circle cx="15" cy="14" r="1.8" fill="#fbbf24" />
          <circle cx="21" cy="14" r="1.8" fill="#f472b6" />
        </svg>
      );
    case 'poker_table':
    case 'craps_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="18" cy="16" rx="13" ry="7.5" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1.5" />
          <ellipse cx="18" cy="16" rx="9.5" ry="5" fill={type === 'craps_table' ? '#1e3a8a' : '#065f46'} />
          <rect x="16" y="23" width="4" height="7" fill={s || '#331a10'} />
        </svg>
      );
    case 'roulette_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 32,15 18,22 4,15" fill="#065f46" stroke={p || '#4f2c1d'} strokeWidth="1.8" />
          <circle cx="15" cy="15" r="4.5" fill={a || '#d4af37'} stroke="#0f172a" strokeWidth="1" />
          <circle cx="15" cy="15" r="2.2" fill="#991b1b" />
          <polygon points="4,15 18,22 18,29 4,22" fill={s || '#331a10'} />
          <polygon points="32,15 18,22 18,29 32,22" fill={p || '#4f2c1d'} />
        </svg>
      );
    case 'slot_machine':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="10" y="7" width="16" height="23" rx="2" fill={p || '#c49b3b'} stroke="#0f172a" strokeWidth="1.3" />
          <rect x="12" y="11" width="12" height="7" fill="#fef3c7" stroke="#0f172a" strokeWidth="1" />
          <text x="18" y="16.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#991b1b">777</text>
          <line x1="27" y1="12" x2="29" y2="18" stroke={a || '#d4af37'} strokeWidth="2" />
          <circle cx="29" cy="11" r="2" fill="#dc2626" />
        </svg>
      );
    case 'poker_chips':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="14" cy="24" rx="5.5" ry="2.5" fill="#991b1b" stroke="#fef3c7" strokeWidth="1" />
          <ellipse cx="14" cy="20" rx="5.5" ry="2.5" fill="#dc2626" stroke="#fef3c7" strokeWidth="1" />
          <ellipse cx="22" cy="22" rx="5.5" ry="2.5" fill="#0f766e" stroke="#fef3c7" strokeWidth="1" />
          <ellipse cx="22" cy="18" rx="5.5" ry="2.5" fill={a || '#d4af37'} stroke="#0f172a" strokeWidth="1" />
        </svg>
      );
    case 'pool_lounger':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="7,20 21,13 30,17.5 16,24.5" fill={p || '#dfd3c0'} stroke="#78350f" strokeWidth="1.4" />
          <polygon points="21,13 28,7 31,11 25,16" fill={p || '#dfd3c0'} stroke="#78350f" strokeWidth="1.2" />
          <line x1="10" y1="22" x2="10" y2="28" stroke="#78350f" strokeWidth="1.8" />
          <line x1="25" y1="20" x2="25" y2="27" stroke="#78350f" strokeWidth="1.8" />
        </svg>
      );
    case 'cabana_canopy':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="6,13 18,6 30,13 18,17" fill={p || '#0f5e5a'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <line x1="8" y1="14" x2="8" y2="29" stroke={a || '#d4af37'} strokeWidth="1.8" />
          <line x1="28" y1="14" x2="28" y2="29" stroke={a || '#d4af37'} strokeWidth="1.8" />
          <rect x="9" y="22" width="18" height="6" rx="1.5" fill="#f5efe6" />
        </svg>
      );
    case 'boardroom_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 32,15 18,22 4,15" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1.4" />
          <rect x="10" y="20" width="3" height="9" fill={s || '#331a10'} />
          <rect x="23" y="20" width="3" height="9" fill={s || '#331a10'} />
        </svg>
      );
    case 'executive_chair':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="13" y="6" width="10" height="13" rx="2" fill={p || '#181c26'} stroke={a || '#d4af37'} strokeWidth="1.1" />
          <ellipse cx="18" cy="20" rx="8" ry="3.8" fill={s || '#0d1017'} stroke={a || '#d4af37'} strokeWidth="1" />
          <line x1="18" y1="23" x2="18" y2="29" stroke="#94a3b8" strokeWidth="2" />
          <line x1="12" y1="29" x2="24" y2="29" stroke="#94a3b8" strokeWidth="1.8" />
        </svg>
      );
    case 'framed_painting':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="7" y="7" width="22" height="22" rx="1.5" fill={a || '#d4af37'} stroke="#78350f" strokeWidth="1.2" />
          <rect x="10" y="10" width="16" height="16" fill={p || '#0f5e5a'} />
          <circle cx="18" cy="17" r="4" fill={a || '#fef08a'} />
          <polygon points="10,26 17,19 26,26" fill={s || '#0b1324'} />
        </svg>
      );
    case 'deco_vase':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <path d="M14 11 H22 L20 15 C24 19 23 27 18 29 C13 27 12 19 16 15 Z" fill={p || '#0f5e5a'} stroke={a || '#d4af37'} strokeWidth="1.3" />
          <line x1="14" y1="11" x2="22" y2="11" stroke={a || '#d4af37'} strokeWidth="2" />
        </svg>
      );
    case 'art_deco_rug':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 33,18 18,28 3,18" fill={p || '#0f5e5a'} stroke={a || '#d4af37'} strokeWidth="1.5" />
          <polygon points="18,12 27,18 18,24 9,18" fill="none" stroke={a || '#d4af37'} strokeWidth="1.3" />
          <polygon points="18,15 22,18 18,21 14,18" fill={s || '#083b39'} />
        </svg>
      );
    case 'wall_sconce':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="15" y="18" width="6" height="10" rx="1" fill={a || '#d4af37'} />
          <polygon points="11,18 25,18 21,9 15,9" fill="#fef3c7" stroke={a || '#d4af37'} strokeWidth="1.3" />
        </svg>
      );
    case 'crystal_chandelier':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <line x1="18" y1="4" x2="18" y2="12" stroke={a || '#d4af37'} strokeWidth="1.8" />
          <ellipse cx="18" cy="14" rx="11" ry="3.5" fill="none" stroke={a || '#d4af37'} strokeWidth="1.8" />
          <polygon points="10,16 12,24 8,24" fill="#e0f2fe" />
          <polygon points="18,17 20.5,27 15.5,27" fill="#fef3c7" />
          <polygon points="26,16 28,24 24,24" fill="#e0f2fe" />
        </svg>
      );
    case 'gold_throne':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="12,5 24,5 26,20 10,20" fill="#d4af37" stroke="#78350f" strokeWidth="1.2" />
          <polygon points="18,14 28,19 18,24 8,19" fill={p || '#6d162c'} stroke="#fef08a" strokeWidth="1" />
          <polygon points="8,19 18,24 18,30 8,25" fill="#b68e36" />
          <polygon points="28,19 18,24 18,30 28,25" fill="#926c1c" />
        </svg>
      );
    case 'jet_interior_tile':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,12 31,19 18,26 5,19" fill={p || '#dfd3c0'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <rect x="13" y="8" width="10" height="10" rx="2" fill={s || '#b8a892'} stroke={a || '#d4af37'} strokeWidth="1" />
        </svg>
      );
    case 'vip_lounge_door':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="9" y="6" width="18" height="25" rx="1.5" fill={p || '#4f2c1d'} stroke={a || '#d4af37'} strokeWidth="1.8" />
          <circle cx="18" cy="14" r="3" fill={a || '#d4af37'} />
          <circle cx="23" cy="20" r="1.4" fill="#fef08a" />
        </svg>
      );

    case 'velvet_armchair':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,6 30,12 18,18 6,12" fill={p || '#9d245f'} />
          <polygon points="6,12 18,18 18,28 6,22" fill={s || '#581235'} />
          <polygon points="30,12 18,18 18,28 30,22" fill={p || '#7a1949'} />
          <polygon points="18,14 26,18 18,22 10,18" fill={a || '#be185d'} />
        </svg>
      );
    case 'vip_sofa':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 31,14.5 18,21 5,14.5" fill={p || '#be185d'} />
          <polygon points="5,14.5 18,21 18,29 5,22.5" fill={s || '#701a3e'} />
          <polygon points="31,14.5 18,21 18,29 31,22.5" fill={p || '#9d174d'} />
          <polygon points="18,12 27,16.5 18,21 9,16.5" fill={a || '#db2777'} />
        </svg>
      );
    case 'neon_cocktail_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16.5" y="16" width="3" height="12" fill="#94a3b8" />
          <ellipse cx="18" cy="29" rx="7" ry="3.5" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
          <ellipse cx="18" cy="14" rx="12" ry="6" fill={p || '#161e31'} stroke={a || '#22d3ee'} strokeWidth="1.6" />
          <polygon points="15,7 21,7 18,11" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
        </svg>
      );
    case 'vip_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16.5" y="16" width="3" height="12" fill="#78350f" />
          <ellipse cx="18" cy="29" rx="6" ry="3" fill="#451a03" />
          <ellipse cx="18" cy="14" rx="11" ry="5.5" fill={p || '#1e293b'} stroke={a || '#f59e0b'} strokeWidth="1.3" />
          <rect x="17" y="9" width="2" height="4" fill="#fef3c7" />
          <circle cx="18" cy="8" r="1.8" fill="#fbbf24" />
        </svg>
      );
    case 'bar_counter':
    case 'bar_corner':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 31,14.5 18,21 5,14.5" fill={p || '#1e293b'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <polygon points="5,14.5 18,21 18,30 5,23.5" fill={s || '#0f172a'} stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="31,14.5 18,21 18,30 31,23.5" fill="#162038" stroke={a || '#d4af37'} strokeWidth="1" />
        </svg>
      );
    case 'retro_arcade':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,4 27,8.5 18,13 9,8.5" fill="#312e81" stroke="#ec4899" strokeWidth="1" />
          <polygon points="9,8.5 18,13 18,31 9,26.5" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
          <polygon points="27,8.5 18,13 18,31 27,26.5" fill="#171c36" stroke="#22d3ee" strokeWidth="1" />
          <rect x="19.5" y="14" width="5.5" height="6" rx="1" fill="#082f49" stroke="#22d3ee" strokeWidth="1" />
        </svg>
      );
    case 'potted_monstera':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,17 25,20.5 18,24 11,20.5" fill="#27272a" />
          <polygon points="11,20.5 18,24 18,31 11,27.5" fill="#18181b" />
          <polygon points="25,20.5 18,24 18,31 25,27.5" fill="#202024" />
          <ellipse cx="13" cy="14" rx="5" ry="3.2" transform="rotate(-25 13 14)" fill="#059669" />
          <ellipse cx="23" cy="14" rx="5" ry="3.2" transform="rotate(25 23 14)" fill="#10b981" />
          <ellipse cx="18" cy="10" rx="5.5" ry="3.5" fill="#34d399" />
        </svg>
      );
    case 'dance_floor_tile':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,9 32,18 18,27 4,18" fill={p || '#1e1b4b'} stroke={a || '#d4af37'} strokeWidth="1.5" />
          <polygon points="18,13 26,18 18,23 10,18" fill={s || '#083344'} stroke={a || '#22d3ee'} strokeWidth="1.4" />
        </svg>
      );
    case 'dj_speaker':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,5 28,10 18,15 8,10" fill="#1e293b" />
          <polygon points="8,10 18,15 18,31 8,26" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
          <polygon points="28,10 18,15 18,31 28,26" fill="#111827" stroke="#ec4899" strokeWidth="1" />
          <circle cx="23" cy="21" r="3" fill="#06b6d4" opacity="0.8" />
        </svg>
      );
    case 'dj_console':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 31,13.5 18,20 5,13.5" fill="#1e1b4b" stroke="#22d3ee" strokeWidth="1.2" />
          <polygon points="5,13.5 18,20 18,30 5,23.5" fill="#0f172a" />
          <polygon points="31,13.5 18,20 18,30 31,23.5" fill="#1e293b" />
          <circle cx="14" cy="13.5" r="2.5" fill="#020617" stroke="#ec4899" strokeWidth="1" />
          <circle cx="22" cy="13.5" r="2.5" fill="#020617" stroke="#22d3ee" strokeWidth="1" />
        </svg>
      );
    case 'vip_daybed':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,10 31,16.5 18,23 5,16.5" fill={p || '#9d174d'} stroke={a || '#f472b6'} strokeWidth="1" />
          <polygon points="5,16.5 18,23 18,28 5,21.5" fill={s || '#581235'} />
          <polygon points="31,16.5 18,23 18,28 31,21.5" fill="#7a1949" />
          <polygon points="12,13 17,15.5 13,17.5 8,15" fill="#fbcfe8" />
        </svg>
      );
    case 'club_rug':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,10 32,18 18,26 4,18" fill={p || '#6b1840'} stroke={a || '#d4af37'} strokeWidth="1.3" />
          <polygon points="18,13 27,18 18,23 9,18" fill="none" stroke="#fbbf24" strokeWidth="1.1" />
        </svg>
      );
    case 'neon_lamp':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="18" cy="29" rx="7" ry="3.5" fill={s || '#1e293b'} stroke={a || '#d4af37'} strokeWidth="1" />
          <rect x="16.8" y="15" width="2.4" height="14" fill="#64748b" />
          <polygon points="12,15 24,15 21,7 15,7" fill={p || '#083344'} stroke={a || '#d4af37'} strokeWidth="1.4" />
          <circle cx="18" cy="11" r="2.2" fill="#fef3c7" />
        </svg>
      );
    case 'cocktail_tray':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="18" cy="22" rx="11" ry="5.5" fill={p || '#1e293b'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <polygon points="11,13 17,13 14,17" fill="#67e8f9" />
          <line x1="14" y1="17" x2="14" y2="21" stroke="#e2e8f0" strokeWidth="1.2" />
          <rect x="20" y="14" width="4.5" height="6.5" rx="1" fill="#ec4899" />
        </svg>
      );
    case 'casino_dice':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 28,12 18,17 8,12" fill="#f8fafc" stroke={a || '#d4af37'} strokeWidth="1.2" />
          <polygon points="8,12 18,17 18,28 8,23" fill="#cbd5e1" stroke={a || '#d4af37'} strokeWidth="1" />
          <polygon points="28,12 18,17 18,28 28,23" fill="#e2e8f0" stroke={a || '#d4af37'} strokeWidth="1" />
          <circle cx="18" cy="12" r="1.4" fill="#991b1b" />
          <circle cx="13" cy="20" r="1.3" fill="#0f172a" />
          <circle cx="23" cy="19" r="1.3" fill="#0f172a" />
          <circle cx="23" cy="23" r="1.3" fill="#0f172a" />
        </svg>
      );
    case 'vip_rope_gate':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="9" y="12" width="3" height="16" rx="1" fill="#f59e0b" />
          <rect x="24" y="12" width="3" height="16" rx="1" fill="#f59e0b" />
          <circle cx="10.5" cy="11" r="2.2" fill="#fbbf24" />
          <circle cx="25.5" cy="11" r="2.2" fill="#fbbf24" />
          <path d="M11 15 Q18 22 25 15" fill="none" stroke="#e11d48" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'teleporter_booth':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <ellipse cx="18" cy="29" rx="10" ry="4.5" fill={s || '#0f172a'} stroke={a || '#d4af37'} strokeWidth="1.4" />
          <rect x="11" y="8" width="14" height="20" rx="4" fill={p || '#082f49'} fillOpacity="0.72" stroke="#67e8f9" strokeWidth="1.3" />
          <ellipse cx="18" cy="9" rx="7" ry="3" fill="#1e1b4b" stroke={a || '#d4af37'} strokeWidth="1.2" />
        </svg>
      );
    case 'one_way_gate':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,12 31,19 18,26 5,19" fill={s || '#0f172a'} stroke={a || '#d4af37'} strokeWidth="1.2" />
          <rect x="10" y="10" width="2.8" height="14" rx="1" fill="#64748b" />
          <rect x="23.2" y="10" width="2.8" height="14" rx="1" fill="#64748b" />
          <path d="M13 19 L22 19 M19 15.5 L22.5 19 L19 22.5" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pressure_plate':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,11 31,19 18,27 5,19" fill={s || '#1e293b'} stroke="#94a3b8" strokeWidth="1.2" />
          <polygon points="18,14 26,19 18,24 10,19" fill={p || '#065f46'} stroke={a || '#d4af37'} strokeWidth="1.4" />
        </svg>
      );
    case 'espresso_bar':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 31,14.5 18,21 5,14.5" fill="#92400e" stroke="#fbbf24" strokeWidth="1" />
          <polygon points="5,14.5 18,21 18,30 5,23.5" fill="#78350f" />
          <polygon points="31,14.5 18,21 18,30 31,23.5" fill="#5c280b" />
          <rect x="13" y="6" width="10" height="7" rx="1" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1" />
        </svg>
      );
    case 'cafe_bistro_table':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16.5" y="16" width="3" height="12" fill="#334155" />
          <ellipse cx="18" cy="29" rx="6" ry="3" fill="#1e293b" />
          <ellipse cx="18" cy="14" rx="11" ry="5.5" fill="#d97706" stroke="#fde68a" strokeWidth="1.2" />
          <circle cx="19" cy="13" r="2.2" fill="#f8fafc" />
        </svg>
      );
    case 'cozy_bookshelf':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,4 28,9 18,14 8,9" fill={p || '#92400e'} />
          <polygon points="8,9 18,14 18,31 8,26" fill={s || '#78350f'} />
          <polygon points="28,9 18,14 18,31 28,26" fill="#5c280b" />
          <line x1="20" y1="16" x2="26" y2="13" stroke="#38bdf8" strokeWidth="2" />
          <line x1="20" y1="22" x2="26" y2="19" stroke="#f43f5e" strokeWidth="2" />
        </svg>
      );
    case 'loft_armchair':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 30,13 18,19 6,13" fill={p || '#e2e8f0'} />
          <polygon points="6,13 18,19 18,28 6,22" fill={s || '#b45309'} />
          <polygon points="30,13 18,19 18,28 30,22" fill="#cbd5e1" />
          <polygon points="18,14 26,18 18,22 10,18" fill="#f8fafc" />
        </svg>
      );
    case 'vip_golden_trophy':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="13" y="25" width="10" height="5" rx="1" fill="#451a03" />
          <path d="M12 9 H24 L21 19 H15 Z" fill="#fbbf24" stroke="#fef08a" strokeWidth="1" />
          <rect x="16.5" y="19" width="3" height="6" fill="#f59e0b" />
        </svg>
      );
    case 'vip_grand_piano':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,7 31,13.5 18,20 5,13.5" fill={p || '#0f172a'} stroke={a || '#fbbf24'} strokeWidth="1.2" />
          <polygon points="5,13.5 18,20 18,26 5,19.5" fill={s || '#1e293b'} />
          <polygon points="31,13.5 18,20 18,26 31,19.5" fill="#090d16" />
          <line x1="8" y1="20" x2="8" y2="30" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="28" y1="20" x2="28" y2="30" stroke="#fbbf24" strokeWidth="1.5" />
          <polygon points="18,17 29,22 25,24 14,19" fill="#f8fafc" />
        </svg>
      );
    case 'vip_hot_tub':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 32,15 18,22 4,15" fill={p || '#92400e'} stroke={a || '#fbbf24'} strokeWidth="1" />
          <polygon points="4,15 18,22 18,30 4,23" fill={s || '#78350f'} />
          <polygon points="32,15 18,22 18,30 32,23" fill="#5c280b" />
          <polygon points="18,10 28,15 18,20 8,15" fill="#22d3ee" />
          <circle cx="15" cy="14" r="1.4" fill="#ecfeff" />
          <circle cx="21" cy="16" r="1.2" fill="#ecfeff" />
        </svg>
      );
    case 'vip_emerald_throne':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,4 29,9.5 18,15 7,9.5" fill={p || '#047857'} stroke={a || '#fbbf24'} strokeWidth="1.2" />
          <polygon points="7,9.5 18,15 18,29 7,23.5" fill={s || '#064e3b'} stroke={a || '#fbbf24'} strokeWidth="1" />
          <polygon points="29,9.5 18,15 18,29 29,23.5" fill="#065f46" stroke={a || '#fbbf24'} strokeWidth="1" />
          <polygon points="18,14 25,17.5 18,21 11,17.5" fill="#10b981" />
        </svg>
      );
    case 'rope_barrier':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="8" y="12" width="3" height="17" rx="1" fill="#94a3b8" />
          <rect x="25" y="12" width="3" height="17" rx="1" fill="#94a3b8" />
          <circle cx="9.5" cy="11" r="2" fill="#e2e8f0" />
          <circle cx="26.5" cy="11" r="2" fill="#e2e8f0" />
          <path d="M10.5 15 Q18 22 25.5 15" fill="none" stroke="#c29b61" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'picket_fence':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="6" y="16" width="24" height="2.4" fill="#cbd5e1" />
          <rect x="6" y="23" width="24" height="2.4" fill="#cbd5e1" />
          <polygon points="9,10 11,13 11,29 7,29 7,13" fill={p || '#f8fafc'} stroke="#94a3b8" strokeWidth="0.8" />
          <polygon points="15,11 17,14 17,29 13,29 13,14" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          <polygon points="21,11 23,14 23,29 19,29 19,14" fill={p || '#f8fafc'} stroke="#94a3b8" strokeWidth="0.8" />
          <polygon points="27,10 29,13 29,29 25,29 25,13" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
        </svg>
      );
    case 'glass_partition':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="6" y="12" width="24" height="16" rx="1.5" fill={p || '#22d3ee'} fillOpacity="0.22" stroke={a || '#67e8f9'} strokeWidth="1.4" />
          <rect x="5" y="11" width="2.5" height="18" fill="#475569" />
          <rect x="28.5" y="11" width="2.5" height="18" fill="#475569" />
          <line x1="12" y1="25" x2="21" y2="14" stroke="#ecfeff" strokeWidth="1.3" strokeOpacity="0.65" />
        </svg>
      );
    case 'velvet_stanchion':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="8" y="11" width="3" height="18" rx="1" fill="#f59e0b" />
          <rect x="25" y="11" width="3" height="18" rx="1" fill="#f59e0b" />
          <circle cx="9.5" cy="10" r="2.2" fill="#fef08a" />
          <circle cx="26.5" cy="10" r="2.2" fill="#fef08a" />
          <path d="M10.5 15 Q18 23 25.5 15" fill="none" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'laser_gate':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="6" y="10" width="4" height="19" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <rect x="26" y="10" width="4" height="19" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="8" cy="9.5" r="1.8" fill="#fb7185" />
          <circle cx="28" cy="9.5" r="1.8" fill="#fb7185" />
          <line x1="10" y1="15" x2="26" y2="15" stroke="#f43f5e" strokeWidth="2.2" />
          <line x1="10" y1="22" x2="26" y2="22" stroke="#f43f5e" strokeWidth="2.2" />
        </svg>
      );
    case 'arena_scoreboard':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16" y="23" width="4" height="7" fill="#334155" />
          <rect x="6" y="9" width="24" height="15" rx="2" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="12.5" y="19.5" fill="#fb7185" fontSize="8" fontWeight="bold" textAnchor="middle">3</text>
          <text x="18" y="19" fill="#64748b" fontSize="8" textAnchor="middle">:</text>
          <text x="23.5" y="19.5" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">2</text>
        </svg>
      );
    case 'tie_dye_beanbag':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <defs>
            <radialGradient id="tdBeanGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="75%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
          <ellipse cx="18" cy="21" rx="12" ry="9" fill="url(#tdBeanGrad)" stroke="#fef08a" strokeWidth="1.2" />
        </svg>
      );
    case 'lava_lamp':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="13,29 23,29 21,23 15,23" fill="#475569" />
          <polygon points="15,23 21,23 19.5,9 16.5,9" fill="#7c3aed" stroke="#f472b6" strokeWidth="1.1" />
          <circle cx="18" cy="18" r="2.1" fill="#fb923c" />
          <circle cx="17.8" cy="13" r="1.5" fill="#fde047" />
          <polygon points="16.5,9 19.5,9 18,5" fill="#cbd5e1" />
        </svg>
      );
    case 'tie_dye_rug':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,9 32,18 18,27 4,18" fill="#7c3aed" stroke="#fde047" strokeWidth="1.2" />
          <polygon points="18,12 27,18 18,24 9,18" fill="#ec4899" />
          <polygon points="18,15 23,18 18,21 13,18" fill="#06b6d4" />
        </svg>
      );
    case 'beaded_curtain':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <path d="M8 29 V9 H28 V29" fill="none" stroke="#92400e" strokeWidth="2.4" />
          <circle cx="12" cy="14" r="1.6" fill="#fbbf24" />
          <circle cx="12" cy="20" r="1.6" fill="#ec4899" />
          <circle cx="18" cy="13" r="1.6" fill="#06b6d4" />
          <circle cx="18" cy="19" r="1.6" fill="#84cc16" />
          <circle cx="24" cy="14" r="1.6" fill="#f97316" />
          <circle cx="24" cy="20" r="1.6" fill="#fbbf24" />
        </svg>
      );
    case 'shag_velvet_sofa':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 31,14.5 18,21 5,14.5" fill="#ea580c" stroke="#84cc16" strokeWidth="1" />
          <polygon points="5,14.5 18,21 18,29 5,22.5" fill="#9a3412" />
          <polygon points="31,14.5 18,21 18,29 31,22.5" fill="#c2410c" />
        </svg>
      );
    case 'peace_neon_art':
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <rect x="16.8" y="21" width="2.4" height="9" fill="#94a3b8" />
          <circle cx="18" cy="14" r="8" fill="#1e1b4b" stroke="#f472b6" strokeWidth="2" />
          <line x1="18" y1="6" x2="18" y2="22" stroke="#22d3ee" strokeWidth="1.6" />
          <line x1="18" y1="14" x2="12.5" y2="19.5" stroke="#fde047" strokeWidth="1.6" />
          <line x1="18" y1="14" x2="23.5" y2="19.5" stroke="#fde047" strokeWidth="1.6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon points="18,8 28,13 18,18 8,13" fill={p || '#334155'} stroke={a || '#d4af37'} strokeWidth="0.9" />
          <polygon points="8,13 18,18 18,28 8,23" fill={s || '#1e293b'} />
          <polygon points="28,13 18,18 18,28 28,23" fill="#0f172a" />
        </svg>
      );
  }
}

