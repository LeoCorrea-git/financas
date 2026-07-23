let barChartInst = null;
let pieChartInst = null;
let investChartInst = null;

function initCharts() {
  const ctxBar = document.getElementById('barChart').getContext('2d');
  barChartInst = new Chart(ctxBar, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const ctxPie = document.getElementById('pieChart').getContext('2d');
  pieChartInst = new Chart(ctxPie, {
    type: 'doughnut',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const ctxInvest = document.getElementById('investChart').getContext('2d');
  investChartInst = new Chart(ctxInvest, {
    type: 'doughnut',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function renderCharts() {
  const totals = db.transactions.reduce((acc, t) => {
    acc[t.type] += t.amount;
    return acc;
  }, { receita: 0, despesa: 0, investimento: 0 });

  // Bar Chart
  barChartInst.data = {
    labels: ['Receitas', 'Despesas', 'Investimentos'],
    datasets: [{
      data: [totals.receita, totals.despesa, totals.investimento],
      backgroundColor: ['#10b981', '#f43f5e', '#6366f1'],
      borderRadius: 6
    }]
  };
  barChartInst.options.plugins.legend.display = false;
  barChartInst.update();

  // Despesas Chart
  const catTotals = {};
  db.transactions.filter(t => t.type === 'despesa').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  pieChartInst.data = {
    labels: Object.keys(catTotals),
    datasets: [{
      data: Object.values(catTotals),
      backgroundColor: ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#64748b']
    }]
  };
  pieChartInst.update();

  // Investimentos Chart
  const investTotals = {};
  db.transactions.filter(t => t.type === 'investimento').forEach(t => {
    investTotals[t.category] = (investTotals[t.category] || 0) + t.amount;
  });

  investChartInst.data = {
    labels: Object.keys(investTotals),
    datasets: [{
      data: Object.values(investTotals),
      backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    }]
  };
  investChartInst.update();
}
