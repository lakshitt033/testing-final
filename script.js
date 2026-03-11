/* =============================================
   SKILL TRACE - Global JavaScript v2
   ============================================= */

// ── Theme ─────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('st_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon();
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('st_theme', next);
  updateThemeIcon();
}
function updateThemeIcon() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = isDark ? '🌙' : '☀️';
}

// ── Auth ──────────────────────────────────────
function getCurrentUser() {
  const data = localStorage.getItem('st_current_user');
  return data ? JSON.parse(data) : null;
}
function setCurrentUser(user) {
  localStorage.setItem('st_current_user', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('st_current_user');
  window.location.href = 'index.html';
}
function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  if (role && user.role !== role) {
    window.location.href = user.role === 'recruiter' ? 'recruiter-dashboard.html' : 'candidate-dashboard.html';
    return null;
  }
  return user;
}

// ── Users ─────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem('st_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('st_users', JSON.stringify(users));
}
function getUserByEmail(email) {
  return getUsers().find(u => u.email === email);
}
function updateUser(updated) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === updated.email);
  if (idx >= 0) { users[idx] = updated; saveUsers(users); }
  setCurrentUser(updated);
}

// ── Jobs ──────────────────────────────────────
function getJobs() {
  return JSON.parse(localStorage.getItem('st_jobs') || '[]');
}
function saveJob(job) {
  const jobs = getJobs();
  job.id = Date.now().toString();
  job.postedAt = new Date().toLocaleDateString();
  jobs.push(job);
  localStorage.setItem('st_jobs', JSON.stringify(jobs));
}

// ── Applications (with status sync) ──────────
function getApplications() {
  return JSON.parse(localStorage.getItem('st_applications') || '[]');
}
function saveApplications(apps) {
  localStorage.setItem('st_applications', JSON.stringify(apps));
}
function applyToJob(jobId, candidateEmail) {
  const apps = getApplications();
  const exists = apps.find(a => a.jobId === jobId && a.candidateEmail === candidateEmail);
  if (exists) return false;
  apps.push({
    jobId,
    candidateEmail,
    appliedAt: new Date().toLocaleDateString(),
    status: 'Applied'
  });
  saveApplications(apps);
  return true;
}
// Recruiter updates application status — syncs to candidate view
function updateApplicationStatus(jobId, candidateEmail, newStatus) {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.jobId === jobId && a.candidateEmail === candidateEmail);
  if (idx >= 0) {
    apps[idx].status = newStatus;
    apps[idx].updatedAt = new Date().toLocaleDateString();
    saveApplications(apps);
    return true;
  }
  return false;
}

// ── Resume Score ──────────────────────────────
function calculateScore(user) {
  let score = 0;
  const profile = user.profile || {};
  if (profile.skills && profile.skills.length > 0) score += 2.5;
  else if (user.skills) score += 1.5;
  if (profile.projects && profile.projects.length > 10) score += 2.5;
  else if (profile.projects && profile.projects.length > 0) score += 1.5;
  if (profile.github) score += 1.5;
  if (profile.linkedin) score += 1;
  if (profile.experience) score += 1.5;
  if (profile.portfolio) score += 0.5;
  if (profile.role) score += 0.5;
  return Math.min(10, parseFloat(score.toFixed(1)));
}

// ── Toast ─────────────────────────────────────
function showToast(msg, type = 'success') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
  wrap.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 280); }, 3200);
}

// ── Animate Number ────────────────────────────
function animateNumber(el, target, suffix = '', duration = 1100) {
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = parseFloat(start.toFixed(1)) + suffix;
  }, 16);
}

// ── Progress Bar ──────────────────────────────
function animateProgress(el, pct) {
  setTimeout(() => { if (el) el.style.width = pct + '%'; }, 120);
}

