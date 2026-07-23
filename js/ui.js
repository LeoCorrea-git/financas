function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-icon').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  renderCharts();
}

function toggleModal(id) {
  const el = document.getElementById(id);
  el.classList.toggle('hidden');
  el.classList.toggle('flex');
  if (id === 'config-modal') renderConfigCategories();
  if (id === 'budget-modal') {
    const catSelect = document.getElementById('budget-category');
    catSelect.innerHTML = db.categories.despesa.map(c => `<option value="${c}">${c}</option>`).join('');
  }
}

function toggleInstallmentOption() {
  const isChecked = document.getElementById('tx-is-installment').checked;
  document.getElementById('installment-container').classList.toggle('hidden', !isChecked);
}

function updateCategoryDropdown() {
  const type = document.getElementById('tx-type').value;
  const catSelect = document.getElementById('tx-category');
  catSelect.innerHTML = db.categories[type].map(c => `<option value="${c}">${c}</option>`).join('');
}

function addCategory() {
  const type = document.getElementById('cfg-type').value;
  const input = document.getElementById('cfg-name');
  const val = input.value.trim();

  if (val && !db.categories[type].includes(val)) {
    db.categories[type].push(val);
    saveDB();
    input.value = '';
    renderConfigCategories();
    updateCategoryDropdown();
  }
}

function removeCategory(type, name) {
  db.categories[type] = db.categories[type].filter(c => c !== name);
  saveDB();
  renderConfigCategories();
  updateCategoryDropdown();
}

function renderConfigCategories() {
  const list = document.getElementById('cfg-list');
  let html = '';
  ['receita', 'despesa', 'investimento'].forEach(type => {
    db.categories[type].forEach(cat => {
      html += `
        <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-600 text-sm">
          <span class="capitalize text-slate-600 dark:text-slate-300"><strong class="font-semibold text-slate-800 dark:text-white">${type}:</strong> ${cat}</span>
          <button onclick="removeCategory('${type}', '${cat}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `;
    });
  });
  list.innerHTML = html;
}

function saveBudgetLimit(e) {
  e.preventDefault();
  const cat = document.getElementById('budget-category').value;
  const limit = parseFloat(document.getElementById('budget-limit').value);
  db.budgets[cat] = limit;
  saveDB();
  toggleModal('budget-modal');
  renderBudgets();
}

