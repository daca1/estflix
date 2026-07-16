// ── SVG ICONS ──────────────────────────────────────────────────────────────
const icons = {
  heart: (filled) => `<svg width="18" height="18" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`,

  play: () => `<svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>`,

  playLg: () => `<svg width="22" height="22" fill="white" viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>`,

  back: () => `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6"/>
  </svg>`,

  plus: () => `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,

  plusLg: () => `<svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,

  edit: () => `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`,

  trash: () => `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>`,

  logout: () => `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>`,

  menu: () => `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>`,
};

// ── UTILITIES ──────────────────────────────────────────────────────────────

/** Escape HTML entities to prevent XSS */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Generate a content card HTML string */
function contentCardHTML(c, isFav) {
  return `
    <div class="content-card">
      <div class="card-img" onclick="goToDetail('${c.id}')">
        <img src="${esc(c.imageUrl)}" alt="${esc(c.title)}"
             onerror="this.src='https://images.pexels.com/photos/33545/sunrise-rose-clouds-sky.jpg?auto=compress&cs=tinysrgb&w=600'">
        <div class="card-img-overlay">
          <div class="play-circle">${icons.play()}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-title" onclick="goToDetail('${c.id}')">${esc(c.title)}</div>
        <div class="card-meta">
          <div class="card-rating"><span class="star">★</span> ${c.rating.toFixed(1)}</div>
          <span>${c.releaseYear}</span>
        </div>
        <button class="card-fav-btn ${isFav ? 'fav' : 'not-fav'}" onclick="toggleFav('${c.id}', ${isFav})">
          ${icons.heart(isFav)} ${isFav ? 'Nos Favoritos' : 'Adicionar'}
        </button>
      </div>
    </div>
  `;
}
