(function(){

// geometry (viewBox units)
const CX=560, BACK=150, RX=440, RY=370, START=520, SPAN=2*START;
const ROWS={"R-H0":.14,"L-H0":.29,"R-L0":.44,"L-L0":.59};   // lines a little apart, so the two groups don't brush past each other mid-stage
const PIOD=.62, PIO_RUN=.72, PIO_FROM=-.13;
const ENTRY=.12, BOWD=.08+.064*2*RX/RY,   // bow line a further 6.4% of the floor width away from the stage
      FILEGAP=40, LANEGAP=74, FREEZE_OUT=.2;   // LANEGAP: space between people in a line at the freezes
const BOW_HW=330;   // bow line half-width: a bit wider than the stage (300), dots close together
const AMP=.15, DC2=30, DZ2=.05*RY;   // second slow-down: a little further out, a little towards the audience

const BOW=SECTIONS.findIndex(s=>s.id==="bow");
let state={bpm:91,bpb:4,cross:8,pioJoin:8,beats:SECTIONS.map(s=>s.beats),tags:SECTIONS.map(s=>s.tag)};
try{const sv=JSON.parse(localStorage.getItem("blocking-v3")||"null");if(sv&&sv.beats&&sv.beats.length===SECTIONS.length){if(sv.beats[BOW]===20)sv.beats[BOW]=17;state=sv;if(state.pioJoin==null||state.pioJoin===16||state.pioJoin===24)state.pioJoin=8;}
if(!Array.isArray(state.tags)||state.tags.length!==SECTIONS.length)state.tags=SECTIONS.map(s=>s.tag);
if(!state.pre28){if(state.beats[0]<=4&&state.beats[1]<=6){state.beats[0]=2;state.beats[1]=8;}state.pre28=1;}   // Pio dies 2 + guitar 8 beats; count 1 stays on the song's 1
if(!state.ciPio){if(state.beats[0]===2)state.beats[0]=4;state.tags[0]=SECTIONS[0].tag;state.ciPio=1;}   // count-in merged into Pio dies
state.tags=state.tags.map((x,i)=>x==="Run · high & low shapes"||x==="Freeze"||x==="Move edge to edge"||x==="Freeze striking a pose"||x==="Strike a scary pose"?SECTIONS[i].tag:x);}catch(e){}
function save(){try{localStorage.setItem("blocking-v3",JSON.stringify(state));}catch(e){}}

// build dancers
const dancers=[];
function build(list,side){
  let h=0,l=0;
  list.forEach(([name,type,resp],i)=>{
    const k=type==="H"?h++:l++;
    dancers.push({name,type,resp:!!resp,side,file:i,lane:`${side}-${type}0`,order:k});
  });
}
build(RIGHT,"R");build(LEFT,"L");
dancers.push({name:"Pio",type:"P",pio:true,side:"P"});

const NS="http://www.w3.org/2000/svg";
const svg=document.getElementById("stage");
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;}
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// stage drawing
el("rect",{x:0,y:0,width:1120,height:560,fill:"var(--floor)"});
el("rect",{x:CX-300,y:BACK-104,width:600,height:50,rx:3,fill:"color-mix(in srgb,var(--onfloor) 12%,transparent)",stroke:"var(--floor-edge)","stroke-width":2});
el("rect",{x:CX-300,y:BACK-50,width:600,height:46,rx:3,fill:"color-mix(in srgb,var(--onfloor) 7%,transparent)",stroke:"var(--floor-edge)","stroke-width":2});
el("rect",{x:CX-START-38,y:BACK-8,width:76,height:398,rx:8,fill:"none",stroke:"var(--floor-edge)","stroke-dasharray":"5 5"});
el("rect",{x:CX+START-38,y:BACK-8,width:76,height:398,rx:8,fill:"none",stroke:"var(--floor-edge)","stroke-dasharray":"5 5"});
el("path",{d:`M${CX-RX},${BACK} A${RX},${RY} 0 0 0 ${CX+RX},${BACK} Z`,fill:"color-mix(in srgb,var(--onfloor) 6%,transparent)",stroke:"var(--floor-edge)","stroke-width":2});
el("line",{x1:CX,y1:BACK,x2:CX,y2:BACK+RY,stroke:"var(--floor-edge)","stroke-dasharray":"2 8"});
const lbl=(x,y,t,anchor)=>{const e=el("text",{x,y,"text-anchor":anchor||"middle",fill:"var(--onfloor-dim)","font-family":"Archivo, sans-serif","font-size":15,"letter-spacing":"2"});e.textContent=t;return e;};
lbl(6,BACK-20,"LUNA'S WING","start");lbl(1114,BACK-20,"DUNCAN'S WING","end");
lbl(CX,BACK-22,"STAGE");lbl(CX,BACK+RY+34,"AUDIENCE");
lbl(CX-RX+6,BACK+RY*.16,"HIGH","start");lbl(CX-RX+30,BACK+RY*.35,"LOW","start");
const banner=el("text",{x:CX,y:BACK+RY*.84,"text-anchor":"middle",fill:"var(--freeze)","font-family":"Archivo, sans-serif","font-weight":700,"font-size":28,"letter-spacing":"5",opacity:0});
banner.textContent="FREEZE";
const caption=el("text",{x:CX,y:BACK+RY*.84+30,"text-anchor":"middle",fill:"var(--onfloor-dim)","font-family":"Archivo, sans-serif","font-size":16,opacity:0});

const layer=el("g",{});
svg.append(banner,caption);   // tag text drawn above the dancers
// comic "STRIKE SHAPE" burst at centre on the first beat of each strike-shape moment (drawn above the dancers)
// big count 1 2 3 4 1 2 3 4 through "Guitar picks up", with GO on the beat they leave (drawn above the dancers)
const POW_Y=BACK+RY*.24, pow=el("g",{opacity:0});
{const pts=[];for(let i=0;i<28;i++){const a=i/28*2*Math.PI, r=i%2?44:70+(i%4?0:8);pts.push((r*1.45*Math.cos(a)).toFixed(1)+","+(r*Math.sin(a)).toFixed(1));}
 el("polygon",{points:pts.join(" "),fill:"#ffd23f",stroke:"#1b1b1f","stroke-width":3,"stroke-linejoin":"round"},pow);
 for(const [y,w] of [[-4,"STRIKE"],[22,"SHAPE"]]){const tx=el("text",{"text-anchor":"middle",y,fill:"#d7261e",stroke:"#1b1b1f","stroke-width":1.5,"font-family":"Archivo, sans-serif","font-weight":900,"font-size":26,"letter-spacing":"1"},pow);tx.textContent=w;}}
dancers.forEach(d=>{
  const g=el("g",{},layer);
  const col=d.pio?"var(--pio)":d.side==="R"?"var(--right)":"var(--left)";
  const r=d.pio?13:d.type==="H"?12:11, solid=d.type!=="L";
  if(d.resp) el("circle",{r:16.5,fill:"none",stroke:col,"stroke-width":1.5,"stroke-dasharray":"3 2"},g);
  d.dot=el("circle",{r,fill:solid?col:"var(--floor)",stroke:col,"stroke-width":2.5},g);
  const t=el("text",{"text-anchor":"middle",y:3.5,"font-size":d.pio?10:9,fill:solid?"var(--floor)":col,"font-family":"Archivo, sans-serif","font-weight":700},g);
  t.textContent=d.name.slice(0,3);
  const tt=el("title",{},g);tt.textContent=d.name+(d.pio?"":d.type==="H"?" (high)":" (low)");
  d.g=g;
});

const bigCount=el("text",{"text-anchor":"middle",y:40,fill:"var(--onfloor)",stroke:"var(--floor)","stroke-width":4,"paint-order":"stroke","font-family":"Archivo, sans-serif","font-weight":900,"font-size":120,opacity:0});

// timing
function bounds(){let t=0;return state.beats.map(b=>{const s=t;t+=b;return[s,t];});}
function total(){return state.beats.reduce((a,b)=>a+b,0);}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const lerp=(a,b,u)=>a+(b-a)*u;

const laneCount={};dancers.filter(d=>!d.pio).forEach(d=>laneCount[d.lane]=(laneCount[d.lane]||0)+1);
const hw=d=>RX*Math.sqrt(1-d*d);
const laneEdge=l=>hw(ROWS[l])-(laneCount[l]-1)*LANEGAP/2-22;
const prof=u=>u+AMP*Math.sin(2*Math.PI*u)/(2*Math.PI);   // speed = 1+AMP·cos → fast at edges, slowest mid-stage
const spd=u=>1+AMP*Math.cos(2*Math.PI*u);
// Each line runs a super-elongated loop: a long straight (fast at the ends, slowest mid-stage),
// then a half-circle turn that swings up/downstage by LOOP_A before running back.
// LOOP_A is kept small, so each line's way out and way back stay inside its own band, clear of the next line.
// TURN_OUT: how far from centre the turns reach - just a little past the end of the stage (300)
const LOOP_A=.035*RY, TURN_R=62, STRAIGHT=.78, TURN_OUT=315, RUN_E=TURN_OUT-TURN_R, FILE_DELAY=.35, QSPEED=FILEGAP/.35;
// warp for the first run (wing to far side): puts the middle at fraction f0 of it
const warpCache={};
function firstWarp(E,f0){
  const key=E+"|"+f0;if(warpCache[key]!==undefined)return warpCache[key];
  const s=START/(E+START);let lo=0,hi=1;
  for(let i=0;i<40;i++){const m=(lo+hi)/2;if(prof(m)<s)lo=m;else hi=m;}
  return warpCache[key]=clamp((lo-f0)/(f0*(1-f0)),-.5,.5);   // capped so the run never nearly stops before the turn
}
function loopAt(c,E,d0){
  const C=Math.max(.5,state.cross), k=Math.floor(c), u=c-k;
  const dir=k%2===0?d0:-d0, sgn=k%2===0?-1:1;
  if(u<STRAIGHT){
    const uu=u/STRAIGHT, from=-dir*E, to=dir*E;
    return {x:from+(to-from)*prof(uu),dy:sgn*LOOP_A,dir,v:Math.abs(to-from)/(C*STRAIGHT)*spd(uu),E};
  }
  const al=(u-STRAIGHT)/(1-STRAIGHT)*Math.PI, w=Math.PI/(C*(1-STRAIGHT));
  return {x:dir*E+dir*TURN_R*Math.sin(al),dy:sgn*LOOP_A*Math.cos(al),dir:Math.cos(al)>=0?dir:-dir,v:TURN_R*w*Math.abs(Math.cos(al)),E};
}
// The loop is timed so the leaders cross centre LEAD_PAST beats before count 1 of the run-in, and every
// return crossing lands the same way before its strike. lead() is where that loop would have started.
const lead=()=>Math.max(.5,state.cross)*STRAIGHT/2+LEAD_PAST;
// Everyone leaves the wing together on the pickup (pickupT() beats before count 1); the first run, wing to the
// far side, is warped so the leaders still cross centre LEAD_PAST beats before count 1.
// beats before count 1 of the run-in that everyone leaves: the last guitar bar plus the pickup
const pickupT=()=>state.bpb+(state.pickup??PICKUP_BEATS);
function crossing(lane,d0,tau){
  const PICKUP=pickupT(), C=Math.max(.5,state.cross), E=RUN_E, T1=PICKUP+C*STRAIGHT-lead(), r=tau+PICKUP;
  if(r<0) return {x:-d0*(START-r*QSPEED),dy:-LOOP_A,dir:d0,v:0,E};
  if(r<T1){
    const a=firstWarp(E,(PICKUP-LEAD_PAST)/T1), uu=r/T1, w=uu+a*uu*(1-uu);
    return {x:-d0*START+d0*(E+START)*prof(w),dy:-LOOP_A,dir:d0,v:(E+START)/T1*spd(w)*(1+a*(1-2*uu)),E};
  }
  return loopAt((tau+lead())/C,E,d0);
}
// "beat to beat": beats in, beats of travel out. Everyone makes the same steps, a long leap then a short one
// (65% / 35% of each two-beat stretch); within a beat a hit of acceleration on the beat, then keep moving
// through to the next one. Lands on whole even beats, so the strikes stay where they were.
const BEAT_STEPS=[1.3,.7];
function beatWarp(r){
  const b=Math.floor(r),u=r-b,h=Math.min(1,u/.35),p=((b%2)+2)%2;
  return Math.floor(b/2)*2+(p?BEAT_STEPS[0]:0)+BEAT_STEPS[p]*(.5*(1-(1-h)*(1-h))+.5*u);
}
// Pio: holds centre, then runs in step with the smaller side's lines. He joins the first time
// their leaders pass mid-stage after pioJoin beats, so he steps off his mark at x=0 with them.
const PIO_D0=LEFT.length<=RIGHT.length?1:-1;
function pioJoinAt(){
  const C=Math.max(.5,state.cross);
  return Math.max(1,Math.ceil(state.pioJoin/C-STRAIGHT/2))*C+STRAIGHT/2*C;
}
function pioCrossing(tau){
  tau+=lead();
  const C=Math.max(.5,state.cross), E=RUN_E, tj=tau-pioJoinAt();
  if(tj<0) return {x:0,dy:0,dir:PIO_D0,v:0,E,still:1};
  const r=loopAt(tau/C,E,PIO_D0);
  // fade Pio's loop offset in over the first beat so Pio doesn't jump sideways off the mark,
  // and over two beats move him up from his mark to run just in front of the low lines
  r.dy=r.dy*clamp(tj,0,1)+(PIO_RUN-PIOD)*RY*ease(clamp(tj/2,0,1)); return r;
}
// slot: place in the lane at the first freeze, in LANEGAPs from centre, leader furthest ahead
// Beats (from 0) when the run's leaders cross centre, snapped to the nearest count 1, only inside Run in & cross; cached per setting
let midCache={};
function midBeats(){
  const P0=state.beats[0]+state.beats[1], end=state.beats[2], key=[state.cross,P0,end,lead(),pickupT()].join();
  if(midCache.key===key)return midCache.v;
  const v=[];let prev=crossing("R-H0",-1,-pickupT()).x;
  for(let tb=-pickupT()+.05;tb<end;tb+=.05){const x=crossing("R-H0",-1,tb).x;if(prev<0!==x<0){const b=P0+Math.max(0,Math.round(tb/state.bpb)*state.bpb);if(b<P0+end&&!v.includes(b))v.push(b);}prev=x;}
  midCache={key,v};return v;
}
function follow(cross,tb,slot){
  const B=state.beats.slice(2);
  if(tb<=B[0]){const r=cross(tb);return {x:r.x,dy:r.dy};}
  const st=cross(B[0]); let x=st.x, t=tb-B[0];
  const lim=st.E+TURN_R;
  const room=dx=>Math.max(0,(st.dir>0?lim-dx:dx+lim)*.9);
  // first slow-down: everyone drifts in to the middle of the stage instead of on to the edges
  const xt=st.dir*slot*LANEGAP;
  const out=xx=>({x:xx,dy:st.dy});
  if(t<B[1]){const u=t/B[1];return out(lerp(x,xt,1-(1-u)*(1-u)));}
  x=xt;t-=B[1];
  if(t<B[2])return out(x); t-=B[2];
  const d2=st.v>0?Math.min(DC2,room(x)):0, out2=(xx,k)=>({x:xx,dy:st.dy+DZ2*k});
  if(t<B[3]){const u=t/B[3], k=1-(1-u)*(1-u);return out2(x+st.dir*d2*k,k);}
  return out2(x+st.dir*d2,1);
}
function travelPos(d,tAbs){
  const W=state.beats[0], P0=W+state.beats[1];
  // from the first slow-down on, everyone drifts FREEZE_OUT further from the stage, ready for the freezes
  const fo=1+FREEZE_OUT*ease(clamp((tAbs-P0-state.beats[2])/(state.beats[3]||1),0,1));
  if(d.pio){if(tAbs<P0)return {x:0,depth:PIOD};const r=follow(tau=>pioCrossing(beatWarp(tau)),tAbs-P0,0);return {x:r.x,depth:(PIOD+r.dy/RY)*fo};}
  const tb=tAbs-P0, d0=d.side==="R"?-1:1, delay=d.file*FILE_DELAY;
  // before the run-in (count-in, Pio dies, guitar cue) everyone already stands in line in the wing
  const r=follow(tau=>crossing(d.lane,d0,beatWarp(tau)-delay),Math.max(-pickupT(),tb),(laneCount[d.lane]-1)/2-d.order);
  // still waiting: an L in the wing - the first two side by side at the top, the rest down the wing under the second
  const x=r.x, q=Math.abs(x)-START;
  // (columns 40 apart, shifted 20 inwards so both sit inside the wing; the shift fades out over the first steps of the run)
  if(q>0) return q<=FILEGAP?{x:Math.sign(x)*(START-20+q),depth:ENTRY}:{x:Math.sign(x)*(START+20),depth:ENTRY+(q-FILEGAP)/RY};
  const xs=q>-30?x-Math.sign(x)*20*(1+q/30):x;
  const inside=ease(clamp((START-Math.abs(x))/150,0,1));
  return {x:xs,depth:(lerp(ENTRY,ROWS[d.lane],inside)+r.dy/RY*inside)*fo};
}
function positions(tb){
  const bd=bounds(), bowStart=bd[BOW][0], TBow=state.beats[BOW];
  if(tb<bowStart) return dancers.map(d=>travelPos(d,tb));
  const frozen=dancers.map(d=>travelPos(d,bowStart));
  const idx=frozen.map((p,i)=>i).sort((a,b)=>frozen[a].x-frozen[b].x);
  const n=dancers.length, hw=BOW_HW, sp=2*hw/(n-1);
  const out=new Array(n);
  const tau=tb-bowStart, u=TBow>0?ease(clamp(tau/(TBow*.7),0,1)):1;
  idx.forEach((di,k)=>{const f=frozen[di];out[di]={x:lerp(f.x,-hw+k*sp,u),depth:lerp(f.depth,BOWD,u)};});
  return out;
}

// UI
const rowsEl=document.getElementById("rows"), strip=document.getElementById("strip"), ph=document.getElementById("ph");
const scrub=document.getElementById("scrub");
function renderTable(){
  rowsEl.innerHTML="";strip.querySelectorAll(".seg").forEach(n=>n.remove());
  const T=total()||1;
  SECTIONS.forEach((s,i)=>{
    const tr=document.createElement("tr");tr.id="row-"+i;
    tr.innerHTML=`<td><b>${s.name}</b></td><td class="d">${s.desc}</td><td><input type="text" class="tagin" id="tag-${s.id}-${i}" aria-label="${s.name} tag"></td><td><input type="number" id="beats-${s.id}-${i}" min="0" max="128" value="${state.beats[i]}" aria-label="${s.name} beats"></td><td class="bars"></td>`;
    rowsEl.appendChild(tr);
    const tg=tr.querySelector(".tagin");tg.value=state.tags[i]||"";
    tg.addEventListener("input",()=>{state.tags[i]=tg.value;save();draw();});
    tr.querySelector("input[type=number]").addEventListener("change",ev=>{state.beats[i]=Math.max(0,Math.round(+ev.target.value||0));save();renderTable();});
    const seg=document.createElement("div");seg.className="seg"+(s.fz?" fz":"");seg.id="seg-"+i;
    seg.style.flex=`${state.beats[i]} 0 0`;seg.textContent=state.beats[i]?s.name:"";
    seg.addEventListener("click",()=>{t=bounds()[i][0];started=true;draw();});
    strip.insertBefore(seg,ph);
  });
  updateBars();
  scrub.min=startT(); scrub.max=T; if(t>T)t=T; draw();
}
function updateBars(){
  SECTIONS.forEach((s,i)=>{document.querySelector(`#row-${i} .bars`).textContent=+(state.beats[i]/state.bpb).toFixed(2);});
  const T=total(), sec=T*60/state.bpm;
  document.getElementById("total").textContent=`Total ${T} beats · ${+(T/state.bpb).toFixed(2)} bars · ${Math.floor(sec/60)}:${String(Math.round(sec%60)).padStart(2,"0")} at ${state.bpm} BPM`;
}
const cast=document.getElementById("cast");
[["Left side",LEFT,"var(--left)"],["Right side",RIGHT,"var(--right)"],["Centre",[["Pio","C"]],"var(--pio)"]].forEach(([h,list,c])=>{
  const d=document.createElement("div");
  d.innerHTML=`<h3 style="color:${c}">${h}</h3><ul>${list.map(([n,ty,r])=>`<li><span class="sw" style="background:${ty!=="L"?c:"transparent"};border:2px solid ${c}"></span>${n}<span class="tag">${ty==="H"?"high":ty==="L"?"low":"centre"}</span>${r?'<span class="tag">responsible for forming line</span>':""}</li>`).join("")}</ul>`;
  cast.appendChild(d);
});

// Counts follow the song's bars: count 1 of the run-in is a 1.
const countAt=b=>{const n=state.bpb,r=b-(state.beats[0]+state.beats[1]);return ((r%n)+n)%n+1;};
let t=0, started=false, playing=false, last=0, clickOn=false, actx=null, lastBeat=-1;
const bpmIn=document.getElementById("bpm"), bpbIn=document.getElementById("bpb");
bpmIn.value=state.bpm;bpbIn.value=state.bpb;
bpmIn.addEventListener("change",()=>{state.bpm=clamp(+bpmIn.value||91,40,240);bpmIn.value=state.bpm;save();updateBars();});
const pjIn=document.getElementById("piojoin");pjIn.value=state.pioJoin;
pjIn.addEventListener("change",()=>{state.pioJoin=clamp(Math.round(+pjIn.value)||0,0,128);pjIn.value=state.pioJoin;save();draw();});
const crossIn=document.getElementById("cross");crossIn.value=state.cross;
crossIn.addEventListener("change",()=>{state.cross=clamp(Math.round(+crossIn.value)||8,1,32);crossIn.value=state.cross;save();draw();});
bpbIn.addEventListener("change",()=>{state.bpb=clamp(Math.round(+bpbIn.value)||4,1,12);bpbIn.value=state.bpb;save();renderTable();});

function tick(accent){
  if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();
  o.frequency.value=accent?1500:1000;g.gain.setValueAtTime(.25,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.06);
  o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+.07);
}
const audio=new Audio(); audio.preservesPitch=true; let hasSong=true;
audio.src=location.protocol==="file:"?"../audio/dope-show.mp3":"/audio/dope-show.mp3";
audio.addEventListener("error",()=>{hasSong=false;});
const speedSel=document.getElementById("speed");
const pickupBtns=[...document.querySelectorAll("#pickup button[data-p]")];
function showPickup(){const p=state.pickup??PICKUP_BEATS;pickupBtns.forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.p===p)));}
pickupBtns.forEach(b=>b.addEventListener("click",()=>{state.pickup=+b.dataset.p;save();showPickup();draw();}));
showPickup();
{const dlg=document.getElementById("pickup-dlg");document.getElementById("pickup-info").addEventListener("click",()=>dlg.showModal());
 dlg.addEventListener("click",e=>{const r=dlg.getBoundingClientRect();   // tap outside the box closes
   if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close();});}
