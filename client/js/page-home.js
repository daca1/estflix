// ── HOME PAGE (Fase 2 – async) ──────────────────────────────────────────────

async function renderHome() {
  const container = document.getElementById('page-home');
  container.textContent = 'A carregar...';

  let contents, categories, favorites, recommendations;
  try {
    [contents, categories, favorites, recommendations] = await Promise.all([
      Contents.getAll(),
      Categories.getAll(),
      Profiles.getFavorites(state.activeProfile.id),
      Profiles.getRecommendations(state.activeProfile.id),
    ]);
  } catch (e) {
    container.textContent = 'Erro ao carregar: ' + e.message;
    return;
  }

  const favIds = favorites.map(f => f.id);
  container.replaceChildren();

  // Banner de destaque
  const featured = contents[0];
  if (featured) {
    const isFav = favIds.includes(featured.id);
    const div = document.createElement('div');
    div.className = 'featured';
    div.addEventListener('click', () => goToDetail(featured.id));

    const img = document.createElement('img');
    img.src = featured.imageUrl;
    img.alt = featured.title;
    img.onerror = () => { img.src = 'https://images.pexels.com/photos/33545/sunrise-rose-clouds-sky.jpg?auto=compress&cs=tinysrgb&w=600'; };

    const overlay = document.createElement('div');
    overlay.className = 'featured-overlay';

    const info = document.createElement('div');
    info.className = 'featured-info';

    const ftitle = document.createElement('div');
    ftitle.className = 'featured-title';
    ftitle.textContent = featured.title;

    const fdesc = document.createElement('div');
    fdesc.className = 'featured-desc';
    fdesc.textContent = featured.description;

    const actions = document.createElement('div');
    actions.className = 'featured-actions';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-play';
    playBtn.innerHTML = icons.play() + ' Ver Agora';
    playBtn.addEventListener('click', e => { e.stopPropagation(); goToDetail(featured.id); });

    const favBtn = document.createElement('button');
    favBtn.className = 'btn-fav-featured' + (isFav ? ' active' : '');
    favBtn.innerHTML = icons.heart(isFav);
    favBtn.addEventListener('click', e => { e.stopPropagation(); toggleFav(featured.id, isFav); });

    actions.append(playBtn, favBtn);
    info.append(ftitle, fdesc, actions);
    div.append(img, overlay, info);
    container.appendChild(div);
  }

  // Favoritos
  if (favorites.length > 0) {
    container.appendChild(buildSection('Os Meus Favoritos', favorites, favIds));
  }

  // Recomendações
  if (recommendations.length > 0) {
    container.appendChild(buildSection('Recomendados para Si', recommendations, favIds));
  }

  // Por categoria
  categories.forEach(cat => {
    const catContents = contents.filter(c => c.category_id === cat.id || c.categoryId === cat.id);
    if (!catContents.length) return;
    container.appendChild(buildSection(cat.name, catContents, favIds));
  });
}

function buildSection(title, items, favIds) {
  const section = document.createElement('div');
  section.className = 'section';

  const header = document.createElement('div');
  header.className = 'section-header';
  const h2 = document.createElement('h2');
  h2.className = 'section-title';
  h2.textContent = title;
  header.appendChild(h2);

  const grid = document.createElement('div');
  grid.className = 'content-grid';
  items.forEach(c => {
    const isFav = favIds.includes(c.id);
    grid.appendChild(buildContentCard(c, isFav));
  });

  section.append(header, grid);
  return section;
}

function buildContentCard(c, isFav) {
  const card = document.createElement('div');
  card.className = 'content-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img';
  imgWrap.addEventListener('click', () => goToDetail(c.id));

  const img = document.createElement('img');
  img.src = c.imageUrl || c.image_url;
  img.alt = c.title;
  img.onerror = () => { img.src = 'https://images.pexels.com/photos/33545/sunrise-rose-clouds-sky.jpg?auto=compress&cs=tinysrgb&w=600'; };

  const overlay = document.createElement('div');
  overlay.className = 'card-img-overlay';
  const playCircle = document.createElement('div');
  playCircle.className = 'play-circle';
  playCircle.innerHTML = icons.play();
  overlay.appendChild(playCircle);
  imgWrap.append(img, overlay);

  const body = document.createElement('div');
  body.className = 'card-body';

  const cardTitle = document.createElement('div');
  cardTitle.className = 'card-title';
  cardTitle.textContent = c.title;
  cardTitle.addEventListener('click', () => goToDetail(c.id));

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const rating = document.createElement('div');
  rating.className = 'card-rating';
  rating.innerHTML = '<span class="star">★</span> ' + Number(c.rating).toFixed(1);
  const year = document.createElement('span');
  year.textContent = c.releaseYear || c.release_year;
  meta.append(rating, year);

  const favBtn = document.createElement('button');
  favBtn.className = 'card-fav-btn ' + (isFav ? 'fav' : 'not-fav');
  favBtn.innerHTML = icons.heart(isFav) + (isFav ? ' Nos Favoritos' : ' Adicionar');
  favBtn.addEventListener('click', () => toggleFav(c.id, isFav));

  body.append(cardTitle, meta, favBtn);
  card.append(imgWrap, body);
  return card;
}

async function toggleFav(contentId, isFav) {
  const profile = state.activeProfile;
  if (!profile) return;
  try {
    if (isFav) await Profiles.removeFavorite(profile.id, contentId);
    else       await Profiles.addFavorite(profile.id, contentId);
    renderHome();
  } catch (e) { alert(e.message); }
}

async function goToDetail(contentId) {
  try {
    await Profiles.addToHistory(state.activeProfile.id, contentId);
  } catch {}
  navigate('detail', contentId);
}
