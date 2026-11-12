/* Interacciones discretas para una navegación más cómoda */
(()=>{
 const header=document.querySelector('header.top');
 const nav=header?.querySelector('nav');
 if(!header||!nav)return;
 const menu=document.createElement('button');
 menu.type='button';menu.className='btn sm mobile-menu';menu.textContent='Menú';
 menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú de navegación');
 menu.style.display='none';
 header.append(menu);
 const close=()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú de navegación')};
 menu.addEventListener('click',()=>{
  const open=!header.classList.contains('menu-open');
  header.classList.toggle('menu-open',open);
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Cerrar menú de navegación':'Abrir menú de navegación');
 });
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.addEventListener('click',e=>{if(!header.contains(e.target))close()});
 const links=[...nav.querySelectorAll('a[href^="#"]')];
 const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const link=links.find(a=>a.getAttribute('href')==='#'+entry.target.id);
    links.forEach(a=>a.removeAttribute('aria-current'));
    link?.setAttribute('aria-current','location');
   });
  },{rootMargin:'-28% 0px -62% 0px'});
  sections.forEach(section=>observer.observe(section));
 }
 // Evita que el navegador conserve el menú abierto al cambiar el tamaño.
 window.addEventListener('resize',()=>{if(window.innerWidth>820)close()},{passive:true});
})();
