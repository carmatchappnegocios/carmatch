function normalizeSpaces(s){return s.replace(/\s+/g,' ').trim();}
function cleanVersion(b,m,v){if(!v)return '';const vv=normalizeSpaces(v);const bb=normalizeSpaces(b||'');const mm=normalizeSpaces(m||'');if(!bb||!mm||!vv)return vv;const prefix=`${bb} ${mm}`;if(vv.toLowerCase().startsWith(prefix.toLowerCase())){let r=vv.slice(prefix.length);return normalizeSpaces(r);}return vv;}
function build(b,m,v,y){const bb=normalizeSpaces(b||'');const mm=normalizeSpaces(m||'');const cv=cleanVersion(bb,mm,v);const yy=y?String(y):'';const parts=[bb,mm,cv,yy].filter(Boolean);return normalizeSpaces(parts.join(' '));}
console.log(build('','Model','',2020));
console.log(build('Toyota','','Corolla',2020));
console.log(build('Toyota','Corolla','Toyota Corolla XSE',2020));
