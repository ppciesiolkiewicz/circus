(function(){

// geometry (viewBox units)
const CX=560, BACK=150, RX=440, RY=370, START=520, SPAN=2*START;
const ROWS={"R-H0":.11,"L-H0":.20,"R-L0":.29,"L-L0":.38};
const PIOD=.62, PIO_FROM=-.13;
const ENTRY=.12, BOWD=.08, FILEGAP=40, LANEGAP=62;
const AMP=.65, DC2=90;

let state={bpm:91,bpb:4,cross:8,pioJoin:16,beats:SECTIONS.map(s=>s.beats),tags:SECTIONS.map(s=>s.tag)};
try{const sv=JSON.parse(localStorage.getItem("blocking-v3")||"null");if(sv&&sv.beats&&sv.beats.length===SECTIONS.length){state=sv;if(state.pioJoin==null)state.pioJoin=16;}
if(!Array.isArray(state.tags)||state.tags.length!==SECTIONS.length)state.tags=SECTIONS.map(s=>s.tag);}catch(e){}
function save(){try{localStorage.setItem("blocking-v3",JSON.stringify(state));}catch(e){}}
const BOW=SECTIONS.length-1;

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
el("rect",{x:CX-START-34,y:BACK-8,width:68,height:398,rx:8,fill:"none",stroke:"var(--floor-edge)","stroke-dasharray":"5 5"});
el("rect",{x:CX+START-34,y:BACK-8,width:68,height:398,rx:8,fill:"none",stroke:"var(--floor-edge)","stroke-dasharray":"5 5"});
el("path",{d:`M${CX-RX},${BACK} A${RX},${RY} 0 0 0 ${CX+RX},${BACK} Z`,fill:"color-mix(in srgb,var(--onfloor) 6%,transparent)",stroke:"var(--floor-edge)","stroke-width":2});
el("line",{x1:CX,y1:BACK,x2:CX,y2:BACK+RY,stroke:"var(--floor-edge)","stroke-dasharray":"2 8"});
const lbl=(x,y,t,anchor)=>{const e=el("text",{x,y,"text-anchor":anchor||"middle",fill:"var(--onfloor-dim)","font-family":"Archivo, sans-serif","font-size":15,"letter-spacing":"2"});e.textContent=t;return e;};
lbl(6,BACK-20,"LUNA'S WING","start");lbl(1114,BACK-20,"DUNCAN'S WING","end");
lbl(CX,BACK-22,"STAGE");lbl(CX,BACK+RY+34,"AUDIENCE");
lbl(CX-RX+6,BACK+RY*.16,"HIGH","start");lbl(CX-RX+30,BACK+RY*.35,"LOW","start");
const banner=el("text",{x:CX,y:BACK+RY*.84,"text-anchor":"middle",fill:"var(--freeze)","font-family":"Archivo, sans-serif","font-weight":700,"font-size":28,"letter-spacing":"5",opacity:0});
banner.textContent="FREEZE";
// running count, top-left corner of the plot
const stCount=el("text",{x:24,y:78,fill:"var(--onfloor)","font-family":"Archivo, sans-serif","font-weight":700,"font-size":64});
const stBar=el("text",{x:26,y:100,fill:"var(--onfloor-dim)","font-family":"Archivo, sans-serif","font-size":14,"letter-spacing":"2"});

const layer=el("g",{});
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
const LOOP_A=.045*RY, TURN_R=62, STRAIGHT=.78, EDGE_K=.62, FILE_DELAY=.35, QSPEED=FILEGAP/.35;
function loopAt(c,E,d0,offstageStart){
  const C=Math.max(.5,state.cross), k=Math.floor(c), u=c-k;
  const dir=k%2===0?d0:-d0, sgn=k%2===0?-1:1;
  if(u<STRAIGHT){
    const uu=u/STRAIGHT, from=(k===0&&offstageStart)?-d0*START:-dir*E, to=dir*E;
    return {x:from+(to-from)*prof(uu),dy:sgn*LOOP_A,dir,v:Math.abs(to-from)/(C*STRAIGHT)*spd(uu),E};
  }
  const al=(u-STRAIGHT)/(1-STRAIGHT)*Math.PI, w=Math.PI/(C*(1-STRAIGHT));
  return {x:dir*E+dir*TURN_R*Math.sin(al),dy:sgn*LOOP_A*Math.cos(al),dir:Math.cos(al)>=0?dir:-dir,v:TURN_R*w*Math.abs(Math.cos(al)),E};
}
function crossing(lane,d0,tau){
  const C=Math.max(.5,state.cross), E=hw(ROWS[lane])*EDGE_K;
  if(tau<0) return {x:-d0*(START-tau*QSPEED),dy:-LOOP_A,dir:d0,v:0,E};
  return loopAt(tau/C,E,d0,true);
}
// Pio: holds centre, then runs in step with the smaller side's lines. He joins the first time
// their leaders pass mid-stage after pioJoin beats, so he steps off his mark at x=0 with them.
const PIO_D0=LEFT.length<=RIGHT.length?1:-1;
function pioJoinAt(){
  const C=Math.max(.5,state.cross);
  return Math.max(1,Math.ceil(state.pioJoin/C-STRAIGHT/2))*C+STRAIGHT/2*C;
}
function pioCrossing(tau){
  const C=Math.max(.5,state.cross), E=hw(PIOD)*EDGE_K, tj=tau-pioJoinAt();
  if(tj<0) return {x:0,dy:0,dir:PIO_D0,v:0,E,still:1};
  const r=loopAt(tau/C,E,PIO_D0,false);
  // fade Pio's loop offset in over the first beat so Pio doesn't jump sideways off the mark
  r.dy*=clamp(tj,0,1); return r;
}
// slot: place in the lane at the first freeze, in LANEGAPs from centre, leader furthest ahead
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
  const d2=st.v>0?Math.min(DC2,room(x)):0;
  if(t<B[3]){const u=t/B[3];return out(x+st.dir*d2*(1-(1-u)*(1-u)));}
  return out(x+st.dir*d2);
}
function travelPos(d,tAbs){
  const W=state.beats[0], P0=W+state.beats[1];
  if(d.pio){if(tAbs<P0)return {x:0,depth:PIOD};const r=follow(pioCrossing,tAbs-P0,0);return {x:r.x,depth:PIOD+r.dy/RY};}
  const tb=tAbs-P0, d0=d.side==="R"?-1:1, delay=d.file*FILE_DELAY;
  // before the run-in (count-in, Pio dies, guitar cue) everyone already stands in line in the wing
  const r=follow(tau=>crossing(d.lane,d0,tau-delay),Math.max(0,tb),(laneCount[d.lane]-1)/2-d.order);
  const x=r.x, q=Math.abs(x)-START;   // still waiting in the wing: queue runs down the wing in entrance order
  if(q>0) return {x:Math.sign(x)*START,depth:ENTRY+q/RY};
  const inside=ease(clamp((START-Math.abs(x))/150,0,1));
  return {x,depth:lerp(ENTRY,ROWS[d.lane],inside)+r.dy/RY*inside};
}
function positions(tb){
  const bd=bounds(), bowStart=bd[BOW][0], TBow=state.beats[BOW];
  if(tb<bowStart) return dancers.map(d=>({...travelPos(d,tb),bow:0}));
  const frozen=dancers.map(d=>travelPos(d,bowStart));
  const idx=frozen.map((p,i)=>i).sort((a,b)=>frozen[a].x-frozen[b].x);
  const n=dancers.length, hw=RX*Math.sqrt(1-BOWD*BOWD)-20, sp=2*hw/(n-1);
  const out=new Array(n);
  const tau=tb-bowStart, u=TBow>0?ease(clamp(tau/(TBow*.7),0,1)):1;
  const bowU=TBow>0?clamp((tau-TBow*.75)/(TBow*.25),0,1):0;
  idx.forEach((di,k)=>{const f=frozen[di];out[di]={x:lerp(f.x,-hw+k*sp,u),depth:lerp(f.depth,BOWD,u),bow:Math.sin(bowU*Math.PI)};});
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
  scrub.max=T; if(t>T)t=T; draw();
}
function updateBars(){
  SECTIONS.forEach((s,i)=>{document.querySelector(`#row-${i} .bars`).textContent=+(state.beats[i]/state.bpb).toFixed(2);});
  const T=total(), sec=T*60/state.bpm;
  document.getElementById("total").textContent=`Total ${T} beats · ${+(T/state.bpb).toFixed(2)} bars · ${Math.floor(sec/60)}:${String(Math.round(sec%60)).padStart(2,"0")} at ${state.bpm} BPM`;
}
const cast=document.getElementById("cast");
[["Right side",RIGHT,"var(--right)"],["Left side",LEFT,"var(--left)"],["Centre",[["Pio","C"]],"var(--pio)"]].forEach(([h,list,c])=>{
  const d=document.createElement("div");
  d.innerHTML=`<h3 style="color:${c}">${h}</h3><ul>${list.map(([n,ty,r])=>`<li><span class="sw" style="background:${ty!=="L"?c:"transparent"};border:2px solid ${c}"></span>${n}<span class="tag">${ty==="H"?"high":ty==="L"?"low":"centre"}</span>${r?'<span class="tag">responsible</span>':""}</li>`).join("")}</ul>`;
  cast.appendChild(d);
});

let t=0, started=false, playing=false, last=0, clickOn=false, actx=null, lastBeat=-1;
const bpmIn=document.getElementById("bpm"), bpbIn=document.getElementById("bpb");
bpmIn.value=state.bpm;bpbIn.value=state.bpb;
bpmIn.addEventListener("change",()=>{state.bpm=clamp(+bpmIn.value||91,40,240);bpmIn.value=state.bpm;save();updateBars();});
const pjIn=document.getElementById("piojoin");pjIn.value=state.pioJoin;
pjIn.addEventListener("change",()=>{state.pioJoin=clamp(Math.round(+pjIn.value)||0,0,128);pjIn.value=state.pioJoin;save();draw();});
const crossIn=document.getElementById("cross");crossIn.value=state.cross;
crossIn.addEventListener("change",()=>{state.cross=clamp(Math.round(+crossIn.value)||8,1,32);crossIn.value=state.cross;save();draw();});
bpbIn.addEventListener("change",()=>{state.bpb=clamp(Math.round(+bpbIn.value)||4,1,12);bpbIn.value=state.bpb;save();updateBars();draw();});

function tick(accent){
  if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();
  o.frequency.value=accent?1500:1000;g.gain.setValueAtTime(.25,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.06);
  o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+.07);
}
const audio=new Audio(); audio.preservesPitch=true; let hasSong=true;
audio.src=location.protocol==="file:"?"../audio/dope-show.mp3":"/audio/dope-show.mp3";
audio.addEventListener("error",()=>{if(audio.src.endsWith("/audio/dope-show.mp3")){hasSong=false;document.getElementById("songname").textContent="Load the song (mp3)";}});
const offIn=document.getElementById("offset"), countIn=document.getElementById("countin"), speedSel=document.getElementById("speed");
function parseOff(v){const m=String(v).trim().match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);return m?(+(m[1]||0))*60+(+m[2]):null;}
function fmtOff(x){x=Math.max(0,x);const m=Math.floor(x/60);return m+":"+(x-m*60).toFixed(2).padStart(5,"0");}
let offset=191; try{const o=localStorage.getItem("blocking-offset-311");if(o!==null&&!isNaN(+o))offset=+o;}catch(e){}
offIn.value=fmtOff(offset);
function setOff(x){offset=Math.max(0,x);offIn.value=fmtOff(offset);try{localStorage.setItem("blocking-offset-311",offset);}catch(e){}if(playing&&hasSong)syncAudio();}
offIn.addEventListener("change",()=>{const v=parseOff(offIn.value);if(v===null){offIn.value=fmtOff(offset);}else setOff(v);});
document.getElementById("nm").addEventListener("click",()=>setOff(offset-.05));
document.getElementById("np").addEventListener("click",()=>setOff(offset+.05));
document.getElementById("song").addEventListener("change",e=>{
  const f=e.target.files&&e.target.files[0]; if(!f)return;
  audio.src=URL.createObjectURL(f); hasSong=true;
  document.getElementById("songname").textContent="♪ "+f.name;
});
const beatSec=()=>60/state.bpm;
const preRun=()=>state.beats[0]+state.beats[1];
const songAt=tt=>offset+(tt-preRun())*beatSec();
function syncAudio(){audio.playbackRate=+speedSel.value;const at=songAt(t);if(at>=0)audio.currentTime=at;}
speedSel.addEventListener("change",()=>{audio.playbackRate=+speedSel.value;});

