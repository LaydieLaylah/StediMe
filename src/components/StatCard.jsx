import React from 'react';
export default function StatCard({label,value,detail,accent}){return <div className={`stat-card ${accent?'accent':''}`}><div className="eyebrow">{label}</div><strong>{value}</strong>{detail&&<span>{detail}</span>}</div>}
