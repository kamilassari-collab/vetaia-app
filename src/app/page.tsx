'use client'

import { useEffect } from 'react'

const CSS = `
:root {
  --brand:      #0B7A6A;
  --brand-lt:   #0D9C87;
  --brand-dk:   #085D50;
  --brand-bg:   #E4F0EE;
  --brand-bg2:  #EDF6F4;

  --ink:        #111D1B;
  --ink-2:      #4D6661;
  --ink-3:      #97ADA8;
  --surface:    #FFFFFF;
  --warm:       #F5F2EB;
  --warm-2:     #EDE9E0;
  --border:     #DDD8CF;
  --border-2:   #E9E5DC;

  --sh-card:  0 1px 3px rgba(17,29,27,.05), 0 6px 20px rgba(17,29,27,.07), 0 20px 56px rgba(11,122,106,.08);
  --sh-card-hover: 0 2px 6px rgba(17,29,27,.06), 0 12px 32px rgba(17,29,27,.10), 0 32px 72px rgba(11,122,106,.13);
  --sh-btn:   0 1px 0 rgba(255,255,255,.16) inset, 0 4px 14px rgba(11,122,106,.25), 0 10px 32px rgba(11,122,106,.18);

  --ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-spring: cubic-bezier(0.34, 1.35, 0.64, 1);
  --dur: 0.38s;

  --r-s: 10px; --r: 14px; --r-l: 20px; --r-xl: 26px; --r-2xl: 36px;
  --max-w: 72em;
  --pad-h: 2.5em;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: clamp(14px, calc(100vw / 90), 16px); scroll-behavior: smooth; }
body {
  font-family: 'DM Sans', system-ui, sans-serif !important;
  color: var(--ink);
  background: var(--warm);
  line-height: 1.5;
  letter-spacing: -0.01em;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  display: block !important;
  min-height: unset !important;
}
::selection { background: var(--brand); color: white; }
body ::-webkit-scrollbar { display: none; }

@keyframes pdot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.5)} }
@keyframes sonar { 0%{transform:scale(.6);opacity:1} 100%{transform:scale(2.8);opacity:0} }
@keyframes wav   { 0%,100%{transform:scaleY(.28)} 50%{transform:scaleY(1)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes run   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes rise  { from{transform:translateY(20px)} to{transform:translateY(0)} }
@keyframes fadein{ from{opacity:0} to{opacity:1} }

/* NAV */
nav {
  position: sticky; top: 0; z-index: 100;
  height: 4.6em;
  overflow: hidden;
  background: color-mix(in srgb, var(--warm) 90%, transparent);
  backdrop-filter: blur(24px) saturate(160%);
  border-bottom: 1px solid var(--border);
}
.nav-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 var(--pad-h); height: 100%; display: flex; align-items: center; gap: 2.5em; }
.nav-logo { display:flex; align-items:center; flex-shrink:0; text-decoration:none; }
.nav-links { display:flex; align-items:center; gap:.15em; flex:1; }
.nav-link { font-size:.875em; font-weight:500; color:var(--ink-2); text-decoration:none; padding:.45em .9em; border-radius:var(--r-s); transition:color var(--dur) var(--ease), background var(--dur) var(--ease); }
.nav-link:hover { color:var(--ink); background:var(--warm-2); }
.nav-actions { display:flex; align-items:center; gap:.5em; margin-left:auto; }
.btn-ghost { font-family:'DM Sans',sans-serif; font-size:.875em; font-weight:500; color:var(--ink-2); background:none; border:1px solid var(--border); padding:.46em 1em; border-radius:var(--r-s); cursor:pointer; text-decoration:none; transition:color var(--dur) var(--ease), background var(--dur) var(--ease), border-color var(--dur) var(--ease); }
.btn-ghost:hover { color:var(--ink); background:var(--warm-2); border-color:var(--ink-3); }
.btn-primary { font-family:'DM Sans',sans-serif; font-size:.875em; font-weight:600; color:white; background:var(--brand); border:none; padding:.52em 1.25em; border-radius:var(--r); cursor:pointer; text-decoration:none; box-shadow:var(--sh-btn); transition:background var(--dur) var(--ease), transform .12s var(--ease-spring); display:inline-flex; align-items:center; gap:.4em; }
.btn-primary:hover { background:var(--brand-lt); transform:translateY(-1px); }
.btn-primary:active { transform:translateY(0); }
.btn-lg { font-family:'DM Sans',sans-serif; font-size:1em; font-weight:600; color:white; background:var(--brand); border:none; padding:.8em 1.8em; border-radius:var(--r-l); cursor:pointer; text-decoration:none; box-shadow:var(--sh-btn); transition:background var(--dur) var(--ease), transform .12s var(--ease-spring); display:inline-flex; align-items:center; gap:.5em; }
.btn-lg:hover { background:var(--brand-lt); transform:translateY(-1px); }
.btn-lg:active { transform:translateY(0); }
.btn-text { font-family:'DM Sans',sans-serif; font-size:1em; font-weight:500; color:var(--ink); background:var(--surface); border:1px solid var(--border); padding:.78em 1.6em; border-radius:var(--r-l); cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:.5em; transition:border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); }
.btn-text:hover { border-color:var(--ink-3); box-shadow:0 2px 10px rgba(17,29,27,.06); }

/* HERO */
.hero-wrap { overflow: hidden; position: relative; }
.hero-glow {
  position: absolute; top: -160px; left: 50%; transform: translateX(-50%);
  width: 900px; height: 700px;
  background: radial-gradient(ellipse, color-mix(in srgb, #0B7A6A 10%, transparent) 0%, transparent 65%);
  pointer-events: none;
}
.hero {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 5.5em var(--pad-h) 3.5em;
  text-align: center;
  animation: rise .9s var(--ease) both;
}
.hero-badge {
  display:inline-flex; align-items:center; gap:.5em;
  font-size:.75em; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
  color:var(--brand); background:var(--brand-bg);
  padding:.35em 1em; border-radius:100em; margin-bottom:1.6em;
  border:1px solid color-mix(in srgb, var(--brand) 20%, transparent);
}
.hero-dot { width:6px; height:6px; border-radius:50%; background:var(--brand); animation:pdot 2s ease-in-out infinite; flex-shrink:0; }
.hero-h1 {
  font-family:'Newsreader',serif; font-size:5em; font-weight:400;
  line-height:1.03; letter-spacing:-.04em; color:var(--ink);
  margin-bottom:1rem; max-width:14em; margin-left:auto; margin-right:auto;
}
.hero-h1 em { font-style:italic; font-weight:300; color:var(--brand); }
.hero-sub { font-size:1.1em; line-height:1.78; color:var(--ink-2); margin-bottom:2.5rem; max-width:34em; margin-left:auto; margin-right:auto; }
.hero-actions { display:flex; align-items:center; justify-content:center; gap:1em; margin-bottom:2.4em; flex-wrap:wrap; }
.hero-trust { display:flex; align-items:center; justify-content:center; gap:.8em; flex-wrap:wrap; }
.trust-item { display:flex; align-items:center; gap:.4em; font-size:.78em; color:var(--ink-3); }
.trust-sep { color:var(--border); }

/* HERO PRODUCT MOCKUP */
.hero-product {
  max-width: 860px; margin: 0 auto;
  padding: 0 var(--pad-h) 5em;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1em;
  animation: rise 1s var(--ease) .15s both;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-l);
  box-shadow: var(--sh-card);
}

.rec-card { padding: 1.25em; }
.rec-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.9em; }
.rec-live { display:flex; align-items:center; gap:.5em; }
.rec-dot { width:7px; height:7px; border-radius:50%; background:#16A34A; flex-shrink:0; position:relative; }
.rec-dot::after { content:''; position:absolute; inset:-3px; border-radius:50%; background:rgba(22,163,74,.15); animation:sonar 2s ease-out infinite; }
.rec-label { font-size:.75em; font-weight:600; color:#16A34A; }
.rec-timer { font-family:'Newsreader',serif; font-size:1em; color:var(--ink-3); letter-spacing:.04em; }
.patient-row { background:var(--warm); border:1px solid var(--border-2); border-radius:var(--r); padding:.6em .85em; margin-bottom:.85em; display:flex; align-items:center; gap:.65em; }
.patient-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#DCF0ED,#C4E4E0); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.patient-name { font-size:.8em; font-weight:600; color:var(--ink); }
.patient-meta { font-size:.68em; color:var(--ink-3); margin-top:1px; }
.waveform { display:flex; align-items:center; justify-content:center; gap:2.5px; height:32px; margin-bottom:.85em; }
.bar { width:2.5px; border-radius:2px; background:var(--brand); animation:wav 1.2s ease-in-out infinite; }
.bar:nth-child(1){height:7px;animation-delay:.00s;opacity:.2} .bar:nth-child(2){height:17px;animation-delay:.10s;opacity:.32} .bar:nth-child(3){height:28px;animation-delay:.20s;opacity:.44} .bar:nth-child(4){height:32px;animation-delay:.30s;opacity:.58} .bar:nth-child(5){height:27px;animation-delay:.40s;opacity:.70} .bar:nth-child(6){height:32px;animation-delay:.50s;opacity:.83} .bar:nth-child(7){height:29px;animation-delay:.60s;opacity:1} .bar:nth-child(8){height:32px;animation-delay:.65s;opacity:.88} .bar:nth-child(9){height:26px;animation-delay:.70s;opacity:.76} .bar:nth-child(10){height:18px;animation-delay:.80s;opacity:.60} .bar:nth-child(11){height:30px;animation-delay:.90s;opacity:.74} .bar:nth-child(12){height:32px;animation-delay:1.0s;opacity:.84} .bar:nth-child(13){height:22px;animation-delay:1.1s;opacity:.56} .bar:nth-child(14){height:30px;animation-delay:.85s;opacity:.70} .bar:nth-child(15){height:16px;animation-delay:.75s;opacity:.38} .bar:nth-child(16){height:26px;animation-delay:.55s;opacity:.58} .bar:nth-child(17){height:10px;animation-delay:.45s;opacity:.28} .bar:nth-child(18){height:18px;animation-delay:.35s;opacity:.40} .bar:nth-child(19){height:8px;animation-delay:.25s;opacity:.22} .bar:nth-child(20){height:5px;animation-delay:.15s;opacity:.17}
.transcript-box { background:var(--warm); border:1px solid var(--border-2); border-radius:var(--r); padding:.65em .85em; margin-bottom:.85em; }
.transcript-text { font-size:.72em; color:var(--ink-2); line-height:1.7; }
.transcript-text mark { background:color-mix(in srgb, var(--brand) 10%, transparent); color:var(--brand); border-radius:3px; padding:0 3px; }
.cursor { display:inline-block; width:1.5px; height:10px; background:var(--brand); vertical-align:text-bottom; margin-left:2px; animation:blink 1s step-end infinite; }
.rec-actions { display:flex; gap:.5em; }
.btn-rec-pause { flex:1; padding:.52em; border-radius:var(--r); border:1px solid var(--border); background:var(--surface); color:var(--ink-2); font-size:.72em; font-weight:500; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:.4em; transition:background var(--dur) var(--ease); }
.btn-rec-pause:hover { background:var(--warm); }
.btn-rec-gen { flex:2.2; padding:.52em; border-radius:var(--r); border:none; background:var(--brand); color:white; font-size:.72em; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:.4em; box-shadow:var(--sh-btn); transition:background var(--dur) var(--ease); }
.btn-rec-gen:hover { background:var(--brand-lt); }

.report-card { padding: 1.1em 1.25em; }
.report-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:.9em; }
.report-lbl { font-size:.68em; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--ink-3); }
.report-ok { background:#DCFCE7; color:#15803D; font-size:.68em; font-weight:700; padding:.2em .75em; border-radius:100em; }
.report-rows { display:flex; flex-direction:column; gap:.6em; }
.report-row { display:grid; grid-template-columns:auto 1fr; gap:.7em; align-items:start; }
.report-chip {
  display:inline-flex; align-items:center; gap:.3em;
  padding:.15em .55em; border-radius:6px;
  background:var(--brand-bg); color:var(--brand);
  font-size:.58em; font-weight:700; white-space:nowrap;
  border:1px solid color-mix(in srgb, var(--brand) 16%, transparent);
  letter-spacing:.01em;
}
.report-t { font-size:.7em; color:var(--ink-2); line-height:1.62; padding-top:2px; }

/* MARQUEE */
.marquee-wrap { border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:1em 0; overflow:hidden; background:var(--surface); }
.marquee-inner { display:flex; align-items:center; max-width:var(--max-w); margin:0 auto; padding:0 var(--pad-h); gap:2em; }
.marquee-lbl { font-size:.72em; color:var(--ink-3); white-space:nowrap; flex-shrink:0; }
.marquee-sep { width:1px; height:1em; background:var(--border); flex-shrink:0; }
.marquee-scroll { flex:1; overflow:hidden; }
.marquee-track { display:flex; gap:.6em; animation:run 28s linear infinite; width:max-content; }
.marquee-track:hover { animation-play-state:paused; }
.m-pill { display:inline-flex; align-items:center; gap:.45em; font-size:.75em; font-weight:500; color:var(--ink-2); padding:.38em 1em; border-radius:100em; background:var(--warm); border:1px solid var(--border); white-space:nowrap; }
.m-dot { width:5px; height:5px; border-radius:50%; background:var(--brand); opacity:.5; flex-shrink:0; }

/* SECTION SHARED */
.section-inner { max-width:var(--max-w); margin:0 auto; padding:6em var(--pad-h); }
.section-head { text-align:center; margin-bottom:4em; }
.overline { display:inline-flex; align-items:center; gap:.4em; background:var(--brand-bg); color:var(--brand); font-size:.72em; font-weight:600; letter-spacing:.05em; text-transform:uppercase; padding:.32em .9em; border-radius:100em; margin-bottom:1em; border:1px solid color-mix(in srgb, var(--brand) 16%, transparent); }
.sh2 { font-family:'Newsreader',serif; font-size:3em; font-weight:400; letter-spacing:-.035em; line-height:1.06; color:var(--ink); margin-bottom:.7em; }
.sh2 em { font-style:italic; font-weight:300; color:var(--brand); }
.ssub { font-size:1.05em; color:var(--ink-2); line-height:1.78; max-width:34em; margin:0 auto; }

/* VALUE SECTION */
.value-section { background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.value-top {
  display:grid; grid-template-columns:1fr 1fr; gap:5em; align-items:start; margin-bottom:4.5em;
}
.value-headline { font-family:'Newsreader',serif; font-size:3.5em; font-weight:400; line-height:1.06; letter-spacing:-.04em; color:var(--ink); }
.value-headline em { font-style:italic; font-weight:300; color:var(--brand); }
.value-desc { font-size:1.05em; line-height:1.78; color:var(--ink-2); margin-bottom:2em; }
.value-cta-note { font-size:.78em; color:var(--ink-3); margin-top:.75em; }

.feat-duo { display:grid; grid-template-columns:1fr 1fr; gap:1.25em; }
.feat-duo-card { background:var(--warm); border:1px solid var(--border); border-radius:var(--r-xl); overflow:hidden; display:flex; flex-direction:column; transition:box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.feat-duo-card:hover { box-shadow:var(--sh-card-hover); transform:translateY(-2px); }
.feat-duo-text { padding:2.2em 2.2em 1.8em; }
.feat-duo-eyebrow { font-size:.7em; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--brand); margin-bottom:.75em; }
.feat-duo-title { font-family:'Newsreader',serif; font-size:1.75em; font-weight:400; line-height:1.1; letter-spacing:-.03em; color:var(--ink); margin-bottom:.55em; }
.feat-duo-title em { font-style:italic; color:var(--brand); font-weight:300; }
.feat-duo-desc { font-size:.84em; line-height:1.78; color:var(--ink-2); }
.feat-duo-ui { flex:1; border-top:1px solid var(--border); background:var(--surface); padding:1.5em; display:flex; flex-direction:column; gap:.55em; min-height:220px; justify-content:center; }

/* HOW IT WORKS */
.how-section { background:var(--warm); }
.step-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25em; }
.step-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-xl); padding:2.4em 2em 2.2em; text-align:center; transition:box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.step-card:hover { box-shadow:var(--sh-card-hover); transform:translateY(-2px); }
.step-deco { position:relative; width:88px; height:88px; margin:0 auto 1.5em; }
.step-deco-grid { position:absolute; inset:0; border-radius:50%; background-image:linear-gradient(to right, var(--border) 1px, transparent 1px),linear-gradient(to bottom, var(--border) 1px, transparent 1px); background-size:14px 14px; mask-image:radial-gradient(ellipse 50% 50% at 50% 50%, black 65%, transparent 100%); -webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%, black 65%, transparent 100%); opacity:.7; }
.step-deco-icon { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:1.9em; }
.step-badge { display:inline-flex; align-items:center; gap:.35em; font-size:.65em; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--brand); background:var(--brand-bg); padding:.3em .8em; border-radius:100em; border:1px solid color-mix(in srgb, var(--brand) 16%, transparent); margin-bottom:.9em; }
.step-card-title { font-size:1.05em; font-weight:600; color:var(--ink); letter-spacing:-.02em; line-height:1.25; margin-bottom:.55em; }
.step-card-desc { font-size:.83em; color:var(--ink-2); line-height:1.8; }

/* STATS */
.stats-wrap { background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.stats-grid { max-width:var(--max-w); margin:0 auto; padding:0 var(--pad-h); display:grid; grid-template-columns:repeat(4,1fr); }
.stat-cell { padding:3.5em 2em; display:flex; flex-direction:column; gap:.5em; border-right:1px solid var(--border); }
.stat-cell:last-child { border-right:none; }
.stat-num { font-family:'Newsreader',serif; font-size:3.75em; font-weight:300; line-height:1; letter-spacing:-.04em; color:var(--brand); display:flex; align-items:baseline; gap:.08em; }
.stat-unit { font-size:.52em; font-weight:400; color:var(--brand); }
.stat-desc { font-size:.8em; color:var(--ink-3); line-height:1.55; max-width:13em; }

/* TESTIMONIALS */
.testi-section { background:var(--warm); border-top:1px solid var(--border); }
.testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1em; }
.testi-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-l); padding:1.8em; transition:box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease); }
.testi-card:hover { box-shadow:var(--sh-card-hover); transform:translateY(-2px); }
.testi-stars { font-size:.8em; margin-bottom:1em; letter-spacing:2px; color:#F59E0B; }
.testi-quote { font-size:.875em; color:var(--ink-2); line-height:1.82; margin-bottom:1.4em; }
.testi-quote strong { color:var(--ink); font-weight:500; }
.testi-author { display:flex; align-items:center; gap:.65em; }
.testi-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-family:'DM Sans',sans-serif; font-weight:700; color:rgba(255,255,255,.9); flex-shrink:0; }
.testi-name { font-size:.82em; font-weight:600; color:var(--ink); }
.testi-role { font-size:.72em; color:var(--ink-3); margin-top:1px; }

/* FAQ */
.faq-section { background:var(--surface); border-top:1px solid var(--border); }
.faq-inner { max-width:50em; margin:0 auto; }
.faq-item { border-bottom:1px solid var(--border); padding:1.35em 0; cursor:pointer; }
.faq-item:first-of-type { border-top:1px solid var(--border); }
.faq-q { display:flex; align-items:center; justify-content:space-between; gap:1em; }
.faq-question { font-size:.95em; font-weight:500; color:var(--ink); letter-spacing:-.015em; }
.faq-icon { width:24px; height:24px; border-radius:50%; border:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--ink-3); font-size:16px; line-height:1; transition:background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease), transform .3s var(--ease-spring); }
.faq-item.open .faq-icon { background:var(--brand); border-color:var(--brand); color:white; transform:rotate(45deg); }
.faq-answer { max-height:0; overflow:hidden; transition:max-height .4s var(--ease), padding .4s var(--ease); }
.faq-item.open .faq-answer { max-height:240px; padding-top:.9em; }
.faq-answer p { font-size:.875em; color:var(--ink-2); line-height:1.82; }

/* CTA */
.cta-section { padding:0 var(--pad-h) 6em; max-width:var(--max-w); margin:0 auto; }
.cta-box { border-radius:var(--r-2xl); background:linear-gradient(148deg, var(--brand-dk) 0%, var(--brand) 52%, var(--brand-lt) 100%); padding:6em var(--pad-h); text-align:center; overflow:hidden; position:relative; }
.cta-box::before { content:''; position:absolute; top:-240px; left:50%; transform:translateX(-50%); width:900px; height:800px; background:radial-gradient(ellipse, rgba(255,255,255,.14) 0%, transparent 60%); pointer-events:none; }
.cta-overline { display:inline-block; background:rgba(255,255,255,.12); color:rgba(255,255,255,.88); font-size:.72em; font-weight:600; letter-spacing:.05em; text-transform:uppercase; padding:.32em 1.1em; border-radius:100em; margin-bottom:1.3em; position:relative; border:1px solid rgba(255,255,255,.16); }
.cta-h2 { font-family:'Newsreader',serif; font-size:3.75em; font-weight:400; letter-spacing:-.04em; line-height:1.04; color:white; margin-bottom:.9em; position:relative; }
.cta-h2 em { font-style:italic; font-weight:300; color:rgba(255,255,255,.62); }
.cta-sub { font-size:1.05em; color:rgba(255,255,255,.58); line-height:1.75; max-width:28em; margin:0 auto 2.5em; position:relative; }
.cta-actions { display:flex; align-items:center; justify-content:center; gap:.75em; flex-wrap:wrap; position:relative; }
.btn-white { font-family:'DM Sans',sans-serif; font-size:1em; font-weight:600; color:var(--brand); background:white; border:none; padding:.82em 1.9em; border-radius:var(--r-l); cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:.5em; box-shadow:0 2px 16px rgba(0,0,0,.12),0 8px 32px rgba(0,0,0,.09); transition:transform .12s var(--ease-spring), box-shadow var(--dur) var(--ease); }
.btn-white:hover { transform:translateY(-1px); box-shadow:0 4px 24px rgba(0,0,0,.16),0 16px 48px rgba(0,0,0,.12); }
.btn-outline-w { font-family:'DM Sans',sans-serif; font-size:1em; font-weight:500; color:rgba(255,255,255,.82); background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); padding:.8em 1.7em; border-radius:var(--r-l); cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:.5em; transition:background var(--dur) var(--ease), color var(--dur) var(--ease); }
.btn-outline-w:hover { background:rgba(255,255,255,.18); color:white; }

/* FOOTER */
footer { background:var(--ink); border-top:1px solid rgba(255,255,255,.05); }
.footer-inner { max-width:var(--max-w); margin:0 auto; padding:5em var(--pad-h) 3.5em; display:grid; grid-template-columns:1.8fr 1fr 1fr 1fr; gap:3em; }
.footer-desc { font-size:.78em; color:rgba(255,255,255,.26); line-height:1.75; margin-top:.9em; max-width:17em; }
.fcol-title { font-size:.68em; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:rgba(255,255,255,.22); margin-bottom:.9em; }
.flinks { display:flex; flex-direction:column; gap:.6em; }
.flink { font-size:.84em; color:rgba(255,255,255,.34); text-decoration:none; transition:color var(--dur) var(--ease); }
.flink:hover { color:rgba(255,255,255,.72); }
.footer-bottom { max-width:var(--max-w); margin:0 auto; padding:1.25em var(--pad-h); border-top:1px solid rgba(255,255,255,.05); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75em; }
.footer-bottom p { font-size:.72em; color:rgba(255,255,255,.2); }
.f-badge { display:inline-flex; align-items:center; gap:.35em; padding:.28em .75em; border-radius:100em; font-size:.68em; font-weight:600; }
.f-badge-teal { background:rgba(11,122,106,.14); border:1px solid rgba(11,122,106,.2); color:#2DD4C0; }
.f-badge-dim  { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); color:rgba(255,255,255,.26); }

/* HAMBURGER */
.nav-hamburger { display:none; flex-direction:column; justify-content:center; gap:5px; background:none; border:none; cursor:pointer; padding:.5em; border-radius:var(--r-s); margin-left:.5em; flex-shrink:0; }
.nav-hamburger span { display:block; width:20px; height:1.5px; background:var(--ink); border-radius:2px; transition:transform var(--dur) var(--ease), opacity var(--dur) var(--ease); }
.nav-hamburger.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
.nav-hamburger.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }
.nav-link-mob { display:none; }

/* RESPONSIVE */
@media (max-width: 900px) {
  html { font-size: 15px; }
  :root { --pad-h: 1.5rem; }

  .nav-inner { gap: 0; }
  .nav-links { display:none; position:fixed; top:4.6em; left:0; right:0; background:var(--warm); border-bottom:1px solid var(--border); padding:.75rem 1.5rem 1rem; flex-direction:column; gap:.15em; z-index:99; box-shadow:0 8px 24px rgba(20,20,20,.1); animation:rise .25s var(--ease) both; }
  .nav-links.mobile-open { display:flex; }
  .nav-link { font-size:.95em; padding:.7em .75em; }
  .nav-hamburger { display:flex; }
  .btn-ghost { display:none; }
  .btn-primary { font-size:.78em; padding:.46em .85em; white-space:nowrap; }
  .nav-link-mob { display:block; }

  .hero { padding:3.5em 1.5rem 2em; }
  .hero-h1 { font-size:3em; }
  .hero-sub { font-size:1em; }
  .hero-actions { flex-direction:column; align-items:center; gap:.75em; }
  .hero-product { grid-template-columns:1fr; max-width:420px; padding:0 1.5rem 3em; }

  .value-top { grid-template-columns:1fr; gap:2em; margin-bottom:2.5em; }
  .value-headline { font-size:2.5em; }
  .feat-duo { grid-template-columns:1fr; }
  .feat-duo-ui { min-height:180px; }

  .step-cards { grid-template-columns:1fr; }
  .step-card { text-align:left; padding:1.75em 1.5em; }
  .step-deco { margin:0 0 1.25em; }

  .stats-grid { grid-template-columns:1fr 1fr; }
  .stat-cell { padding:2.25em 1.5em; border-right:none; border-bottom:1px solid var(--border); }
  .stat-cell:nth-child(odd) { border-right:1px solid var(--border); }
  .stat-cell:last-child { border-bottom:none; }
  .stat-num { font-size:2.75em; }

  .sh2 { font-size:2.25em; }
  .testi-grid { grid-template-columns:1fr; }

  .cta-box { padding:4em 1.5rem; border-radius:var(--r-xl); }
  .cta-h2 { font-size:2.5em; }
  .cta-actions { flex-direction:column; align-items:center; }
  .btn-white, .btn-outline-w { width:100%; justify-content:center; max-width:300px; }

  .footer-inner { grid-template-columns:1fr 1fr; gap:2em; padding:3.5em 1.5rem 2em; }
  .footer-bottom { flex-direction:column; align-items:center; text-align:center; }
}

@media (max-width: 520px) {
  html { font-size: 14px; overflow-x: hidden; }
  :root { --pad-h: 1rem; }
  .nav-logo svg { width: 90px; height: auto; }
  .btn-word-hide { display: none; }
  .hero-h1 { font-size:2.1em; }
  .hero-product { padding:0 1.1rem 2.5em; }
  .hero-wrap { overflow-x: hidden; }
  .sh2 { font-size:1.9em; }
  .cta-h2 { font-size:2em; }
  .stats-grid { grid-template-columns:1fr; }
  .stat-cell { border-right:none !important; border-bottom:1px solid var(--border); }
  .stat-cell:last-child { border-bottom:none; }
  .footer-inner { grid-template-columns:1fr; }
  .marquee-lbl, .marquee-sep { display:none; }
  .value-headline { font-size:2em; }
}
`

