export const seedUser = { id:'user-1', name:'', username:'', email:'' };

const daysAgo = (n) => { const d = new Date(); d.setHours(10,0,0,0); d.setDate(d.getDate()-n); return d.toISOString(); };
const daysFromNow = (n) => { const d = new Date(); d.setHours(23,59,59,999); d.setDate(d.getDate()+n); return d.toISOString(); };

export const seedChallenges = [
  { id:'challenge-1', title:'Learn JavaScript', description:'Build a steady practice habit with focused JavaScript sessions.', target:'26 successful sessions', durationDays:30, startDate:daysAgo(12), endDate:daysFromNow(18), frequency:'5× per week', threshold:26, reward:'Ship one small JavaScript project', status:'active', completedSessions:18, missedSessions:1, lateSessions:2, streak:6, bestStreak:9, sessions:Array.from({length:21},(_,i)=>({id:`s-${i}`,dueDate:daysAgo(21-i),status:i===20?'pending':i===18?'missed':i===17?'late':'completed',proof:i<19?{text:i===17?'Late proof submitted after the session window.':'Focused practice session completed.'}:null})) },
  { id:'challenge-2', title:'Read & Reflect', description:'Keep a consistent reading and reflection rhythm.', target:'20 sessions', durationDays:30, startDate:daysAgo(8), endDate:daysFromNow(22), frequency:'4× per week', threshold:20, reward:'Complete a reflection note at the end', status:'active', completedSessions:7, missedSessions:0, lateSessions:1, streak:4, bestStreak:5, sessions:[] },
  { id:'challenge-3', title:'30-day Morning Movement', description:'A completed consistency cycle focused on short movement sessions.', target:'24 successful sessions', durationDays:30, startDate:daysAgo(45), endDate:daysAgo(15), frequency:'5× per week', threshold:24, reward:'Celebrate the completed cycle', status:'completed', completedSessions:25, missedSessions:1, lateSessions:3, streak:0, bestStreak:11, sessions:[] }
];

export const seedCommitments = [
  { id:'commitment-1', name:'Read every day', target:'20 pages', frequency:'Daily', note:'Keep the reading session small enough to repeat.', streak:8, bestStreak:15, status:'active', history:[{date:daysAgo(0),status:'completed',proof:'Read pages 41–60.'},{date:daysAgo(1),status:'completed',proof:'Read pages 21–40.'},{date:daysAgo(2),status:'completed',proof:'Read pages 1–20.'}] },
  { id:'commitment-2', name:'Weekly memorisation', target:'3 pages', frequency:'Weekly', note:'One focused memorisation block each week.', streak:4, bestStreak:7, status:'active', history:[{date:daysAgo(2),status:'completed',proof:'Reviewed and memorised the planned pages.'}] }
];

export const seedActivity = [
  { id:'a1', type:'proof', title:'Learn JavaScript', text:'Focused practice session completed.', time:daysAgo(0) },
  { id:'a2', type:'proof', title:'Read every day', text:'Read pages 41–60.', time:daysAgo(0) },
  { id:'a3', type:'proof', title:'Learn JavaScript', text:'Late proof accepted and streak preserved.', time:daysAgo(1) }
];
