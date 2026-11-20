const $ = (id) => document.getElementById(id);
const exams = [
  {date:"2026-11-27",code:"ITC",name:"Information Theory & Coding"},
  {date:"2026-11-30",code:"CD",name:"Compiler Design"},
  {date:"2026-12-03",code:"CG",name:"Computer Graphics & Multimedia"},
  {date:"2026-12-05",code:"AOA",name:"Analysis of Algorithms"},
  {date:"2026-12-07",code:"WC",name:"Wireless Communication"},
  {date:"2026-12-11",code:"OS",name:"Operating System"}
];
const checklistItems = ["ITC ke 2 hours complete","Second subject ke 2 hours complete","Third subject ka 1 hour complete","Minimum 3 PYQs solve kiye","Today's topics ka revision kiya","Gym completed","Tomorrow's study targets ready"];
const baseSchedule = [
  ["07:00","07:30","Wake up & freshen up","Start calmly: water, freshen up and light stretching.","Routine"],
  ["07:30","08:00","Breakfast","Eat breakfast and prepare your study desk.","Break"],
  ["08:00","10:00","ITC — Deep Study","Main concepts, formulas, numericals and difficult topics.","Study"],
  ["10:00","10:30","Break","Walk, hydrate and rest your eyes.","Break"],
  ["10:30","12:30","Second Subject","Unit-wise preparation: CD, CG or AOA according to the daily plan.","Study"],
  ["12:30","13:30","Lunch & rest","Have lunch and take a proper break.","Break"],
  ["13:30","14:30","Third Subject","WC / OS / AOA concepts and short notes.","Study"],
  ["14:30","16:00","Rest / personal time","Take a nap, go for a walk or handle personal work.","Rest"],
  ["16:00","17:00","PYQs & answer writing","Solve previous-year questions and write answers without looking.","Practice"],
  ["17:00","18:15","Free time & snack","Relax and have a pre-workout snack.","Break"],
  ["18:30","19:30","Gym","Workout and fitness session.","Gym"],
  ["19:30","20:15","Shower & recovery","Cool down and recover after gym.","Rest"],
  ["20:15","20:45","Dinner","Dinner and hydration.","Break"],
  ["20:45","21:15","Light revision","Revise today's topics, formulas and mistakes. No new chapters.","Revision"],
  ["21:15","23:00","Wind down & sleep","Prepare tomorrow's targets and aim to sleep by 11 PM.","Rest"]
];
const planByDate = {
 "2026-11-16":["CD Unit 1","CG basics"],"2026-11-17":["CD Unit 2","AOA basics"],
 "2026-11-18":["CD Unit 3","WC basics"],"2026-11-19":["CG Unit 1","OS basics"],
 "2026-11-20":["CD Unit 4","AOA Unit 1"],"2026-11-21":["CG Unit 2","WC Unit 1"],
 "2026-11-22":["CD Unit 5","OS Unit 1"],"2026-11-23":["AOA Unit 2","CG revision"],
 "2026-11-24":["CD PYQs","AOA PYQs"],"2026-11-25":["ITC numericals","ITC weak topics"],
 "2026-11-26":["ITC mock test","ITC final revision"]
};
const postExamPlans = {
 "2026-11-27":["CD revision","Rest after exam"],"2026-11-28":["CD full revision","CD PYQs"],
 "2026-11-29":["CD mock / weak topics","CD short notes"],"2026-11-30":["CG preparation","Rest after exam"],
 "2026-12-01":["CG full revision","CG algorithms / diagrams"],"2026-12-02":["CG PYQs","CG mock / weak topics"],
 "2026-12-03":["AOA preparation","Rest after exam"],"2026-12-04":["AOA algorithms","AOA PYQs"],
 "2026-12-05":["WC preparation","Rest after exam"],"2026-12-06":["WC full revision","WC diagrams / PYQs"],
 "2026-12-07":["OS preparation","Rest after exam"],"2026-12-08":["OS process & scheduling","OS deadlocks"],
 "2026-12-09":["OS memory management","OS file systems"],"2026-12-10":["OS PYQs","OS final revision"],
 "2026-12-11":["Exam day — OS","Rest and exam"]
};
let alarmOscillators=[], alarmInterval=null, alarmTimeout=null, lastTriggered=new Set(), deferredInstall=null;
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const timeToMinutes = t => {const [h,m]=t.split(":").map(Number);return h*60+m};
function dayPlan(date){
 const key=dateKey(date), plan=planByDate[key]||postExamPlans[key];
 return plan || ["CD / CG / AOA rotation","WC / OS revision"];
}
function scheduleForToday(){
 const now=new Date(), key=dateKey(now), [second,third]=dayPlan(now);
 return baseSchedule.map((x,i)=>{
  const a=[...x];
  if(i===4) a[2]=second;
  if(i===6) a[2]=third;
  if(i===2 && key>="2026-11-27") a[2]=key==="2026-11-27"?"Post-exam recovery":"Next exam subject focus";
  return a;
 });
}
function renderSchedule(){
 const now=new Date(), minutes=now.getHours()*60+now.getMinutes(), items=scheduleForToday();
 $("scheduleList").innerHTML=items.map((x,i)=>{
  const start=timeToMinutes(x[0]),end=timeToMinutes(x[1]),active=minutes>=start&&minutes<end;
  return `<article class="schedule-item ${active?"active":""}"><div class="time">${fmtTime(x[0])}<br>– ${fmtTime(x[1])}</div><div class="activity"><strong>${escapeHTML(x[2])}</strong><small>${escapeHTML(x[3])}</small></div><span class="type-pill">${x[4]}</span></article>`;
 }).join("");
 const next=items.find(x=>timeToMinutes(x[0])>minutes);
 $("nextEvent").textContent=next?`${fmtTime(next[0])} · ${next[2]}`:"Schedule complete — wind down";
 $("todayFocus").textContent=now<new Date("2026-11-27T00:00:00")?"ITC priority":"Next exam priority";
}
function fmtTime(t){let [h,m]=t.split(":").map(Number);const ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${String(m).padStart(2,"0")} ${ap}`;}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function updateClock(){
 const n=new Date();$("clock").textContent=n.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});
 $("todayDate").textContent=n.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 const first=new Date("2026-11-27T00:00:00");$("daysLeft").textContent=Math.max(0,Math.ceil((first-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/86400000));
 renderSchedule();
}
function loadChecklist(){
 const key="sb-check-"+dateKey(new Date()),saved=JSON.parse(localStorage.getItem(key)||"[]");
 $("checklist").innerHTML=checklistItems.map((x,i)=>`<label class="check-row ${saved.includes(i)?"done":""}"><input type="checkbox" data-index="${i}" ${saved.includes(i)?"checked":""}><span>${x}</span></label>`).join("");
 updateProgress();
}
function updateProgress(){
 const checks=[...document.querySelectorAll("#checklist input")],n=checks.filter(x=>x.checked).length;
 $("progressText").textContent=`${n}/7`;$("progressBar").style.width=`${n/7*100}%`;
 localStorage.setItem("sb-check-"+dateKey(new Date()),JSON.stringify(checks.filter(x=>x.checked).map(x=>Number(x.dataset.index))));
}
function showToast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600);}
function notify(title,body){
 if("Notification"in window&&Notification.permission==="granted"){
  try{new Notification(title,{body,icon:"icon.svg",tag:"studybuddy-"+Date.now()});}catch(e){}
 }
}
function beep(){
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  const ctx=new Ctx();let count=0;
  const play=()=>{if(count>=3){ctx.close();return;}const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";osc.frequency.value=count%2?740:880;gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.32);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.34);count++;setTimeout(play,430);};play();
 }catch(e){}
}
function stopAlarm(){
 if(alarmInterval)clearInterval(alarmInterval);if(alarmTimeout)clearTimeout(alarmTimeout);
 alarmInterval=null;alarmTimeout=null;$("alarmOverlay").hidden=true;$("stopAlarm").disabled=true;$("alarmStatus").textContent="Alarm stopped.";
}
function fireReminder(item){
 const title=item[2],body=item[3];notify("Study Buddy · "+title,body);
 if($("soundToggle").checked){$("alarmTitle").textContent=title;$("alarmMessage").textContent=body;$("alarmOverlay").hidden=false;$("stopAlarm").disabled=false;$("alarmStatus").textContent="Alarm is ringing.";beep();
  if($("repeatToggle").checked)alarmInterval=setInterval(beep,5000);else alarmTimeout=setTimeout(stopAlarm,4500);
 }
 showToast("Reminder: "+title);
 if(navigator.vibrate)navigator.vibrate([250,100,250]);
}
function checkReminders(){
 if(!$("remindersToggle").checked)return;
 const now=new Date(),key=dateKey(now),minute=now.getHours()*60+now.getMinutes();
 scheduleForToday().forEach((item)=>{
  const id=key+"-"+item[0];
  if(timeToMinutes(item[0])===minute&&!lastTriggered.has(id)){lastTriggered.add(id);fireReminder(item);}
 });
 // Keep the set bounded as the day changes.
 if(lastTriggered.size>100)lastTriggered.clear();
}
function setSetting(id,key){$(id).checked=localStorage.getItem(key)!=="false";$(id).addEventListener("change",()=>localStorage.setItem(key,$(id).checked));}
$("checklist").addEventListener("change",e=>{if(e.target.matches("input[type=checkbox]")){e.target.closest(".check-row").classList.toggle("done",e.target.checked);updateProgress();}});
$("resetChecklist").addEventListener("click",()=>{localStorage.removeItem("sb-check-"+dateKey(new Date()));loadChecklist();showToast("Checklist reset.");});
$("enableNotifications").addEventListener("click",async()=>{
 if(!("Notification"in window)){showToast("This browser does not support notifications.");return;}
 const p=await Notification.requestPermission();$("permissionStatus").textContent=p==="granted"?"Reminders enabled. Keep the website open for scheduled alerts.": "Notifications not enabled. You can still use the on-page alarm while this page is open.";
 showToast(p==="granted"?"Reminders enabled!":"Notification permission not granted.");
});
$("testAlarm").addEventListener("click",()=>{fireReminder(["","","Test alarm","This is a test. Your study reminder sound is working."]);});
$("stopAlarm").addEventListener("click",stopAlarm);$("dismissAlarm").addEventListener("click",stopAlarm);
$("themeBtn").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("sb-dark",document.body.classList.contains("dark"));$("themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾";});
if(localStorage.getItem("sb-dark")==="true"){document.body.classList.add("dark");$("themeBtn").textContent="☀";}
setSetting("remindersToggle","sb-reminders");setSetting("soundToggle","sb-sound");setSetting("repeatToggle","sb-repeat");setSetting("autoResetToggle","sb-autoreset");
$("installBtn").addEventListener("click",async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").hidden=true;}else showToast("Use your browser menu and choose Add to Home Screen.");});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").hidden=false;});
if("serviceWorker"in navigator && location.protocol!=="file:"){navigator.serviceWorker.register("sw.js").catch(()=>{});}
updateClock();loadChecklist();setInterval(()=>{updateClock();checkReminders();},1000);
