import React from 'react';
import {Outlet} from 'react-router-dom';export default function AuthLayout(){return <div className="auth-layout"><div className="auth-brand">StediMe</div><div className="auth-tagline">Keep showing up.</div><Outlet/></div>}