const HTML = `
<nav>
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="VetaIA">
      <svg width="120" height="36" viewBox="0 0 320 100" fill="none">
        <path d="M0 32L32 0v64L0 64z" fill="#0B7A6A"/>
        <path d="M32 0h32v32L32 64V32z" fill="#111D1B"/>
        <text x="82" y="58" font-family="DM Sans,system-ui,sans-serif" font-size="50" font-weight="700" fill="#111D1B" letter-spacing="-2">Veta</text>
        <text x="190" y="58" font-family="DM Sans,system-ui,sans-serif" font-size="50" font-weight="700" fill="#0B7A6A" letter-spacing="-2">IA</text>
      </svg>
    </a>
    <div class="nav-links" id="nav-links">
      <a href="#fonctionnalites" class="nav-link">Fonctionnalités</a>
      <a href="#comment-ca-marche" class="nav-link">Comment ça marche</a>
      <a href="#temoignages" class="nav-link">Témoignages</a>
      <a href="/login" class="nav-link nav-link-mob">Connexion</a>
    </div>
    <div class="nav-actions">
      <a href="/login" class="btn-ghost">Connexion</a>
      <a href="/signup" class="btn-primary">
        Accès <span class="btn-word-hide"> gratuit</span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M6 2.5l3.5 3L6 8.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <button class="nav-hamburger" id="nav-hamburger" onclick="toggleNav()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>

<div class="hero-wrap">
  <div class="hero-glow"></div>
  <div class="hero">
    <div class="hero-badge"><span class="hero-dot"></span>Bêta ouverte · Accès gratuit</div>
    <h1 class="hero-h1">Dictez la consultation.<br><em>VetaIA rédige le rapport.</em></h1>
    <p class="hero-sub">Vous parlez pendant la consultation. VetaIA transcrit et génère automatiquement un compte-rendu structuré en 30 secondes — prêt à signer, sans toucher au clavier.</p>
    <div class="hero-actions">
      <a href="/signup" class="btn-lg">
        Commencer gratuitement
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3l4 3.5-4 3.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="https://calendly.com/kamilassari/30min" class="btn-text" target="_blank">Voir une démo →</a>
    </div>
    <div class="hero-trust">
      <div class="trust-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#0B7A6A" stroke-width="1.1"/><path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="#0B7A6A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Données en Europe · RGPD
      </div>
      <span class="trust-sep">·</span>
      <div class="trust-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#0B7A6A" stroke-width="1.1"/><path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="#0B7A6A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Réservé aux vétérinaires diplômés
      </div>
      <span class="trust-sep">·</span>
      <div class="trust-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#0B7A6A" stroke-width="1.1"/><path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="#0B7A6A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Sans carte bancaire
      </div>
    </div>
  </div>

  <div class="hero-product">
    <div class="card rec-card">
      <div class="rec-header">
        <div class="rec-live">
          <div class="rec-dot"></div>
          <span class="rec-label">Consultation en cours</span>
        </div>
        <span class="rec-timer">02:47</span>
      </div>
      <div class="patient-row">
        <div class="patient-icon">
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><ellipse cx="9" cy="12" rx="5" ry="3.5" stroke="#0B7A6A" stroke-width="1.4"/><circle cx="9" cy="6" r="2.2" stroke="#0B7A6A" stroke-width="1.4"/><circle cx="5.2" cy="4.2" r="1" fill="#0B7A6A" opacity=".4"/><circle cx="12.8" cy="4.2" r="1" fill="#0B7A6A" opacity=".4"/></svg>
        </div>
        <div>
          <div class="patient-name">Rex · Golden Retriever</div>
          <div class="patient-meta">4 ans · Mâle · 32 kg</div>
        </div>
      </div>
      <div class="waveform">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
      </div>
      <div class="transcript-box">
        <p class="transcript-text">Propriétaire rapporte une <mark>boiterie postérieure droite</mark> depuis 3 jours, sans traumatisme identifié. Légère diminution d'activité<span class="cursor"></span></p>
      </div>
      <div class="rec-actions">
        <button class="btn-rec-pause">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="1" y=".5" width="2.5" height="8" rx="1" fill="currentColor"/><rect x="5.5" y=".5" width="2.5" height="8" rx="1" fill="currentColor"/></svg>
          Pause
        </button>
        <button class="btn-rec-gen">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l.8 2.8H8.5L6.1 5.6l.9 2.8L5 7l-2 1.4.9-2.8L1.5 3.8H4.2z" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg>
          Générer le compte-rendu
        </button>
      </div>
    </div>

    <div class="card report-card">
      <div class="report-top">
        <span class="report-lbl">Compte-rendu de consultation</span>
        <span class="report-ok">✓ 8 sec</span>
      </div>
      <div class="report-rows">
        <div class="report-row">
          <div class="report-chip">Symptômes</div>
          <div class="report-t">Boiterie postérieure droite depuis 3 jours, sans traumatisme.</div>
        </div>
        <div class="report-row">
          <div class="report-chip">Examen</div>
          <div class="report-t">32 kg · T° 38,6°C · Douleur à la palpation du LCC.</div>
        </div>
        <div class="report-row">
          <div class="report-chip">Diagnostic</div>
          <div class="report-t">Suspicion rupture partielle ligament croisé crânial.</div>
        </div>
        <div class="report-row">
          <div class="report-chip">Traitement</div>
          <div class="report-t">Méloxicam 0,1 mg/kg/j × 5j · Radio · Repos strict.</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="marquee-wrap">
  <div class="marquee-inner">
    <span class="marquee-lbl">Utilisé par des cliniques en France</span>
    <div class="marquee-sep"></div>
    <div class="marquee-scroll">
      <div class="marquee-track">
        <div class="m-pill"><span class="m-dot"></span>Vétoclinic Lyon</div>
        <div class="m-pill"><span class="m-dot"></span>Cabinet VetPro Paris</div>
        <div class="m-pill"><span class="m-dot"></span>Clinique Animalia</div>
        <div class="m-pill"><span class="m-dot"></span>VetCenter Bordeaux</div>
        <div class="m-pill"><span class="m-dot"></span>ClinVet Toulouse</div>
        <div class="m-pill"><span class="m-dot"></span>Vétofrance Nantes</div>
        <div class="m-pill"><span class="m-dot"></span>Clinique du Parc Lille</div>
        <div class="m-pill"><span class="m-dot"></span>Centre Vétérinaire Marseille</div>
        <div class="m-pill"><span class="m-dot"></span>Vétoclinic Lyon</div>
        <div class="m-pill"><span class="m-dot"></span>Cabinet VetPro Paris</div>
        <div class="m-pill"><span class="m-dot"></span>Clinique Animalia</div>
        <div class="m-pill"><span class="m-dot"></span>VetCenter Bordeaux</div>
        <div class="m-pill"><span class="m-dot"></span>ClinVet Toulouse</div>
        <div class="m-pill"><span class="m-dot"></span>Vétofrance Nantes</div>
        <div class="m-pill"><span class="m-dot"></span>Clinique du Parc Lille</div>
        <div class="m-pill"><span class="m-dot"></span>Centre Vétérinaire Marseille</div>
      </div>
    </div>
  </div>
</div>

<section class="value-section" id="fonctionnalites">
  <div class="section-inner">
    <div class="value-top">
      <h2 class="value-headline">
        Deux outils.<br>Un seul objectif :<br><em>vous libérer du temps.</em>
      </h2>
      <div>
        <p class="value-desc">Chaque heure passée sur les dossiers est une heure prise sur vos patients. VetaIA prend en charge la rédaction des comptes-rendus et répond à vos questions cliniques en temps réel.</p>
        <a href="/signup" class="btn-lg">
          Commencer gratuitement
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3l4 3.5-4 3.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <p class="value-cta-note">Données hébergées en Europe · RGPD</p>
      </div>
    </div>

    <div class="feat-duo">
      <div class="feat-duo-card">
        <div class="feat-duo-text">
          <div class="feat-duo-eyebrow">Dictée & Transcription</div>
          <div class="feat-duo-title">Fini la rédaction.<br><em>Pour toujours.</em></div>
          <p class="feat-duo-desc">Vous parlez, VetaIA rédige. Le compte-rendu structuré est prêt en 30 secondes — symptômes, examen, diagnostic, traitement — sans que vous ayez touché au clavier.</p>
        </div>
        <div class="feat-duo-ui">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-l);overflow:hidden;box-shadow:var(--sh-card);">
            <div style="padding:.75em 1em;border-bottom:1px solid var(--border-2);display:flex;align-items:center;gap:.6em;">
              <div style="width:7px;height:7px;border-radius:50%;background:#16A34A;box-shadow:0 0 0 3px rgba(22,163,74,.15);flex-shrink:0;"></div>
              <span style="font-size:.72em;font-weight:600;color:var(--ink);">Consultation en cours</span>
              <span style="margin-left:auto;font-family:'Newsreader',serif;font-size:.8em;color:var(--ink-3);">04:12</span>
            </div>
            <div style="padding:.85em 1em;background:var(--warm);display:flex;align-items:center;gap:.6em;">
              <div style="display:flex;align-items:center;gap:2.5px;flex:1;">
                <div class="bar" style="height:8px;width:2.5px;"></div><div class="bar" style="height:18px;width:2.5px;animation-delay:.1s;"></div><div class="bar" style="height:28px;width:2.5px;animation-delay:.2s;"></div><div class="bar" style="height:22px;width:2.5px;animation-delay:.3s;"></div><div class="bar" style="height:30px;width:2.5px;animation-delay:.4s;"></div><div class="bar" style="height:26px;width:2.5px;animation-delay:.5s;"></div><div class="bar" style="height:30px;width:2.5px;animation-delay:.6s;"></div><div class="bar" style="height:20px;width:2.5px;animation-delay:.7s;"></div><div class="bar" style="height:14px;width:2.5px;animation-delay:.55s;"></div><div class="bar" style="height:8px;width:2.5px;animation-delay:.35s;"></div>
              </div>
              <span style="font-size:.65em;color:var(--ink-3);white-space:nowrap;">Enregistrement actif</span>
            </div>
            <div style="padding:.85em 1em;">
              <div style="font-size:.63em;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);margin-bottom:.65em;">Compte-rendu de consultation</div>
              <div style="display:flex;flex-direction:column;gap:.5em;">
                <div style="display:flex;gap:.5em;align-items:flex-start;">
                  <span style="background:var(--brand-bg);color:var(--brand);font-size:.58em;font-weight:700;padding:.15em .55em;border-radius:6px;white-space:nowrap;border:1px solid color-mix(in srgb,var(--brand) 16%,transparent);flex-shrink:0;margin-top:2px;">Symptômes</span>
                  <span style="font-size:.7em;color:var(--ink-2);line-height:1.5;">Boiterie postérieure droite depuis 3 jours.</span>
                </div>
                <div style="display:flex;gap:.5em;align-items:flex-start;">
                  <span style="background:var(--brand-bg);color:var(--brand);font-size:.58em;font-weight:700;padding:.15em .55em;border-radius:6px;white-space:nowrap;border:1px solid color-mix(in srgb,var(--brand) 16%,transparent);flex-shrink:0;margin-top:2px;">Examen</span>
                  <span style="font-size:.7em;color:var(--ink-2);line-height:1.5;">32 kg · T° 38,6°C · LCC douloureux.</span>
                </div>
                <div style="display:flex;gap:.5em;align-items:flex-start;">
                  <span style="background:var(--brand-bg);color:var(--brand);font-size:.58em;font-weight:700;padding:.15em .55em;border-radius:6px;white-space:nowrap;border:1px solid color-mix(in srgb,var(--brand) 16%,transparent);flex-shrink:0;margin-top:2px;">Diagnostic</span>
                  <span style="font-size:.7em;color:var(--ink-2);line-height:1.5;">Suspicion rupture partielle ligament croisé.</span>
                </div>
                <div style="display:flex;gap:.5em;align-items:flex-start;">
                  <span style="background:var(--brand-bg);color:var(--brand);font-size:.58em;font-weight:700;padding:.15em .55em;border-radius:6px;white-space:nowrap;border:1px solid color-mix(in srgb,var(--brand) 16%,transparent);flex-shrink:0;margin-top:2px;">Traitement</span>
                  <span style="font-size:.7em;color:var(--ink-2);line-height:1.5;">Méloxicam 0,1 mg/kg/j × 5j · Radio · Repos.</span>
                </div>
              </div>
              <div style="margin-top:.85em;">
                <span style="background:#DCFCE7;color:#15803D;font-size:.65em;font-weight:700;padding:.2em .75em;border-radius:100em;">✓ Généré en 28 sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="feat-duo-card">
        <div class="feat-duo-text">
          <div class="feat-duo-eyebrow">Assistant clinique IA</div>
          <div class="feat-duo-title">La bonne réponse,<br>en <em>5 secondes.</em></div>
          <p class="feat-duo-desc">Dosages, interactions médicamenteuses, protocoles. Posez votre question en langage naturel et obtenez une réponse sourcée immédiatement.</p>
        </div>
        <div class="feat-duo-ui">
          <div style="display:flex;flex-direction:column;gap:.55em;">
            <div style="display:flex;justify-content:flex-end;">
              <div style="background:var(--brand);border-radius:14px 14px 4px 14px;padding:.6em .9em;font-size:.72em;color:white;line-height:1.6;max-width:82%;">Méloxicam pour un Golden de 32 kg ?</div>
            </div>
            <div style="display:flex;gap:.5em;align-items:flex-start;">
              <div style="width:22px;height:22px;border-radius:6px;background:var(--brand-bg);border:1px solid color-mix(in srgb,var(--brand) 18%,transparent);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1.5C3.3 1.5 1.5 3.3 1.5 5.5S3.3 9.5 5.5 9.5 9.5 7.7 9.5 5.5 7.7 1.5 5.5 1.5z" stroke="#0B7A6A" stroke-width="1.1"/><path d="M5.5 3.5v2.2l1.5.9" stroke="#0B7A6A" stroke-width="1.1" stroke-linecap="round"/></svg>
              </div>
              <div style="background:var(--warm);border:1px solid var(--border);border-radius:4px 14px 14px 14px;padding:.65em .9em;font-size:.72em;color:var(--ink-2);line-height:1.75;flex:1;">
                <strong style="color:var(--ink);">J1 : 6,4 mg</strong> (0,2 mg/kg, dose de charge)<br>
                Entretien : <strong style="color:var(--ink);">3,2 mg/j</strong> × 5 jours<br>
                <span style="color:var(--brand);font-size:.9em;font-weight:600;">Source : Merck Vet Manual</span>
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;">
              <div style="background:var(--brand);border-radius:14px 14px 4px 14px;padding:.6em .9em;font-size:.72em;color:white;line-height:1.6;max-width:82%;">Contre-indications à vérifier ?</div>
            </div>
            <div style="display:flex;gap:.5em;align-items:flex-start;">
              <div style="width:22px;height:22px;border-radius:6px;background:var(--brand-bg);border:1px solid color-mix(in srgb,var(--brand) 18%,transparent);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1.5C3.3 1.5 1.5 3.3 1.5 5.5S3.3 9.5 5.5 9.5 9.5 7.7 9.5 5.5 7.7 1.5 5.5 1.5z" stroke="#0B7A6A" stroke-width="1.1"/><path d="M5.5 3.5v2.2l1.5.9" stroke="#0B7A6A" stroke-width="1.1" stroke-linecap="round"/></svg>
              </div>
              <div style="background:var(--warm);border:1px solid var(--border);border-radius:4px 14px 14px 14px;padding:.65em .9em;font-size:.72em;color:var(--ink-2);line-height:1.75;flex:1;">
                Insuffisance rénale ou hépatique, ulcère gastrique. Éviter avec les corticoïdes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="how-section" id="comment-ca-marche">
  <div class="section-inner">
    <div class="section-head">
      <div class="overline">En pratique</div>
      <h2 class="sh2">De l'enregistrement<br>au rapport, <em>en 30 secondes.</em></h2>
      <p class="ssub">Voici exactement ce qui se passe quand vous utilisez VetaIA en consultation.</p>
    </div>
    <div class="step-cards">
      <div class="step-card">
        <div class="step-deco">
          <div class="step-deco-grid"></div>
          <div class="step-deco-icon">🎙️</div>
        </div>
        <div class="step-badge">Étape 01</div>
        <div class="step-card-title">Enregistrez pendant la consultation</div>
        <p class="step-card-desc">Lancez l'enregistrement avant de faire entrer le patient. Parlez normalement. VetaIA transcrit en temps réel, termes latins et doses compris.</p>
      </div>
      <div class="step-card">
        <div class="step-deco">
          <div class="step-deco-grid"></div>
          <div class="step-deco-icon">⚡</div>
        </div>
        <div class="step-badge">Étape 02</div>
        <div class="step-card-title">Générez le rapport en un clic</div>
        <p class="step-card-desc">À la fin de la consultation, cliquez sur "Générer". Le compte-rendu structuré est prêt en 30 secondes, avant que le propriétaire reparte.</p>
      </div>
      <div class="step-card">
        <div class="step-deco">
          <div class="step-deco-grid"></div>
          <div class="step-deco-icon">📋</div>
        </div>
        <div class="step-badge">Étape 03</div>
        <div class="step-card-title">Relisez, ajustez et copiez</div>
        <p class="step-card-desc">Le rapport est entièrement éditable. Modifiez ce qui ne convient pas, puis copiez-le en un clic dans votre logiciel de gestion. Rien à ressaisir.</p>
      </div>
    </div>
  </div>
</section>

<div class="stats-wrap">
  <div class="stats-grid">
    <div class="stat-cell">
      <div class="stat-num">30<span class="stat-unit">sec</span></div>
      <p class="stat-desc">Pour générer un compte-rendu complet après dictée</p>
    </div>
    <div class="stat-cell">
      <div class="stat-num">2<span class="stat-unit">h</span></div>
      <p class="stat-desc">Récupérées par jour en moyenne par les vétérinaires utilisateurs</p>
    </div>
    <div class="stat-cell">
      <div class="stat-num">500<span class="stat-unit">k+</span></div>
      <p class="stat-desc">Cas cliniques annotés pour entraîner le modèle vétérinaire</p>
    </div>
    <div class="stat-cell">
      <div class="stat-num">47<span class="stat-unit"> esp.</span></div>
      <p class="stat-desc">Espèces animales couvertes par la base de données cliniques</p>
    </div>
  </div>
</div>

<section class="testi-section" id="temoignages">
  <div class="section-inner">
    <div class="section-head">
      <div class="overline">
        <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><circle cx="3.5" cy="3.5" r="3" fill="#2DD4C0"/></svg>
        Témoignages
      </div>
      <h2 class="sh2">Ils ont arrêté de rédiger <em>leurs rapports eux-mêmes.</em></h2>
      <p class="ssub">Ils font partie des premières cliniques à tester VetaIA pendant la bêta.</p>
    </div>
    <div class="testi-grid">
      <div class="testi-card">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-quote">"Je dicte pendant la consultation et le rapport est prêt avant que le propriétaire ait remis sa laisse. <strong>J'ai récupéré presque deux heures par jour.</strong>"</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#0B4A40,#0B7A6A);">MD</div>
          <div><div class="testi-name">Dr. Marie Dubois</div><div class="testi-role">Vétérinaire généraliste · Lyon</div></div>
        </div>
      </div>
      <div class="testi-card">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-quote">"En chirurgie on perd beaucoup de temps à dicter les comptes-rendus post-op. Avec VetaIA, <strong>je parle et le rapport est structuré en trente secondes.</strong> Bluffant."</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#1A1A2E,#16213E);">AM</div>
          <div><div class="testi-name">Dr. Antoine Mercier</div><div class="testi-role">Chirurgien vétérinaire · Paris</div></div>
        </div>
      </div>
      <div class="testi-card">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-quote">"Les dosages, les interactions médicamenteuses. Je pose la question, <strong>j'ai la réponse sourcée en quelques secondes.</strong> C'est le genre d'outil dont on ne réalise pas qu'on avait besoin."</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#2D1B4E,#1A0F30);">SL</div>
          <div><div class="testi-name">Dr. Sophie Laurent</div><div class="testi-role">Vétérinaire généraliste · Bordeaux</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="faq-section">
  <div class="section-inner">
    <div class="section-head">
      <div class="overline">Questions fréquentes</div>
      <h2 class="sh2">Tout ce que vous <em>voulez savoir</em></h2>
    </div>
    <div class="faq-inner">
      <div class="faq-item open" onclick="toggleFaq(this)">
        <div class="faq-q"><span class="faq-question">Mes données sont-elles sécurisées ?</span><div class="faq-icon">+</div></div>
        <div class="faq-answer"><p>Toutes les données sont hébergées en Europe (France/Allemagne), chiffrées en transit et au repos. Conforme RGPD. Vos consultations ne servent jamais à entraîner des modèles tiers.</p></div>
      </div>
      <div class="faq-item" onclick="toggleFaq(this)">
        <div class="faq-q"><span class="faq-question">Faut-il un équipement spécial pour la dictée ?</span><div class="faq-icon">+</div></div>
        <div class="faq-answer"><p>Non. Le microphone de votre ordinateur, tablette ou smartphone suffit. Une connexion internet et c'est tout.</p></div>
      </div>
      <div class="faq-item" onclick="toggleFaq(this)">
        <div class="faq-q"><span class="faq-question">L'IA remplace-t-elle mon jugement clinique ?</span><div class="faq-icon">+</div></div>
        <div class="faq-answer"><p>Non. VetaIA est un outil d'aide à la rédaction réservé aux vétérinaires diplômés. Il vous fait gagner du temps sur l'administratif. Le diagnostic reste votre expertise.</p></div>
      </div>
      <div class="faq-item" onclick="toggleFaq(this)">
        <div class="faq-q"><span class="faq-question">Quand les intégrations logicielles seront-elles disponibles ?</span><div class="faq-icon">+</div></div>
        <div class="faq-answer"><p>Les intégrations avec Vetup, VetManager, Provet Cloud et eVetPractice arrivent prochainement. Inscrivez-vous pour être notifié dès le lancement.</p></div>
      </div>
      <div class="faq-item" onclick="toggleFaq(this)">
        <div class="faq-q"><span class="faq-question">Y a-t-il une période d'essai gratuite ?</span><div class="faq-icon">+</div></div>
        <div class="faq-answer"><p>Oui. Pendant la bêta, VetaIA est entièrement gratuit, sans limite de consultations. Accès immédiat après inscription.</p></div>
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="cta-box">
    <div class="cta-overline">Accès anticipé gratuit</div>
    <h2 class="cta-h2">Concentrez-vous sur <em>l'animal.</em></h2>
    <p class="cta-sub">Rejoignez les premières cliniques à tester VetaIA. Accès complet pendant la bêta, sans engagement.</p>
    <div class="cta-actions">
      <a href="/signup" class="btn-white">
        Commencer maintenant
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 2.5l4 3.5-4 3.5" stroke="#0B7A6A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="https://calendly.com/kamilassari/30min" class="btn-outline-w" target="_blank">Réserver une démo →</a>
    </div>
  </div>
</div>

<footer>
  <div class="footer-inner">
    <div>
      <svg width="114" height="34" viewBox="0 0 320 100" fill="none" aria-label="VetaIA">
        <path d="M0 32L32 0v64L0 64z" fill="#0D9C87"/>
        <path d="M32 0h32v32L32 64V32z" fill="white"/>
        <text x="82" y="58" font-family="DM Sans,system-ui,sans-serif" font-size="50" font-weight="700" fill="white" letter-spacing="-2">Veta</text>
        <text x="190" y="58" font-family="DM Sans,system-ui,sans-serif" font-size="50" font-weight="700" fill="#2DD4C0" letter-spacing="-2">IA</text>
      </svg>
      <p class="footer-desc">Assistant clinique IA conçu exclusivement pour les vétérinaires diplômés. Données hébergées en Europe.</p>
      <div style="display:flex;gap:.5em;margin-top:1.25em;flex-wrap:wrap;">
        <span class="f-badge f-badge-teal">🇪🇺 RGPD conforme</span>
        <span class="f-badge f-badge-dim">🔒 Données UE</span>
      </div>
    </div>
    <div>
      <div class="fcol-title">Produit</div>
      <div class="flinks">
        <a href="#fonctionnalites" class="flink">Transcription & rapports</a>
        <a href="#fonctionnalites" class="flink">Assistant clinique</a>
        <a href="#comment-ca-marche" class="flink">Comment ça marche</a>
        <a href="https://calendly.com/kamilassari/30min" class="flink" target="_blank">Réserver une démo</a>
      </div>
    </div>
    <div>
      <div class="fcol-title">Conformité</div>
      <div class="flinks">
        <a href="#" class="flink">Mentions légales</a>
        <a href="#" class="flink">Confidentialité</a>
        <a href="#" class="flink">CGU</a>
        <a href="#" class="flink">Cookies</a>
      </div>
    </div>
    <div>
      <div class="fcol-title">Avertissement</div>
      <p style="font-size:.72em;color:rgba(255,255,255,.22);line-height:1.78;">Outil d'aide à la rédaction destiné <strong style="color:rgba(255,255,255,.36);">exclusivement aux vétérinaires diplômés</strong>. Ne remplace pas le jugement clinique professionnel.</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 VetaIA · Tous droits réservés</p>
    <p>Outil réservé aux professionnels de santé animale</p>
  </div>
</footer>
`

