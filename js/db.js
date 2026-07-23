// Gerenciamento de Estado e LocalStorage
let db = JSON.parse(localStorage.getItem('fin_db')) || {
  transactions: [],
  goals: [{ id: 1, title: 'Reserva de Emergência', current: 3000, target: 10000 }],
  budgets: { 'Alimentação': 800, 'Lazer': 400 },
  recurring: [
    { id: 1, desc: 'Netflix', type: 'despesa', category: 'Lazer', amount: 55.90, day: 10, lastProcessedMonth: '' },
    { id: 2, desc: 'Aluguel', type: 'despesa', category: 'Moradia', amount: 1500.00, day: 5, lastProcessedMonth: '' }
  ],
  categories: {
    receita: ['Salário', 'Freelance', 'Rendimentos'],
    despesa: ['Alimentação', 'Moradia', 'Lazer', 'Transporte', 'Saúde'],
    investimento: ['Ações', 'FIIs', 'Renda Fixa', 'Cripto']
  }
};

if (!db.budgets) db.budgets = {};
if (!db.goals) db.goals = [];
if (!db.recurring) db.recurring = [];

function saveDB() {
  localStorage.setItem('fin_db', JSON.stringify(db));
}

function exportBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `backup_financas_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.transactions && importedData.categories) {
        db = importedData;
        if (!db.goals) db.goals = [];
        if (!db.budgets) db.budgets = {};
        if (!db.recurring) db.recurring = [];
        saveDB();
        renderApp();
        alert('Backup restaurado com sucesso!');
      } else {
        alert('Arquivo de backup inválido.');
      }
    } catch (err) {
      alert('Erro ao carregar o arquivo de backup.');
    }
  };
  reader.readAsText(file);
}
