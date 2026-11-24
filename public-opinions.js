const OPINION_KEY='scRoleplayOpinionsV1';
function readOpinions(){try{const value=JSON.parse(localStorage.getItem(OPINION_KEY)||'[]');return Array.isArray(value)?value:[];}catch{return[];}}
function escapeText(value){const node=document.createElement('span');node.textContent=String(value||'');return node.innerHTML;}

const titleNode=document.querySelector('#print-title');
const bodyNode=document.querySelector('#print-body');
let lastTitle='';

function renderOpinionDocuments(){
  if(!titleNode||!bodyNode)return;
  const title=titleNode.textContent.trim();
  if(title===lastTitle)return;
  lastTitle=title;
  bodyNode.querySelector('.justice-opinions-public')?.remove();
  if(!title)return;

  const record=readOpinions().find(item=>item.caseTitle===title);
  if(!record||!Array.isArray(record.opinions)||record.opinions.length===0)return;

  const section=document.createElement('section');section.className='opinion-section justice-opinions-public';
  section.innerHTML='<h3>Justice opinions</h3><div class="justice-opinion-list"></div>';
  const list=section.querySelector('.justice-opinion-list');
  record.opinions.forEach(opinion=>{
    if(!opinion?.justice||!opinion?.type||!opinion?.document)return;
    const article=document.createElement('article');article.className='justice-opinion';
    const titleText=opinion.title?` — ${escapeText(opinion.title)}`:'';
    const link=document.createElement('a');link.href=opinion.document;link.target='_blank';link.rel='noopener';link.download=opinion.documentName||`${opinion.justice}-opinion.pdf`;link.textContent='View / download document';
    article.innerHTML=`<strong>${escapeText(opinion.justice)}</strong><span>${escapeText(opinion.type)} opinion${titleText}</span>`;article.append(link);list.append(article);
  });
  if(list.children.length)bodyNode.append(section);
}

if(titleNode&&bodyNode){
  const observer=new MutationObserver(()=>renderOpinionDocuments());
  observer.observe(titleNode,{childList:true,subtree:true,characterData:true});
  window.addEventListener('storage',event=>{if(event.key===OPINION_KEY){lastTitle='';renderOpinionDocuments();}});
  renderOpinionDocuments();
}