export default function LandingPage() {
  useEffect(() => {
    const body = document.body
    const origClass = body.className
    const origStyle = body.style.cssText
    body.className = ''
    body.style.cssText = ''

    const style = document.createElement('style')
    style.id = 'landing-css'
    style.textContent = CSS
    document.head.appendChild(style)

    ;(window as any).toggleFaq = function(item: Element) {
      const isOpen = item.classList.contains('open')
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'))
      if (!isOpen) item.classList.add('open')
    }

    ;(window as any).toggleNav = function() {
      const links = document.getElementById('nav-links')
      const btn = document.getElementById('nav-hamburger')
      links?.classList.toggle('mobile-open')
      btn?.classList.toggle('open')
    }

    const handleNavLinkClick = () => {
      document.getElementById('nav-links')?.classList.remove('mobile-open')
      document.getElementById('nav-hamburger')?.classList.remove('open')
    }
    const navLinks = document.querySelectorAll('.nav-link')
    navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick))

    return () => {
      body.className = origClass
      body.style.cssText = origStyle
      document.getElementById('landing-css')?.remove()
      delete (window as any).toggleFaq
      delete (window as any).toggleNav
      navLinks.forEach(link => link.removeEventListener('click', handleNavLinkClick))
    }
  }, [])

  return (
    <div dangerouslySetInnerHTML={{ __html: HTML }} />
  )
}