const offset=191;   // song time (3:11) of count 1 of the run-in
const beatSec=()=>60/state.bpm;
const preRun=()=>state.beats[0]+state.beats[1];
const songAt=tt=>offset+(tt-preRun())*beatSec();
function syncAudio(){audio.playbackRate=+speedSel.value;const at=songAt(t);if(at>=0)audio.currentTime=at;}
speedSel.addEventListener("change",()=>{audio.playbackRate=+speedSel.value;});

const notesEl=document.getElementById("notes");
// the 4 running lines, back (stage) to front (audience), drawn with the same dots as the stage plot
function linesFig(){
  const lanes=Object.keys(ROWS).sort((a,b)=>ROWS[a]-ROWS[b]), RH=40, top=26, DX=200, GAP=42;
  const maxN=Math.max(...lanes.map(l=>laneCount[l])), W=DX+(maxN-1)*GAP+52;
  const f=document.createElementNS(NS,"svg");f.setAttribute("viewBox",`0 0 ${W} ${top+lanes.length*RH+22}`);f.setAttribute("class","linesfig");
  f.setAttribute("role","img");f.setAttribute("aria-label","Line order from the stage: Duncan high, Luna high, Duncan low, Luna low");
  el("text",{x:W/2,y:14,"text-anchor":"middle",class:"lb"},f).textContent="STAGE";
  lanes.forEach((ln,r)=>{
    const y=top+r*RH+RH/2, R=ln[0]==="R", col=R?"var(--right)":"var(--left)", hi=ln[2]==="H";
    el("text",{x:8,y:y+4,fill:col,class:"ln"},f).textContent=(R?"Duncan":"Luna")+" group · "+(hi?"high":"low");
    const ms=dancers.filter(d=>d.lane===ln), n=ms.length;
    ms.forEach((d,k)=>{
      // 1 = front of the line: the dot furthest in the running direction
      const pos=R?k:n-1-k, g=el("g",{transform:`translate(${DX+pos*GAP},${y})`},f);
      el("circle",{r:13,fill:hi?col:"var(--floor)",stroke:col,"stroke-width":2.5},g);
      el("text",{"text-anchor":"middle",y:3.5,"font-size":9,fill:hi?"var(--floor)":col,"font-family":"Archivo, sans-serif","font-weight":700},g).textContent=d.name.slice(0,3);
    });
    for(const x of [DX-32,DX+(maxN-1)*GAP+32])el("text",{x,y:y+6,"text-anchor":"middle",fill:col,"font-size":20},f).textContent=R?"←":"→";
  });
  el("text",{x:W/2,y:top+lanes.length*RH+16,"text-anchor":"middle",class:"lb"},f).textContent="AUDIENCE";
  return f;
}
// "beat to beat": Duncan and Luna dots move in bursts, a long leap then a short one, and the leaders
// are a bit past the middle on the first strike (count 1 of the run-in), then cross. Follows the playhead;
// before Play it holds still on the start marks.
let beatRefs=null, beatEnd=null;   // beatEnd: the beat-to-beat Play stops at the end of the run & cross
function beatFig(){
  const W=520,H=168,f=document.createElementNS(NS,"svg");f.setAttribute("viewBox",`0 0 ${W} ${H}`);f.setAttribute("class","linesfig");
  f.setAttribute("role","img");f.setAttribute("aria-label","Three Duncan dots and three Luna dots moving towards each other in hits on the beat, and crossing");
  el("line",{x1:W/2,y1:8,x2:W/2,y2:H-26,stroke:"var(--floor-edge)","stroke-dasharray":"2 6"},f);
  const mk=(y,col,d)=>{const g=el("g",{},f);el("circle",{r:13,fill:col,stroke:col,"stroke-width":2.5},g);
    el("text",{"text-anchor":"middle",y:3.5,"font-size":9,fill:"var(--floor)","font-family":"Archivo, sans-serif","font-weight":700},g).textContent=d.name.slice(0,3);return {g,y};};
  const hiR=dancers.filter(d=>d.lane==="R-H0"), hiL=dancers.filter(d=>d.lane==="L-H0");
  // each group keeps its out and back tracks close together, with clear space between the groups: Duncan 28/60, Luna 100/132
  const dun=[0,1,2].map(i=>mk(28,"var(--right)",hiR[i])), lun=[0,1,2].map(i=>mk(100,"var(--left)",hiL[i]));
  dun.forEach(d=>d.y1=60);lun.forEach(d=>d.y1=132);
  const cnt=el("text",{x:W/2,y:H-8,"text-anchor":"middle",class:"lb"},f);
  beatRefs={W,dun,lun,cnt};return f;
}
// where a dot is after `u` units: a straight side to side, then a half-circle turn onto the return track
// (Luna clockwise, Duncan counter-clockwise, as on the stage plot); negative u = still queued outside
function beatPt(u,W,E,span,fr,y0,y1){
  const ST=STRAIGHT, RXT=44, d0=fr?-1:1;
  if(u<0)return [W/2-d0*(E-u/span/ST*2*E),y0];
  const c=Math.floor(u/span), f=u/span-c, dir=c%2?-d0:d0, ya=c%2?y1:y0, yb=c%2?y0:y1;
  if(f<ST)return [W/2-dir*E+dir*2*E*f/ST,ya];
  const al=(f-ST)/(1-ST)*Math.PI;
  return [W/2+dir*(E+RXT*Math.sin(al)),ya+(yb-ya)*(1-Math.cos(al))/2];
}
// On count 1 the leader is a bit past the middle: beatAt1() units travelled by then.
// The dots leave beatLead() beats earlier (even, so the long/short leaps stay on 1).
const BEAT_PAST=40;   // px past the middle line on count 1
const beatAt1=()=>{const E=beatRefs.W/2-100;return state.cross*STRAIGHT*(E+BEAT_PAST)/(2*E);};
const beatLead=()=>Math.ceil(beatAt1()/2)*2;
function drawBeatFig(tt){
  if(!beatRefs)return;
  const {W,dun,lun,cnt}=beatRefs, E=W/2-100, n=state.bpb, rel=tt-(state.beats[0]+state.beats[1]);   // starts on the first strike (count 1 of the run-in)
  const span=state.cross;   // units per crossing: one unit per beat on average
  // same steps as the main plot (beatWarp)
  const unitsAt=r=>r<=0?0:beatWarp(r);
  const gapU=span*80/(2*E);   // followers keep a gap behind
  const L=beatLead(), off=beatAt1()-L;
  const pulse=rel>=-L?1+.22*Math.max(0,1-(rel-Math.floor(rel))/.3):1;
  [[dun,true],[lun,false]].forEach(([pair,fr])=>pair.forEach((d,i)=>{
    const [x,y]=beatPt(unitsAt(rel+L)+off-i*gapU,W,E,span,fr,d.y,d.y1);
    d.g.setAttribute("transform",`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${pulse.toFixed(3)})`);}));
  cnt.textContent=rel<-L?"":"COUNT "+(((Math.floor(rel)%n)+n)%n+1);
}
NOTES.forEach(x=>{
  if(x.fig==="beat"){const w=document.createElement("div");w.className="figwrap";w.appendChild(beatFig());
    // start the song when the dots leave (at least a bar before the first strike)
    const from=()=>preRun()-Math.max(state.bpb,beatLead());
    const b=document.createElement("button");b.className="primary beatplay";b.textContent="Play";
    const runEnd=()=>bounds()[2][1];
    b.addEventListener("click",()=>{const go=!playing;if(go){t=from();started=true;}playBtn.click();beatEnd=go?runEnd():null;});
    const rs=document.createElement("button");rs.className="beatplay";rs.textContent="Restart";
    rs.addEventListener("click",()=>{if(playing)stop();t=from();started=true;playBtn.click();beatEnd=runEnd();});
    w.append(b,rs);beatRefs.btn=b;notesEl.lastElementChild.appendChild(w);return;}
  if(x.fig==="loops"){notesEl.lastElementChild.appendChild(document.querySelector(".loops"));return;}
  if(x.fig==="lines"){const w=document.createElement("div");w.className="figwrap";w.appendChild(linesFig());notesEl.lastElementChild.appendChild(w);return;}
  if(x.length===3&&/^\P{L}/u.test(x[0])){   // [icon, title, text]; sub-points start with a letter
    const [ic,ti,tx]=x,li=document.createElement("li"),i=document.createElement("span"),h=document.createElement("b");
    i.className="ic";i.textContent=ic;h.textContent=ti;li.append(i,h," ",tx);notesEl.appendChild(li);return;}
  if(Array.isArray(x)){const ul=document.createElement("ul");x.forEach(y=>{const li=document.createElement("li");li.textContent=y;ul.appendChild(li);});notesEl.lastElementChild.appendChild(ul);return;}
  const li=document.createElement("li");li.textContent=x;notesEl.appendChild(li);});
