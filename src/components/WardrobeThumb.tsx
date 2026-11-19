import type { WardrobeCatalogItem } from '../data/wardrobeCatalog';

export function WardrobeThumb({
  item,
  size = 'md',
}: {
  item: WardrobeCatalogItem;
  size?: 'sm' | 'md';
}) {
  const cls = size === 'sm' ? 'w-7 h-7 shrink-0' : 'w-9 h-9 shrink-0';
  const primary = item.defaultColor || '#d4af37';
  const accent = item.accentColor || '#f5efe6';

  if (item.slot === 'hair') {
    const hs = item.hairStyle || 'side_part';
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <circle cx="18" cy="20" r="8" fill="#d9b292" stroke="#0f172a" strokeWidth="1.2" />
        {(hs === 'long_waves' || hs === 'beach_waves' || hs === 'curtain_bangs') && (
          <path d="M8 17 C8 8, 28 8, 28 17 L29 29 L24 27 L24 17 L12 17 L12 27 L7 29 Z" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
        )}
        {(hs === 'bob' || hs === 'braids') && (
          <path d="M9 17 C9 8, 27 8, 27 17 L27 25 L23 25 L23 17 L13 17 L13 25 L9 25 Z" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
        )}
        {(hs === 'pompadour' || hs === 'slick_back' || hs === 'undercut') && (
          <path d="M9 17 C8 9, 25 6, 27 15 L25 17 L11 17 Z" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
        )}
        {(hs === 'man_bun' || hs === 'chignon' || hs === 'high_ponytail') && (
          <>
            <circle cx="24" cy="10" r="4" fill={primary} stroke="#0f172a" strokeWidth="1.1" />
            <path d="M10 17 C10 10, 26 10, 26 17 Z" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
          </>
        )}
        {(hs === 'afro' || hs === 'afro_puff' || hs === 'curls' || hs === 'curly_crop') && (
          <path d="M7 18 C6 8, 30 8, 29 18 C27 15, 9 15, 7 18 Z" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
        )}
        {(hs === 'buzz' || hs === 'fade' || hs === 'side_part' || hs === 'tousled' || hs === 'spiky' || hs === 'pixie' || hs === 'pigtails') && (
          <path d="M10 17 C10 9, 26 9, 26 17 L10 17 Z" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
        )}
        {hs === 'pigtails' && (
          <>
            <circle cx="8" cy="19" r="3" fill={primary} stroke="#0f172a" strokeWidth="1" />
            <circle cx="28" cy="19" r="3" fill={primary} stroke="#0f172a" strokeWidth="1" />
          </>
        )}
      </svg>
    );
  }

  if (item.slot === 'top') {
    const ts = item.topStyle || 'tshirt';
    const isJacket = ts === 'suit' || ts === 'tuxedo' || ts === 'leather' || ts === 'varsity';
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <path
          d="M11 8 L6 13 L9 18 L11 16 L11 29 L25 29 L25 16 L27 18 L30 13 L25 8 L21 10 L15 10 Z"
          fill={primary}
          stroke="#0f172a"
          strokeWidth="1.3"
        />
        {isJacket ? (
          <>
            <polygon points="15,9 21,9 18,21" fill={accent} />
            <line x1="18" y1="21" x2="18" y2="29" stroke="#0f172a" strokeWidth="1.2" />
          </>
        ) : (
          <path d="M15 9 Q18 13 21 9" fill="none" stroke={accent} strokeWidth="1.5" />
        )}
      </svg>
    );
  }

  if (item.slot === 'bottom') {
    const bs = item.bottomStyle || 'slacks';
    if (bs === 'skirt' || bs === 'midi_skirt') {
      return (
        <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
          <polygon
            points={bs === 'midi_skirt' ? '12,8 24,8 28,28 8,28' : '12,10 24,10 27,24 9,24'}
            fill={primary}
            stroke="#0f172a"
            strokeWidth="1.3"
          />
          <rect x="12" y="8" width="12" height="3" fill={accent} stroke="#0f172a" strokeWidth="1" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <path
          d={
            bs === 'shorts'
              ? 'M10 9 H26 L27 21 H20 L18 16 L16 21 H9 Z'
              : 'M10 7 H26 L27 29 H20 L18 16 L16 29 H9 Z'
          }
          fill={primary}
          stroke="#0f172a"
          strokeWidth="1.3"
        />
        <rect x="10" y="7" width="16" height="3" fill={accent} stroke="#0f172a" strokeWidth="0.9" />
      </svg>
    );
  }

  if (item.slot === 'footwear') {
    const ss = item.shoeStyle || 'dress_shoes';
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <path
          d={
            ss === 'heels'
              ? 'M8 14 L15 14 L20 22 L28 24 L28 27 L18 27 L14 21 L11 27 L8 27 Z'
              : ss === 'boots'
              ? 'M10 9 H18 V20 L28 22 V27 H10 Z'
              : 'M9 17 H17 L28 22 V27 H9 Z'
          }
          fill={primary}
          stroke="#0f172a"
          strokeWidth="1.3"
        />
        <rect x="9" y="25" width="19" height="2.4" fill={accent} />
      </svg>
    );
  }

  // Accessories
  if (item.accessoryKind === 'watch') {
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <rect x="15" y="5" width="6" height="26" rx="2" fill={accent} stroke="#0f172a" strokeWidth="1.1" />
        <circle cx="18" cy="18" r="6.5" fill={primary} stroke="#0f172a" strokeWidth="1.3" />
        <line x1="18" y1="18" x2="18" y2="14" stroke="#0f172a" strokeWidth="1.3" />
        <line x1="18" y1="18" x2="21" y2="18" stroke="#0f172a" strokeWidth="1.3" />
      </svg>
    );
  }
  if (item.accessoryKind === 'glasses' || item.accessoryKind === 'sunglasses') {
    const tint = item.accessoryKind === 'sunglasses' ? '#0f172a' : '#bae6fd';
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <rect x="5" y="14" width="10" height="7" rx="2" fill={tint} fillOpacity="0.82" stroke={primary} strokeWidth="1.6" />
        <rect x="21" y="14" width="10" height="7" rx="2" fill={tint} fillOpacity="0.82" stroke={primary} strokeWidth="1.6" />
        <line x1="15" y1="16.5" x2="21" y2="16.5" stroke={primary} strokeWidth="1.6" />
      </svg>
    );
  }
  if (item.accessoryKind === 'necklace') {
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <path d="M9 10 Q18 24 27 10" fill="none" stroke={primary} strokeWidth="2.2" />
        <polygon points="18,17 21.5,21 18,25 14.5,21" fill={accent} stroke="#0f172a" strokeWidth="1" />
      </svg>
    );
  }
  // Hat
  const hat = item.hatStyle || 'fedora';
  if (hat === 'crown') {
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <polygon points="7,25 7,12 13,18 18,10 23,18 29,12 29,25" fill={primary} stroke="#0f172a" strokeWidth="1.3" />
        <circle cx="18" cy="20" r="2" fill={accent} />
      </svg>
    );
  }
  if (hat === 'halo') {
    return (
      <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
        <ellipse cx="18" cy="18" rx="11" ry="4.5" fill="none" stroke={primary} strokeWidth="3" />
        <ellipse cx="18" cy="18" rx="11" ry="4.5" fill="none" stroke={accent} strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className={cls} aria-hidden="true">
      <ellipse cx="18" cy="24" rx="13" ry="3.5" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
      <rect x="11" y="10" width="14" height="13" rx="2" fill={primary} stroke="#0f172a" strokeWidth="1.2" />
      <rect x="11" y="19" width="14" height="2.6" fill={accent} />
    </svg>
  );
}
