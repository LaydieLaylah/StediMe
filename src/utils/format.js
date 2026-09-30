export const formatDate=d=>new Intl.DateTimeFormat(undefined,{day:'numeric',month:'short',year:'numeric'}).format(new Date(d));
export const formatRelative=d=>{const diff=Date.now()-new Date(d).getTime();const mins=Math.floor(diff/60000);if(mins<1)return'Just now';if(mins<60)return`${mins}m ago`;const h=Math.floor(mins/60);if(h<24)return`${h}h ago`;const days=Math.floor(h/24);return`${days}d ago`};
export const greeting=(username)=>{const h=new Date().getHours();const prefix=h<5?'Good night':h<12?'Good morning':h<18?'Good afternoon':h<22?'Good evening':'Good night';return`${prefix}, @${username}`};
export const pct=(a,b)=>b?Math.min(100,Math.round(a/b*100)):0;
