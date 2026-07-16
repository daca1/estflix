// ── CATEGORIES / DETAIL PAGES (Fase 2 – async) ──────────────────────────────

async function renderCategories() {
  const container = document.getElementById('page-categories');
  container.textContent = 'A carregar...';
  let contents, categories, favorites;
  try {
    [contents, categories, favorites] = await Promise.all([
      Contents.getAll(),
      Categories.getAll(),
      Profiles.getFavorites(state.activeProfile.id),
    ]);
  } catch (e) { container.textContent = 'Erro: ' + e.message; return; }

  const favIds = favorites.map(f => f.id);
  container.replaceChildren();

  categories.forEach(cat => {
    const catContents = contents.filter(c => c.category_id === cat.id || c.categoryId === cat.id);
    if (!catContents.length) return;

    const section = document.createElement('div'); section.className = 'section';
    const header = document.createElement('div'); header.className = 'section-header';
    const h2 = document.createElement('h2'); h2.className = 'section-title'; h2.textContent = cat.name;
    header.appendChild(h2);

    const grid = document.createElement('div'); grid.className = 'content-grid';
    catContents.forEach(c => grid.appendChild(buildContentCard(c, favIds.includes(c.id))));

    section.append(header, grid);
    container.appendChild(section);
  });
}

async function renderDetail() {
  const container = document.getElementById('page-detail');
  container.textContent = 'A carregar...';

  let content, favorites;
  try {
    [content, favorites] = await Promise.all([
      Contents.getById(state.selectedContentId),
      Profiles.getFavorites(state.activeProfile.id),
    ]);
  } catch (e) { container.textContent = 'Erro: ' + e.message; return; }

  const isFav = favorites.some(f => f.id === content.id);
  container.replaceChildren();

  // Header do detalhe
  const dHeader = document.createElement('div'); dHeader.className = 'detail-header';
  const backBtn = document.createElement('button'); backBtn.className = 'back-btn';
  backBtn.innerHTML = icons.back() + ' Voltar';
  backBtn.addEventListener('click', () => navigate('home'));
  const logoSpan = document.createElement('span'); logoSpan.className = 'detail-logo'; logoSpan.textContent = 'ESTFlix';
  dHeader.append(backBtn, logoSpan);
  container.appendChild(dHeader);

  // Conteúdo do detalhe
  const detail = document.createElement('div'); detail.className = 'detail-content';

  const imgDiv = document.createElement('div'); imgDiv.className = 'detail-img';
  const img = document.createElement('img');
  img.src = content.imageUrl || content.image_url; img.alt = content.title;
  img.onerror = () => { img.src = 'https://images.pexels.com/photos/33545/sunrise-rose-clouds-sky.jpg?auto=compress&cs=tinysrgb&w=600'; };
  const playOverlay = document.createElement('div'); playOverlay.className = 'detail-play';
  playOverlay.innerHTML = icons.playLg();
  imgDiv.append(img, playOverlay);

  const info = document.createElement('div'); info.className = 'detail-info';

  const titleEl = document.createElement('h1'); titleEl.className = 'detail-title'; titleEl.textContent = content.title;

  const starsDiv = document.createElement('div'); starsDiv.className = 'detail-stars';
  const rating = Number(content.rating);
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.className = 'star' + (i <= Math.round(rating) ? '' : ' empty');
    s.textContent = '★';
    starsDiv.appendChild(s);
  }
  const ratingNum = document.createElement('span');
  ratingNum.className = 'rating-num';
  ratingNum.textContent = rating.toFixed(1) + '/5';
  starsDiv.appendChild(ratingNum);

  const meta = document.createElement('div'); meta.className = 'detail-meta';
  meta.textContent = `Ano: ${content.releaseYear || content.release_year}  ·  Género: ${content.genre}`;

  const desc = document.createElement('p'); desc.className = 'detail-desc'; desc.textContent = content.description;

  const actionRow = document.createElement('div'); actionRow.className = 'detail-actions';

  const favBtn = document.createElement('button');
  favBtn.className = 'btn btn-secondary detail-fav';
  favBtn.innerHTML = icons.heart(isFav) + (isFav ? ' Nos Favoritos' : ' Adicionar aos Favoritos');
  favBtn.addEventListener('click', async () => {
    try {
      if (isFav) await Profiles.removeFavorite(state.activeProfile.id, content.id);
      else       await Profiles.addFavorite(state.activeProfile.id, content.id);
      renderDetail();
    } catch (e) { alert(e.message); }
  });

  const watchBtn = document.createElement('button');
  watchBtn.className = 'btn btn-primary detail-watch';
  watchBtn.innerHTML = icons.playLg() + ' Assistir';
  watchBtn.addEventListener('click', () => alert('A reproduzir: ' + content.title));

  actionRow.append(favBtn, watchBtn);
  info.append(titleEl, starsDiv, meta, desc, actionRow);
  detail.append(imgDiv, info);
  container.appendChild(detail);

  // Recomendações
  try {
    const recs = await Profiles.getRecommendations(state.activeProfile.id);
    const recFavIds = favorites.map(f => f.id);
    if (recs.length > 0) {
      const recSection = document.createElement('div'); recSection.className = 'section';
      const recHeader = document.createElement('div'); recHeader.className = 'section-header';
      const recH2 = document.createElement('h2'); recH2.className = 'section-title'; recH2.textContent = 'Recomendados para Si';
      recHeader.appendChild(recH2);
      const recGrid = document.createElement('div'); recGrid.className = 'content-grid';
      recs.filter(r => r.id !== content.id).slice(0, 6).forEach(r => {
        recGrid.appendChild(buildContentCard(r, recFavIds.includes(r.id)));
      });
      recSection.append(recHeader, recGrid);
      container.appendChild(recSection);
    }
  } catch {}
}
