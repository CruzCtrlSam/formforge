'use strict';

const key = 'formforge-v1';
const empty = () => ({ profile: null, workouts: [], checks: [], session: null });
let state = empty();
let storageIssue = false;
try { state = JSON.parse(localStorage.getItem(key)) || empty(); }
catch { storageIssue = true; }
const app = document.querySelector('#app');
const nav = document.querySelector('#nav');
let page = state.profile ? 'Today' : 'Setup';
const gear = ['Yoga mat', 'Wall', 'Sturdy countertop', 'Stable chair without wheels', 'Bottom stair', 'Resistance bands', 'Dumbbells', 'Kettlebell', 'Pull-up bar', 'Rings', 'Parallel bars'];
const goals = ['Get stronger', 'Build muscle', 'Learn a skill', 'Change body composition', 'Build a routine'];
const cuisines = ['Mexican', 'Mediterranean', 'South Asian', 'Any'];
const flavors = ['Crunchy', 'Tangy', 'Spicy', 'Sweet'];
const avoid = ['Dairy', 'Gluten', 'Nuts', 'Sesame', 'Eggs', 'Soy'];
const moves = {
  push: [
    ['Wall push-up', 'Wall', 'Keep your body straight and bring your chest toward the wall.'],
    ['Countertop push-up', 'Sturdy countertop', 'Use a fixed countertop and keep your elbows angled back.'],
    ['Hands-and-knees push-up', '', 'Start on all fours and bend your elbows through a comfortable range.'],
    ['Knee push-up', '', 'Keep a straight line from knees to shoulders.'],
    ['Floor push-up', '', 'Brace your trunk and lower your chest with control.']
  ],
  legs: [
    ['Chair sit-to-stand', 'Stable chair without wheels', 'Use a sturdy chair against a wall and stand without rocking.'],
    ['Bodyweight squat', '', 'Sit your hips back and keep your feet planted.'],
    ['Reverse lunge', '', 'Step back gently and push through your front foot.']
  ],
  core: [
    ['Heel slide', '', 'Lie on your back and slide one heel away slowly. Count reps per side.'],
    ['Dead bug', '', 'Reach opposite arm and leg while keeping your back steady. Count reps per side.'],
    ['Bird dog', '', 'Reach opposite arm and leg without rotating. Count reps per side.']
  ],
  back: [
    ['Prone W raise', '', 'Lie face down and lift your arms slightly into a W.'],
    ['Seated band row', 'Resistance bands', 'Use an intact band and pull your elbows back slowly.'],
    ['Scapular pull-up', 'Pull-up bar', 'Use a securely installed bar. Keep arms straight and draw shoulders gently down.']
  ]
};
const startingLevels = ['I’m not sure what I can do yet', 'I’ve never worked out regularly', 'Some experience', 'Train regularly'];
const beginner = profile => !startingLevels.slice(2).includes(profile.level);
const feelings = ['Skip', 'Energized', 'Calm', 'About the same', 'Tired'];
const confidence = ['Skip', 'More confident', 'About the same', 'I’d like more guidance'];
const walkthroughs = {
  'Wall push-up': ['Place your palms on the wall at shoulder height and step back slightly.', 'Bend your elbows to move toward the wall, then press back to standing.'],
  'Countertop push-up': ['Place your hands on a sturdy, fixed countertop and step your feet back.', 'Lower your chest toward the edge with control, then press away.'],
  'Hands-and-knees push-up': ['Start with hands under shoulders and knees under hips.', 'Slowly bend your elbows a little, then press the floor away.'],
  'Knee push-up': ['Start with hands under your shoulders and knees on the floor or mat.', 'Bend your elbows to lower your chest, then press back up.'],
  'Floor push-up': ['Start in a high plank with hands under your shoulders.', 'Bend your elbows to lower your chest, then push the floor away.'],
  'Chair sit-to-stand': ['Sit near the front of a stable chair with your feet flat.', 'Lean forward slightly, stand tall, then sit down slowly.'],
  'Bodyweight squat': ['Stand with your feet about shoulder-width apart.', 'Bend your hips and knees as if sitting down, then stand tall.'],
  'Reverse lunge': ['Stand tall with space behind you.', 'Step back and bend both knees to a comfortable depth. Return to standing and alternate sides.'],
  'Heel slide': ['Lie on your back with knees bent and feet on the floor.', 'Slide one heel away, bring it back, then switch sides.'],
  'Dead bug': ['Lie on your back with arms up and knees bent above your hips.', 'Slowly reach one arm and the opposite leg away, return, and switch sides.'],
  'Bird dog': ['Start on hands and knees with hands under shoulders.', 'Reach one arm and the opposite leg, pause, then return and switch sides.'],
  'Prone W raise': ['Lie face down and bend your elbows to make a W shape.', 'Lift your hands and elbows a little, pause, then lower gently.'],
  'Seated band row': ['Sit upright with the band secured around your feet and one end in each hand.', 'Pull your elbows toward your ribs, then slowly release.'],
  'Scapular pull-up': ['Grip a securely installed bar and start with your arms straight.', 'Draw your shoulders down to lift slightly, then lower slowly.']
};
const snacks = [
  ['Jícama with lime and Tajín', 'Mexican', ['Crunchy','Tangy','Spicy'], [], 'Slice peeled jícama into sticks, squeeze over lime, and sprinkle with Tajín.'],
  ['Black bean tostada', 'Mexican', ['Crunchy','Tangy'], [], 'Top a corn tostada with mashed black beans and pico de gallo.'],
  ['Mango with lime', 'Mexican', ['Sweet','Tangy'], [], 'Dice mango and finish with a squeeze of lime.'],
  ['Cucumber and hummus', 'Mediterranean', ['Crunchy'], ['Sesame'], 'Slice cucumbers and dip in hummus.'],
  ['Greek yogurt and berries', 'Mediterranean', ['Sweet'], ['Dairy'], 'Spoon berries over plain Greek yogurt.'],
  ['Chana chaat', 'South Asian', ['Tangy','Spicy'], [], 'Toss cooked chickpeas with cucumber, lime, and a pinch of chaat masala.'],
  ['Apple and almond butter', 'Any', ['Sweet','Crunchy'], ['Nuts'], 'Slice an apple and serve with almond butter.'],
  ['Orange and pumpkin seeds', 'Any', ['Sweet','Crunchy'], [], 'Peel an orange and serve with a handful of pumpkin seeds.']
];
const metrics = [
  ['weight','Weight','lb'], ['height','Height','in'], ['waist','Waist','in'], ['hips','Hips','in'],
  ['chest','Chest','in'], ['arm','Upper arm','in'], ['thigh','Thigh','in'], ['fat','Total body fat estimate','%'],
  ['subfat','Device subcutaneous fat estimate','%'], ['fold','Skinfold thickness','mm']
];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => new Date(value).toLocaleDateString(undefined, {month:'short',day:'numeric',year:'numeric'});
function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); storageIssue = false; }
  catch { storageIssue = true; }
}
function weekStart(time) {
  const d = new Date(time);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  d.setHours(0,0,0,0);
  return +d;
}
function previousWeek(time) {
  const d = new Date(time);
  d.setDate(d.getDate() - 7);
  return +d;
}
function stats() {
  const weeks = new Map();
  for (const workout of state.workouts) {
    const key = weekStart(workout.time);
    const item = weeks.get(key) || {count:0, target:workout.target};
    item.count++;
    weeks.set(key, item);
  }
  let best = 0, run = 0, previous;
  for (const [time, item] of [...weeks].sort((a,b) => a[0]-b[0])) {
    run = item.count >= item.target ? (previousWeek(time) === previous ? run + 1 : 1) : 0;
    best = Math.max(best, run);
    previous = time;
  }
  const now = weekStart(Date.now());
  const current = weeks.get(now) || {count:0,target:state.profile.days};
  let start = current.count >= current.target ? now : previousWeek(now), streak = 0;
  while (weeks.has(start) && weeks.get(start).count >= weeks.get(start).target) {
    streak++;
    start = previousWeek(start);
  }
  return { ...current, streak, best };
}
function options(values, selected) {
  return values.map(value => `<option ${String(value) === String(selected) ? 'selected' : ''}>${value}</option>`).join('');
}
function checks(name, values, selected = []) {
  return `<div class="grid">${values.map(value => `<label class="check"><input type="checkbox" name="${name}" value="${value}" ${selected.includes(value) ? 'checked' : ''}>${value}</label>`).join('')}</div>`;
}
function setup() {
  const p = state.profile || {};
  return `<div class="hero"><div class="eyebrow">THE STARTER WEEK</div><h1>Meet the you you’ve never known.</h1><p>Tell us what you have at home and how much time you have. We’ll guide you through your first workout.</p></div>
    <form id="setup"><fieldset><legend>Your training</legend><div class="grid">
    <label>Primary goal<select name="goal">${options(goals,p.goal)}</select></label>
    <label>Starting point<select name="level">${options(startingLevels,p.level)}</select></label>
    <label>Workouts per week<select name="days">${options([2,3,4],p.days || 3)}</select></label>
    <label>Time per workout<select name="minutes">${options([15,20,25,30],p.minutes || 20)}</select></label></div></fieldset>
    <fieldset><legend>What do you already have at home?</legend><p>Choose what you can use today. A mat helps cushion floor exercises. A wall or fixed countertop opens up easier push-ups. Leave these blank if you only have floor space or you’re unsure.</p>${checks('gear',gear,p.gear)}</fieldset>
    <fieldset><legend>Snack preferences · optional</legend><label>Favorite cuisine<select name="cuisine">${options(['Skip',...cuisines],p.cuisine)}</select></label>
    <p>Flavors you enjoy</p>${checks('flavor',flavors,p.flavors)}
    <p>Ingredients to avoid</p>${checks('avoid',avoid,p.avoid)}</fieldset>
    <button class="primary">Save my plan</button></form>`;
}
function chooseMoves(short) {
  const p = state.profile;
  const families = state.workouts.length % 2 ? ['legs','back','push','core'] : ['push','legs','back','core'];
  return families.slice(0,short ? 2 : 4).map(family => {
    const available = moves[family].filter(([,required]) => !required || p.gear.includes(required));
    const last = state.workouts.slice().reverse().flatMap(workout => workout.sets.slice().reverse()).find(set => set.family === family);
    const index = last ? available.findIndex(([name]) => name === last.name) : -1;
    let next = Math.max(0,index);
    let reason = 'Starting variation for your equipment and experience.';
    if (index < 0 && !beginner(p)) next = Math.min(1,available.length-1);
    if (index >= 0) {
      if (last.effort === 'Hard') next = Math.max(0,index-1);
      if (last.effort === 'Easy' && last.reps >= last.target) next = Math.min(available.length-1,index+1);
      reason = next > index ? 'You met your last rep target and rated it easy.' : next < index ? 'You rated the last variation hard.' : 'Repeat this variation to build consistency.';
    }
    return {family, name:available[next][0], reason};
  });
}
function start(short) {
  const p = state.profile;
  const last = state.workouts.at(-1);
  const comeback = !!last && Date.now() - last.time >= 14 * 86400000;
  const reduced = short || comeback;
  state.session = {
    short, comeback, moves:chooseMoves(reduced), sets:[], rest:0, index:0,
    rounds:comeback || (beginner(p) && !state.workouts.length) ? 1 : 2,
    target:beginner(p) ? 6 : p.goal === 'Build muscle' ? 10 : 8,
    minutes:short ? 10 : comeback ? 10 : p.minutes
  };
  save();
  render();
}
function today() {
  if (state.session) return workout();
  const p = state.profile, s = stats();
  return `<div class="hero"><div class="eyebrow">WEEK 01 / YOUR NEXT SESSION</div><h1>${state.workouts.length ? 'Ready to train?' : 'Your first workout'}</h1><p>${p.goal} · ${p.minutes} min available · ${p.days} days per week</p>
  <div class="row"><button class="primary" data-action="start">Start workout</button><button data-action="short">Short on Time · 10 min</button></div></div>
  <section><h2>This week</h2><p>${s.count} of ${s.target} workouts · ${s.streak} week streak</p><progress value="${Math.min(s.count,s.target)}" max="${s.target}" aria-label="Weekly workouts"></progress></section>
  <section><h2>Your setup</h2><p>${p.gear.length ? p.gear.join(' · ') : 'Clear floor space'}</p><p>Short sessions count toward your weekly goal when you complete all their sets.</p></section>`;
}
function workout() {
  const s = state.session;
  if (s.index >= s.moves.length) return `<div class="hero"><div class="eyebrow">SESSION COMPLETE</div><h1>Good work.</h1><p>${s.sets.length} sets ready to save to your history.</p><form id="finish"><fieldset><legend>How did it go? · Optional</legend><div class="grid">
    <label>How did you feel afterward?<select name="feeling">${options(feelings)}</select></label>
    <label>How confident do you feel doing this again on your own?<select name="confidence">${options(confidence)}</select></label>
    </div></fieldset><button class="primary">Save workout</button></form></div>`;
  const move = s.moves[s.index];
  const variants = moves[move.family].filter(([,required]) => !required || state.profile.gear.includes(required));
  const info = variants.find(([name]) => name === move.name) || variants[0];
  const [name, required, cue] = info;
  const setCount = s.sets.filter(set => set.step === s.index).length;
  const surface = required || (['core','back'].includes(move.family) && state.profile.gear.includes('Yoga mat') ? 'Yoga mat optional' : 'Floor space');
  return `<div class="hero"><div class="eyebrow">${s.comeback ? 'COMEBACK SESSION' : s.short ? 'SHORT SESSION' : 'TRAINING SESSION'} · ${s.minutes} MIN AVAILABLE</div><h1>${name}</h1><p>Exercise ${s.index+1} of ${s.moves.length} · Set ${setCount+1} of ${s.rounds} · ${surface}</p></div>
    ${s.sets.length ? '' : '<section><h2>Warm up</h2><p>Spend a few minutes marching in place, circling your arms, and rehearsing easy versions of the first moves.</p></section>'}
    <section><p>${cue}</p><p>${move.reason}</p><p>Aim for ${s.target} controlled reps. Finish with a couple of reps left in reserve.</p>
    <details class="walkthrough"><summary>Show me how</summary><ol>${walkthroughs[name].map(step => `<li>${step}</li>`).join('')}</ol></details>
    ${variants[0][0] !== name ? '<button type="button" data-action="easier">Choose a gentler variation</button>' : ''}
    <label>Swap variation<select id="swap">${options(variants.map(([variant]) => variant),name)}</select></label>
    <p class="timer" id="timer" aria-label="Rest timer"></p><button data-action="rest">Start 60-second rest</button>
    <form id="set"><div class="grid"><label>Reps completed<input type="number" min="0" max="200" required name="reps" inputmode="numeric"></label>
    <label>How it felt<select name="effort">${options(['About right','Easy','Hard'])}</select></label>
    <label>Setup detail (optional)<input name="detail" maxlength="60" placeholder="e.g. 36-inch counter"></label></div>
    <p><button class="primary">Log set</button></p></form></section>
    <button data-action="discard">Discard session</button>`;
}
function plan() {
  return `<div class="hero"><div class="eyebrow">THE ROADMAP</div><h1>Your training plan</h1><p>${state.profile.days} sessions per week. Repeat Week 1 whenever you like.</p></div>
  <section><h2>01 · Learn the basics</h2><p>Alternate two full-body sessions with pushing, legs, trunk work, and back work. Start at a variation you can control.</p><button class="primary" data-page="Today">Go to today</button></section>
  <section><h2>02 · Build consistency</h2><p>Roadmap preview · Repeat familiar movements and track how the sets feel.</p></section>
  <section><h2>03 · Try the next variation</h2><p>Roadmap preview · Explore harder variations where your logged sets show readiness.</p></section>
  <section><h2>04 · Review and reset</h2><p>Roadmap preview · Compare strength and consistency before choosing your next goal.</p></section>`;
}
function bestSets() {
  const best = new Map();
  for (const workout of state.workouts) for (const set of workout.sets) {
    const key = JSON.stringify([set.name,set.detail.toLowerCase()]);
    if (!best.has(key) || best.get(key).reps < set.reps) best.set(key,set);
  }
  return [...best.values()];
}
function progress() {
  const s = stats(), count = state.workouts.length;
  const badges = [
    ['✦','First Rep',count > 0,'Complete your first workout'],
    ['●','First Full Set',state.workouts.some(w => w.sets.some(set => set.reps >= set.target)),'Reach your rep target in a set'],
    ['▲','On a Roll',s.best >= 3,'Meet your weekly goal three weeks in a row'],
    ['◆','Level Up',state.workouts.some(w => w.sets.some(set => set.advanced && set.reps > 0)),'Log reps in a recommended harder variation'],
    ['↻','Back in Motion',state.workouts.some(w => w.comeback),'Complete a comeback session'],
    ['★','Starter Finisher',s.best >= 1,'Meet your weekly workout goal']
  ];
  return `<div class="hero"><div class="eyebrow">YOUR TRAINING LOG</div><h1>Progress</h1><p>${count} workouts · ${s.streak} current streak · ${s.best} best streak (weeks)</p></div>
  <section><h2>Badges</h2><ul class="log">${badges.map(([icon,title,earned,rule]) => `<li><strong>${earned ? icon : '○'} ${title}</strong> · ${earned ? 'Earned' : rule}</li>`).join('')}</ul></section>
  <section><h2>Personal bests by setup</h2>${count ? `<ul class="log">${bestSets().map(set => `<li>${escapeHtml(set.name)}${set.detail ? ' · '+escapeHtml(set.detail) : ''} · ${set.reps} reps</li>`).join('')}</ul>` : '<p>Log a workout to see your best sets.</p>'}</section>
  <section><h2>Workout history</h2>${state.workouts.slice().reverse().map(w => `<details><summary>${date(w.time)} · ${w.comeback ? 'Comeback' : w.short ? 'Short' : 'Full'} workout · ${w.sets.length} sets</summary>
    ${w.feeling ? `<p>Afterward · ${escapeHtml(w.feeling)}</p>` : ''}
    ${w.confidence ? `<p>Confidence · ${escapeHtml(w.confidence)}</p>` : ''}<ul class="log">${w.sets.map(set => `<li>${set.name} · ${set.reps} reps · ${set.effort}${set.detail ? ' · '+escapeHtml(set.detail) : ''}</li>`).join('')}</ul></details>`).join('') || '<p>No workouts yet.</p>'}</section>
  ${bodyCheck()}`;
}
function bodyCheck() {
  const rows = state.checks.slice().reverse();
  return `<section><h2>Body check-in</h2><p>Optional. Use the same setup and method for comparable readings.</p><details><summary>Add a check-in</summary>
    <form id="body"><div class="grid">${metrics.map(([id,label,unit]) => `<label>${label} (${unit})<input type="number" step="any" min="0.01" ${unit === '%' ? 'max="100"' : ''} name="${id}"></label>`).join('')}
    <label>Fat estimate source<input name="source" maxlength="60" placeholder="Scale model or method"></label>
    <label>Skinfold site<input name="site" maxlength="60" placeholder="e.g. triceps"></label>
    <label class="check"><input name="adult" type="checkbox">I’m 20 or older (show BMI)</label></div><p>BMI is based on height and weight and is a screening measure. Body fat values are estimates.</p><button class="primary">Save check-in</button></form></details>
    ${metrics.map(([id,label,unit]) => trend(id,label,unit)).join('')}
    ${rows.map(row => `<details><summary>${date(row.time)}</summary><ul class="log">${metrics.filter(([id]) => row[id]).map(([id,label,unit]) => `<li>${label} · ${row[id]} ${unit}</li>`).join('')}${row.bmi ? `<li>BMI · ${row.bmi}</li>` : ''}${row.source ? `<li>Source · ${escapeHtml(row.source)}</li>` : ''}${row.site ? `<li>Site · ${escapeHtml(row.site)}</li>` : ''}</ul><button data-action="delete-check" data-id="${row.time}">Delete check-in</button></details>`).join('') || '<p>No check-ins yet.</p>'}</section>`;
}
function trend(id,label,unit) {
  const groups = new Map();
  for (const row of state.checks) {
    if (!row[id]) continue;
    const source = id === 'fold' ? row.site : ['fat','subfat'].includes(id) ? row.source : '';
    if (!groups.has(source)) groups.set(source,[]);
    groups.get(source).push(row[id]);
  }
  return [...groups].filter(([,values]) => values.length > 1).map(([source,values]) => {
    const low = Math.min(...values), range = Math.max(...values)-low || 1;
    const points = values.map((value,i) => `${4+232*i/(values.length-1)},${56-48*(value-low)/range}`).join(' ');
    return `<div><strong>${label}${source ? ' · '+escapeHtml(source) : ''}</strong><svg class="trend" viewBox="0 0 240 60" role="img" aria-label="${label}: ${values[0]} to ${values.at(-1)} ${unit}"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3"/></svg><p>${values[0]} → ${values.at(-1)} ${unit}</p></div>`;
  }).join('');
}
function food() {
  const p = state.profile;
  const score = snack => (snack[1] === p.cuisine ? 5 : 0) + snack[2].filter(flavor => p.flavors.includes(flavor)).length;
  const suggested = snacks.filter(snack => !snack[3].some(item => p.avoid.includes(item))).sort((a,b) => score(b)-score(a)).slice(0,3);
  return `<div class="hero"><div class="eyebrow">QUICK SNACKS</div><h1>Food you enjoy</h1><p>Simple ideas based on your preferences. Check packaged ingredients for your dietary needs.</p><button data-page="Setup">Edit preferences</button></div>
  ${suggested.map(([name,cuisine,, ,prep]) => `<section><div class="eyebrow">${cuisine === 'Any' ? 'PANTRY SNACK' : cuisine}</div><h2>${name}</h2><p>${prep}</p></section>`).join('') || '<p>No snacks match your current preferences.</p>'}`;
}
function settings() {
  return `<div class="hero"><div class="eyebrow">DEVICE & PREFERENCES</div><h1>Settings</h1><p>Your training and check-ins are saved in this browser. An export includes both.</p></div>
  <section class="row"><button data-page="Setup">Edit setup</button><button data-action="export">Export data</button><button data-action="reset">Delete all data</button></section>`;
}
const pages = {Today:today,Plan:plan,Progress:progress,Snacks:food,Settings:settings,Setup:setup};
function render() {
  app.innerHTML = (storageIssue ? '<p role="alert">Browser storage is unavailable. Changes may be lost when you close or reload this page.</p>' : '') + pages[page]();
  nav.innerHTML = state.profile ? Object.keys(pages).filter(name => name !== 'Setup').map(name => `<button data-page="${name}" ${page === name ? 'aria-current="page"' : ''}>${name}</button>`).join('') : '';
  tick();
}
function tick() {
  const timer = document.querySelector('#timer');
  if (!timer) return;
  const end = state.session.rest;
  const left = Math.max(0,Math.ceil((end-Date.now())/1000));
  const text = left ? `Rest · ${left}s` : end ? 'Rest complete' : 'Rest timer ready';
  if (timer.textContent !== text) timer.textContent = text;
}
function navigate(next) {
  page = next;
  render();
  window.scrollTo(0,0);
}
document.addEventListener('submit',event => {
  event.preventDefault();
  const form = event.target, data = new FormData(form);
  if (form.id === 'setup') {
    if (state.session && !confirm('Changing your setup will discard the workout in progress. Continue?')) return;
    state.session = null;
    state.profile = {
      goal:data.get('goal'), level:data.get('level'), days:+data.get('days'), minutes:+data.get('minutes'),
      gear:data.getAll('gear'), cuisine:data.get('cuisine'), flavors:data.getAll('flavor'), avoid:data.getAll('avoid')
    };
    save();
    navigate('Today');
  }
  if (form.id === 'set') {
    const s = state.session, move = s.moves[s.index];
    s.sets.push({...move,step:s.index,reps:+data.get('reps'),effort:data.get('effort'),detail:data.get('detail').trim(),target:s.target,advanced:move.reason.startsWith('You met')});
    if (s.sets.filter(set => set.step === s.index).length >= s.rounds) s.index++;
    s.rest = Date.now()+60000;
    save();
    render();
  }
  if (form.id === 'finish') {
    const {short,comeback,sets} = state.session;
    if (!sets.some(set => set.reps > 0)) return alert('Log at least one completed rep before saving.');
    const feeling = feelings.slice(1).find(value => value === data.get('feeling'));
    const confidenceRating = confidence.slice(1).find(value => value === data.get('confidence'));
    state.workouts.push({short,comeback,sets,time:Date.now(),target:stats().target,feeling,confidence:confidenceRating});
    state.session = null;
    save();
    navigate('Progress');
  }
  if (form.id === 'body') {
    const row = {time:Date.now(),source:data.get('source').trim(),site:data.get('site').trim()};
    for (const [id] of metrics) if (data.get(id)) row[id] = +data.get(id);
    if (!metrics.some(([id]) => row[id])) return alert('Enter at least one measurement.');
    if ((row.fat || row.subfat) && !row.source) return alert('Add the source of your body fat estimate.');
    if (row.fold && !row.site) return alert('Add the skinfold site.');
    if (data.has('adult') && row.weight && row.height) row.bmi = (row.weight*0.45359237/(row.height*0.0254)**2).toFixed(1);
    state.checks.push(row);
    save();
    render();
  }
});
document.addEventListener('change',event => {
  if (event.target.id !== 'swap') return;
  const s = state.session;
  Object.assign(s.moves[s.index],{name:event.target.value,reason:'You chose this variation.'});
  save();
  render();
});
document.addEventListener('click',event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.page) return navigate(button.dataset.page);
  switch (button.dataset.action) {
    case 'start': return start(false);
    case 'short': return start(true);
    case 'rest':
      state.session.rest = Date.now()+60000;
      save();
      return tick();
    case 'easier': {
      const move = state.session.moves[state.session.index];
      const variants = moves[move.family].filter(([,required]) => !required || state.profile.gear.includes(required));
      const index = variants.findIndex(([name]) => name === move.name);
      if (index > 0) Object.assign(move,{name:variants[index-1][0],reason:'You chose a gentler variation.'});
      break;
    }
    case 'discard':
      if (!confirm('Discard this workout and its logged sets?')) return;
      state.session = null;
      break;
    case 'delete-check':
      state.checks = state.checks.filter(row => row.time !== +button.dataset.id);
      break;
    case 'reset':
      if (!confirm('Permanently delete all FormForge data from this browser?')) return;
      state = empty();
      page = 'Setup';
      break;
    case 'export': {
      const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
      const link = Object.assign(document.createElement('a'),{href:url,download:'formforge-data.json'});
      link.click();
      setTimeout(() => URL.revokeObjectURL(url),1000);
      return;
    }
    default: return;
  }
  save();
  render();
});
setInterval(tick,250);
render();
