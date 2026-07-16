// ── ADMIN PAGE (Fase 2 – async) ─────────────────────────────────────────────

async function renderAdmin() {
  const page = document.getElementById('page-admin');

  const header = document.createElement('div');
  header.className = 'admin-header';
  const h1 = document.createElement('h1');
  h1.textContent = 'Administração';
  header.appendChild(h1);

  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  const btnCont = document.createElement('button');
  btnCont.className = 'tab-btn' + (state.adminTab === 'contents' ? ' active' : '');
  btnCont.textContent = 'Gestão de Conteúdo';
  btnCont.addEventListener('click', () => setAdminTab('contents'));

  const btnCats = document.createElement('button');
  btnCats.className = 'tab-btn' + (state.adminTab === 'categories' ? ' active' : '');
  btnCats.textContent = 'Categorias';
  btnCats.addEventListener('click', () => setAdminTab('categories'));

  const btnUsers = document.createElement('button');
  btnUsers.className = 'tab-btn' + (state.adminTab === 'users' ? ' active' : '');
  btnUsers.textContent = 'Utilizadores';
  btnUsers.addEventListener('click', () => setAdminTab('users'));

  tabs.append(btnCont, btnCats, btnUsers);

  const body = document.createElement('div');
  body.id = 'admin-body';

  page.replaceChildren(header, tabs, body);
  await renderAdminBody();
}

function setAdminTab(tab) {
  state.adminTab = tab;
  state.showContentForm = false;
  state.showCategoryForm = false;
  state.editingContent = null;
  state.editingCategory = null;
  renderAdmin();
}

async function renderAdminBody() {
  const body = document.getElementById('admin-body');
  if (!body) return;
  body.textContent = 'A carregar...';
  if (state.adminTab === 'contents')   await buildContentsTab(body);
  else if (state.adminTab === 'users') await buildUsersTab(body);
  else                                 await buildCategoriesTab(body);
}

// ── CONTENTS TAB ─────────────────────────────────────────────────────────────

async function buildContentsTab(body) {
  let contents, categories;
  try {
    [contents, categories] = await Promise.all([Contents.getAll(), Categories.getAll()]);
  } catch (e) { body.textContent = 'Erro: ' + e.message; return; }

  body.replaceChildren();

  const addRow = document.createElement('div');
  addRow.style.marginBottom = '20px';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;flex:unset;width:auto';
  addBtn.innerHTML = icons.plus() + ' Adicionar Conteúdo';
  addBtn.addEventListener('click', () => { state.showContentForm = !state.showContentForm; state.editingContent = null; renderAdminBody(); });
  addRow.appendChild(addBtn);
  body.appendChild(addRow);

  if (state.showContentForm && !state.editingContent)
    body.appendChild(buildContentForm(null, categories));
  if (state.editingContent)
    body.appendChild(buildContentForm(state.editingContent, categories));

  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const htr = document.createElement('tr');
  ['Título','Género','Categoria','Ano','Avaliação','Ações'].forEach(t => {
    const th = document.createElement('th'); th.textContent = t; htr.appendChild(th);
  });
  thead.appendChild(htr);
  const tbody = document.createElement('tbody');

  if (contents.length === 0) {
    const tr = document.createElement('tr'); tr.className = 'empty-row';
    const td = document.createElement('td'); td.colSpan = 6; td.textContent = 'Nenhum conteúdo encontrado';
    tr.appendChild(td); tbody.appendChild(tr);
  } else {
    contents.forEach(c => {
      const tr = document.createElement('tr');
      const catName = c.category?.name || categories.find(cat => cat.id === (c.category_id || c.categoryId))?.name || '—';
      const cells = [c.title, c.genre, catName, c.releaseYear || c.release_year, '★ ' + Number(c.rating).toFixed(1)];
      cells.forEach((txt, i) => {
        const td = document.createElement('td');
        if (i === 0) td.style.fontWeight = '600';
        td.textContent = txt;
        tr.appendChild(td);
      });
      const actTd = document.createElement('td');
      const btns = document.createElement('div'); btns.className = 'action-btns';
      const editBtn = document.createElement('button'); editBtn.className = 'tbl-btn edit'; editBtn.title = 'Editar'; editBtn.innerHTML = icons.edit();
      editBtn.addEventListener('click', () => { state.editingContent = c; state.showContentForm = false; renderAdminBody(); });
      const delBtn = document.createElement('button'); delBtn.className = 'tbl-btn del'; delBtn.title = 'Eliminar'; delBtn.innerHTML = icons.trash();
      delBtn.addEventListener('click', async () => {
        if (!confirm('Tens a certeza que queres eliminar este conteúdo?')) return;
        try { await Contents.delete(c.id); renderAdminBody(); } catch (e) { alert(e.message); }
      });
      btns.append(editBtn, delBtn); actTd.appendChild(btns); tr.appendChild(actTd);
      tbody.appendChild(tr);
    });
  }

  table.append(thead, tbody);
  wrap.appendChild(table);
  body.appendChild(wrap);
}