const orderEl=document.getElementById("order");
const mmss=x=>Math.floor(x/60)+":"+String(Math.round(x%60)).padStart(2,"0");
ORDER.forEach(([sec,label,lines])=>{
  const li=document.createElement("li");
  const b=document.createElement("button");b.className="tm";b.textContent=mmss(sec);b.setAttribute("aria-label","Jump to "+mmss(sec));
  b.addEventListener("click",()=>seekSong(sec));
  const body=document.createElement("div");
  const h=document.createElement("b");h.textContent=label;body.appendChild(h);
  if(lines.length){const ul=document.createElement("ul");lines.forEach(x=>{const l=document.createElement("li");
    if(typeof x==="string")l.textContent=x;
    else{const q=document.createElement("q");q.className="lyr";q.textContent=x.cue+"…";const sub=document.createElement("ul");
      x.do.forEach(y=>{const s=document.createElement("li");s.textContent=y;sub.appendChild(s);});l.classList.add("cueline");l.append(q,sub);}
    ul.appendChild(l);});body.appendChild(ul);}
  li.append(b,body);orderEl.appendChild(li);
});
function seekSong(sec){
  started=true;
  t=(sec-offset)/beatSec()+preRun();lastBeat=Math.ceil(t)-1;
  if(hasSong){try{audio.currentTime=sec;}catch(e){}}
  draw();
}
function drawOrder(){
  const sec=songAt(t);let cur=-1;
  ORDER.forEach(([s0],i)=>{if(s0<=sec+.05)cur=i;});
  orderEl.querySelectorAll(":scope > li").forEach((el,i)=>el.classList.toggle("on",i===cur));
}