let cues=[{at:0,text:"[Run-in line: type it here]"},{at:36,text:"[Mid slowdown / freeze line]"},{at:48,text:"[Moving-to-line line]"}];
try{const c=JSON.parse(localStorage.getItem("blocking-cues")||"null");if(Array.isArray(c))cues=c;}catch(e){}
function saveCues(){try{localStorage.setItem("blocking-cues",JSON.stringify(cues));}catch(e){}}
const relT=()=>t-preRun();
const cueRows=document.getElementById("cuerows");
function renderCues(){
  cues.sort((a,b)=>a.at-b.at);cueRows.innerHTML="";
  cues.forEach((c,i)=>{
    const tr=document.createElement("tr");tr.className="cuerow";
    const tdA=document.createElement("td"),tdT=document.createElement("td"),tdB=document.createElement("td");
    const a=document.createElement("input");a.type="number";a.step="0.5";a.id="cue-at-"+i;a.value=c.at;a.setAttribute("aria-label","Beat");
    a.addEventListener("change",()=>{c.at=+a.value||0;saveCues();renderCues();draw();});
    const tx=document.createElement("input");tx.type="text";tx.id="cue-text-"+i;tx.value=c.text;tx.setAttribute("aria-label","Line");
    tx.addEventListener("input",()=>{c.text=tx.value;saveCues();draw();});
    const now=document.createElement("button");now.textContent="Now";
    now.addEventListener("click",()=>{c.at=Math.round(relT()*2)/2;saveCues();renderCues();draw();});
    const del=document.createElement("button");del.textContent="Remove";del.setAttribute("aria-label","Remove line");
    del.addEventListener("click",()=>{cues.splice(cues.indexOf(c),1);saveCues();renderCues();draw();});
    tdA.appendChild(a);tdT.appendChild(tx);tdB.style.whiteSpace="nowrap";tdB.append(now," ",del);
    tr.append(tdA,tdT,tdB);cueRows.appendChild(tr);
  });
}
document.getElementById("addcue").addEventListener("click",()=>{cues.push({at:Math.round(relT()*2)/2,text:""});saveCues();renderCues();const last=cueRows.querySelector("tr:last-child input[type=text]");});
function drawCue(){
  const rt=relT();let cur=-1;
  cues.forEach((c,i)=>{if(c.at<=rt+1e-6)cur=i;});
  const nx=cues[cur+1];
  document.getElementById("cueNow").textContent=cur>=0?cues[cur].text:"";
  document.getElementById("cueNext").textContent=nx&&nx.text?"next: "+nx.text:"";
  cueRows.querySelectorAll("tr").forEach((r,i)=>r.classList.toggle("on",i===cur));
}

