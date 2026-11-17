import { createClient } from '@supabase/supabase-js';
import './style.css';

const app = document.querySelector('#app');
const cfg = await fetch('/config.js').then(r=>r.text()).catch(()=> '');
if (!window.BAJAWWA_SUPABASE_URL) {
  const s=document.createElement('script'); s.src='/config.js'; document.head.appendChild(s);
  await new Promise(resolve=>s.onload=resolve);
}
const ready = window.BAJAWWA_SUPABASE_URL && !window.BAJAWWA_SUPABASE_URL.startsWith('YOUR_')
  && window.BAJAWWA_SUPABASE_ANON_KEY && !window.BAJAWWA_SUPABASE_ANON_KEY.startsWith('YOUR_');
const db = ready ? createClient(window.BAJAWWA_SUPABASE_URL, window.BAJAWWA_SUPABASE_ANON_KEY) : null;
let lang='en';
const copy={
 en:{tag:'2025 OL BATCH PRESENTS',title:'BAJAWWA',sub:'THE BIG BATCH PARTY',date:'04 JANUARY 2027',venue:'Sundara Hotel',time:'10:00 AM – 4:30 PM',price:'LKR 4,500',left:'Tickets available',name:'Full name',email:'Email address',phone:'Phone number',qty:'Tickets',pay:'Payment method',book:'SUBMIT BOOKING',admin:'ADMIN LOGIN',status:'Booking request only. Your ticket is confirmed after the organiser verifies payment.',methods:['Bank transfer','LankaQR','Visa / Mastercard (gateway setup required)'],adminTitle:'Admin access',send:'Send sign-in link',logout:'Log out',refresh:'Refresh bookings',empty:'No bookings yet.',setup:'Website files are ready, but database setup is still required. Follow SETUP-SI.txt before using this site.'},
 si:{tag:'2025 OL BATCH ඉදිරිපත් කරයි',title:'BAJAWWA',sub:'මහා BATCH PARTY එක',date:'2027 ජනවාරි 04',venue:'Sundara Hotel',time:'පෙ.ව. 10:00 – ප.ව. 4:30',price:'රු. 4,500',left:'ඉතිරි ටිකට්',name:'සම්පූර්ණ නම',email:'Email ලිපිනය',phone:'දුරකථන අංකය',qty:'ටිකට් ගණන',pay:'ගෙවීමේ ක්‍රමය',book:'BOOKING යවන්න',admin:'ADMIN LOGIN',status:'ගෙවීම පරීක්ෂා කිරීමෙන් පසු සංවිධායක විසින් ටිකට් තහවුරු කරනු ඇත.',methods:['Bank transfer','LankaQR','Visa / Mastercard (gateway සකස් කළ යුතුයි)'],adminTitle:'Admin පිවිසුම',send:'Login link යවන්න',logout:'Logout',refresh:'Bookings නැවත බලන්න',empty:'තවම bookings නැහැ.',setup:'Database එක තවම සකස් කර නැහැ. භාවිතයට පෙර SETUP-SI.txt කියවන්න.'}
};
const t=()=>copy[lang];
function shell(){app.innerHTML=`
<header><div class="badge">🔥</div><button id="lang" class="lang">සිංහල / EN</button></header>
<main><section class="hero"><p class="eyebrow">${t().tag}</p><h1>${t().title}</h1><h2>${t().sub}</h2><div class="flame">🐉</div>
<div class="details"><b>${t().date}</b><span>${t().venue}</span><span>${t().time}</span><strong>${t().price}</strong></div></section>
<section class="card"><h2>🎟️ ${lang==='en'?'Book your tickets':'ටිකට් වෙන්කරගන්න'}</h2><p class="muted">${t().status}</p>
<form id="booking"><label>${t().name}<input name="name" required maxlength="100"></label><label>${t().email}<input name="email" type="email" required maxlength="160"></label><label>${t().phone}<input name="phone" required maxlength="30"></label>
<label>${t().qty}<select name="quantity">${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select></label>
<label>${t().pay}<select name="payment"><option>${t().methods[0]}</option><option>${t().methods[1]}</option><option>${t().methods[2]}</option></select></label>
<p class="total">${lang==='en'?'Total':'මුළු මුදල'}: <b id="total">LKR 4,500</b></p><button class="primary">${t().book}</button><p id="bookingMsg" class="muted"></p></form></section>
<section class="admin card"><button id="adminToggle" class="outline">${t().admin}</button><div id="adminPanel" hidden><h3>${t().adminTitle}</h3><p class="muted">Only the authorised organiser account can sign in.</p><form id="login"><input name="adminEmail" type="email" value="abinuweerakoon29@gmail.com" readonly><button class="primary">${t().send}</button></form><p id="adminMsg"></p><div id="dashboard"></div></div></section>
</main><footer>BAJAWWA • 2027</footer>`;
document.querySelector('#lang').onclick=()=>{lang=lang==='en'?'si':'en';shell()};
document.querySelector('#adminToggle').onclick=()=>document.querySelector('#adminPanel').hidden=!document.querySelector('#adminPanel').hidden;
const qty=document.querySelector('[name=quantity]'); qty.onchange=()=>document.querySelector('#total').textContent='LKR '+(4500*Number(qty.value)).toLocaleString('en-US');
document.querySelector('#booking').onsubmit=submitBooking;
document.querySelector('#login').onsubmit=login;
}
async function submitBooking(e){e.preventDefault();const msg=document.querySelector('#bookingMsg');if(!db){msg.textContent=t().setup;return}
const f=new FormData(e.target), quantity=Number(f.get('quantity'));
const {data,error}=await db.rpc('create_bajawwa_booking',{p_name:f.get('name'),p_email:f.get('email'),p_phone:f.get('phone'),p_quantity:quantity,p_payment:f.get('payment')});
msg.textContent=error?error.message:`Booking request received. Reference: ${data}. Pay only using verified organiser instructions.`;
if(!error)e.target.reset();document.querySelector('#total').textContent='LKR 4,500';
}
async function login(e){e.preventDefault();const msg=document.querySelector('#adminMsg');if(!db){msg.textContent=t().setup;return}
const {error}=await db.auth.signInWithOtp({email:'abinuweerakoon29@gmail.com',options:{emailRedirectTo:location.origin}});
msg.textContent=error?error.message:'Sign-in link sent to your email. Open it on this device.';
}
async function dashboard(session){const box=document.querySelector('#dashboard');if(!session){box.innerHTML='';return}
const {data,error}=await db.from('bookings').select('id,created_at,customer_name,email,phone,quantity,payment_method,status').order('created_at',{ascending:false});
box.innerHTML=`<button id="refresh" class="outline">${t().refresh}</button> <button id="logout" class="outline">${t().logout}</button><div class="tablewrap"><table><thead><tr><th>Name</th><th>Qty</th><th>Payment</th><th>Status</th></tr></thead><tbody>${(data||[]).map(x=>`<tr><td>${escapeHtml(x.customer_name)}<small>${escapeHtml(x.email)}</small></td><td>${x.quantity}</td><td>${escapeHtml(x.payment_method)}</td><td>${escapeHtml(x.status)}</td></tr>`).join('')}</tbody></table></div>${error?error.message:(!data?.length?t().empty:'')}`;
document.querySelector('#refresh').onclick=()=>dashboard(session);
document.querySelector('#logout').onclick=async()=>{await db.auth.signOut();document.querySelector('#adminMsg').textContent='Signed out.';dashboard(null)};
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
shell();
if(db){db.auth.onAuthStateChange((_event,session)=>{if(session)dashboard(session);});db.auth.getSession().then(({data})=>{if(data.session)dashboard(data.session)});}
