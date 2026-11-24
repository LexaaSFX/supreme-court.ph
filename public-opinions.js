const OPINION_KEY='scRoleplayOpinionsV1';
function readOpinions(){try{const value=JSON.parse(localStorage.getItem(OPINION_KEY)||'[]');return Array.isArray(value)?value:[];}catch{return[];}}
function escapeOpinionText(value){const node=document.createElement('span');node.textContent=value||'';return node.innerHTML;}

let lastRenderedTitle='';
function renderOpinionDocuments(){
  const title=document.querySelector('#print-title');
  const body=document.querySelector('#print-body');
  if(!title||!body)return;
  if(lastRenderedTitle===title.textContent&&body.querySelector('.justice-opinions-public'))return;
  lastRenderedTitle=title.textContent;

  const record=readOpinions().find(item=>item.caseTitle===title.textContent);
  body.querySelector('.justice-opinions-public')?.remove();
  if(!record||!Array.isArray(record.opinions)||!record.opinions.length)return;

  const section=document.createElement('section');section.className='opinion-section justice-opinions-public';
  section.innerHTML='<h3>Justice opinions</h3><div class="justice-opinion-list"></div>';
  const list=section.querySelector('.justice-opinion-list');
  record.opinions.forEach(opinion=>{
    const article=document.createElement('article');article.className='justice-opinion';
    const titleText=opinion.title?` — ${escapeOpinionText(opinion.title)}`:'';
    const link=document.createElement('a');link.href=opinion.document;link.download=opinion.documentName||`${opinion.justice}-opinion.pdf`;link.textContent='View / download document';link.target='_blank';
    article.innerHTML=`<strong>${escapeOpinionText(opinion.justice)}</strong><span>${escapeOpinionText(opinion.type)} opinion${titleText}</span>`;
    article.append(link);list.append(article);
  });
  body.append(section);
}

const titleNode=document.querySelector('#print-title');
const bodyNode=document.querySelector('#print-body');
if(titleNode&&bodyNode){
  const observer=new MutationObserver(()=>renderOpinionDocuments());
  observer.observe(titleNode,{childList:true,subtree:true,characterData:true});
  observer.observe(bodyNode,{childList:true,subtree:false});
  renderOpinionDocuments();
}
