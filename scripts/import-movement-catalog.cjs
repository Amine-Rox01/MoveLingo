const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const original=path.resolve(__dirname,'../../movelingo/dist/MoveLingo.html');
const html=fs.readFileSync(original,'utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
let api;const storage=new Map();const empty={addEventListener(){},querySelectorAll(){return[]},querySelector(){return null},getAttribute(){return null},classList:{add(){},remove(){}},style:{},contains(){return true}};
const document={addEventListener(){},getElementById(){return empty},querySelectorAll(){return[]},querySelector(){return null},body:empty,documentElement:{setAttribute(){}}};
const context={document,window:{matchMedia:()=>({matches:false}),addEventListener(){},__MOVELINGO_TEST_HOOK__:x=>api=x},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Date,Math,Set,Map,JSON,Object,Array,Number,String,RegExp,NodeFilter:{SHOW_TEXT:4},setTimeout(){return 1},clearTimeout(){},setInterval(){},clearInterval(){},location:{hash:''}};
vm.runInNewContext(source.slice(0,source.indexOf('  var scoped = PRINT_CSS.replace'))+'\n})();',context);
if(!api||api.ACT_ORDER.length!==82)throw Error('Expected the original 82-activity library');
const data=api.ACT_ORDER.map(id=>{const a=api.ACT[id];return {id:a.id,name:a.name,category:a.cat,spaces:a.spaces,levels:a.levels,equipment:a.kit,energy:a.energy,description:a.desc,aim:a.aim,steps:a.steps,student:a.student,phrases:a.say,easier:a.easy,harder:a.hard,warm:a.warm,taskType:a.taskType,functions:a.functions||[],outcome:a.outcome||'',gap:a.gap||'',noRunning:!!a.noRunning,adaptations:a.adaptations||{},scene:api.activityScene(id)}});
const guide=data.find(a=>a.id==='blind');
if(guide){guide.name='Eyes-open guide';guide.steps[0]='Set a short, clear route with cones. Partners agree their roles and keep their eyes open. One partner walks slowly while the other gives English directions; either may stop at any time.';}
fs.writeFileSync(path.resolve(__dirname,'../lib/movement-catalog.json'),JSON.stringify(data,null,2));
console.log('Imported '+data.length+' original and extended movement activities.');
