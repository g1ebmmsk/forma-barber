(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const booking = $('#booking');
  const info = $('#demo-info');
  const form = $('#booking-form');
  const serviceSelect = $('#service-select');
  const masterSelect = $('#master-select');
  const flow = $('#booking-flow');
  const success = $('#booking-success');
  const services = {
    cut: {name:'Мужская стрижка',price:2500,duration:60},
    beard: {name:'Борода и контуры',price:1500,duration:40},
    combo: {name:'Полный образ',price:3500,duration:90},
    shave: {name:'Королевское бритьё',price:2000,duration:45}
  };
  const masters = {any:'Любой мастер',mark:'Марк',danil:'Данил',alex:'Алекс'};
  const prices = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  let lastTrigger = null;
  let dates = [];
  const schedule = ['10:00','11:30','13:00','14:30','16:00','17:30','19:00'];
  function makeDateChoices() {
    const host = $('#date-options');
    host.replaceChildren();
    dates = [];
    for (let i=1;i<=7;i++) {
      const date = new Date();
      date.setHours(12,0,0,0);
      date.setDate(date.getDate()+i);
      dates.push(date);
      const label = document.createElement('label');
      label.className = 'date-choice';
      const input = document.createElement('input');
      input.type='radio'; input.name='date'; input.value=String(i-1); input.checked=i===1;
      input.setAttribute('aria-label',date.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'}));
      const span = document.createElement('span');
      const weekday = document.createElement('small');
      weekday.textContent=date.toLocaleDateString('ru-RU',{weekday:'short'});
      span.append(weekday,document.createTextNode(date.getDate()));
      label.append(input,span);host.append(label);
      input.addEventListener('change',renderTimes);
    }
  }
  function renderTimes() {
    const day = Number(new FormData(form).get('date')||0);
    const masterIndex = Object.keys(masters).indexOf(masterSelect.value);
    const serviceIndex = Object.keys(services).indexOf(serviceSelect.value);
    const host = $('#time-options');
    const prior = new FormData(form).get('time');
    host.replaceChildren();
    schedule.forEach((time,i) => {
      const label=document.createElement('label');label.className='time-choice';
      const input=document.createElement('input');input.type='radio';input.name='time';input.value=time;
      input.disabled=(i+day+masterIndex+serviceIndex)%5===2;
      input.checked=time===prior&&!input.disabled;
      input.setAttribute('aria-label',time+(input.disabled?' — недоступно':''));
      const span=document.createElement('span');span.textContent=time;
      label.append(input,span);host.append(label);
      input.addEventListener('change',()=>$('#form-error').textContent='');
    });
    if(!host.querySelector('input:checked')) host.querySelector('input:not(:disabled)').checked=true;
    $('#form-error').textContent='';
  }
  function updateSummary() {
    const selected=services[serviceSelect.value];
    $('#summary-service').textContent=selected.name;
    $('#summary-price').textContent=prices(selected.price);
    $('#summary-duration').textContent=selected.duration+' минут';
  }
  function resetFlow() {flow.hidden=false;success.hidden=true;$('#form-error').textContent='';booking.scrollTop=0;}
  function openBooking(trigger) {
    lastTrigger=trigger;
    resetFlow();
    if(trigger.dataset.service) serviceSelect.value=trigger.dataset.service;
    if(trigger.dataset.master) masterSelect.value=trigger.dataset.master;
    makeDateChoices();renderTimes();updateSummary();
    booking.showModal();document.body.classList.add('modal-open');
  }
  document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>openBooking(button)));
  function closeDialog(dialog) {dialog.close();}
  $('#close-booking').addEventListener('click',()=>closeDialog(booking));
  [booking,info].forEach(dialog=>{
    dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(lastTrigger)lastTrigger.focus();});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  });
  serviceSelect.addEventListener('change',()=>{updateSummary();renderTimes();});
  masterSelect.addEventListener('change',renderTimes);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form);
    const date=dates[Number(data.get('date'))];
    const time=data.get('time');
    if(!date||!time){$('#form-error').textContent='Выбери день и время визита.';return;}
    const service=services[serviceSelect.value];
    const rows=[['Услуга',service.name],['Мастер',masters[masterSelect.value]],['Когда',date.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})+' · '+time],['Продолжительность',service.duration+' минут'],['Стоимость',prices(service.price)]];
    const details=$('#confirmation-details');details.replaceChildren();
    rows.forEach(([key,value])=>{const row=document.createElement('div');row.className='confirmation-row';const a=document.createElement('span');a.textContent=key;const b=document.createElement('span');b.textContent=value;row.append(a,b);details.append(row);});
    flow.hidden=true;success.hidden=false;booking.scrollTop=0;
    $('#book-again').focus({preventScroll:true});
  });
  $('#book-again').addEventListener('click',()=>{resetFlow();serviceSelect.focus({preventScroll:true});});
  const menu=$('#mobile-menu');const toggle=$('.menu-toggle');
  function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');}
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  $('#about-demo').addEventListener('click',event=>{lastTrigger=event.currentTarget;info.showModal();document.body.classList.add('modal-open');});
  $('#close-info').addEventListener('click',()=>info.close());$('#info-done').addEventListener('click',()=>info.close());
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.section-heading,.approach-content h2,.team-intro,.master,.faq-heading,.closing h2,.contact-details,.map-placeholder,.reviews-heading,.review-placeholder').forEach(el=>{el.classList.add('js-reveal');observer.observe(el);});
  }
})();
