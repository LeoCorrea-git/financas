document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tx-date').valueAsDate = new Date();
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon').className = 'fa-solid fa-sun';
  }
  initCharts();
  renderApp();
});

function getFilteredData() {
  const typeFilter = document.getElementById('filter-type').value;
  const monthFilter = document.getElementById('filter-month').value;
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();

  return db.transactions.filter(t => {
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchMonth = !monthFilter || t.date.startsWith(monthFilter);
    const matchSearch = !searchQuery || t.desc.toLowerCase().includes(searchQuery) || t.category.toLowerCase().includes(searchQuery);
    return matchType && matchMonth && matchSearch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderApp() {
  const filtered = getFilteredData();
  renderTable(filtered);
  renderKPIs();
  renderCharts();
  renderGoals();
  renderBudgets();
}
