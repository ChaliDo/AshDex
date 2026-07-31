(() => {
  const root = document.querySelector('#app');
  const fail = (message, detail='') => {
    root.innerHTML = `<main class="login"><img src="assets/ash-pikachu-transparent.png"><h1>AshDex</h1><p>Uygulama başlatılamadı.</p><small>${esc(message)}</small>${detail?`<small>${esc(detail)}</small>`:''}<button onclick="location.reload()">Try again</button></main>`;
  };
  window.addEventListener('error', e => fail('JavaScript error', e.message || 'Unknown error'));
  window.addEventListener('unhandledrejection', e => fail('Startup error', e.reason?.message || String(e.reason || 'Unknown error')));

  function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  if (!window.firebase) { fail('Firebase libraries could not be loaded.'); return; }
  if (!window.POKEMON && typeof POKEMON === 'undefined') { fail('Pokémon data could not be loaded.'); return; }

  const firebaseConfig={apiKey:'AIzaSyCrjjAQcSA9xI5x9iiqhoi45AT5afhyKJs',authDomain:'ashdex-chalido.firebaseapp.com',projectId:'ashdex-chalido',storageBucket:'ashdex-chalido.firebasestorage.app',messagingSenderId:'753341960916',appId:'1:753341960916:web:49d3a9b509c026f2f7a141',measurementId:'G-WX6BR0F2T6'};
  firebase.initializeApp(firebaseConfig);
  const auth=firebase.auth(), db=firebase.firestore(), provider=new firebase.auth.GoogleAuthProvider();
  db.enablePersistence({synchronizeTabs:true}).catch(()=>{});

  let user=null,profile=null,unsubscribe=null,region='All',query='',friend=null,status='';
  const emptyOwned=()=>Object.fromEntries(POKEMON.map(p=>[p.id,false]));
  const codeFromUid=uid=>'ASH-'+uid.replace(/[^a-z0-9]/gi,'').slice(0,6).toUpperCase();
  async function ensureUser(u){const ref=db.collection('users').doc(u.uid),snap=await ref.get();if(!snap.exists){const trainerCode=codeFromUid(u.uid),data={displayName:u.displayName||'Trainer',photoURL:u.photoURL||'',trainerCode,owned:emptyOwned(),friends:[],createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};await ref.set(data);await db.collection('publicProfiles').doc(trainerCode).set({...data,uid:u.uid});}}
  function render(){if(!user){root.innerHTML=`<main class="login"><img src="assets/ash-pikachu-transparent.png"><h1>AshDex</h1><p>Cloud-synced collection and live friend lookup.</p><button id="login">Continue with Google</button><small>${esc(status)}</small></main>`;document.querySelector('#login').onclick=login;return}if(!profile){root.innerHTML='<div class="loading">Opening your Trainer Card…</div>';return}const owned=profile.owned||emptyOwned(),count=Object.values(owned).filter(Boolean).length,filtered=POKEMON.filter(p=>(region==='All'||p.region===region)&&p.name.toLowerCase().includes(query.toLowerCase()));root.innerHTML=`<div class="app"><header><div><h1>AshDex</h1><p>${count}/${POKEMON.length} collected · ${Math.round(count/POKEMON.length*100)}%</p></div><button id="logout" class="ghost">Sign out</button></header><section class="trainer"><img src="${esc(profile.photoURL||'assets/icon-192.png')}"><div><b>${esc(profile.displayName)}</b><span>Trainer Code: <strong>${esc(profile.trainerCode)}</strong></span></div></section><section class="friends"><h2>Live Friend Lookup</h2><div class="friendAdd"><input id="friendCode" value="" placeholder="ASH-ABC123"><button id="findFriend">Check</button></div>${status?`<p>${esc(status)}</p>`:''}${friend?friendHtml(friend):''}</section><nav class="regions">${REGIONS.map(r=>`<button data-region="${esc(r)}" class="${r===region?'active':''}">${esc(r)}</button>`).join('')}</nav><input id="search" class="search" value="${esc(query)}" placeholder="Search Pokémon…"><main class="grid">${filtered.map(p=>cardHtml(p,owned[p.id])).join('')}</main></div>`;bind();}
  function cardHtml(p,isOwned){return `<article class="card ${isOwned?'owned':''}" data-id="${esc(p.id)}"><div class="check">${isOwned?'✓':''}</div><img src="assets/pokemon/${encodeURI(p.image)}" loading="lazy"><small>#${p.dex} · ${esc(p.region)}</small><h3>${esc(p.name)}</h3>${p.kind||p.note?`<span>${esc(p.kind||p.note)}</span>`:''}</article>`}
  function friendHtml(f){const n=Object.values(f.owned||{}).filter(Boolean).length;return `<div class="friendCard"><img src="${esc(f.photoURL||'assets/icon-192.png')}"><div><b>${esc(f.displayName)}</b><span>${n}/${POKEMON.length} · ${Math.round(n/POKEMON.length*100)}%</span></div></div>`}
  function bind(){document.querySelector('#logout').onclick=()=>auth.signOut();document.querySelector('#search').oninput=e=>{query=e.target.value;render()};document.querySelectorAll('[data-region]').forEach(b=>b.onclick=()=>{region=b.dataset.region;render()});document.querySelectorAll('[data-id]').forEach(c=>c.onclick=()=>toggle(c.dataset.id));document.querySelector('#findFriend').onclick=()=>findFriend(document.querySelector('#friendCode').value);}
  async function login(){status='';try{await auth.signInWithPopup(provider)}catch(e){if(['auth/popup-blocked','auth/cancelled-popup-request','auth/operation-not-supported-in-this-environment'].includes(e.code))await auth.signInWithRedirect(provider);else{status=e.message;render()}}}
  async function toggle(id){const next={...(profile.owned||emptyOwned()),[id]:!(profile.owned||{})[id]};await db.collection('users').doc(user.uid).update({owned:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});await db.collection('publicProfiles').doc(profile.trainerCode).update({owned:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});}
  async function findFriend(value){status='';friend=null;const code=value.trim().toUpperCase();if(!code){status='Enter a Trainer Code.';render();return}const snap=await db.collection('publicProfiles').doc(code).get();if(!snap.exists){status='Trainer code not found.';render();return}friend=snap.data();await db.collection('users').doc(user.uid).update({friends:firebase.firestore.FieldValue.arrayUnion(code)});render();}

  auth.getRedirectResult().catch(()=>{});
  auth.onAuthStateChanged(async u=>{user=u;profile=null;if(unsubscribe){unsubscribe();unsubscribe=null}if(u){try{await ensureUser(u);unsubscribe=db.collection('users').doc(u.uid).onSnapshot(s=>{profile=s.data();render()},e=>{status=e.message;render()})}catch(e){status=e.message;render()}}else render()});
})();
