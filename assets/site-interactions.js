/* Interacciones discretas para una navegación más cómoda */
(()=>{
 const header=document.querySelector('header.top');
 const nav=header?.querySelector('nav');
 if(!header||!nav)return;

 // Menú móvil accesible: informa su estado y conserva el foco al cerrarlo.
 if(!nav.id)nav.id='site-navigation';
 const menu=document.createElement('button');
 menu.type='button';
 menu.className='btn sm mobile-menu';
 menu.textContent='Menú';
 menu.setAttribute('aria-expanded','false');
 menu.setAttribute('aria-controls',nav.id);
 menu.setAttribute('aria-label','Abrir menú de navegación');
 menu.style.display='none';
 header.append(menu);

 const closeMenu=(restoreFocus=false)=>{
  header.classList.remove('menu-open');
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Abrir menú de navegación');
  if(restoreFocus)menu.focus();
 };
 menu.addEventListener('click',()=>{
  const open=!header.classList.contains('menu-open');
  header.classList.toggle('menu-open',open);
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Cerrar menú de navegación':'Abrir menú de navegación');
  if(open)nav.querySelector('a')?.focus();
 });
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&header.classList.contains('menu-open'))closeMenu(true);
 });
 document.addEventListener('click',event=>{
  if(!header.contains(event.target))closeMenu();
 });
 window.addEventListener('resize',()=>{
  if(window.innerWidth>820)closeMenu();
 },{passive:true});

 // Marca la sección que está leyendo la persona.
 const links=[...nav.querySelectorAll('a[href^="#"]')];
 const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const active=links.find(link=>link.getAttribute('href')==='#'+entry.target.id);
    links.forEach(link=>link.removeAttribute('aria-current'));
    active?.setAttribute('aria-current','location');
   });
  },{rootMargin:'-28% 0px -62% 0px'});
  sections.forEach(section=>observer.observe(section));
 }

 // Indicador de lectura y acceso rápido al inicio.
 const progress=document.createElement('div');
 progress.className='reading-progress';
 progress.setAttribute('aria-hidden','true');
 const fill=document.createElement('span');
 progress.append(fill);
 document.body.append(progress);

 const topButton=document.createElement('button');
 topButton.type='button';
 topButton.className='back-to-top';
 topButton.textContent='↑';
 topButton.setAttribute('aria-label','Volver al inicio');
 topButton.title='Volver al inicio';
 topButton.hidden=true;
 document.body.append(topButton);
 topButton.addEventListener('click',()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
 });

 let scheduled=false;
 const updateScrollUI=()=>{
  scheduled=false;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const percent=max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):0;
  fill.style.width=percent+'%';
  topButton.hidden=window.scrollY<480;
 };
 window.addEventListener('scroll',()=>{
  if(scheduled)return;
  scheduled=true;
  window.requestAnimationFrame(updateScrollUI);
 },{passive:true});
 updateScrollUI();
})();
