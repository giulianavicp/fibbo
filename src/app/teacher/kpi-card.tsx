import { ArrowUp, ArrowDown } from 'lucide-react';
import { C } from '../lib/tokens';

const KPICard = ({ label, value, sub, icon, color, bg, trend }: { label:string; value:string; sub:string; icon:React.ReactNode; color:string; bg:string; trend?:'up'|'down'|null }) => (
  <div style={{ background:C.card, borderRadius:'0.75rem', padding:'1.125rem', border:`1px solid ${C.border}` }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
      <div style={{ width:'2.25rem', height:'2.25rem', borderRadius:'0.625rem', background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
      {trend && <div style={{ display:'flex', alignItems:'center', gap:'2px', color:trend==='up'?C.success:C.error, fontSize:'0.7rem', fontWeight:600 }}>{trend==='up'?<ArrowUp size={11}/>:<ArrowDown size={11}/>}{trend==='up'?'+2.3%':'-1.1%'}</div>}
    </div>
    <div style={{ color:C.title, fontSize:'1.5rem', fontWeight:800, lineHeight:1 }}>{value}</div>
    <div style={{ color:C.title, fontSize:'0.8rem', fontWeight:600, marginTop:'0.25rem' }}>{label}</div>
    <div style={{ color:C.textTer, fontSize:'0.7rem', marginTop:'1px' }}>{sub}</div>
  </div>
);

export default KPICard;
