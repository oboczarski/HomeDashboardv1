// Fantasy Command - Vanilla JS rebuild
// Data model
const defaultPlayers = [
  {
    id: '1',
    name: 'Justin Jefferson',
    position: 'WR',
    team: 'MIN',
    totalPoints: 342.5,
    ppg: 22.4,
    consistency: 92,
    ceiling: 45,
    floor: 12,
    targetShare: 29.5,
    avatarUrl: 'https://picsum.photos/seed/jefferson/100/100',
    trend: 'up'
  },
  {
    id: '2',
    name: 'Christian McCaffrey',
    position: 'RB',
    team: 'SF',
    totalPoints: 380.2,
    ppg: 24.8,
    consistency: 95,
    ceiling: 50,
    floor: 15,
    targetShare: 18.2,
    avatarUrl: 'https://picsum.photos/seed/cmc/100/100',
    trend: 'stable'
  },
  {
    id: '3',
    name: 'Tyreek Hill',
    position: 'WR',
    team: 'MIA',
    totalPoints: 310.8,
    ppg: 20.1,
    consistency: 85,
    ceiling: 55,
    floor: 8,
    targetShare: 31.0,
    avatarUrl: 'https://picsum.photos/seed/tyreek/100/100',
    trend: 'down'
  },
  {
    id: '4',
    name: 'Josh Allen',
    position: 'QB',
    team: 'BUF',
    totalPoints: 402.1,
    ppg: 25.3,
    consistency: 88,
    ceiling: 42,
    floor: 18,
    targetShare: 0,
    avatarUrl: 'https://picsum.photos/seed/allen/100/100',
    trend: 'up'
  },
  {
    id: '5',
    name: 'Travis Kelce',
    position: 'TE',
    team: 'KC',
    totalPoints: 210.4,
    ppg: 14.5,
    consistency: 90,
    ceiling: 30,
    floor: 8,
    targetShare: 22.1,
    avatarUrl: 'https://picsum.photos/seed/kelce/100/100',
    trend: 'stable'
  },
  {
    id: '6',
    name: 'CeeDee Lamb',
    position: 'WR',
    team: 'DAL',
    totalPoints: 335.9,
    ppg: 21.5,
    consistency: 89,
    ceiling: 40,
    floor: 10,
    targetShare: 28.4,
    avatarUrl: 'https://picsum.photos/seed/lamb/100/100',
    trend: 'up'
  },
  {
    id: '7',
    name: 'Lamar Jackson',
    position: 'QB',
    team: 'BAL',
    totalPoints: 360.5,
    ppg: 23.1,
    consistency: 82,
    ceiling: 48,
    floor: 14,
    targetShare: 0,
    avatarUrl: 'https://picsum.photos/seed/lamar/100/100',
    trend: 'up'
  },
  {
    id: '8',
    name: 'Bijan Robinson',
    position: 'RB',
    team: 'ATL',
    totalPoints: 245.3,
    ppg: 16.2,
    consistency: 78,
    ceiling: 35,
    floor: 6,
    targetShare: 14.5,
    avatarUrl: 'https://picsum.photos/seed/bijan/100/100',
    trend: 'down'
  }
];

let players = [];
const state = {
  selectedPlayerId: null,
  filter: 'all'
};

// Helpers
const byMetric = metric => [...players].sort((a, b) => b[metric] - a[metric]);
const getTop = metric => byMetric(metric)[0];
const getSelected = () => players.find(p => p.id === state.selectedPlayerId) || players[0];
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

function calculatePlayerScore(player) {
  const score = (player.consistency + player.ppg * 3 + player.ceiling) / 3;
  return clamp(Math.round(score), 0, 99);
}

function radarData(player) {
  return [
    { axis: 'Consistency', value: player.consistency },
    { axis: 'Ceiling', value: Math.min(100, (player.ceiling / 60) * 100) },
    { axis: 'Floor', value: Math.min(100, (player.floor / 20) * 100) },
    { axis: 'PPG', value: Math.min(100, (player.ppg / 30) * 100) },
    { axis: 'Share', value: Math.min(100, (player.targetShare / 40) * 100) }
  ];
}

function ppgBarData(filter) {
  return [...players]
    .filter(p => filter === 'all' || p.position === filter)
    .sort((a, b) => b.ppg - a.ppg)
    .slice(0, 8)
    .map(p => ({ label: p.name.split(' ').pop() || p.name, value: p.ppg }));
}