function draw(){
  const tp=Math.max(0,t), P=positions(tp);
  dancers.forEach((d,i)=>{
    const p=P[i], x=CX+p.x, y=BACK+p.depth*RY;
    d.g.setAttribute("transform",`translate(${x.toFixed(1)},${y.toFixed(1)})`);
  });
  const bd=bounds();let si=bd.findIndex(([a,b])=>tp>=a&&tp<b);if(si<0)si=SECTIONS.length-1;
  const n=state.bpb;
  if(t<0){
    document.getElementById("bar").textContent="–";
    document.getElementById("cnt").textContent="–";
    document.getElementById("sec").textContent="Before the blocking";
  }else{
    const beat=Math.floor(Math.min(t,total()-1e-6));
    const rb=beat-(state.beats[0]+state.beats[1]);   // bar 1 = the run-in
    document.getElementById("bar").textContent=rb<0?"–":Math.floor(rb/n)+1;
    document.getElementById("cnt").textContent=countAt(beat);
    let name=SECTIONS[si].name;
    document.getElementById("sec").textContent=name;
  }
  {const D=1+.1/beatSec();   // one beat plus 100ms
  const m=started&&t>=0?midBeats().find(m=>t>=m&&t<m+D):undefined;
  {const go=state.beats[0]+state.beats[1]-pickupT(), b0=state.beats[0], b=Math.floor(t);
   if(started&&t>=b0&&t<state.beats[0]+state.beats[1]){   // all of "Guitar picks up"
    const k=t-b;
     const n=countAt(b);   // the GO beat keeps its count: "4 – GO", "3 – GO", "1 – GO"
     bigCount.textContent=b===go?n+" – GO":n;
     bigCount.setAttribute("opacity",Math.max(0,1-k*.6));
     bigCount.setAttribute("transform",`translate(${CX},${BACK+RY*.42}) scale(${(1.15-.15*Math.min(1,k/.2)).toFixed(3)})`);}
   else bigCount.setAttribute("opacity",0);}
  if(m===undefined)pow.setAttribute("opacity",0);
  else{const k=t-m, sc=k<.15?.3+k/.15*.9:1.2-(k-.15)*.2;
    pow.setAttribute("opacity",k<D-.3?1:Math.max(0,1-(k-(D-.3))/.3));
    pow.setAttribute("transform",`translate(${CX},${POW_Y}) rotate(-8) scale(${sc.toFixed(3)})`);}}
  {let tag=t>=0?(state.tags[si]||""):"";
  const md=(SECTIONS.find(s=>s.mid)||{}).mid, lst=SECTIONS[si].last;   // strike moments can run into the slow-down
  if(t>=0&&md&&midBeats().some(m=>t>=m&&t<m+md.beats))tag=md.tag;
  if(t>=0&&lst&&bd[si][1]-t<=(lst.beats==="pickup"?pickupT():lst.beats))tag=lst.tag;
  if(tag.includes("|")){const [h1,h2]=tag.split("|").map(x=>x.trim());tag=(t-bd[si][0])<state.beats[si]/2?h1:h2;}
  banner.textContent=tag.toUpperCase();
  banner.setAttribute("fill",t>=0&&SECTIONS[si].fz?"var(--freeze)":"var(--onfloor)");
  banner.setAttribute("opacity",tag&&started?1:0);
  const nt=SECTIONS[si].note, note=t>=0&&nt&&(nt.beats==null||bd[si][1]-t<=nt.beats)?nt.text:"";
  caption.textContent=note;caption.setAttribute("opacity",note&&started?1:0);}
  if(!started)document.getElementById("sec").textContent="Ready";
  SECTIONS.forEach((s,i)=>document.getElementById("seg-"+i).classList.toggle("on",started&&t>=0&&i===si));
  document.querySelectorAll("#rows tr").forEach((el,i)=>el.classList.toggle("on",started&&t>=0&&i===si));
  const S=startT(), tl=Math.max(S,t);
  ph.style.left=`${((tl-S)/((total()-S)||1))*100}%`;
  scrub.value=tl;
  drawOrder();
}
function stop(){playing=false;playBtn.textContent="Play";audio.pause();}
function loop(now){
  if(!playing)return;
  const dt=(now-last)/1000;last=now;
  if(hasSong&&!audio.paused&&audio.currentTime>0&&songAt(t)>=0){
    t=(audio.currentTime-offset)/beatSec()+preRun();
  }else{
    t+=dt/beatSec()*(+speedSel.value);
    if(hasSong&&audio.paused&&songAt(t)>=0){syncAudio();audio.play().catch(()=>{});}
  }
  const b=Math.floor(t);
  if(b!==lastBeat&&clickOn&&t<total())tick(countAt(b)===1);
  lastBeat=b;
  if(t>=total()){t=total();stop();}
  draw();if(playing)requestAnimationFrame(loop);
}
const playBtn=document.getElementById("play");
const startT=()=>0;
playBtn.addEventListener("click",()=>{
  beatEnd=null;
  if(playing){stop();return;}
  started=true;
  if(t>=total())t=startT();
  if(clickOn&&!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}
  if(actx&&actx.state==="suspended")actx.resume();
  playing=true;playBtn.textContent="Pause";last=performance.now();lastBeat=Math.ceil(t)-1;
  if(hasSong){syncAudio();if(songAt(t)>=0)audio.play().catch(()=>{});}
  requestAnimationFrame(loop);
});
document.getElementById("restart").addEventListener("click",()=>{t=startT();started=playing;lastBeat=Math.ceil(t)-1;if(playing&&hasSong)syncAudio();draw();});
scrub.addEventListener("input",()=>{t=+scrub.value;started=true;lastBeat=Math.floor(t);if(hasSong)syncAudio();draw();});

renderTable();
(function beatTick(){
   // before Play the dots wait on their start marks
   if(beatEnd!==null&&playing&&t>=beatEnd){stop();beatEnd=null;}
   drawBeatFig(started?t:preRun()-beatLead());if(beatRefs&&beatRefs.btn)beatRefs.btn.textContent=playing?"Stop":"Play";
   requestAnimationFrame(beatTick);})();
})();
