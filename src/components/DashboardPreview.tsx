import { useState, useEffect } from 'react';
import Avatar from './Avatar';

export default function DashboardPreview(){
  const [progress] = useState(62);
  // animate on mount
  const [fill, setFill] = useState(0);
  useEffect(()=>{ const t = setTimeout(()=>setFill(progress),120); return ()=>clearTimeout(t); },[progress]);

  return (
    <div className="dashboard-card w-full max-w-md text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-white/70">Active Trade</div>
          <div className="trade-id">#TR-239104</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-white/60">Value</div>
          <div className="value-badge">$3,200</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="trade-meta">
            <Avatar src="/images/avatar1.jpg" alt="Buyer" className="avatar-sm" />
            <div>
              <div className="text-sm font-semibold">Buyer</div>
              <div className="text-xs text-white/60">@alice</div>
            </div>
          </div>
          <div className="text-white/40">→</div>
          <div className="trade-meta">
            <Avatar src="/images/avatar2.jpg" alt="Seller" className="avatar-sm" />
            <div>
              <div className="text-sm font-semibold">Seller</div>
              <div className="text-xs text-white/60">@bob</div>
            </div>
          </div>
        </div>

        <div className="status-pill">In Escrow</div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-white/70">Escrow Status</div>
          <div className="text-sm font-medium">{fill}%</div>
        </div>
        <div className="progress"><i style={{ width: `${fill}%` }} /></div>
      </div>

      <div className="text-sm text-white/70">Verification: <span className="text-white font-medium">ID checked</span></div>
    </div>
  );
}
