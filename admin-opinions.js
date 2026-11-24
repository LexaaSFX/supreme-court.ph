const KEY='scRoleplayOpinionsV1';

function loadOpinions(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[];}catch{return[];}}
function saveOpinions(items){localStorage.setItem(KEY,JSON.stringify(items));}

const form=document.querySelector('#decision-form');
if(form){
  const host=document.createElement('fieldset');
  host.className='opinion-document-fields';
  host.innerHTML=`<legend>Dissenting / Concurrent opinions</legend>
    <p class="opinion-help">Add a separate opinion for every justice. Justice name and document are required for each dissenting or concurrent opinion.</p>
    <div id="opinion-rows"></div>
    <button id="add-opinion" class="secondary-button" type="button">+ Add justice opinion</button>`;
  form.insertBefore(host,form.querySelector('.form-actions'));

  const rows=document.querySelector('#opinion-rows');
  function addRow(opinion={}){
    const row=document.createElement('div');row.className='opinion-row';
    row.innerHTML=`<div class="opinion-row-grid">
      <label>Justice name <span>*</span><input name="opinionJustice" required value="${(opinion.justice||'').replace(/"/g,'&quot;')}" maxlength="120"></label>
      <label>Opinion type <span>*</span><select name="opinionType" required><option value="">Select type</option><option value="Dissenting">Dissenting</option><option value="Concurrent">Concurrent</option></select></label>
      <label>Opinion title<input name="opinionTitle" value="${(opinion.title||'').replace(/"/g,'&quot;')}" maxlength="180" placeholder="Optional"></label>
      <label>Opinion document <span>*</span><input name="opinionDocument" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required></label>
    </div><button class="danger-button remove-opinion" type="button">Remove opinion</button>`;
    const type=row.querySelector('[name="opinionType"]');type.value=opinion.type||'';
    row.querySelector('.remove-opinion').addEventListener('click',()=>row.remove());
    rows.append(row);
  }

  addRow();
  document.querySelector('#add-opinion').addEventListener('click',()=>addRow());

  form.addEventListener('submit',async event=>{
    event.prevent();
  });

  form.addEventListener('submit',async event=>{
    const rowsNow=[...rows.querySelectorAll('.opinion-row')];
    if(!rowsNow.length)return;
    const data=new FormData(form);
    const title=String(data.get('title')||'').trim();
    const docket=String(data.get('docket')||'').trim();
    if(!title)return;

    const opinions=[];
    for(const row of rowsNow){
      const justice=row.querySelector('[name="opinionJustice"]').value.trim();
      const type=row.querySelector('[name="opinionType"]').value;
      const opinionTitle=row.querySelector('[name="opinionTitle"]').value.trim();
      const file=row.querySelector('[name="opinionDocument"]').files[0];
      if(!justice||!type||(!file)){sayOpinion('A justice name, opinion type, and document are required for every dissenting or concurrent opinion.',true);event.preventDefault();return;}
      const document=await readFile(file);
      opinions.push({id:crypto.randomUUID?.()||String(Date.now()),justice,type,title:opinionTitle,documentName:file.name,documentType:file.type,document});
    }
    const items=loadOpinions().filter(item=>!(item.caseTitle===title&&item.docket===docket));
    items.push({caseTitle:title,docket,opinions});
    try{saveOpinions(items);const message=document.querySelector('#admin-message');if(message){message.textContent='Decision and justice opinion documents saved in this browser.';}}
    catch{sayOpinion('The document is too large for browser storage. Use a smaller PDF or DOC file.',true);event.preventDefault();}
  });
}

function sayOpinion(text,error=false){const message=document.querySelector('#admin-message');if(!message)return;message.textContent=text;message.classList.toggle('error',error);}
function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
