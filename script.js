/* Advanced single-page interactions (pure JS) */

/* --------- Utilities --------- */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* --------- Mobile hamburger toggle --------- */
const hamburger = $('#hamburger');
const navLinks = $('#nav-links');
hamburger?.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? '' : 'flex';
});

/* --------- Smooth scroll + active link highlight --------- */
const links = $$('.nav-link');
const sections = links.map(l => document.getElementById(l.dataset.target || l.getAttribute('href').slice(1)));

function onScrollSpy() {
  const y = window.scrollY + window.innerHeight*0.35;
  let currentIndex = 0;
  sections.forEach((s, i) => {
    if (!s) return;
    if (y >= s.offsetTop) currentIndex = i;
  });
  links.forEach(l => l.classList.remove('active'));
  if (links[currentIndex]) links[currentIndex].classList.add('active');
}
window.addEventListener('scroll', onScrollSpy);
window.addEventListener('load', onScrollSpy);

/* Smooth link clicks */
links.forEach(l => {
  l.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(l.dataset.target || l.getAttribute('href').slice(1));
    target?.scrollIntoView({behavior:'smooth', block:'start'});
    if (window.innerWidth < 820) navLinks.style.display = '';
  });
});

/* --------- Intersection Observer: animate elements when visible --------- */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

$$('.animate').forEach(el => animObserver.observe(el));

/* --------- Skill bars animation (fill when visible) --------- */
const barObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      $$('.bar-fill').forEach(fill=>{
        const val = fill.dataset.fill;
        fill.style.width = val + '%';
      });
      barObserver.disconnect();
    }
  });
},{threshold:0.25});
barObserver.observe($('#embedded'));

/* --------- Stagger in projects (small delay per card) --------- */
const projCards = $$('.project-card');
projCards.forEach((c,i)=>{
  c.style.transitionDelay = `${0.08 * i}s`;
  animObserver.observe(c);
  // open modal on click
  c.addEventListener('click', ()=> openProjectModal(c));
});

/* --------- Project modal (simple) --------- */
function openProjectModal(card){
  const modalRoot = $('#modal-root') || document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
  const title = card.querySelector('h3')?.textContent || 'Project';
  const desc = card.querySelector('p')?.textContent || '';
  const imgSrc = card.querySelector('img')?.src || '';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-panel">
      <button class="modal-close" aria-label="Close">✕</button>
      <div class="modal-body">
        <img src="${imgSrc}" alt="${title}" />
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    </div>
  `;
  modalRoot.appendChild(modal);

  // basic styles for modal via JS to avoid extra CSS file
  Object.assign(modal.style, {position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'});
  modal.querySelector('.modal-backdrop').style.cssText = 'position:absolute;inset:0;background:rgba(2,6,23,0.7)';
  const panel = modal.querySelector('.modal-panel');
  panel.style.cssText = 'position:relative;z-index:2;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));padding:18px;border-radius:12px;max-width:820px;width:92%;box-shadow:0 20px 50px rgba(0,0,0,0.6);';
  modal.querySelector('.modal-body img').style.cssText = 'width:100%;height:320px;object-fit:cover;border-radius:8px;margin-bottom:12px';
  modal.querySelector('.modal-close').style.cssText = 'position:absolute;right:12px;top:12px;background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer';

  modal.querySelector('.modal-close').addEventListener('click', ()=> modal.remove());
  modal.querySelector('.modal-backdrop').addEventListener('click', ()=> modal.remove());
}

/* --------- Contact form (Formspree) AJAX handling --------- */
const contactForm = $('#contactForm');
const formStatus = $('#formStatus');
if(contactForm){
  contactForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    formStatus.textContent = 'Sending...';
    formStatus.style.color = '#9fb3c8';
    try{
      const res = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: {'Accept':'application/json'}
      });
      if(res.ok){
        formStatus.textContent = '✅ Message sent — thank you!';
        formStatus.style.color = 'limegreen';
        contactForm.reset();
      } else {
        const data = await res.json();
        formStatus.textContent = data?.error || '❌ Failed to send — try again later.';
        formStatus.style.color = 'tomato';
      }
    } catch(err){
      formStatus.textContent = '⚠️ Network error — please try again later.';
      formStatus.style.color = 'tomato';
    }
  });
}

/* --------- Back to top behavior --------- */
const backBtn = $('#backToTop');
window.addEventListener('scroll', ()=>{
  if(window.scrollY > 500) backBtn.style.display = 'flex'; else backBtn.style.display = 'none';
});
backBtn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

/* --------- WhatsApp tooltip works via CSS; small focus improvement: keyboard accessible --------- */
const wa = document.querySelector('.whatsapp-float');
wa?.addEventListener('keydown', e => { if(e.key === 'Enter') wa.click(); });

/* --------- ensure animations on load for hero elements --------- */
window.addEventListener('load', ()=>{
  // reveal immediate hero bits
  $$('.hero .animate').forEach(el=> el.classList.add('visible'));
  // but hero elements may not have .animate, so add manually
  document.querySelectorAll('.hero *').forEach(el => {
    if (el.classList && el.classList.contains('animate')) return;
    // slight staged reveal for hero text
    if(el.matches('.hero-title,.hero-sub,.hero-ctas,.hero-skills')) {
      el.style.opacity = 0;
      setTimeout(()=> el.style.transition = 'opacity .9s ease', 120);
      setTimeout(()=> el.style.opacity = 1, 150);
    }
  });
});
