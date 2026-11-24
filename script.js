const supremeCourtLogo='https://upload.wikimedia.org/wikipedia/commons/3/3a/Supreme_Court_of_the_Philippines.svg';
document.querySelectorAll('.seal').forEach(seal=>{seal.innerHTML=`<img src="${supremeCourtLogo}" alt="Seal of the Supreme Court of the Philippines" style="width:82%;height:82%;object-fit:contain">`;});

const menuButton=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));

const filters=document.querySelectorAll('.filter');
const decisions=document.querySelectorAll('.decision');
const search=document.querySelector('#decision-search');
const noResults=document.querySelector('#no-results');
let activeFilter='all';
function updateDecisions(){const query=search.value.trim().toLowerCase();let count=0;decisions.forEach(decision=>{const matchesFilter=activeFilter==='all'||decision.dataset.category===activeFilter;const matchesSearch=decision.dataset.search.includes(query)||decision.textContent.toLowerCase().includes(query);const visible=matchesFilter&&matchesSearch;decision.hidden=!visible;if(visible)count+=1;});noResults.hidden=count!==0;}
filters.forEach(filter=>filter.addEventListener('click',()=>{filters.forEach(item=>item.classList.remove('active'));filter.classList.add('active');activeFilter=filter.dataset.filter;updateDecisions();}));
search.addEventListener('input',updateDecisions);

const cases={
  digital:{kicker:'G.R. RP-2026-001 · Constitutional',title:'Digital Access Coalition v. Commission on Elections',body:'<p>In this fictional roleplay decision, the Court upheld safeguards for lawful digital civic participation while requiring clear data-retention and voter-privacy standards.</p><p><strong>Fictional ratio:</strong> Political rights may be facilitated through secure digital platforms, but public authorities must provide accessible remedies and meaningful notice.</p><p><em>This case and holding are invented for roleplay and are not legal authority.</em></p>'},
  rivera:{kicker:'G.R. RP-2026-014 · Civil',title:'Santos Heirs v. City of Rivera',body:'<p>In this roleplay proceeding, the Court balanced family property rights with a local coastal protection program and ordered compensation where privately owned property was affected beyond a generally applicable restriction.</p><p><strong>Fictional ratio:</strong> Environmental regulation must remain consistent, rational, and respectful of constitutional property protections.</p><p><em>This case and holding are invented for roleplay and are not legal authority.</em></p>'},
  cruz:{kicker:'G.R. RP-2026-027 · Criminal',title:'People of the Philippines v. Cruz',body:'<p>The fictional Court ruled that digital evidence may be admitted only when properly preserved, authenticated, and obtained in accordance with due-process safeguards.</p><p><strong>Fictional ratio:</strong> Technological reliability cannot replace constitutional protections of search, seizure, and a fair trial.</p><p><em>This case and holding are invented for roleplay and are not legal authority.</em></p>'}
};
const modal=document.querySelector('#case-modal');
const modalTitle=document.querySelector('#modal-title');
const modalKicker=document.querySelector('#modal-kicker');
const modalBody=document.querySelector('#modal-body');
document.querySelectorAll('.read-btn').forEach(button=>button.addEventListener('click',()=>{const item=cases[button.dataset.case];modalKicker.textContent=item.kicker;modalTitle.textContent=item.title;modalBody.innerHTML=item.body;modal.showModal();}));
document.querySelector('.modal-close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',event=>{if(event.target===modal)modal.close();});

const sections=document.querySelectorAll('main section[id]');
const navLinks=document.querySelectorAll('.nav a');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`));}),{rootMargin:'-35% 0px -55%'});
sections.forEach(section=>observer.observe(section));