// ── Seed Demo Data ────────────────────────────
function seedDemoData() {
  if (localStorage.getItem('st_seeded')) return;
  const demoUsers = [
    {
      name: 'Alex Rivera', email: 'alex@demo.com', password: 'demo123', role: 'candidate',
      profile: { role: 'Frontend Developer', skills: ['React', 'TypeScript', 'Node.js', 'CSS', 'GraphQL'], experience: '3 years building SaaS products at startups.', projects: 'E-commerce dashboard, Real-time chat app, Portfolio site', github: 'https://github.com/alexrivera', linkedin: 'https://linkedin.com/in/alexrivera', portfolio: 'https://alexrivera.dev' },
      verificationStatus: 'verified'
    },
    {
      name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', role: 'candidate',
      profile: { role: 'Full Stack Developer', skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'], experience: '5 years in fintech and healthtech domains.', projects: 'Banking API, Healthcare portal, Analytics dashboard', github: 'https://github.com/priyasharma', linkedin: 'https://linkedin.com/in/priyasharma', portfolio: 'https://priya.dev' },
      verificationStatus: 'verified'
    },
    {
      name: 'Marcus Chen', email: 'marcus@demo.com', password: 'demo123', role: 'candidate',
      profile: { role: 'UI/UX Designer', skills: ['Figma', 'React', 'CSS', 'Motion Design', 'User Research'], experience: '4 years designing for B2B SaaS.', projects: 'Design system, Mobile app redesign, Onboarding flows', github: 'https://github.com/marcuschen', linkedin: 'https://linkedin.com/in/marcuschen', portfolio: 'https://marcus.design' },
      verificationStatus: 'pending'
    },
    {
      name: 'Sarah Kim', email: 'sarah@demo.com', password: 'demo123', role: 'candidate',
      profile: { role: 'DevOps Engineer', skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Go'], experience: '6 years in cloud infrastructure.', projects: 'Multi-cloud deploy pipeline, K8s operator, Cost optimizer', github: 'https://github.com/sarahkim', linkedin: 'https://linkedin.com/in/sarahkim', portfolio: '' },
      verificationStatus: 'pending'
    },
    {
      name: 'David Park', email: 'david@demo.com', password: 'demo123', role: 'candidate',
      profile: { role: 'Backend Developer', skills: ['Java', 'Spring Boot', 'Kafka', 'MySQL'], experience: '2 years in enterprise software.', projects: 'Microservices API, Event-driven system', github: '', linkedin: 'https://linkedin.com/in/davidpark', portfolio: '' },
      verificationStatus: 'rejected'
    },
    { name: 'TechCorp HR', email: 'recruiter@demo.com', password: 'demo123', role: 'recruiter', company: 'TechCorp Inc.', profile: {} }
  ];
  const existingUsers = getUsers();
  demoUsers.forEach(u => { if (!existingUsers.find(e => e.email === u.email)) existingUsers.push(u); });
  saveUsers(existingUsers);

  const demoJobs = [
    { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', skills: 'React, TypeScript, CSS, GraphQL', experience: '3+ years', description: 'Join our product team building cutting-edge SaaS dashboards.', postedBy: 'recruiter@demo.com', postedAt: '2025-01-10' },
    { id: '2', title: 'Full Stack Engineer', company: 'DataFlow', skills: 'Python, React, PostgreSQL, Docker', experience: '4+ years', description: 'Build scalable data pipelines and beautiful interfaces.', postedBy: 'recruiter@demo.com', postedAt: '2025-01-12' },
    { id: '3', title: 'UI/UX Designer', company: 'DesignStudio', skills: 'Figma, React, CSS, User Research', experience: '2+ years', description: 'Create stunning user experiences for our global clients.', postedBy: 'recruiter@demo.com', postedAt: '2025-01-14' }
  ];
  localStorage.setItem('st_jobs', JSON.stringify(demoJobs));

  const demoApps = [
    { jobId: '1', candidateEmail: 'alex@demo.com', appliedAt: '2025-01-11', status: 'Applied' },
    { jobId: '2', candidateEmail: 'priya@demo.com', appliedAt: '2025-01-13', status: 'Accepted' },
    { jobId: '3', candidateEmail: 'marcus@demo.com', appliedAt: '2025-01-15', status: 'Applied' }
  ];
  saveApplications(demoApps);
  localStorage.setItem('st_seeded', '1');
}

// ── Sidebar ───────────────────────────────────
function populateSidebar() {
  const user = getCurrentUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebar-name');
  const roleEl = document.getElementById('sidebar-role');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role === 'recruiter' ? '🏢 Recruiter' : '👤 Candidate';
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}
function setActiveNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page) a.classList.add('active');
  });
}

// ── Status helpers ────────────────────────────
function getStatusClass(status) {
  const map = { Applied: 'app-status-applied', Accepted: 'app-status-accepted', Shortlisted: 'app-status-shortlisted', Rejected: 'app-status-rejected', Pending: 'app-status-pending' };
  return map[status] || 'app-status-applied';
}
function getStatusIcon(status) {
  const map = { Applied: '📨', Accepted: '✅', Shortlisted: '⭐', Rejected: '❌', Pending: '⏳' };
  return map[status] || '📨';
}

// ── Profile views simulation ──────────────────
function getProfileViews(email) {
  const key = 'st_pviews_' + email;
  let views = parseInt(localStorage.getItem(key) || '0');
  if (!views) {
    views = Math.floor(Math.random() * 80) + 20;
    localStorage.setItem(key, views);
  }
  return views;
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  seedDemoData();
  populateSidebar();
  setActiveNav();

  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
});
function getJobs() {
  return JSON.parse(localStorage.getItem('st_jobs') || '[]');
}