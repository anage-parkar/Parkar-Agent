/* =============================================
   PARKAR.IN - Component Loader
   js/components.js
   =============================================
   Loads reusable navbar & footer into every page.

   Environments handled automatically:
     • Local (Live Server / file://)   – depth-relative file paths
     • GitHub Pages (github.io)        – depth-relative file paths
                                         (no URL rewriting on GH Pages)
     • Production (Nginx / Apache)     – clean URLs served via
                                         nginx.conf / .htaccess rewrites
   ============================================= */

(function () {
  'use strict';

  /* ── Route map: clean URL → file path (relative to project root) ────────── */
  const ROUTES = {
    '/':                                    'index.html',
    '/platforms/aioniq':                    'platforms/aioniq.html',
    '/platforms/vector':                    'platforms/vector.html',
    '/platforms/vector-platform':           'platforms/vector-platform.html',
    '/platforms/vector-integrations':       'platforms/vector-integrations.html',
    '/solutions/agentic-ai':                'solutions/agentic-ai.html',
    '/solutions/applications':              'solutions/applications.html',
    '/solutions/data':                      'solutions/data.html',
    '/solutions/cloud':                     'solutions/cloud.html',
    '/solutions/itops':                     'solutions/itops.html',
    '/gcc/overview':                        'gcc/overview.html',
    '/gcc/managed-service':                 'gcc/managed-service.html',
    '/gcc/pay-as-you-go':                   'gcc/pay-as-you-go.html',
    '/gcc/build-operate-transfer':          'gcc/build-operate-transfer.html',
    '/gcc/thought-leadership':              'gcc/thought-leadership.html',
    '/industries/financial-services':       'industries/financial-services.html',
    '/industries/healthcare':               'industries/healthcare.html',
    '/industries/manufacturing':            'industries/manufacturing.html',
    '/industries/media':                    'industries/media.html',
    '/insights/blogs':                  'insights/blogs.html',
    '/insights/research':                  'insights/research.html',
    '/insights/case-studies':              'insights/case-studies.html',
    '/insights/events':                    'insights/events.html',
    '/insights/news':                      'insights/news.html',
    '/company/about':                       'company/about.html',
    '/company/our-journey':                 'company/our-journey.html',
    '/company/awards':                      'company/awards.html',
    '/company/partners':                    'company/partners.html',
    '/company/leadership':                  'company/leadership.html',
    '/careers/life-at-parkar':              'careers/life-at-parkar.html',
    '/careers/open-positions':              'careers/open-positions.html',
    '/careers/team-highlights':             'careers/team-highlights.html',
    '/contact':                             'contact.html',
    '/careers/team-highlights/satyen':      'careers/team-highlights/satyen.html',
    '/legal/privacy':                       'legal/privacy.html',
    '/legal/terms':                         'legal/terms.html',
    // GCC articles
    '/gcc/blogs/building-for-intelligence':         'gcc/blogs/building-for-intelligence.html',
    '/gcc/blogs/why-enterprise-ai-struggles':       'gcc/blogs/why-enterprise-ai-struggles.html',
    '/gcc/case-studies/gen-ai-studio':              'gcc/case-studies/gen-ai-studio.html',
    '/gcc/case-studies/real-time-ai-ops':           'gcc/case-studies/real-time-ai-ops.html',
    // Resources articles
    '/insights/blogs/the-three-gaps-every-enterprise-ai-leader-misses':        'insights/blogs/the-three-gaps-every-enterprise-ai-leader-misses.html',
    '/insights/blogs/why-95-of-your-ml-models-never-reach-production':        'insights/blogs/why-95-of-your-ml-models-never-reach-production.html',
    '/insights/blogs/the-architecture-that-frees-your-data-engineering-team': 'insights/blogs/the-architecture-that-frees-your-data-engineering-team.html',
    '/insights/blogs/when-fraud-monitoring-becomes-manual-triage':            'insights/blogs/when-fraud-monitoring-becomes-manual-triage.html',
    '/insights/blogs/alert-fatigue-is-a-data-architecture-problem':           'insights/blogs/alert-fatigue-is-a-data-architecture-problem.html',
    '/insights/blogs/the-customer-data-problem-banks-cant-engineer-their-way-out-of': 'insights/blogs/the-customer-data-problem-banks-cant-engineer-their-way-out-of.html',
    '/insights/blogs/nothing-triggered-an-alert-thats-what-triggered-the-investigation': 'insights/blogs/nothing-triggered-an-alert-thats-what-triggered-the-investigation.html',
    '/insights/blogs/when-cloud-breaks-patients-wait-why-healthcare-leaders-cant-ignore-ai-infrastructure': 'insights/blogs/when-cloud-breaks-patients-wait-why-healthcare-leaders-cant-ignore-ai-infrastructure.html',
    '/insights/blogs/7-reasons-cios-should-stop-piloting-ai-and-start-owning-the-outcomes': 'insights/blogs/7-reasons-cios-should-stop-piloting-ai-and-start-owning-the-outcomes.html',
    '/insights/blogs/agile-and-devops-debunking-myths-and-driving-excellence-with-azure-pipelines': 'insights/blogs/agile-and-devops-debunking-myths-and-driving-excellence-with-azure-pipelines.html',
    '/insights/blogs/aiops---the-secret-weapon-of-gccs-winning-the-application-performance-battle': 'insights/blogs/aiops---the-secret-weapon-of-gccs-winning-the-application-performance-battle.html',
    '/insights/blogs/application-modernization---trends-themes-and-opportunities': 'insights/blogs/application-modernization---trends-themes-and-opportunities.html',
    '/insights/blogs/application-performance-the-infrastructure-dimension': 'insights/blogs/application-performance-the-infrastructure-dimension.html',
    '/insights/blogs/automating-data-pipelines-streamlining-analytics-with-azure-and-aws': 'insights/blogs/automating-data-pipelines-streamlining-analytics-with-azure-and-aws.html',
    '/insights/blogs/being-easy-to-work-with-is-an-often-overlooked-career-skill': 'insights/blogs/being-easy-to-work-with-is-an-often-overlooked-career-skill.html',
    '/insights/blogs/best-practices-for-building-and-using-cloud-native-solutions': 'insights/blogs/best-practices-for-building-and-using-cloud-native-solutions.html',
    '/insights/blogs/building-and-growing-an-organization-achieving-long-term-success': 'insights/blogs/building-and-growing-an-organization-achieving-long-term-success.html',
    '/insights/blogs/cloud-infrastructure---trends-threats-and-themes-for-enterprise-cios': 'insights/blogs/cloud-infrastructure---trends-threats-and-themes-for-enterprise-cios.html',
    '/insights/blogs/cloud-native-microservices-the-backbone-of-scalable-enterprise-applications': 'insights/blogs/cloud-native-microservices-the-backbone-of-scalable-enterprise-applications.html',
    '/insights/blogs/culture-champions-podcast': 'insights/blogs/culture-champions-podcast.html',
    '/insights/blogs/culture-champions-podcast-2': 'insights/blogs/culture-champions-podcast-2.html',
    '/insights/blogs/custom-copilots-how-enterprises-can-build-their-own-ai-dev-assistants-2': 'insights/blogs/custom-copilots-how-enterprises-can-build-their-own-ai-dev-assistants-2.html',
    '/insights/blogs/data-engineering-pipelines-building-seamless-workflows-on-azure-and-aws': 'insights/blogs/data-engineering-pipelines-building-seamless-workflows-on-azure-and-aws.html',
    '/insights/blogs/data-mesh-in-action---leveraging-azure-synapse-and-databricks-for-decentralized-analytics': 'insights/blogs/data-mesh-in-action---leveraging-azure-synapse-and-databricks-for-decentralized-analytics.html',
    '/insights/blogs/data-mesh-vs-data-fabric-decentralizing-insights-with-databricks-and-azure': 'insights/blogs/data-mesh-vs-data-fabric-decentralizing-insights-with-databricks-and-azure.html',
    '/insights/blogs/delivering-excellence-digital-quality-assurance-with-aws-driven-automation': 'insights/blogs/delivering-excellence-digital-quality-assurance-with-aws-driven-automation.html',
    '/insights/blogs/elevate-your-game': 'insights/blogs/elevate-your-game.html',
    '/insights/blogs/embrace-world-mental-health-day': 'insights/blogs/embrace-world-mental-health-day.html',
    '/insights/blogs/enterprise-ai-and-the-problem-of-split-accountability': 'insights/blogs/enterprise-ai-and-the-problem-of-split-accountability.html',
    '/insights/blogs/enterprise-digital-transformation-the-azure-way': 'insights/blogs/enterprise-digital-transformation-the-azure-way.html',
    '/insights/blogs/finding-your-competitive-sweet-spot-at-the-workplace': 'insights/blogs/finding-your-competitive-sweet-spot-at-the-workplace.html',
    '/insights/blogs/fostering-dialogue-and-shared-responsibility-understanding-employee-dissatisfaction-and-layoffs-in-organizations': 'insights/blogs/fostering-dialogue-and-shared-responsibility-understanding-employee-dissatisfaction-and-layoffs-in-organizations.html',
    '/insights/blogs/from-data-silos-to-data-synergy-achieving-unified-insights-with-modern-data-pipelines': 'insights/blogs/from-data-silos-to-data-synergy-achieving-unified-insights-with-modern-data-pipelines.html',
    '/insights/blogs/from-fragmentation-to-consolidation-the-case-for-unified-monitoring-in-multi-cloud-environments': 'insights/blogs/from-fragmentation-to-consolidation-the-case-for-unified-monitoring-in-multi-cloud-environments.html',
    '/insights/blogs/gcc-india-focused-synergies-of-aiops-and-genai-in-unleashing-productivity-and-performance': 'insights/blogs/gcc-india-focused-synergies-of-aiops-and-genai-in-unleashing-productivity-and-performance.html',
    '/insights/blogs/genai-opportunities-for-india-gccs-to-enhance-efficiencies-and-accelerate-innovation': 'insights/blogs/genai-opportunities-for-india-gccs-to-enhance-efficiencies-and-accelerate-innovation.html',
    '/insights/blogs/generative-ai-in-data-engineering-unlocking-potential-with-databricks-and-azure-2': 'insights/blogs/generative-ai-in-data-engineering-unlocking-potential-with-databricks-and-azure-2.html',
    '/insights/blogs/how-to-build-saas-applications-in-the-ai-age': 'insights/blogs/how-to-build-saas-applications-in-the-ai-age.html',
    '/insights/blogs/how-to-encourage-your-team-to-speak-up': 'insights/blogs/how-to-encourage-your-team-to-speak-up.html',
    '/insights/blogs/how-to-use-the-power-of-genai-to-drive-aiops-in-indias-gccs': 'insights/blogs/how-to-use-the-power-of-genai-to-drive-aiops-in-indias-gccs.html',
    '/insights/blogs/indias-gccs-are-building-for-scale-but-are-they-building-for-intelligence': 'insights/blogs/indias-gccs-are-building-for-scale-but-are-they-building-for-intelligence.html',
    '/insights/blogs/integrate-companies-with-integrating-people-and-culture': 'insights/blogs/integrate-companies-with-integrating-people-and-culture.html',
    '/insights/blogs/landing-zones-are-the-new-cloud-playbook---heres-how-they-accelerate-enterprise-grade-transformation': 'insights/blogs/landing-zones-are-the-new-cloud-playbook---heres-how-they-accelerate-enterprise-grade-transformation.html',
    '/insights/blogs/lead-and-cultivate-a-culture-of-inspiration-not-just-motivation': 'insights/blogs/lead-and-cultivate-a-culture-of-inspiration-not-just-motivation.html',
    '/insights/blogs/leading-with-confidence-mentorship-tales': 'insights/blogs/leading-with-confidence-mentorship-tales.html',
    '/insights/blogs/leading-with-confidence-mentorship-tales-1': 'insights/blogs/leading-with-confidence-mentorship-tales-1.html',
    '/insights/blogs/low-code-development-platforms-driving-agility-with-azure-saas-solutions': 'insights/blogs/low-code-development-platforms-driving-agility-with-azure-saas-solutions.html',
    '/insights/blogs/low-code-vs-cloud-native-finding-the-right-balance-for-your-application-strategy': 'insights/blogs/low-code-vs-cloud-native-finding-the-right-balance-for-your-application-strategy.html',
    '/insights/blogs/mastering-azure-cost-optimization-a-guide-to-maximizing-roi-and-efficiency-': 'insights/blogs/mastering-azure-cost-optimization-a-guide-to-maximizing-roi-and-efficiency-.html',
    '/insights/blogs/mentor-by-your-side': 'insights/blogs/mentor-by-your-side.html',
    '/insights/blogs/ml-projects-dont-die-in-jupyter-they-die-in-your-data-pipeline': 'insights/blogs/ml-projects-dont-die-in-jupyter-they-die-in-your-data-pipeline.html',
    '/insights/blogs/navigating-the-future-modern-leadership-talent-management-and-the-ai-revolution': 'insights/blogs/navigating-the-future-modern-leadership-talent-management-and-the-ai-revolution.html',
    '/insights/blogs/observability-in-devops-streamlining-insights-with-azure-monitor-and-aws-cloudwatch': 'insights/blogs/observability-in-devops-streamlining-insights-with-azure-monitor-and-aws-cloudwatch.html',
    '/insights/blogs/observability-trends-moving-beyond-monitoring-to-actionable-insights': 'insights/blogs/observability-trends-moving-beyond-monitoring-to-actionable-insights.html',
    '/insights/blogs/obstacles-to-succeeding-with-genai-for-indias-gccs': 'insights/blogs/obstacles-to-succeeding-with-genai-for-indias-gccs.html',
    '/insights/blogs/reducing-alert-noise-in-itops-what-actually-works-and-what-doesnt': 'insights/blogs/reducing-alert-noise-in-itops-what-actually-works-and-what-doesnt.html',
    '/insights/blogs/revolutionizing-healthcare-digital-innovations-with-azure-for-patient-centric-care': 'insights/blogs/revolutionizing-healthcare-digital-innovations-with-azure-for-patient-centric-care.html',
    '/insights/blogs/simplified-microservices-development-with-azure-kubernetes-service-aks': 'insights/blogs/simplified-microservices-development-with-azure-kubernetes-service-aks.html',
    '/insights/blogs/snowflake-cost-optimization-strategies-for-efficient-data-management-in-2024': 'insights/blogs/snowflake-cost-optimization-strategies-for-efficient-data-management-in-2024.html',
    '/insights/blogs/supply-chain-analytics-driving-efficiency-with-azure-synapse-in-2024': 'insights/blogs/supply-chain-analytics-driving-efficiency-with-azure-synapse-in-2024.html',
    '/insights/blogs/the-challenge-with-acquiring-real-time-insights-at-scale-and-how-microsoft-fabric-lakehouse-can-help': 'insights/blogs/the-challenge-with-acquiring-real-time-insights-at-scale-and-how-microsoft-fabric-lakehouse-can-help.html',
    '/insights/blogs/the-digital-engineering-ecosystem-explained-unlocking-scalability-with-azure-in-2024': 'insights/blogs/the-digital-engineering-ecosystem-explained-unlocking-scalability-with-azure-in-2024.html',
    '/insights/blogs/the-essential-guide-to-choosing-between-snowflake-and-databricks-for-enterprise-data': 'insights/blogs/the-essential-guide-to-choosing-between-snowflake-and-databricks-for-enterprise-data.html',
    '/insights/blogs/theres-no-observability-without-ownership-and-thats-why-you-are-stuck': 'insights/blogs/theres-no-observability-without-ownership-and-thats-why-you-are-stuck.html',
    '/insights/blogs/under-the-ai-hood---the-data-engine-that-drives-ai-success': 'insights/blogs/under-the-ai-hood---the-data-engine-that-drives-ai-success.html',
    '/insights/blogs/understanding-rag-and-prompt-engineering-in-manufacturing-2': 'insights/blogs/understanding-rag-and-prompt-engineering-in-manufacturing-2.html',
    '/insights/blogs/unlocking-succession-planning-success-in-a-startup-culture': 'insights/blogs/unlocking-succession-planning-success-in-a-startup-culture.html',
    '/insights/blogs/what-can-indias-gccs-do-to-win-with-genai': 'insights/blogs/what-can-indias-gccs-do-to-win-with-genai.html',
    '/insights/blogs/what-happens-after-you-build-your-software-platform': 'insights/blogs/what-happens-after-you-build-your-software-platform.html',
    '/insights/blogs/what-makes-an-aiops-platform-truly-unified-uncover-the-5-non-negotiables': 'insights/blogs/what-makes-an-aiops-platform-truly-unified-uncover-the-5-non-negotiables.html',
    '/insights/blogs/why-cloud-native-security-needs-to-start-at-the-design-phase---not-after-go-live': 'insights/blogs/why-cloud-native-security-needs-to-start-at-the-design-phase---not-after-go-live.html',
    '/insights/blogs/why-your-data-lake-could-become-a-swamp-and-how-data-engineering-can-save--it': 'insights/blogs/why-your-data-lake-could-become-a-swamp-and-how-data-engineering-can-save--it.html',
    '/insights/blogs/why-your-enterprise-needs-a-unified-data-fabric-strategy---now': 'insights/blogs/why-your-enterprise-needs-a-unified-data-fabric-strategy---now.html',
    '/insights/blogs/you-cant-hire-your-way-into-genai-you-have-to-engineer-your-way-in': 'insights/blogs/you-cant-hire-your-way-into-genai-you-have-to-engineer-your-way-in.html',
    '/insights/blogs/your-ai-agents-outnumber-your-employees-whos-managing-them': 'insights/blogs/your-ai-agents-outnumber-your-employees-whos-managing-them.html',
    '/insights/blogs/your-aiops-strategy-is-just-fancy-alerting-with-a-bigger-bill': 'insights/blogs/your-aiops-strategy-is-just-fancy-alerting-with-a-bigger-bill.html',
    '/insights/case-studies/predictive-maintenance':                          'insights/case-studies/predictive-maintenance.html',
    '/insights/case-studies/stabilizing-global-it-operations':                'insights/case-studies/stabilizing-global-it-operations.html',
    '/insights/case-studies/unlocking-population-health-insights':            'insights/case-studies/unlocking-population-health-insights.html',
    '/insights/events/ta-leadership-retreat':                                 'insights/events/ta-leadership-retreat.html',
    '/insights/events/microsoft-mumbai-ai-tour-2025':                         'insights/events/microsoft-mumbai-ai-tour-2025.html',
    '/insights/events/et-gcc-conclave-2025':                                  'insights/events/et-gcc-conclave-2025.html',
    '/insights/webinars/curateai-demo':                                       'insights/webinars/curateai-demo.html',
    '/insights/webinars/building-resilient-cloud-infrastructure-sre':         'insights/webinars/building-resilient-cloud-infrastructure-sre.html',
    '/insights/webinars/end-to-end-api-testing-apac-emea':                    'insights/webinars/end-to-end-api-testing-apac-emea.html',
    '/insights/news/national-technology-day-2024':                            'insights/news/national-technology-day-2024.html',
    '/insights/news/revolutionizing-it-vectors-vision':                       'insights/news/revolutionizing-it-vectors-vision.html',
    '/insights/news/parkar-digital-vector-2-launch':                          'insights/news/parkar-digital-vector-2-launch.html',
    // Solutions case studies
    '/solutions/case-studies/unlocking-growth-user-adoption':   'solutions/case-studies/unlocking-growth-user-adoption.html',
    '/solutions/case-studies/operational-excellence-cloud':     'solutions/case-studies/operational-excellence-cloud.html',
    '/solutions/case-studies/cost-efficiency-cloud':            'solutions/case-studies/cost-efficiency-cloud.html',
    '/solutions/case-studies/elevating-database-performance':   'solutions/case-studies/elevating-database-performance.html',
    '/solutions/case-studies/data-driven-bi':                   'solutions/case-studies/data-driven-bi.html',
    '/solutions/case-studies/strategic-insight-cloud':          'solutions/case-studies/strategic-insight-cloud.html',
  };

  /* ── Detect environment ──────────────────────────────────────────────────── */
  const _scriptSrc = (document.currentScript || {}).src || '';

  // Project root URL derived from this script's own URL.
  // • Local file://  → "file:///home/.../parkar-main-website/"
  // • Live Server    → "http://127.0.0.1:5500/"
  // • GitHub Pages   → "https://user.github.io/parkar-main-website/"
  // • Production     → "https://parkar.in/"
  const _rootUrl = _scriptSrc
    ? _scriptSrc.replace(/js\/components\.js(\?.*)?$/, '')
    : '';

  // Environments that do NOT have server-side URL rewriting.
  // On these, clean URLs (/contact etc.) must be remapped to real file paths.
  const _needsFileRemap =
    window.location.protocol === 'file:' ||             // opened as file
    window.location.hostname === '127.0.0.1' ||         // Live Server
    window.location.hostname === 'localhost' ||          // any local server
    window.location.hostname.endsWith('.github.io');     // GitHub Pages

  /* ── Page depth relative to project root ────────────────────────────────── */
  // Always uses _rootUrl when available so the repo-name prefix on GitHub Pages
  // (e.g. /parkar-main-website/) is correctly stripped before counting slashes.
  //
  // Examples:
  //   Live Server  http://127.0.0.1:5500/solutions/data.html  → depth 1
  //   GitHub Pages https://user.github.io/repo/solutions/data.html → depth 1
  //   Production   https://parkar.in/solutions/data  → depth 1 (doesn't matter,
  //                components fetched via absolute URL, hrefs are clean paths)
  function _getPageDepth() {
    if (_rootUrl) {
      const rootPath    = new URL(_rootUrl).pathname;       // "/" or "/repo-name/"
      const currentPath = window.location.pathname;
      const rel         = currentPath.slice(rootPath.length); // path relative to root
      return (rel.match(/\//g) || []).length;
    }
    return (window.location.pathname.match(/\//g) || []).length - 1;
  }

  /* ── Resolve a single href for the current environment ──────────────────── */
  function _resolve(raw, prefix) {
    // Production with URL rewriting: clean paths work natively — use as-is.
    if (!_needsFileRemap) return raw;

    // Clean absolute path (e.g. "/contact", "/platforms/aioniq#section") →
    // look up in ROUTES and convert to a depth-relative file path.
    if (raw.startsWith('/') && !raw.startsWith('//')) {
      const hash     = raw.includes('#') ? raw.slice(raw.indexOf('#')) : '';
      const base     = hash ? raw.slice(0, raw.indexOf('#')) : raw;
      const filePath = ROUTES[base];
      return filePath ? prefix + filePath + hash : raw;
    }

    // Legacy relative path (shouldn't exist after migration, but safe fallback)
    return prefix + raw;
  }

  /* ── Rewrite clean-URL hrefs already in the page HTML ───────────────────── */
  // Runs only on environments without URL rewriting (local / GitHub Pages).
  // Converts every  href="/contact"  →  href="../contact.html"
  // before the user can click them.
  function rewritePageLinks() {
    if (!_needsFileRemap) return;
    const prefix = _buildPrefix();

    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      if (!href) return;
      // Skip: external URLs, protocol-relative URLs, anchors, already-relative paths
      if (!href.startsWith('/') || href.startsWith('//')) return;

      const hash     = href.includes('#') ? href.slice(href.indexOf('#')) : '';
      const base     = hash ? href.slice(0, href.indexOf('#')) : href;
      const filePath = ROUTES[base];
      if (filePath) el.setAttribute('href', prefix + filePath + hash);
    });
  }

  function _buildPrefix() {
    const depth = _getPageDepth();
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  /* ── Fetch & inject a component partial ─────────────────────────────────── */
  async function loadComponent(targetId, componentPath) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const prefix = _buildPrefix();

    // Production: fetch from absolute root URL (avoids any path ambiguity).
    // Local / GitHub Pages: fetch using depth-relative path.
    const url = (_rootUrl && !_needsFileRemap)
      ? _rootUrl + componentPath
      : prefix + componentPath;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      target.innerHTML = html;

      // Resolve data-local-href attributes for all environments
      target.querySelectorAll('[data-local-href]').forEach(el => {
        el.setAttribute('href', _resolve(el.getAttribute('data-local-href'), prefix));
      });

      // Re-execute any <script> tags inside the injected HTML
      target.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        [...oldScript.attributes].forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      document.dispatchEvent(new CustomEvent('componentLoaded', { detail: { id: targetId } }));

    } catch (err) {
      console.warn(`[components.js] Could not load "${url}":`, err.message);
      target.style.display = 'none';
    }
  }

  /* ── Highlight active nav link ───────────────────────────────────────────── */
  function highlightActiveNav() {
    const currentPath = window.location.pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '');

    document.querySelectorAll('.nav-link, .dropdown-simple-link, .dropdown-link').forEach(link => {
      const href = (link.getAttribute('href') || '')
        .replace(/\.html$/, '')
        .replace(/\/$/, '');
      if (href && currentPath.endsWith(href)) {
        link.closest('.nav-item')?.classList.add('active');
      }
    });
  }

  /* ── Boot ────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async () => {
    rewritePageLinks(); // local dev + GitHub Pages only

    await Promise.all([
      loadComponent('navbar-placeholder', 'components/navbar.html'),
      loadComponent('footer-placeholder', 'components/footer.html'),
    ]);

    highlightActiveNav();
    document.dispatchEvent(new CustomEvent('allComponentsLoaded'));

    // Magic Bento spotlight for partner credential callout
    document.querySelectorAll('.partner-credential-callout').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  });

  /* ── CTA Pill Button icon-swap (all pages) ── */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.hp-cta-btn').forEach(function (btn) {
      var icon = btn.querySelector('.hp-cta-icon');
      var text = btn.querySelector('.hp-cta-text');
      if (!icon || !text) return;

      function calc() {
        var btnW = btn.offsetWidth;
        var iconW = icon.offsetWidth;
        var cs = getComputedStyle(btn);
        var padL = parseFloat(cs.paddingLeft);
        var padR = parseFloat(cs.paddingRight);
        var gap = parseFloat(cs.gap) || 12;
        var move = btnW - padL - padR - iconW;
        btn.style.setProperty('--hp-icon-move', move + 'px');
        btn.style.setProperty('--hp-text-move', -(iconW + gap) + 'px');
      }

      btn.addEventListener('mouseenter', calc);
      calc();
    });

    window.addEventListener('resize', function () {
      document.querySelectorAll('.hp-cta-btn').forEach(function (btn) {
        var icon = btn.querySelector('.hp-cta-icon');
        if (!icon) return;
        var btnW = btn.offsetWidth;
        var iconW = icon.offsetWidth;
        var cs = getComputedStyle(btn);
        var padL = parseFloat(cs.paddingLeft);
        var padR = parseFloat(cs.paddingRight);
        var gap = parseFloat(cs.gap) || 12;
        var move = btnW - padL - padR - iconW;
        btn.style.setProperty('--hp-icon-move', move + 'px');
        btn.style.setProperty('--hp-text-move', -(iconW + gap) + 'px');
      });
    });
  });

})();
