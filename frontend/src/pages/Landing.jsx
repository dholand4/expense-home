import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const css = `
  :root {
    --bg: #0e110f; --bg-2: #0b0e0c;
    --primary: #25a77c; --primary-light: #43d5a5;
    --surface: #151917; --surface-2: #1a1f1c;
    --border: #2b312e; --text: #e8ece9; --muted: #798680;
    --radius: 12px; --radius-sm: 8px;
    --shadow-card: 0 1px 0 rgba(255,255,255,0.03) inset, 0 20px 40px -20px rgba(0,0,0,0.6);
  }
  .lp * { box-sizing: border-box; }
  .lp { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; line-height: 1.55; overflow-x: hidden; min-height: 100vh; }
  .lp a { color: inherit; text-decoration: none; }
  .lp button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
  .lp-glow { position: fixed; inset: 0; background: radial-gradient(800px 500px at 80% -10%, rgba(37,167,124,0.12), transparent 60%), radial-gradient(700px 400px at -10% 30%, rgba(67,213,165,0.06), transparent 60%); pointer-events: none; z-index: 0; }
  .lp .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }
  /* NAVBAR */
  .lp-navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 18px 0; transition: all .3s ease; }
  .lp-navbar.scrolled { background: rgba(14,17,15,0.72); backdrop-filter: saturate(180%) blur(14px); -webkit-backdrop-filter: saturate(180%) blur(14px); border-bottom: 1px solid var(--border); padding: 12px 0; }
  .lp .nav-inner { display: flex; align-items: center; justify-content: space-between; }
  .lp .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; letter-spacing: -0.01em; }
  .lp .logo-mark { width: 32px; height: 32px; border-radius: 9px; overflow: hidden; flex-shrink: 0; }
  .lp .logo-mark img { width: 32px; height: 32px; object-fit: cover; display: block; }
  .lp .nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--muted); }
  .lp .nav-links a:hover { color: var(--text); }
  .lp .nav-actions { display: flex; gap: 10px; align-items: center; }
  .lp .nav-login { padding: 9px 16px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-weight: 600; font-size: 14px; cursor: pointer; transition: border-color .2s ease; }
  .lp .nav-login:hover { border-color: var(--primary); }
  .lp .nav-cta { padding: 9px 16px; border-radius: 9px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: #0b0e0c; font-weight: 600; font-size: 14px; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; border: none; }
  .lp .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 10px 24px -10px rgba(67,213,165,0.6); }
  @media (max-width: 720px) { .lp .nav-links { display: none; } }
  /* HERO */
  .lp .hero { padding: 140px 0 80px; position: relative; }
  .lp .hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 60px; align-items: center; }
  @media (max-width: 920px) { .lp .hero { padding-top: 110px; } .lp .hero-grid { grid-template-columns: 1fr; gap: 48px; text-align: center; } }
  .lp .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px; border: 1px solid var(--border); background: var(--surface); border-radius: 999px; font-size: 13px; color: var(--muted); margin-bottom: 28px; }
  .lp .badge .dot { width: 18px; height: 18px; border-radius: 999px; background: rgba(37,167,124,0.15); display: grid; place-items: center; color: var(--primary-light); }
  .lp .badge .dot::after { content: ''; width: 6px; height: 6px; border-radius: 999px; background: var(--primary-light); box-shadow: 0 0 12px var(--primary-light); }
  .lp h1.hero-title { font-size: clamp(38px, 5.4vw, 64px); line-height: 1.04; letter-spacing: -0.03em; font-weight: 700; margin: 0 0 22px; }
  .lp .hero-title .accent { background: linear-gradient(135deg, var(--primary-light), var(--primary)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .lp .hero-sub { font-size: 18px; color: var(--muted); margin: 0 0 36px; max-width: 540px; }
  @media (max-width: 920px) { .lp .hero-sub { margin-left: auto; margin-right: auto; } }
  .lp .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
  @media (max-width: 920px) { .lp .cta-row { justify-content: center; } }
  .lp .btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 22px; border-radius: 11px; font-size: 15px; font-weight: 600; transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease; cursor: pointer; border: 1px solid transparent; }
  .lp .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: #0b0e0c; box-shadow: 0 10px 30px -10px rgba(37,167,124,0.6); }
  .lp .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 36px -10px rgba(67,213,165,0.7); }
  .lp .btn-outline { border-color: var(--border); background: var(--surface); color: var(--text); }
  .lp .btn-outline:hover { border-color: var(--primary); background: var(--surface-2); }
  .lp .btn-lg { padding: 16px 28px; font-size: 16px; }
  .lp .hero-meta { display: flex; gap: 24px; margin-top: 36px; font-size: 13px; color: var(--muted); flex-wrap: wrap; }
  @media (max-width: 920px) { .lp .hero-meta { justify-content: center; } }
  .lp .hero-meta .check { color: var(--primary-light); margin-right: 6px; }
  /* PHONE */
  .lp .phone-stage { position: relative; display: flex; justify-content: center; }
  .lp .phone { position: relative; width: 290px; height: 600px; background: #0a0c0b; border-radius: 42px; border: 1px solid var(--border); padding: 14px; box-shadow: 0 50px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset, 0 -30px 60px -20px rgba(37,167,124,0.18); }
  .lp .phone-statusbar { position: absolute; top: 24px; left: 28px; right: 28px; display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; z-index: 3; color: var(--text); }
  .lp .phone-statusbar .icons { display: flex; gap: 5px; align-items: center; }
  .lp .phone-statusbar .icons span { width: 14px; height: 8px; border: 1px solid currentColor; border-radius: 2px; position: relative; }
  .lp .phone-statusbar .icons span::after { content: ''; position: absolute; inset: 1px; background: currentColor; border-radius: 1px; width: 70%; }
  .lp .phone-screen { width: 100%; height: 100%; background: linear-gradient(180deg, #0e110f, #0b0e0c); border-radius: 32px; overflow: hidden; padding: 44px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .lp .ph-greet { display: flex; justify-content: space-between; align-items: flex-start; padding: 4px 4px 0; }
  .lp .ph-greet .hi { font-size: 12px; color: var(--muted); }
  .lp .ph-greet .name { font-size: 15px; font-weight: 600; margin-top: 2px; }
  .lp .ph-avatar { width: 32px; height: 32px; border-radius: 999px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); display: grid; place-items: center; color: #0b0e0c; font-weight: 700; font-size: 13px; }
  .lp .ph-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .lp .ph-balance .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .lp .ph-balance .amount { font-size: 26px; font-weight: 700; margin-top: 4px; letter-spacing: -0.02em; }
  .lp .ph-balance .amount .currency { font-size: 14px; color: var(--muted); margin-right: 4px; }
  .lp .ph-balance .delta { font-size: 11px; color: var(--primary-light); margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; }
  .lp .ph-section-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; padding: 0 4px; display: flex; justify-content: space-between; }
  .lp .ph-section-label .more { color: var(--primary-light); text-transform: none; letter-spacing: 0; }
  .lp .ph-cat { display: flex; align-items: center; gap: 10px; padding: 8px 4px; }
  .lp .ph-cat-icon { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; font-size: 13px; flex-shrink: 0; }
  .lp .ph-cat-info { flex: 1; min-width: 0; }
  .lp .ph-cat-row1 { display: flex; justify-content: space-between; font-size: 12px; }
  .lp .ph-cat-row1 .name { font-weight: 500; }
  .lp .ph-cat-row1 .val { color: var(--muted); font-variant-numeric: tabular-nums; }
  .lp .ph-bar { height: 4px; border-radius: 999px; background: #1f2522; margin-top: 5px; overflow: hidden; }
  .lp .ph-bar > span { display: block; height: 100%; border-radius: 999px; animation: lpFillBar 1.6s cubic-bezier(.4,.0,.2,1) .4s both; }
  @keyframes lpFillBar { from { width: 0; } }
  /* SECTIONS */
  .lp section { padding: 90px 0; position: relative; }
  .lp .section-eyebrow { color: var(--primary-light); font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 12px; }
  .lp .section-title { font-size: clamp(30px, 4vw, 44px); line-height: 1.1; letter-spacing: -0.02em; font-weight: 700; margin: 0 0 16px; }
  .lp .section-sub { font-size: 17px; color: var(--muted); max-width: 620px; margin: 0 0 56px; }
  .lp .section-head.centered { text-align: center; }
  .lp .section-head.centered .section-sub { margin-left: auto; margin-right: auto; }
  /* FEATURES */
  .lp .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
  @media (max-width: 920px) { .lp .features-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 600px) { .lp .features-grid { grid-template-columns: 1fr; } }
  .lp .feature { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 26px; transition: transform .25s ease, border-color .25s ease, background .25s ease; position: relative; overflow: hidden; }
  .lp .feature::before { content: ''; position: absolute; inset: 0; background: radial-gradient(400px 200px at var(--mx, 50%) var(--my, 0%), rgba(67,213,165,0.08), transparent 70%); opacity: 0; transition: opacity .3s ease; pointer-events: none; }
  .lp .feature:hover { transform: translateY(-4px); border-color: rgba(67,213,165,0.35); }
  .lp .feature:hover::before { opacity: 1; }
  .lp .feature-icon { width: 44px; height: 44px; border-radius: 11px; background: linear-gradient(135deg, rgba(37,167,124,0.18), rgba(67,213,165,0.06)); border: 1px solid rgba(67,213,165,0.18); display: grid; place-items: center; font-size: 22px; margin-bottom: 18px; }
  .lp .feature h3 { font-size: 17px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.01em; }
  .lp .feature p { font-size: 14px; color: var(--muted); margin: 0; line-height: 1.55; }
  /* DEVICES */
  .lp .devices { background: linear-gradient(180deg, transparent, rgba(255,255,255,0.01), transparent); position: relative; }
  .lp .devices::before { content: ''; position: absolute; inset: 0; background: radial-gradient(700px 360px at 50% 50%, rgba(37,167,124,0.06), transparent 70%); pointer-events: none; }
  .lp .devices-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
  @media (max-width: 800px) { .lp .devices-grid { grid-template-columns: 1fr; } }
  .lp .device-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px 26px; text-align: center; transition: transform .25s ease, border-color .25s ease; }
  .lp .device-card:hover { transform: translateY(-4px); border-color: rgba(67,213,165,0.35); }
  .lp .device-card .icon-wrap { width: 72px; height: 72px; margin: 0 auto 18px; border-radius: 18px; background: linear-gradient(135deg, rgba(37,167,124,0.16), rgba(67,213,165,0.03)); border: 1px solid rgba(67,213,165,0.18); display: grid; place-items: center; color: var(--primary-light); }
  .lp .device-card h3 { font-size: 19px; margin: 0 0 14px; font-weight: 600; letter-spacing: -0.01em; }
  .lp .device-card .stack { font-size: 13px; color: var(--muted); margin: 0 0 18px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .lp .device-card .tag { display: inline-block; padding: 4px 10px; border-radius: 999px; background: rgba(37,167,124,0.12); color: var(--primary-light); font-size: 12px; font-weight: 500; }
  .lp .device-card .tag--soon { background: rgba(121,134,128,0.12); color: var(--muted); }
  .lp .device-card--soon { position: relative; background: var(--surface); }
  .lp .device-card--soon .icon-wrap { background: linear-gradient(135deg, rgba(121,134,128,0.14), rgba(121,134,128,0.03)); border-color: rgba(121,134,128,0.22); color: var(--muted); }
  .lp .soon-badge { position: absolute; top: 14px; right: 14px; padding: 4px 10px; border-radius: 999px; background: rgba(255,176,90,0.12); border: 1px solid rgba(255,176,90,0.28); color: #ffb05a; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
  .lp .devices-foot { text-align: center; margin-top: 40px; color: var(--muted); font-size: 15px; }
  .lp .devices-foot strong { color: var(--text); font-weight: 600; }
  /* STEPS */
  .lp .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; position: relative; }
  @media (max-width: 800px) { .lp .steps { grid-template-columns: 1fr; } }
  .lp .step { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; position: relative; transition: transform .25s ease, border-color .25s ease; }
  .lp .step:hover { transform: translateY(-4px); border-color: rgba(67,213,165,0.35); }
  .lp .step-num { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: #0b0e0c; font-weight: 700; font-size: 15px; margin-bottom: 18px; }
  .lp .step h3 { font-size: 18px; margin: 0 0 8px; font-weight: 600; letter-spacing: -0.01em; }
  .lp .step p { font-size: 14px; color: var(--muted); margin: 0; }
  /* CTA FINAL */
  .lp .cta-final { padding: 90px 0; }
  .lp .cta-final-inner { position: relative; border-radius: 22px; padding: 80px 40px; text-align: center; background: radial-gradient(600px 300px at 50% 0%, rgba(67,213,165,0.22), transparent 70%), linear-gradient(180deg, rgba(37,167,124,0.10), rgba(37,167,124,0.04)); border: 1px solid rgba(67,213,165,0.22); overflow: hidden; }
  .lp .cta-final-inner::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent 0, transparent 24px, rgba(255,255,255,0.012) 24px, rgba(255,255,255,0.012) 25px); pointer-events: none; }
  .lp .cta-final h2 { font-size: clamp(32px, 4.6vw, 50px); margin: 0 0 14px; letter-spacing: -0.025em; font-weight: 700; line-height: 1.05; }
  .lp .cta-final p { color: var(--muted); font-size: 17px; margin: 0 0 32px; max-width: 520px; margin-left: auto; margin-right: auto; }
  /* FOOTER */
  .lp footer { padding: 56px 0 36px; border-top: 1px solid var(--border); background: var(--bg-2); position: relative; z-index: 1; }
  .lp .footer-grid { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; flex-wrap: wrap; }
  .lp .footer-brand { max-width: 320px; }
  .lp .footer-brand .tagline { color: var(--muted); font-size: 14px; margin: 14px 0 0; }
  .lp .footer-links { display: flex; gap: 28px; flex-wrap: wrap; align-items: center; font-size: 14px; }
  .lp .footer-links a { color: var(--muted); transition: color .2s ease; }
  .lp .footer-links a:hover { color: var(--text); }
  .lp .footer-sep { color: var(--border); user-select: none; }
  .lp .footer-bot { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; color: var(--muted); font-size: 13px; flex-wrap: wrap; gap: 12px; }
  /* REVEAL */
  .lp .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
  .lp .reveal.in { opacity: 1; transform: translateY(0); }
  .lp .reveal.d1 { transition-delay: .08s; } .lp .reveal.d2 { transition-delay: .16s; }
  .lp .reveal.d3 { transition-delay: .24s; } .lp .reveal.d4 { transition-delay: .32s; }
  .lp .reveal.d5 { transition-delay: .40s; } .lp .reveal.d6 { transition-delay: .48s; }
  @media (prefers-reduced-motion: reduce) { .lp .reveal { opacity: 1; transform: none; transition: none; } .lp .ph-bar > span { animation: none; } }
`;

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navbar scroll
    const navbar = document.getElementById('lp-navbar');
    const onScroll = () => {
      if (window.scrollY > 24) navbar?.classList.add('scrolled');
      else navbar?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.lp .reveal').forEach(el => observer.observe(el));

    // Feature card cursor glow
    const handlers = [];
    document.querySelectorAll('.lp .feature').forEach(card => {
      const handler = (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      };
      card.addEventListener('mousemove', handler);
      handlers.push({ card, handler });
    });

    // Smooth scroll para âncoras
    const navOffset = 72;
    const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const smoothScrollTo = (targetY, duration = 900) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      if (Math.abs(diff) < 2) return;
      let startTime;
      const step = (ts) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const t = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + diff * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const anchorHandlers = [];
    document.querySelectorAll('.lp a[href^="#"]').forEach(link => {
      const handler = (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') { e.preventDefault(); smoothScrollTo(0); return; }
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        smoothScrollTo(top);
      };
      link.addEventListener('click', handler);
      anchorHandlers.push({ link, handler });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      handlers.forEach(({ card, handler }) => card.removeEventListener('mousemove', handler));
      anchorHandlers.forEach(({ link, handler }) => link.removeEventListener('click', handler));
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="lp">
        <div className="lp-glow" />

        {/* NAVBAR */}
        <nav className="lp-navbar" id="lp-navbar">
          <div className="container nav-inner">
            <a href="#" className="logo" aria-label="DQ Finanças">
              <span className="logo-mark" aria-hidden="true">
                <img src="/icon-32.png" alt="DQ Finanças" />
              </span>
              <span>DQ Finanças</span>
            </a>
            <div className="nav-links">
              <a href="#funcionalidades">Funcionalidades</a>
              <a href="#dispositivos">Dispositivos</a>
              <a href="#como-funciona">Como funciona</a>
            </div>
            <div className="nav-actions">
              <button className="nav-login" onClick={() => navigate('/login')}>Entrar</button>
              <button className="nav-cta" onClick={() => navigate('/register')}>Criar conta</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <header className="hero">
          <div className="container hero-grid">
            <div>
              <div className="badge reveal">
                <span className="dot" aria-hidden="true" />
                Disponível no Android · iOS em breve
              </div>
              <h1 className="hero-title reveal d1">
                Suas finanças <span className="accent">no controle,</span> na palma da mão
              </h1>
              <p className="hero-sub reveal d2">
                Controle despesas, cartões, parcelas e fiados — tudo num só lugar. Web e mobile sincronizados.
              </p>
              <div className="cta-row reveal d3">
                <a href="#dispositivos" className="btn btn-primary">
                  Baixar o App
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
                </a>
                <button className="btn btn-outline" onClick={() => navigate('/login')}>
                  Acessar o sistema
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
              <div className="hero-meta reveal d4">
                <span><span className="check">✓</span> Grátis para começar</span>
                <span><span className="check">✓</span> Sem cartão de crédito</span>
                <span><span className="check">✓</span> Sincronização em tempo real</span>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="phone-stage reveal d2">
              <div className="phone" aria-hidden="true">
                <div className="phone-statusbar">
                  <span>9:41</span>
                  <div className="icons"><span /></div>
                </div>
                <div className="phone-screen">
                  <div className="ph-greet">
                    <div><div className="hi">Olá,</div><div className="name">Daniel</div></div>
                    <div className="ph-avatar">D</div>
                  </div>
                  <div className="ph-card ph-balance">
                    <div className="label">Gastos do mês</div>
                    <div className="amount"><span className="currency">R$</span>1.693,00</div>
                    <div className="delta">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6 6-6-6"/><path d="M12 3v18"/></svg>
                      8% abaixo do mês passado
                    </div>
                  </div>
                  <div className="ph-section-label">
                    <span>Gastos por categoria</span>
                    <span className="more">Ver tudo</span>
                  </div>
                  <div className="ph-card" style={{ padding: '6px 12px' }}>
                    {[
                      { icon: '🍽️', name: 'Alimentação', val: 'R$ 820', pct: '72%', grad: 'linear-gradient(90deg,#25a77c,#43d5a5)', bg: 'rgba(67,213,165,0.16)', color: '#43d5a5' },
                      { icon: '🚗', name: 'Transporte',  val: 'R$ 410', pct: '48%', grad: 'linear-gradient(90deg,#5b7eff,#8aa2ff)', bg: 'rgba(120,150,255,0.16)', color: '#8aa2ff' },
                      { icon: '🛍️', name: 'Compras',    val: 'R$ 295', pct: '34%', grad: 'linear-gradient(90deg,#e08c3a,#ffb05a)', bg: 'rgba(255,176,90,0.16)',  color: '#ffb05a' },
                      { icon: '🎬', name: 'Lazer',      val: 'R$ 168', pct: '22%', grad: 'linear-gradient(90deg,#b755a4,#e08fd0)', bg: 'rgba(218,118,200,0.16)', color: '#e08fd0' },
                    ].map(c => (
                      <div className="ph-cat" key={c.name}>
                        <div className="ph-cat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                        <div className="ph-cat-info">
                          <div className="ph-cat-row1"><span className="name">{c.name}</span><span className="val">{c.val}</span></div>
                          <div className="ph-bar"><span style={{ width: c.pct, background: c.grad }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* FUNCIONALIDADES */}
        <section id="funcionalidades">
          <div className="container">
            <div className="section-head centered">
              <p className="section-eyebrow reveal">Funcionalidades</p>
              <h2 className="section-title reveal d1">Tudo que você precisa para organizar o dinheiro</h2>
              <p className="section-sub reveal d2">Ferramentas pensadas para o dia a dia brasileiro — de parcelamentos a fiados.</p>
            </div>
            <div className="features-grid">
              {[
                { icon: '📊', title: 'Dashboard',           desc: 'Resumo mensal com gastos por categoria, barras de progresso e comparação com o mês anterior.', d: 'd1' },
                { icon: '💳', title: 'Cartões',             desc: 'Gerencie seus cartões com limite disponível em tempo real e fechamento da fatura sempre à mão.', d: 'd2' },
                { icon: '📅', title: 'Parcelamentos',       desc: 'Cadastre em 2 modos: Total ÷ parcelas ou Parcela × quantidade. Sem matemática mental.', d: 'd3' },
                { icon: '🧾', title: 'Próximas faturas',    desc: 'Previsão de cobranças por mês antes de chegar — nunca mais seja pego de surpresa.', d: 'd4' },
                { icon: '🤝', title: 'Fiados',              desc: 'Controle a quem você deve e os valores que vão sendo pagos.', d: 'd5' },
                { icon: '👥', title: 'Acesso compartilhado',desc: 'Convide pessoas para ver seus dados. Casal, família, sócio.', d: 'd6' },
              ].map(f => (
                <div className={`feature reveal ${f.d}`} key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISPOSITIVOS */}
        <section id="dispositivos" className="devices">
          <div className="container">
            <div className="section-head centered">
              <p className="section-eyebrow reveal">Multiplataforma</p>
              <h2 className="section-title reveal d1">Disponível em todos os dispositivos</h2>
              <p className="section-sub reveal d2">Use no celular, no computador, onde for mais prático pra você.</p>
            </div>
            <div className="devices-grid">
              <div className="device-card reveal d1">
                <div className="icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="14" rx="2"/><path d="M2 18h20"/><path d="M9 22h6"/><path d="M12 18v4"/>
                  </svg>
                </div>
                <h3>Web</h3>
                <span className="tag">Acesse pelo navegador</span>
              </div>
              <div className="device-card device-card--soon reveal d2">
                <div className="soon-badge">Em breve</div>
                <div className="icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>
                  </svg>
                </div>
                <h3>iOS</h3>
                <span className="tag tag--soon">iPhone &amp; iPad</span>
              </div>
              <div className="device-card reveal d3">
                <div className="icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 5h6"/><path d="M10 19h4"/>
                  </svg>
                </div>
                <h3>Android</h3>
                <span className="tag">Phones &amp; Tablets</span>
              </div>
            </div>
            <p className="devices-foot reveal d4">
              <strong>Seus dados sempre sincronizados</strong> — comece no celular, continue no computador.
            </p>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona">
          <div className="container">
            <div className="section-head centered">
              <p className="section-eyebrow reveal">Como funciona</p>
              <h2 className="section-title reveal d1">Em 3 passos simples</h2>
              <p className="section-sub reveal d2">Do cadastro ao primeiro relatório, em poucos minutos.</p>
            </div>
            <div className="steps">
              {[
                { n: '1', title: 'Crie sua conta grátis', desc: 'Cadastro em menos de um minuto, sem cartão de crédito. Comece a usar agora mesmo.', d: 'd1' },
                { n: '2', title: 'Cadastre seus cartões e contas', desc: 'Adicione cartões com limite, contas correntes e categorias do seu jeito.', d: 'd2' },
                { n: '3', title: 'Registre seus gastos', desc: 'Lance despesas em segundos e veja o impacto no seu mês instantaneamente.', d: 'd3' },
              ].map(s => (
                <div className={`step reveal ${s.d}`} key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="cta-final" className="cta-final">
          <div className="container">
            <div className="cta-final-inner reveal">
              <h2>Comece hoje, é grátis</h2>
              <p>Junte-se a quem já tomou as rédeas das próprias finanças. Sem letras miúdas, sem cobrança escondida.</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Criar minha conta
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo">
                  <span className="logo-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7h15a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Z"/>
                      <path d="M3 7V6a2 2 0 0 1 2-2h11"/>
                      <circle cx="17" cy="13.5" r="1.3" fill="currentColor"/>
                    </svg>
                  </span>
                  <span>DQ Finanças</span>
                </div>
                <p className="tagline">Finanças simples para vida real.</p>
              </div>
              <div className="footer-links">
                <a href="#dispositivos">Web App</a>
                <span className="footer-sep">·</span>
                <a href="#dispositivos">iOS <small style={{ opacity: 0.6 }}>(em breve)</small></a>
                <span className="footer-sep">·</span>
                <a href="#dispositivos">Android</a>
              </div>
            </div>
            <div className="footer-bot">
              <span>© 2026 DQ Finanças. Todos os direitos reservados.</span>
              <span>Feito com ☕ no Brasil</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