function buildContentForm(content, categories) {
  const isEdit = !!content;
  const d = content || { title:'', description:'', genre:'', releaseYear: new Date().getFullYear(), rating: 5, imageUrl:'', category_id: categories[0]?.id || '' };

  const form = document.createElement('div');
  form.className = 'inline-form';
  form.id = 'content-form';

  const h3 = document.createElement('h3');
  h3.textContent = (isEdit ? 'Editar' : 'Adicionar') + ' Conteúdo';
  form.appendChild(h3);

  const grid = document.createElement('div');
  grid.className = 'form-2col';

  const fields = [
    { id: 'cf-title',  label: 'Título *',              type: 'text',   value: d.title },
    { id: 'cf-genre',  label: 'Género *',              type: 'text',   value: d.genre },
    { id: 'cf-year',   label: 'Ano de Lançamento *',   type: 'number', value: d.releaseYear || d.release_year },
    { id: 'cf-rating', label: 'Avaliação (0–5) *',     type: 'number', value: d.rating, min:'0', max:'5', step:'0.1' },
    { id: 'cf-img',    label: 'URL da Imagem *',       type: 'url',    value: d.imageUrl || d.image_url },
  ];

  fields.forEach(f => {
    const grp = document.createElement('div'); grp.className = 'form-group';
    const lbl = document.createElement('label'); lbl.textContent = f.label;
    const inp = document.createElement('input'); inp.type = f.type; inp.id = f.id; inp.value = f.value || '';
    if (f.min !== undefined) inp.min = f.min;
    if (f.max !== undefined) inp.max = f.max;
    if (f.step !== undefined) inp.step = f.step;
    const err = document.createElement('div'); err.className = 'form-error'; err.id = f.id + '-err';
    grp.append(lbl, inp, err);
    grid.appendChild(grp);
  });

  // Categoria select
  const catGrp = document.createElement('div'); catGrp.className = 'form-group';
  const catLbl = document.createElement('label'); catLbl.textContent = 'Categoria *';
  const catSel = document.createElement('select'); catSel.id = 'cf-cat';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    if (cat.id === (d.category_id || d.categoryId)) opt.selected = true;
    catSel.appendChild(opt);
  });
  catGrp.append(catLbl, catSel);
  grid.appendChild(catGrp);

  form.appendChild(grid);

  // Descrição
  const descGrp = document.createElement('div'); descGrp.className = 'form-group';
  const descLbl = document.createElement('label'); descLbl.textContent = 'Descrição *';
  const descTa = document.createElement('textarea'); descTa.id = 'cf-desc'; descTa.rows = 4;
  descTa.textContent = d.description || '';
  const descErr = document.createElement('div'); descErr.className = 'form-error'; descErr.id = 'cf-desc-err';
  descGrp.append(descLbl, descTa, descErr);
  form.appendChild(descGrp);

  // Botões
  const btnRow = document.createElement('div'); btnRow.className = 'btn-row';
  const saveBtn = document.createElement('button'); saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = isEdit ? 'Atualizar' : 'Adicionar';
  saveBtn.addEventListener('click', () => submitContentForm(isEdit ? d.id : null));
  const cancelBtn = document.createElement('button'); cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', () => { state.editingContent = null; state.showContentForm = false; renderAdminBody(); });
  btnRow.append(saveBtn, cancelBtn);
  form.appendChild(btnRow);

  return form;
}

async function submitContentForm(editId) {
  const title  = document.getElementById('cf-title').value.trim();
  const genre  = document.getElementById('cf-genre').value.trim();
  const desc   = document.getElementById('cf-desc').value.trim();
  const year   = parseInt(document.getElementById('cf-year').value);
  const rating = parseFloat(document.getElementById('cf-rating').value);
  const img    = document.getElementById('cf-img').value.trim();
  const catId  = document.getElementById('cf-cat').value;

  let valid = true;
  const check = (id, msg, cond) => { const e = document.getElementById(id+'-err'); e.textContent = cond ? '' : msg; if (!cond) valid = false; };
  check('cf-title',  'Título é obrigatório', title);
  check('cf-genre',  'Género é obrigatório', genre);
  check('cf-desc',   'Descrição é obrigatória', desc);
  check('cf-year',   'Ano inválido', !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1);
  check('cf-rating', 'Avaliação 0–5', !isNaN(rating) && rating >= 0 && rating <= 5);
  check('cf-img',    'URL é obrigatório', img);
  if (!valid) return;

  const data = { title, genre, description: desc, releaseYear: year, rating, imageUrl: img, categoryId: catId };
  try {
    if (editId) await Contents.update(editId, data);
    else        await Contents.add(data);
    state.editingContent = null;
    state.showContentForm = false;
    renderAdminBody();
  } catch (e) { alert(e.message); }
}

