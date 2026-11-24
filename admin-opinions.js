const OPINION_KEY='scRoleplayOpinionsV1';

function loadOpinions(){try{const value=JSON.parse(localStorage.getItem(OPINION_KEY)||'[]');return Array.isArray(value)?value:[];}catch{return[];}}
function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not read document'));reader.readAsDataURL(file);});}
function sayOpinion(text,error=false){const message=document.querySelector('#admin-message');if(!message)return;message.textContent=text;message.classList.toggle('error',error);}

const form=document.querySelector('#decision-form');
if(form){
  const host=document.createElement('fieldset');
  host.className='opinion-document-fields';
  host.innerHTML='<legend>Dissenting / Concurrent opinions</legend><p class="opinion-help">Opinion entries are optional. When added, they require a justice name, opinion type, and a PDF/DOC/DOCX document.</p><div id="opinion-rows"></div><button id="add-opinion" class="secondary-button" type="button">+ Add justice opinion</button>';
  form.insertBefore(host,form.querySelector('.form-actions'));
  const rows=document.querySelector('#opinion-rows');

  function escapeInput(value){return String(value||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function addRow(opinion={}){
    const row=document.createElement('div');row.className='opinion-row';
    row.innerHTML=`<div class="opinion-row-grid"><label>Justice name <span>*</span><input name="opinionJustice" maxlength="120" value="${escapeInput(opinion.justice)}"></label><label>Opinion type <span>*</span><select name="opinionType"><option value="">Select type</option><option value="Dissenting">Dissenting</option><option value="Concurrent">Concurrent</option></select></label><label>Opinion title<input name="opinionTitle" maxlength="180" value="${escapeInput(opinion.title)}" placeholder="Optional"></label><label>Opinion document <span>*</span><input name="opinionDocument" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label></div><button class="danger-button remove-opinion" type="button">Remove opinion</button>`;
    row.querySelector('[name="opinionType"]').value=opinion.type||'';
    row.querySelector('.remove-opinion').addEventListener('click',()=>row.remove());
    rows.append(row);return row;
  }
  document.querySelector('#add-opinion')?.addEventListener('click',()=>addRow());

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const opinionRows=[...rows.querySelectorAll('.opinion-row')];
    const title=String(new FormData(form).get('title')||'').trim();
    const docket=String(new FormData(form).get('docket')||'').trim();
    if(!title){sayOpinion('Case title is required.',true);return;}

    const seen=new Set();const opinions=[];
    for(const row of opinionRows){
      const justice=row.querySelector('[name="opinionJustice"]').value.trim();
      const type=row.querySelector('[name="opinionType"]').value;
      const opinionTitle=row.querySelector('[name="opinionTitle"]').value.trim();
      const file=row.querySelector('[name="opinionDocument"]').files[0];
      if(!justice||!type||!file){sayOpinion('For every added opinion, enter the justice name, select an opinion type, and attach a document.',true);return;}
      const key=`${justice.toLocaleLowerCase()}|${type.toLocaleLowerCase()}`;
      if(seen.has(key)){sayOpinion(`Only one ${type.toLowerCase()} opinion is allowed per justice.`,true);return;}seen.add(key);
      const validExtension=/\.(pdf|doc|docx)$/i.test(file.name);
      const validType=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',''].includes(file.type);
      if(!validExtension||!validType){sayOpinion('Opinion documents must be PDF, DOC, or DOCX files.',true);return;}
      if(file.size>8*1024*1024){sayOpinion('Opinion documents must be 8 MB or smaller.',true);return;}
      try{opinions.push({id:crypto.randomUUID?.()||`${Date.now()}-${opinions.length}`,justice,type,title:opinionTitle,documentName:file.name,documentType:file.type,document:await readFile(file)});}catch(error){sayOpinion(error.message,true);return;}
    }

    const items=loadOpinions().filter(item=>!(item.caseTitle===title&&item.docket===docket));
    if(opinions.length)items.push({caseTitle:title,docket,opinions});
    try{localStorage.setItem(OPINION_KEY,JSON.stringify(items));window.dispatchEvent(new StorageEvent('storage',{key:OPINION_KEY,newValue:JSON.stringify(items)}));}catch{sayOpinion('The opinion documents exceed browser storage limits. Use smaller files.',true);return;}

    document.querySelector('#decision-form')?.dispatchEvent(new CustomEvent('opinions-saved',{bubbles:false,cancelable:false}));
  },true);
}
