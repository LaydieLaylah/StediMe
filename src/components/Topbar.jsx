import React from 'react';
import {Menu} from 'lucide-react';
export default function Topbar({section,onMenu,user}){return <header className="topbar"><div className="brand">StediMe</div><div className="section-name">{section}</div><div className="mobile-user">@{user.username}</div><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={24}/></button></header>}