// ── CATEGORIES TAB ────────────────────────────────────────────────────────────

async function buildCategoriesTab(body) {
  let cats;
  try { cats = await Categories.getAll(); }
  catch (e) { body.textContent = 'Erro: ' + e.message; return; }

  body.replaceChildren();

  const addRow = document.createElement('div'); addRow.style.marginBottom = '20px';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;flex:unset;width:auto';
  addBtn.innerHTML = icons.plus() + ' Adicionar Categoria';
  addBtn.addEventListener('click', () => { state.showCategoryForm = !state.showCategoryForm; state.editingCategory = null; renderAdminBody(); });
  addRow.appendChild(addBtn);
  body.appendChild(addRow);

  if (state.showCategoryForm && !state.editingCategory) body.appendChild(buildCategoryForm(null));
  if (state.editingCategory) body.appendChild(buildCategoryForm(state.editingCategory));

  const wrap = document.createElement('div'); wrap.className = 'table-wrap';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const htr = document.createElement('tr');
  ['ID','Nome','Ações'].forEach(t => { const th = document.createElement('th'); th.textContent = t; htr.appendChild(th); });
  thead.appendChild(htr);
  const tbody = document.createElement('tbody');

  if (cats.length === 0) {
    const tr = document.createElement('tr'); tr.className = 'empty-row';
    const td = document.createElement('td'); td.colSpan = 3; td.textContent = 'Nenhuma categoria encontrada';
    tr.appendChild(td); tbody.appendChild(tr);
  } else {
    cats.forEach(cat => {
      const tr = document.createElement('tr');
      const idTd = document.createElement('td'); idTd.style.cssText = 'color:var(--text-dim);font-size:12px'; idTd.textContent = cat.id; tr.appendChild(idTd);
      const nameTd = document.createElement('td'); nameTd.style.fontWeight = '600'; nameTd.textContent = cat.name; tr.appendChild(nameTd);
      const actTd = document.createElement('td');
      const btns = document.createElement('div'); btns.className = 'action-btns';
      const editBtn = document.createElement('button'); editBtn.className = 'tbl-btn edit'; editBtn.innerHTML = icons.edit();
      editBtn.addEventListener('click', () => { state.editingCategory = cat; state.showCategoryForm = false; renderAdminBody(); });
      const delBtn = document.createElement('button'); delBtn.className = 'tbl-btn del'; delBtn.innerHTML = icons.trash();
      delBtn.addEventListener('click', async () => {
        if (!confirm('Tens a certeza?')) return;
        try { await Categories.delete(cat.id); renderAdminBody(); }
        catch (e) { alert(e.message); }
      });
      btns.append(editBtn, delBtn); actTd.appendChild(btns); tr.appendChild(actTd);
      tbody.appendChild(tr);
    });
  }

  table.append(thead, tbody); wrap.appendChild(table); body.appendChild(wrap);
}

function buildCategoryForm(cat) {
  const isEdit = !!cat;
  const form = document.createElement('div');
  form.className = 'inline-form'; form.id = 'cat-form'; form.style.maxWidth = '400px';

  const h3 = document.createElement('h3'); h3.textContent = (isEdit ? 'Editar' : 'Adicionar') + ' Categoria';
  const grp = document.createElement('div'); grp.className = 'form-group';
  const lbl = document.createElement('label'); lbl.textContent = 'Nome da Categoria *';
  const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'cat-name-input';
  if (isEdit) inp.value = cat.name;
  inp.placeholder = 'Nome da categoria';
  const err = document.createElement('div'); err.className = 'form-error'; err.id = 'cat-name-err';
  grp.append(lbl, inp, err);

  const btnRow = document.createElement('div'); btnRow.className = 'btn-row';
  const saveBtn = document.createElement('button'); saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = isEdit ? 'Atualizar' : 'Adicionar';
  saveBtn.addEventListener('click', () => submitCategoryForm(isEdit ? cat.id : null));
  const cancelBtn = document.createElement('button'); cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', () => { state.editingCategory = null; state.showCategoryForm = false; renderAdminBody(); });
  btnRow.append(saveBtn, cancelBtn);

  form.append(h3, grp, btnRow);
  return form;
}

