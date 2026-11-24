const records=[
{id:1,name:"محدوده نمونه چشمه‌سفید",owner:"شرکت توسعه معدن نمونه",mineral:"سنگ تزئینی",status:"دارای مجوز (نمونه)",center:[32.72,51.68],corners:[[32.75,51.64],[32.75,51.72],[32.69,51.72],[32.69,51.64]]},
{id:2,name:"محدوده نمونه کوه‌زر",owner:"حسین برقی (اطلاعات فرضی)",mineral:"آهن",status:"آزاد (نمونه)",center:[34.08,49.72],corners:[[34.11,49.68],[34.11,49.76],[34.05,49.76],[34.05,49.68]]},
{id:3,name:"محدوده نمونه دشت‌سیلیس",owner:"نامشخص ـ داده نمایشی",mineral:"سیلیس",status:"آزاد (نمونه)",center:[35.2,52.1],corners:[[35.23,52.06],[35.23,52.14],[35.17,52.14],[35.17,52.06]]},
{id:4,name:"محدوده نمونه مس‌کوه",owner:"شرکت معدنی فرضی",mineral:"مس",status:"دارای مجوز (نمونه)",center:[30.28,56.98],corners:[[30.31,56.94],[30.31,57.02],[30.25,57.02],[30.25,56.94]]}
];
const map=L.map('map').setView([32.5,53.2],5);
const streets=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
const imagery=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri'});
let shapes=[],selected=1;
const list=document.getElementById('list'),details=document.getElementById('details');
function color(r){return r.status.startsWith('آزاد')?'#4bb58b':'#d6a84e'}
function draw(){shapes.forEach(x=>map.removeLayer(x));shapes=[];records.forEach(r=>{const p=L.polygon(r.corners,{color:color(r),weight:r.id===selected?4:2,fillOpacity:.18}).addTo(map).bindPopup('<b>'+r.name+'</b><br>'+r.mineral+' · '+r.status);p.on('click',()=>select(r.id));shapes.push(p)});renderList()}
function renderList(){const q=document.getElementById('search').value.trim();const s=document.getElementById('statusFilter').value,t=document.getElementById('typeFilter').value;const found=records.filter(r=>(!q||(r.name+r.owner+r.mineral).includes(q))&&(!s||r.status===s)&&(!t||r.mineral===t));document.getElementById('count').textContent=found.length+' مورد';list.innerHTML=found.map(r=>'<div class="item '+(r.id===selected?'active':'')+'" data-id="'+r.id+'"><b>'+r.name+'</b><small>'+r.mineral+' · '+r.owner+'</small><span class="tag">'+r.status+'</span></div>').join('');list.querySelectorAll('.item').forEach(el=>el.onclick=()=>select(+el.dataset.id))}
function select(id){selected=id;const r=records.find(x=>x.id===id);if(!r)return;map.fitBounds(r.corners,{padding:[35,35]});details.innerHTML='<div class="section-title">پرونده محدوده</div><h3>'+r.name+'</h3><div class="detail-card"><label>وضعیت</label><strong>'+r.status+'</strong></div><div class="detail-card"><label>دارنده / مالک نمایشی</label><strong>'+r.owner+'</strong></div><div class="detail-card"><label>ماده معدنی</label><strong>'+r.mineral+'</strong></div><div class="detail-card"><label>مرکز تقریبی (Lat, Lon)</label><strong>'+r.center.join(', ')+'</strong></div><div class="detail-card"><label>مختصات گوشه‌ها (Lat, Lon)</label><div class="points">'+r.corners.map((p,i)=>(i+1)+'. '+p.join(', ')).join('\n')+'</div></div><p class="empty">همه داده‌های این پرونده فرضی هستند و تأییدیه کاداستر رسمی محسوب نمی‌شوند.</p>';draw()}
['search','statusFilter','typeFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',renderList));
document.getElementById('satellite').onclick=()=>{if(map.hasLayer(imagery)){map.removeLayer(imagery);streets.addTo(map)}else{map.removeLayer(streets);imagery.addTo(map)}};
document.getElementById('locate').onclick=()=>map.locate({setView:true,maxZoom:12});
map.on('locationfound',e=>L.marker(e.latlng).addTo(map).bindPopup('موقعیت تقریبی دستگاه شما').openPopup());
map.on('locationerror',()=>alert('دسترسی مکان‌یابی فعال نیست یا توسط مرورگر مسدود شده است.'));
map.on('click',e=>document.getElementById('coords').textContent='Lat: '+e.latlng.lat.toFixed(6)+' | Lon: '+e.latlng.lng.toFixed(6));
document.getElementById('export').onclick=()=>{const features=records.map(r=>({type:'Feature',properties:{name:r.name,mineral:r.mineral,status:r.status,note:'DEMO DATA - NOT OFFICIAL'},geometry:{type:'Polygon',coordinates:[[...r.corners.map(p=>[p[1],p[0]]),[r.corners[0][1],r.corners[0][0]]]]}}));const blob=new Blob([JSON.stringify({type:'FeatureCollection',features},null,2)],{type:'application/geo+json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minecadastre-demo.geojson';a.click();URL.revokeObjectURL(a.href)};
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;const b=document.getElementById('installBtn');b.hidden=false;b.onclick=async()=>{installPrompt.prompt();installPrompt=null;b.hidden=true}});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
draw();select(1);