let ticks={};try{ticks=JSON.parse(localStorage.getItem("blocking-check")||"{}")||{};}catch(e){}
const checkEl=document.getElementById("check");
CHECKLIST.forEach((txt,i)=>{
  const li=document.createElement("li"),lb=document.createElement("label"),cb=document.createElement("input"),sp=document.createElement("span");
  cb.type="checkbox";cb.id="check-"+i;cb.checked=!!ticks[txt];sp.textContent=txt;
  cb.addEventListener("change",()=>{ticks[txt]=cb.checked;try{localStorage.setItem("blocking-check",JSON.stringify(ticks));}catch(e){}});
  lb.append(cb,sp);li.appendChild(lb);checkEl.appendChild(li);
});
const orderEl=document.getElementById("order");
const mmss=x=>Math.floor(x/60)+":"+String(Math.round(x%60)).padStart(2,"0");
ORDER.forEach(([sec,label,lines])=>{
  const li=document.createElement("li");
  const b=document.createElement("button");b.className="tm";b.textContent=mmss(sec);b.setAttribute("aria-label","Jump to "+mmss(sec));
  b.addEventListener("click",()=>seekSong(sec));
  const body=document.createElement("div");
  const h=document.createElement("b");h.textContent=label;body.appendChild(h);
  if(lines.length){const ul=document.createElement("ul");lines.forEach(x=>{const l=document.createElement("li");l.textContent=x;ul.appendChild(l);});body.appendChild(ul);}
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
    const p=P[i], x=CX+p.x, y=BACK+p.depth*RY, s=1-.25*p.bow;
    d.g.setAttribute("transform",`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})`);
  });
  const bd=bounds();let si=bd.findIndex(([a,b])=>tp>=a&&tp<b);if(si<0)si=SECTIONS.length-1;
  const n=state.bpb;
  if(t<-state.bpb){
    document.getElementById("bar").textContent="–";
    document.getElementById("cnt").textContent="–";
    document.getElementById("sec").textContent="Before the blocking";
  }else if(t<0){
    const b=Math.floor(t);
    document.getElementById("bar").textContent="–";
    document.getElementById("cnt").textContent=((b%n)+n)%n+1;
    document.getElementById("sec").textContent="Count-in";
  }else{
    const beat=Math.floor(Math.min(t,total()-1e-6));
    document.getElementById("bar").textContent=Math.floor(beat/n)+1;
    document.getElementById("cnt").textContent=beat%n+1;
    let name=SECTIONS[si].name;
    if(si===BOW&&t>=bd[BOW][0]+state.beats[BOW]*.75)name="Bow";
    document.getElementById("sec").textContent=name;
  }
  {let tag=t>=0?(state.tags[si]||""):(t>=-state.bpb?"Count-in":"");
  if(tag.includes("|")){const [h1,h2]=tag.split("|").map(x=>x.trim());tag=(t-bd[si][0])<state.beats[si]/2?h1:h2;}
  if(si===BOW&&t>=bd[BOW][0]+state.beats[BOW]*.75&&tag)tag="Bow";
  banner.textContent=tag.toUpperCase();
  banner.setAttribute("fill",t>=0&&SECTIONS[si].fz?"var(--freeze)":"var(--onfloor)");
  banner.setAttribute("opacity",tag&&started?1:0);}
  if(!started)document.getElementById("sec").textContent="Ready";
  {const c=document.getElementById("cnt").textContent, b=document.getElementById("bar").textContent;
  stCount.textContent=started?c:""; stBar.textContent=started?(b==="–"?(t<0&&t>=-state.bpb?"COUNT-IN":""):"BAR "+b):"";}
  document.querySelectorAll(".strip .seg").forEach((el,i)=>el.classList.toggle("on",started&&t>=0&&i===si));
  document.querySelectorAll("#rows tr").forEach((el,i)=>el.classList.toggle("on",started&&t>=0&&i===si));
  ph.style.left=`${(tp/(total()||1))*100}%`;
  scrub.value=tp;
  drawCue();
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
  if(b!==lastBeat&&clickOn&&t<total()){const n=state.bpb;tick(((b%n)+n)%n===0);}
  lastBeat=b;
  if(t>=total()){t=total();stop();}
  draw();if(playing)requestAnimationFrame(loop);
}
const playBtn=document.getElementById("play");
const startT=()=>countIn.checked?-state.bpb:0;
playBtn.addEventListener("click",()=>{
  if(playing){stop();return;}
  started=true;
  if(t>=total()||t===0)t=startT();
  if(clickOn&&!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}
  if(actx&&actx.state==="suspended")actx.resume();
  playing=true;playBtn.textContent="Pause";last=performance.now();lastBeat=Math.ceil(t)-1;
  if(hasSong){syncAudio();if(songAt(t)>=0)audio.play().catch(()=>{});}
  requestAnimationFrame(loop);
});
document.getElementById("restart").addEventListener("click",()=>{t=playing?startT():0;started=playing;lastBeat=Math.ceil(t)-1;if(playing&&hasSong)syncAudio();draw();});
document.getElementById("click").addEventListener("click",e=>{
  clickOn=!clickOn;e.currentTarget.setAttribute("aria-pressed",clickOn);
  if(clickOn&&!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(err){}}
});
scrub.addEventListener("input",()=>{t=+scrub.value;started=true;lastBeat=Math.floor(t);if(hasSong)syncAudio();draw();});

renderCues();
renderTable();
})();
