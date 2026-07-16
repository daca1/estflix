// ── APPLICATION STATE ───────────────────────────────────────────────────────
const state = {
  currentPage:      'login',    // 'login' | 'register' | 'profiles' | 'home' | 'categories' | 'admin' | 'detail'
  currentUser:      null,       // utilizador autenticado (inclui role)
  activeProfile:    null,
  selectedContentId:null,
  mobileMenuOpen:   false,
  adminTab:         'contents',
  showContentForm:  false,
  showCategoryForm: false,
  editingContent:   null,
  editingCategory:  null,
  selectedAvatar:   AVATARS[0],
  showProfileForm:  false,
  // Cache local para evitar chamadas repetidas
  _contents:   null,
  _categories: null,
};

// ── ROUTER ──────────────────────────────────────────────────────────────────
function navigate(page, contentId) {
  state.currentPage = page;
  if (contentId) state.selectedContentId = contentId;
  render();
}

function switchProfile() {
  state.activeProfile = null;
  state.currentPage   = 'profiles';
  state.mobileMenuOpen = false;
  render();
}

function toggleMobileMenu()  { state.mobileMenuOpen = !state.mobileMenuOpen; renderHeader(); }
function closeMobileMenu()   { state.mobileMenuOpen = false; renderHeader(); }

// ── MASTER RENDER ────────────────────────────────────────────────────────────
function render() {
  const { currentPage, activeProfile } = state;

  // Páginas de autenticação
  if (currentPage === 'login' || currentPage === 'register') {
    document.getElementById('app-header').classList.add('hidden');
    document.getElementById('app-main').classList.add('hidden');
    document.getElementById('page-profiles').classList.add('hidden');
    document.getElementById('page-auth').classList.remove('hidden');
    renderAuth();
    return;
  }

  // Seleção de perfil
  if (currentPage === 'profiles' || !activeProfile) {
    document.getElementById('app-header').classList.add('hidden');
    document.getElementById('app-main').classList.add('hidden');
    document.getElementById('page-auth').classList.add('hidden');
    document.getElementById('page-profiles').classList.remove('hidden');
    renderProfiles();
    return;
  }

  document.getElementById('page-profiles').classList.add('hidden');
  document.getElementById('page-auth').classList.add('hidden');
  document.getElementById('app-header').classList.remove('hidden');
  document.getElementById('app-main').classList.remove('hidden');
  renderHeader();

  ['home', 'categories', 'admin', 'detail'].forEach(p => {
    document.getElementById('page-' + p).classList.add('hidden');
  });

  const pages = {
    home:       renderHome,
    categories: renderCategories,
    admin:      state.currentUser?.role === 'admin' ? renderAdmin : () => navigate('home'),
    detail:     renderDetail,
  };

  if (pages[currentPage]) {
    document.getElementById('page-' + currentPage).classList.remove('hidden');
    pages[currentPage]();
  }
}

function renderCurrent() {
  const p = state.currentPage;
  if (p === 'home')   renderHome();
  else if (p === 'detail') renderDetail();
}

// ── HEADER ───────────────────────────────────────────────────────────────────
function renderHeader() {
  const { activeProfile, mobileMenuOpen, currentPage, currentUser } = state;
  const isAdmin = currentUser?.role === 'admin';

  document.getElementById('header-profile-name').textContent = activeProfile ? activeProfile.name : '';
  document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === currentPage);
  });
  document.getElementById('mobile-nav').classList.toggle('open', mobileMenuOpen);

  // Mostrar/esconder botão Admin consoante o role
  document.querySelectorAll('.nav-admin-btn').forEach(btn => {
    btn.style.display = isAdmin ? '' : 'none';
  });
}

// ── AUTH PAGE ────────────────────────────────────────────────────────────────
function renderAuth() {
  const isLogin = state.currentPage === 'login';
  const container = document.getElementById('page-auth');

  const el = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  };

  container.replaceChildren(); // limpa sem innerHTML

  const box = el('div', 'auth-box');
  const logo = el('div', 'auth-logo', 'ESTFlix');
  const title = el('h2', 'auth-title', isLogin ? 'Entrar' : 'Criar Conta');

  const errDiv = el('div', 'auth-error hidden');
  errDiv.id = 'auth-error';

  const emailGrp = el('div', 'form-group');
  const emailLbl = el('label', null, 'Email');
  const emailInp = el('input'); emailInp.type = 'email'; emailInp.id = 'auth-email'; emailInp.placeholder = 'email@exemplo.pt';
  emailGrp.append(emailLbl, emailInp);

  const passGrp = el('div', 'form-group');
  const passLbl = el('label', null, 'Password');
  const passInp = el('input'); passInp.type = 'password'; passInp.id = 'auth-pass'; passInp.placeholder = '••••••••';
  passGrp.append(passLbl, passInp);

  const btnSubmit = el('button', 'btn btn-primary auth-btn', isLogin ? 'Entrar' : 'Registar');
  btnSubmit.addEventListener('click', isLogin ? submitLogin : submitRegister);

  const switchTxt = el('p', 'auth-switch');
  const switchLink = el('a', 'auth-link', isLogin ? 'Criar Conta' : 'Já tenho conta');
  switchTxt.append(document.createTextNode(isLogin ? 'Não tem conta? ' : 'Já tem conta? '), switchLink);
  switchLink.addEventListener('click', () => navigate(isLogin ? 'register' : 'login'));

  box.append(logo, title, errDiv);

  if (!isLogin) {
    const nameGrp = el('div', 'form-group');
    const nameLbl = el('label', null, 'Nome');
    const nameInp = el('input'); nameInp.type = 'text'; nameInp.id = 'auth-name'; nameInp.placeholder = 'O seu nome';
    nameGrp.append(nameLbl, nameInp);
    box.append(nameGrp);
  }

  box.append(emailGrp, passGrp, btnSubmit, switchTxt);
  container.appendChild(box);

  // Enter key support
  [emailInp, passInp].forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') btnSubmit.click(); });
  });
}

async function submitLogin() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');
  try {
    const user = await Auth.login(email, pass);
    state.currentUser = user;
    navigate('profiles');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
}

async function submitRegister() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  const name  = document.getElementById('auth-name').value.trim();
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');
  try {
    const user = await Auth.register(email, pass, name);
    state.currentUser = user;
    navigate('profiles');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
}

async function doLogout() {
  await Auth.logout();
  state.activeProfile = null;
  state.currentUser   = null;
  navigate('login');
}

// ── BOOT ─────────────────────────────────────────────────────────────────────
async function boot() {
  const user = await Auth.me();
  if (user) {
    state.currentUser = user;
    navigate('profiles');
  } else {
    navigate('login');
  }
}

boot();