// Rendering functions
function renderSummary() {
  const topPoints = getTop('totalPoints');
  const topConsistency = getTop('consistency');
  const topCeiling = getTop('ceiling');
  const topShare = getTop('targetShare');

  const projectedMaxPoints = 450; // visual scale only

  setText('total-points-value', topPoints.totalPoints.toFixed(1));
  setText('total-points-name', topPoints.name);
  setWidth('total-points-bar', (topPoints.totalPoints / projectedMaxPoints) * 100);

  setText('consistency-value', `${topConsistency.consistency}%`);
  setText('consistency-name', topConsistency.name);
  setWidth('consistency-bar', topConsistency.consistency);

  setText('ceiling-value', topCeiling.ceiling);
  setText('ceiling-name', topCeiling.name);

  setText('share-value', `${topShare.targetShare}%`);
  setText('share-name', topShare.name);
  setWidth('share-bar', topShare.targetShare);
}

function renderSelect() {
  const select = document.getElementById('player-select');
  if (!select) return;
  select.innerHTML = players
    .map(p => `<option value="${p.id}" ${p.id === state.selectedPlayerId ? 'selected' : ''}>${p.name}</option>`)
    .join('');
}

function renderSelectedDetails() {
  const player = getSelected();
  // Removed avatar/name/meta updates for the deleted block
  setText('rating-value', calculatePlayerScore(player));
  setText('rating-meta', `${player.position} // ${player.team}`);
}

function renderRadar() {
  const data = radarData(getSelected());
  drawRadarChart('radar-chart', data);
}

function renderBar() {
  const data = ppgBarData(state.filter);
  drawBarChart('bar-chart', data);
}

function renderTable() {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  
  const rows = [...players]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((p, i) => {
      const posClass =
        p.position === 'WR' ? 'fc-pos-wr' :
        p.position === 'RB' ? 'fc-pos-rb' :
        p.position === 'QB' ? 'fc-pos-qb' :
        'fc-pos-te';

      const trendIcon = trendSvg(p.trend);

      return `
        <tr class="fc-tr">
          <td class="fc-td fc-td-rank">#${i + 1}</td>
          <td class="fc-td">
            <div class="fc-td-player">
              <img src="${p.avatarUrl}" class="fc-avatar-sm" alt="">
              <div>
                <div class="fc-player-name">${p.name}</div>
                <div class="fc-player-team">${p.team}</div>
              </div>
            </div>
          </td>
          <td class="fc-td fc-text-center">
            <span class="fc-pos-badge ${posClass}">${p.position}</span>
          </td>
          <td class="fc-td fc-text-right fc-td-val">${p.totalPoints.toFixed(1)}</td>
          <td class="fc-td fc-text-right fc-td-sub">${p.ppg.toFixed(1)}</td>
          <td class="fc-td fc-text-right fc-td-sub">${p.ceiling}</td>
          <td class="fc-td fc-text-center">${trendIcon}</td>
        </tr>
      `;
    })
    .join('');

  tbody.innerHTML = rows;
}

// Event wiring
function wireEvents() {
  const select = document.getElementById('player-select');
  if (select) {
    select.addEventListener('change', e => {
      state.selectedPlayerId = e.target.value;
      renderSelectedDetails();
      renderRadar();
    });
  }

  const filterBtns = document.getElementById('filter-buttons');
  if (filterBtns) {
    filterBtns.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const filter = btn.dataset.filter;
      if (!filter) return;
      state.filter = filter;
      updateFilterButtons();
      renderBar();
    });
  }

  window.addEventListener('resize', debounce(() => {
    renderRadar();
    renderBar();
  }, 200));
}

function updateFilterButtons() {
  document.querySelectorAll('#filter-buttons button').forEach(btn => {
    const active = btn.dataset.filter === state.filter;
    btn.classList.toggle('fc-filter-btn--active', active);
  });
}

