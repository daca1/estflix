// ── PROFILES PAGE (Fase 2 – async) ─────────────────────────────────────────

async function renderProfiles() {
  const grid = document.getElementById('profiles-grid');
  grid.textContent = 'A carregar...';

  let profiles = [];
  try { profiles = await Profiles.getAll(); }
  catch (e) { grid.textContent = 'Erro: ' + e.message; return; }

  grid.replaceChildren();

  profiles.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'profile-card';
    btn.addEventListener('click', () => selectProfile(p));

    const av = document.createElement('div');
    av.className = 'profile-avatar';
    av.textContent = p.avatar;

    const nm = document.createElement('div');
    nm.className = 'profile-card-name';
    nm.textContent = p.name;

    btn.append(av, nm);
    grid.appendChild(btn);
  });

  // Botão Adicionar Perfil
  const addBtn = document.createElement('button');
  addBtn.className = 'add-profile-btn';
  addBtn.innerHTML = icons.plusLg();
  const addLbl = document.createElement('span');
  addLbl.className = 'add-profile-label';
  addLbl.textContent = 'Adicionar Perfil';
  addBtn.appendChild(addLbl);
  addBtn.addEventListener('click', toggleProfileForm);
  grid.appendChild(addBtn);

  renderAvatarGrid();

  // Botão logout (na área de perfis)
  const logoutArea = document.getElementById('profiles-logout');
  if (logoutArea) {
    logoutArea.replaceChildren();
    const logBtn = document.createElement('button');
    logBtn.className = 'btn btn-secondary';
    logBtn.innerHTML = icons.logout() + ' Sair';
    logBtn.style.marginTop = '20px';
    logBtn.addEventListener('click', doLogout);
    logoutArea.appendChild(logBtn);
  }
}

function renderAvatarGrid() {
  const agrid = document.getElementById('avatar-grid');
  if (!agrid) return;
  agrid.replaceChildren();
  AVATARS.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'avatar-opt' + (a === state.selectedAvatar ? ' selected' : '');
    btn.textContent = a;
    btn.addEventListener('click', () => selectAvatar(a));
    agrid.appendChild(btn);
  });
}

function selectAvatar(a) {
  state.selectedAvatar = a;
  document.querySelectorAll('.avatar-opt').forEach(el => {
    el.classList.toggle('selected', el.textContent.trim() === a);
  });
}

async function selectProfile(profile) {
  state.activeProfile = profile;
  state.currentPage = 'home';
  render();
}

function toggleProfileForm() {
  state.showProfileForm = !state.showProfileForm;
  const wrap = document.getElementById('profile-form-wrap');
  wrap.classList.toggle('hidden', !state.showProfileForm);
  if (state.showProfileForm) document.getElementById('new-profile-name').focus();
}

function hideProfileForm() {
  state.showProfileForm = false;
  document.getElementById('profile-form-wrap').classList.add('hidden');
  document.getElementById('new-profile-name').value = '';
}

async function submitNewProfile() {
  const name = document.getElementById('new-profile-name').value.trim();
  if (!name) return;
  try {
    const p = await Profiles.add(name, state.selectedAvatar);
    state.activeProfile = p;
    state.currentPage = 'home';
    hideProfileForm();
    render();
  } catch (e) { alert(e.message); }
}