function renderBudgets() {
  const container = document.getElementById('budget-limits-list');
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthExpenses = db.transactions
    .filter(t => t.type === 'despesa' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const keys = Object.keys(db.budgets);
  if (keys.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 col-span-2">Nenhum limite de gasto cadastrado.</p>`;
    return;
  }

  container.innerHTML = keys.map(cat => {
    const spent = monthExpenses[cat] || 0;
    const limit = db.budgets[cat];
    const pct = Math.min(100, Math.round((spent / limit) * 100));
    const isOver = spent > limit;

    return `
      <div class="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
        <div class="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          <span>${cat}</span>
          <span class="${isOver ? 'text-rose-600 font-bold' : 'text-slate-500'}">${pct}%</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
          <div class="${isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'} h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Gasto: R$ ${spent.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">Teto: R$ ${limit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    `;
  }).join('');
}

function saveGoal(e) {
  e.preventDefault();
  const newGoal = {
    id: Date.now(),
    title: document.getElementById('goal-title').value,
    current: parseFloat(document.getElementById('goal-current').value),
    target: parseFloat(document.getElementById('goal-target').value)
  };
  db.goals.push(newGoal);
  saveDB();
  toggleModal('goal-modal');
  renderGoals();
}

function deleteGoal(id) {
  if(confirm('Deseja excluir esta meta?')) {
    db.goals = db.goals.filter(g => g.id !== id);
    saveDB();
    renderGoals();
  }
}

function renderGoals() {
  const container = document.getElementById('goals-list');
  if (db.goals.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 col-span-3">Nenhuma meta cadastrada ainda.</p>`;
    return;
  }

  container.innerHTML = db.goals.map(g => {
    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
    return `
      <div class="bg-slate-50 dark:bg-slate-700/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-600 relative group">
        <button onclick="deleteGoal(${g.id})" class="absolute top-2 right-2 text-slate-300 hover:text-rose-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-solid fa-trash"></i></button>
        <div class="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          <span>${g.title}</span>
          <span>${pct}%</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
          <div class="bg-indigo-600 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>R$ ${g.current.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">Meta: R$ ${g.target.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    `;
  }).join('');
}

function openFormModal(id = null) {
  const form = document.getElementById('tx-form');
  form.reset();
  document.getElementById('installment-container').classList.add('hidden');
  
  if (id) {
    const tx = db.transactions.find(t => t.id === id);
    document.getElementById('tx-id').value = tx.id;
    document.getElementById('tx-desc').value = tx.desc;
    document.getElementById('tx-type').value = tx.type;
    updateCategoryDropdown();
    document.getElementById('tx-category').value = tx.category;
    document.getElementById('tx-amount').value = tx.amount;
    document.getElementById('tx-date').value = tx.date;
    document.getElementById('modal-title').innerText = 'Editar Lançamento';
  } else {
    document.getElementById('tx-id').value = '';
    document.getElementById('tx-date').valueAsDate = new Date();
    document.getElementById('modal-title').innerText = 'Novo Lançamento';
    updateCategoryDropdown();
  }
  
  toggleModal('form-modal');
}

function saveTransaction(e) {
  e.preventDefault();
  const id = document.getElementById('tx-id').value;
  const isInstallment = document.getElementById('tx-is-installment').checked;
  const numInstallments = parseInt(document.getElementById('tx-installments').value) || 1;
  
  const totalAmount = parseFloat(document.getElementById('tx-amount').value);
  const baseDate = new Date(document.getElementById('tx-date').value + 'T00:00:00');
  const desc = document.getElementById('tx-desc').value;
  const type = document.getElementById('tx-type').value;
  const category = document.getElementById('tx-category').value;

  if (id) {
    const index = db.transactions.findIndex(t => t.id === parseInt(id));
    db.transactions[index] = {
      id: parseInt(id),
      desc, type, category,
      amount: totalAmount,
      date: document.getElementById('tx-date').value
    };
  } else if (isInstallment && numInstallments > 1) {
    const installmentValue = totalAmount / numInstallments;
    for (let i = 0; i < numInstallments; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(baseDate.getMonth() + i);

      db.transactions.push({
        id: Date.now() + i,
        desc: `${desc} (${i + 1}/${numInstallments})`,
        type, category,
        amount: installmentValue,
        date: installmentDate.toISOString().slice(0, 10)
      });
    }
  } else {
    db.transactions.push({
      id: Date.now(),
      desc, type, category,
      amount: totalAmount,
      date: document.getElementById('tx-date').value
    });
  }

  saveDB();
  toggleModal('form-modal');
  renderApp();
}

function deleteTransaction(id) {
  if (confirm('Deseja realmente excluir este registro?')) {
    db.transactions = db.transactions.filter(t => t.id !== id);
    saveDB();
    renderApp();
  }
}

function renderTable(data) {
  const tbody = document.getElementById('transactions-list');
  
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  const badgeStyles = {
    receita: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    despesa: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    investimento: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  };

  tbody.innerHTML = data.map(t => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
      <td class="py-3 px-4 font-mono text-xs">${t.date.split('-').reverse().join('/')}</td>
      <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${t.desc}</td>
      <td class="py-3 px-4">
        <span class="text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeStyles[t.type]} capitalize">
          ${t.type}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-500 dark:text-slate-400">${t.category}</td>
      <td class="py-3 px-4 text-right font-semibold ${t.type === 'despesa' ? 'text-rose-600 dark:text-rose-400' : t.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}">
        ${t.type === 'despesa' ? '-' : '+'} R$ ${t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="openFormModal(${t.id})" class="text-slate-400 hover:text-indigo-600 mx-1"><i class="fa-solid fa-pen"></i></button>
        <button onclick="deleteTransaction(${t.id})" class="text-slate-400 hover:text-rose-600 mx-1"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function renderKPIs() {
  const totals = db.transactions.reduce((acc, t) => {
    acc[t.type] += t.amount;
    return acc;
  }, { receita: 0, despesa: 0, investimento: 0 });

  const saldo = totals.receita - totals.despesa - totals.investimento;

  document.getElementById('kpi-saldo').innerText = `R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  document.getElementById('kpi-receita').innerText = `R$ ${totals.receita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  document.getElementById('kpi-despesa').innerText = `R$ ${totals.despesa.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  document.getElementById('kpi-investimento').innerText = `R$ ${totals.investimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}