async function submitCategoryForm(editId) {
  const name = document.getElementById('cat-name-input').value.trim();
  const errEl = document.getElementById('cat-name-err');
  if (!name) { errEl.textContent = 'Nome é obrigatório'; return; }
  try {
    if (editId) await Categories.update(editId, name);
    else        await Categories.add(name);
    state.editingCategory = null; state.showCategoryForm = false;
    renderAdminBody();
  } catch (e) { errEl.textContent = e.message; }
}

// ── USERS TAB ─────────────────────────────────────────────────────────────────

async function buildUsersTab(body) {
  let users;
  try { users = await Users.getAll(); }
  catch (e) { body.textContent = 'Erro: ' + e.message; return; }

  body.replaceChildren();

  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const htr   = document.createElement('tr');
  ['ID', 'Nome', 'Email', 'Role', 'Registado em', 'Ações'].forEach(t => {
    const th = document.createElement('th');
    th.textContent = t;
    htr.appendChild(th);
  });
  thead.appendChild(htr);
  const tbody = document.createElement('tbody');

  if (users.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Nenhum utilizador encontrado';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    const currentUserId = state.currentUser?.id;

    users.forEach(u => {
      const tr = document.createElement('tr');

      const idTd = document.createElement('td');
      idTd.style.cssText = 'color:var(--text-dim);font-size:12px';
      idTd.textContent = u.id;

      const nameTd = document.createElement('td');
      nameTd.style.fontWeight = '600';
      nameTd.textContent = u.name;

      const emailTd = document.createElement('td');
      emailTd.textContent = u.email;

      const roleTd = document.createElement('td');
      const roleBadge = document.createElement('span');
      roleBadge.textContent = u.role === 'admin' ? '🛡 Admin' : '👤 Utilizador';
      roleBadge.style.cssText = u.role === 'admin'
        ? 'color:var(--red);font-weight:600;font-size:13px'
        : 'color:var(--text-dim);font-size:13px';
      roleTd.appendChild(roleBadge);

      const dateTd = document.createElement('td');
      dateTd.style.cssText = 'color:var(--text-dim);font-size:12px';
      dateTd.textContent = new Date(u.createdAt).toLocaleDateString('pt-PT');

      const actTd = document.createElement('td');
      const btns  = document.createElement('div');
      btns.className = 'action-btns';

      // Botão toggle role (não aparece para o próprio admin)
      if (u.id !== currentUserId) {
        const roleBtn = document.createElement('button');
        roleBtn.className = 'tbl-btn edit';
        roleBtn.title = u.role === 'admin' ? 'Revogar Admin' : 'Tornar Admin';
        roleBtn.innerHTML = u.role === 'admin'
          ? '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="18" y1="6" x2="6" y2="18"/></svg>'
          : '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
        roleBtn.addEventListener('click', async () => {
          const newRole = u.role === 'admin' ? 'user' : 'admin';
          const label   = newRole === 'admin' ? 'Tornar Administrador' : 'Remover privilégios de Admin';
          if (!confirm(`${label}: ${u.name}?`)) return;
          try { await Users.setRole(u.id, newRole); renderAdminBody(); }
          catch (e) { alert(e.message); }
        });
        btns.appendChild(roleBtn);

        // Botão eliminar
        const delBtn = document.createElement('button');
        delBtn.className = 'tbl-btn del';
        delBtn.title = 'Eliminar utilizador';
        delBtn.innerHTML = icons.trash();
        delBtn.addEventListener('click', async () => {
          if (!confirm(`Eliminar o utilizador "${u.name}"? Todos os seus perfis, favoritos e histórico serão apagados.`)) return;
          try { await Users.delete(u.id); renderAdminBody(); }
          catch (e) { alert(e.message); }
        });
        btns.appendChild(delBtn);
      } else {
        const selfSpan = document.createElement('span');
        selfSpan.style.cssText = 'color:var(--text-dim);font-size:12px;font-style:italic';
        selfSpan.textContent = '(você)';
        btns.appendChild(selfSpan);
      }

      actTd.appendChild(btns);
      tr.append(idTd, nameTd, emailTd, roleTd, dateTd, actTd);
      tbody.appendChild(tr);
    });
  }

  table.append(thead, tbody);
  wrap.appendChild(table);
  body.appendChild(wrap);
}
