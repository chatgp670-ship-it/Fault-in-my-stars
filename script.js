const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

const pages = $$(".page");
let current = 0;

function showPage(n, direction=1){
  n = Math.max(0, Math.min(pages.length-1,n));
  if(n === current) return;
  pages[current].classList.remove("active");
  current = n;
  pages[current].style.animationName = direction >= 0 ? "pageIn" : "pageIn";
  pages[current].style.transformOrigin = direction >= 0 ? "right center" : "left center";
  pages[current].classList.add("active");
  $("#pageNo").textContent = String(current+1).padStart(2,"0");
}
function next(){ if(current < pages.length-1) showPage(current+1,1); }
function prev(){ if(current > 0) showPage(current-1,-1); }

$("#nextBtn").addEventListener("click",next);
$("#prevBtn").addEventListener("click",prev);
$("#nextSmall").addEventListener("click",next);
$("#prevSmall").addEventListener("click",prev);
$$("[data-next]").forEach(b=>b.addEventListener("click",next));

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight") next();
  if(e.key==="ArrowLeft") prev();
  if(e.key==="Escape"){closeMenu();closeLightbox();closeSecret();}
});

// Swipe
let touchX=0;
document.addEventListener("touchstart",e=>touchX=e.changedTouches[0].clientX,{passive:true});
document.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-touchX;
  if(Math.abs(dx)>55) dx<0 ? next() : prev();
},{passive:true});

// Menu
const menu=$("#menu"), backdrop=$("#menuBackdrop");
function openMenu(){menu.classList.add("open");backdrop.classList.add("show")}
function closeMenu(){menu.classList.remove("open");backdrop.classList.remove("show")}
$("#menuBtn").addEventListener("click",openMenu);
$("#menuClose").addEventListener("click",closeMenu);
backdrop.addEventListener("click",closeMenu);
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>{showPage(Number(b.dataset.go));closeMenu()}));

// Image lightbox
const lb=$("#lightbox"), lbImg=$("#lightboxImg"), lbCaption=$("#lightboxCaption");
function openLightbox(src,caption){
  lbImg.src=src;
  lbCaption.textContent=caption||"";
  lb.classList.add("show");
}
function closeLightbox(){lb.classList.remove("show")}
$("#lightboxClose").addEventListener("click",closeLightbox);
lb.addEventListener("click",e=>{if(e.target===lb)closeLightbox()});
$$("[data-lightbox]").forEach(b=>b.addEventListener("click",e=>{
  e.stopPropagation();
  openLightbox(b.dataset.lightbox,b.dataset.caption);
}));

// Audio clips
const yimken=$("#yimken"), canon=$("#canon");
let activeAudio=null, raf=null;
function stopAudio(){
  [yimken,canon].forEach(a=>{a.pause();a.currentTime=0});
  activeAudio=null;
  if(raf) cancelAnimationFrame(raf);
  $("#yimkenBtn").textContent="Play the clue ▶";
  $("#canonBtn").textContent="Canon in D · play the last page ♪";
}
function playClip(audio,start,end,button,playingText){
  if(activeAudio===audio && !audio.paused){stopAudio();return}
  stopAudio();
  activeAudio=audio;
  audio.currentTime=start;
  audio.play().catch(()=>{});
  button.textContent=playingText;
  const tick=()=>{
    if(activeAudio!==audio) return;
    if(audio.currentTime>=end || audio.ended){stopAudio();return}
    raf=requestAnimationFrame(tick);
  };
  tick();
}
$("#yimkenBtn").addEventListener("click",e=>playClip(yimken,20,30,e.currentTarget,"Playing · 20 → 30 sec"));
$("#canonBtn").addEventListener("click",e=>playClip(canon,0,30,e.currentTarget,"Playing · Canon in D"));

$("#musicBtn").addEventListener("click",()=>{
  if(activeAudio) stopAudio();
  else {
    const a=current===6?yimken:canon;
    playClip(a,current===6?20:0,current===6?30:30,current===6?$("#yimkenBtn"):$("#canonBtn"),current===6?"Playing · 20 → 30 sec":"Playing · Canon in D");
  }
});

// Curiosity
const secret=$("#secret");
function closeSecret(){secret.classList.remove("show")}
$("#curiosityBtn").addEventListener("click",()=>secret.classList.add("show"));
$("#secretClose").addEventListener("click",closeSecret);

// Defensive image check: if a local asset is missing, mark it visibly instead of leaving a broken icon.
$$("img").forEach(img=>{
  img.addEventListener("error",()=>{
    img.closest("button,figure")?.classList.add("image-missing");
    img.alt = "Image not found — check the assets folder";
  });
});
