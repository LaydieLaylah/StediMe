import {useEffect,useState} from 'react';
import {getStore,setStore} from '../services/store';
export function useStore(){const [store,setState]=useState(()=>getStore()); useEffect(()=>{const fn=()=>setState(getStore());window.addEventListener('storage',fn);return()=>window.removeEventListener('storage',fn)},[]); const refresh=()=>setState(getStore()); const commit=next=>{setStore(next);setState(next)}; return {store,refresh,commit};}