// Small utilities
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setWidth(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${clamp(pct, 0, 100)}%`;
}

function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function trendSvg(trend) {
  if (trend === 'up') {
    return '<span style="color: var(--color-emerald-light); display: flex; justify-content: center;"><svg class="fc-icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></span>';
  }
  if (trend === 'down') {
    return '<span style="color: var(--color-red); display: flex; justify-content: center;"><svg class="fc-icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg></span>';
  }
  return '<span style="color: var(--text-muted); display: flex; justify-content: center;"><svg class="fc-icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"></path></svg></span>';
}

// D3 radar
function drawRadarChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const width = rect.width || 360;
  const height = rect.height || 360;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const numRings = data.length;
  // Reduced maxRadius to prevent clipping of labels
  const maxRadius = Math.min(width, height) / 2 - 30;
  const innerRadius = 40;
  const ringWidth = (maxRadius - innerRadius) / numRings;
  const gap = 4;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22d3ee', '#8b5cf6'];

  data.forEach((d, i) => {
    const rInner = innerRadius + i * ringWidth + gap;
    const rOuter = innerRadius + (i + 1) * ringWidth;
    const color = colors[i % colors.length];

    const bgArc = d3.arc()
      .innerRadius(rInner)
      .outerRadius(rOuter)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .cornerRadius(ringWidth / 2);

    svg.append('path')
      .attr('d', bgArc)
      .attr('fill', color)
      .attr('opacity', 0.1);

    const endAngle = (d.value / 100) * 2 * Math.PI;

    const fgArc = d3.arc()
      .innerRadius(rInner)
      .outerRadius(rOuter)
      .startAngle(0)
      .endAngle(endAngle)
      .cornerRadius(ringWidth / 2);

    svg.append('path')
      .attr('fill', color)
      .attr('d', fgArc)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attrTween('d', function() {
        const interpolate = d3.interpolate(0, endAngle);
        return function(t) {
          const arcFn = d3.arc()
            .innerRadius(rInner)
            .outerRadius(rOuter)
            .startAngle(0)
            .endAngle(interpolate(t))
            .cornerRadius(ringWidth / 2);
          return arcFn();
        };
      });

    svg.append('text')
      .attr('x', 5)
      .attr('y', -(rInner + (ringWidth - gap) / 2))
      .attr('dy', '0.35em')
      .text(d.axis.substring(0, 3).toUpperCase())
      .attr('fill', '#fff')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0.8)
      .style('pointer-events', 'none');
  });
}

// D3 bar chart
function drawBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const width = rect.width || 640;
  const height = rect.height || 360;

  const margin = { top: 40, right: 15, bottom: 40, left: 15 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const defs = svg.append('defs');
  const filter = defs.append('filter')
    .attr('id', 'neon-glow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter.append('feGaussianBlur')
    .attr('stdDeviation', '3')
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .range([0, innerWidth])
    .domain(data.map(d => d.label))
    .padding(0.45);

  const maxValue = d3.max(data, d => d.value) || 0;
  const y = d3.scaleLinear()
    .range([innerHeight, 0])
    .domain([0, maxValue * 1.15]);

  const colorScale = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range(['#06b6d4', '#a855f7'])
    .interpolate(d3.interpolateRgb);

  const uid = Date.now();

  data.forEach((d, i) => {
    const color = colorScale(i);
    const gradId = `bar-grad-${uid}-${i}`;
    const grad = defs.append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.5);
    grad.append('stop').attr('offset', '70%').attr('stop-color', color).attr('stop-opacity', 0.1);
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);
  });

  const barGroups = g.selectAll('.bar-group')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'bar-group');

  const barWidth = x.bandwidth();
  const radius = barWidth / 2;

  barGroups.append('rect')
    .attr('x', d => x(d.label))
    .attr('y', innerHeight)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('rx', radius)
    .attr('ry', radius)
    .attr('fill', 'none')
    .attr('stroke', (d, i) => colorScale(i))
    .attr('stroke-width', 6)
    .attr('stroke-opacity', 0.3)
    .style('filter', 'url(#neon-glow)')
    .transition()
    .duration(1000)
    .delay((d, i) => i * 50)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(d.value))
    .attr('height', d => innerHeight - y(d.value));

  barGroups.append('rect')
    .attr('x', d => x(d.label))
    .attr('y', innerHeight)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('rx', radius)
    .attr('ry', radius)
    .attr('fill', (d, i) => `url(#bar-grad-${uid}-${i})`)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 50)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(d.value))
    .attr('height', d => innerHeight - y(d.value));

  barGroups.append('rect')
    .attr('x', d => x(d.label))
    .attr('y', innerHeight)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('rx', radius)
    .attr('ry', radius)
    .attr('fill', 'none')
    .attr('stroke', (d, i) => colorScale(i))
    .attr('stroke-width', 2.5)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 50)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(d.value))
    .attr('height', d => innerHeight - y(d.value));

  barGroups.append('text')
    .text(d => d.value.toFixed(1))
    .attr('x', d => x(d.label) + barWidth / 2)
    .attr('y', innerHeight)
    .attr('text-anchor', 'middle')
    .attr('fill', (d, i) => colorScale(i))
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .style('text-shadow', '0 0 10px rgba(0,0,0,1)')
    .style('opacity', 0)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 50 + 400)
    .attr('y', d => y(d.value) - 10)
    .style('opacity', 1);

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll('text')
    .style('text-anchor', 'middle')
    .style('fill', '#94a3b8')
    .style('font-size', '12px')
    .style('font-weight', '500')
    .attr('dy', '18px');

  g.select('.domain').remove();
}

// Initialize
window.initFantasyDashboard = function(data) {
  players = data || defaultPlayers;
  state.selectedPlayerId = players[0].id;
  
  renderSummary();
  renderSelect();
  renderSelectedDetails();
  renderRadar();
  renderBar();
  renderTable();
  updateFilterButtons();
  wireEvents();
};

document.addEventListener('DOMContentLoaded', () => {
  window.initFantasyDashboard();
});

