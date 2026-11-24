const KEY='scRoleplayPortalDataV1';
const OPINIONS_KEY='scRoleplayOpinionsV1';
const ADMIN_PASSWORD='SC-2026';

const login=document.querySelector('#admin-login');
const workspace=document.querySelector('#admin-workspace');
const loginForm=document.querySelector('#login-form');
const passwordInput=document.querySelector('#admin-password');
const loginError=document.querySelector('#login-error');

function unlock(){
  if(!login||!workspace)return;
  login.hidden=true;
  workspace.hidden=false;
  sessionStorage.setItem('scAdminUnlocked','yes');
  initialize();
}

if(sessionStorage.getItem('scAdminUnlocked')==='yes')unlock();
loginForm?.addEventListener('submit',event=>{
  event.preventDefault();
  if(passwordInput?.value===ADMIN_PASSWORD){unlock();if(passwordInput){passwordInput.value='';}}
  else if(loginError){loginError.textContent='Incorrect password. Please try again.';passwordInput?.select();}
});

document.querySelector('#lock-admin')?.addEventListener('click',()=>{sessionStorage.removeItem('scAdminUnlocked');location.reload();});

function initialize(){
  const blank=()=>({decisions:[],schedule:[]});
  function getData(){
    try{
      const data=JSON.parse(localStorage.getItem(KEY)||'null');
      return data&&Array.isArray(data.decisions)&&Array.isArray(data.schedule)?data:blank();
    }catch{return blank();}
  }
  function setData(data){
    localStorage.setItem(KEY,JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage',{key:KEY,newValue:JSON.stringify(data)}));
    render();
  }

  const decisionForm=document.querySelector('#decision-form');
  const scheduleForm=document.querySelector('#schedule-form');
  const message=document.querySelector('#admin-message');

  function say(text,error=false){
    if(!message)return;
    message.textContent=text;
    message.classList.toggle('error',error);
    clearTimeout(say.timer);
    say.timer=setTimeout(()=>{message.textContent='';message.classList.remove('error');},6000);
  }

  function dateLabel(value){
    if(!value)return 'Date not set';
    const date=new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())?'Date not set':new Intl.DateTimeFormat('en-PH',{day:'numeric',month:'short',year:'numeric'}).format(date);
  }

  function renderList(container,items,type){
    container.replaceChildren();
    items.forEach(item=>{
      const row=document.createElement('article');row.className='managed-item';
      const text=document.createElement('div');text.className='managed-item-text';
      const title=document.createElement('strong');title.textContent=item.title||'Untitled';
      const meta=document.createElement('span');
      meta.textContent=type==='decision'?`${item.docket||'No docket'} · ${item.category||'Other'} · ${dateLabel(item.date)}`:`${item.kind||'Court event'} · ${dateLabel(item.date)}${item.time?` · ${item.time}`:''}${item.venue?` · ${item.venue}`:''}`;
      text.append(title,meta);
      const actions=document.createElement('div');actions.className='managed-item-actions';
      const edit=document.createElement('button');edit.type='button';edit.className='secondary-button';edit.textContent='Edit';
      edit.addEventListener('click',()=>editEntry(item,type));
      const remove=document.createElement('button');remove.type='button';remove.className='danger-button';remove.textContent='Delete';
      remove.addEventListener('click',()=>removeEntry(item,type));
      actions.append(edit,remove);row.append(text,actions);container.append(row);
    });
  }

  function removeEntry(item,type){
    if(!confirm(`Delete “${item.title||'this entry'}”?`))return;
    const data=getData();
    if(type==='decision'){
      data.decisions=data.decisions.filter(entry=>entry.id!==item.id);
      try{
        const opinions=JSON.parse(localStorage.getItem(OPINIONS_KEY)||'[]');
        if(Array.isArray(opinions))localStorage.setItem(OPINIONS_KEY,JSON.stringify(opinions.filter(entry=>!(entry.caseTitle===item.title&&entry.docket===item.docket))));
      }catch{}
      say('Decision and linked opinions deleted.');
    }else{
      data.schedule=data.schedule.filter(entry=>entry.id!==item.id);
      say('Schedule item deleted.');
    }
    setData(data);
  }

  function editEntry(item,type){
    const form=type==='decision'?decisionForm:scheduleForm;
    if(!form)return;
    Object.keys(item).forEach(key=>{if(form.elements[key])form.elements[key].value=item[key]||'';});
    const cancel=document.querySelector(type==='decision'?'.cancel-edit':'#cancel-schedule-edit')||document.querySelector(type==='decision'?'#cancel-edit':'#cancel-schedule-edit');
    if(cancel)cancel.hidden=false;
    form.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function render(){
    const data=getData();
    document.querySelector('#decision-count').textContent=String(data.decisions.length);
    document.querySelector('#schedule-count').textContent=String(data.schedule.length);
    const decisionsContainer=document.querySelector('#admin-decisions');
    const scheduleContainer=document.querySelector('#admin-schedule');
    renderList(decisionsContainer,data.decisions,'decision');
    renderList(scheduleContainer,data.schedule,'schedule');
    document.querySelector('#decision-empty-admin').hidden=data.decisions.length>0;
    document.querySelector('#schedule-empty-admin').hidden=data.schedule.length>0;
  }

  decisionForm?.addEventListener('submit',event=>{
    if(event.defaultPrevented)return;
    event.preventDefault();
    const formData=new FormData(decisionForm);
    const title=String(formData.get('title')||'').trim();
    if(!title){say('Case title is required.',true);return;}
    const id=String(formData.get('id')||'');
    const entry={id:id||crypto.randomUUID?.()||String(Date.now()),title,docket:String(formData.get('docket')||'').trim(),category:String(formData.get('category')||'other'),date:String(formData.get('date')||''),summary:String(formData.get('summary')||'').trim(),decision:String(formData.get('decision')||'').trim()};
    const data=getData();
    const index=data.decisions.findIndex(item=>item.id===id);
    if(index>=0)data.decisions[index]=entry;else data.decisions.unshift(entry);
    setData(data);decisionForm.reset();document.querySelector('#cancel-edit')?.setAttribute('hidden','');say(id?'Decision updated.':'Decision saved.');
  });

  scheduleForm?.addEventListener('submit',event=>{
    event.preventDefault();
    const formData=new FormData(scheduleForm);
    const title=String(formData.get('title')||'').trim();
    if(!title){say('Event title is required.',true);return;}
    const id=String(formData.get('id')||'');
    const entry={id:id||crypto.randomUUID?.()||String(Date.now()),title,kind:String(formData.get('kind')||'').trim(),date:String(formData.get('date')||''),time:String(formData.get('time')||''),venue:String(formData.get('venue')||'').trim()};
    const data=getData();const index=data.schedule.findIndex(item=>item.id===id);
    if(index>=0)data.schedule[index]=entry;else data.schedule.unshift(entry);
    setData(data);scheduleForm.reset();document.querySelector('#cancel-schedule-edit')?.setAttribute('hidden','');say(id?'Schedule item updated.':'Schedule item saved.');
  });

  document.querySelector('#cancel-edit')?.addEventListener('click',()=>{decisionForm?.reset();document.querySelector('#cancel-edit')?.setAttribute('hidden','');});
  document.querySelector('#cancel-schedule-edit')?.addEventListener('click',()=>{scheduleForm?.reset();document.querySelector('#cancel-schedule-edit')?.setAttribute('hidden','');});

  document.querySelectorAll('.admin-tab').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.admin-tab').forEach(tab=>tab.classList.toggle('active',tab===button));
    document.querySelector('#decision-panel').hidden=button.dataset.tab!=='decisions';
    document.querySelector('#schedule-panel').hidden=button.dataset.tab!=='schedule';
  }));

  document.querySelector('#export-data')?.addEventListener('click',()=>{
    const opinions=JSON.parse(localStorage.getItem(OPINIONS_KEY)||'[]');
    const blob=new Blob([JSON.stringify({...getData(),opinions:Array.isArray(opinions)?opinions:[]},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`supreme-court-backup-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url);
  });

  document.querySelector('#import-data')?.addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{
      const data=JSON.parse(await file.text());
      if(!data||!Array.isArray(data.decisions)||!Array.isArray(data.schedule))throw new Error('Invalid backup format');
      localStorage.setItem(KEY,JSON.stringify({decisions:data.decisions,schedule:data.schedule}));
      if(Array.isArray(data.opinions))localStorage.setItem(OPINIONS_KEY,JSON.stringify(data.opinions));
      render();say('Backup imported.');
    }catch{say('Could not import this backup.',true);}finally{event.target.value='';}
  });

  document.querySelector('#clear-data')?.addEventListener('click',()=>{
    if(!confirm('Delete every saved decision, schedule item, and justice opinion?'))return;
    localStorage.setItem(KEY,JSON.stringify(blank()));localStorage.removeItem(OPINIONS_KEY);render();say('All portal entries cleared.');
  });

  document.querySelectorAll('.seal').forEach(seal=>{const image=document.createElement('img');image.src='IMG_b7031dbc-e9a1-45e4-9c98-9395588668b3.png';image.alt='Supreme Court roleplay seal';image.style.cssText='width:82%;height:82%;object-fit:contain';seal.replaceChildren(image);});
  render();
}
