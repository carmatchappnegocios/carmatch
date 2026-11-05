function normalizeSpaces(str){return str.replace(/\s+/g,' ').trim();}
function cleanVersion(brand,model,version){
 if(!version) return '';
 const v=normalizeSpaces(version);
 const b=normalizeSpaces(brand||'');
 const m=normalizeSpaces(model||'');
 if(!b||!m||!v) return v;
 const prefix=`${b} ${m}`;
 const vLower=v.toLowerCase();
 const prefixLower=prefix.toLowerCase();
 if(vLower.startsWith(prefixLower)){
   let remaining=v.slice(prefix.length);
   remaining=normalizeSpaces(remaining);
   return remaining;
 }
 const vTokens=vLower.split(' ');
 const pTokens=prefixLower.split(' ');
 if(vTokens.length>=pTokens.length){
   const matches=pTokens.every((tok,i)=>vTokens[i]===tok);
   if(matches){
     const remaining=vTokens.slice(pTokens.length).join(' ');
     return normalizeSpaces(remaining);
   }
 }
 return v;
}
console.log(cleanVersion('ford','f-150','ford f-150 king ranch'));
console.log(cleanVersion('Ford','F-150','  Ford   F-150   King Ranch  '));
console.log(cleanVersion('Chevrolet','Suburban','1500 LT'));
