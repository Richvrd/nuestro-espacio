'use client';

import type { MomentIntensity } from '../types';

export function MomentNode({ intensity }: { intensity: MomentIntensity }) {
  if (intensity === 'normal') {
    return <div className="tl-node node-normal" />;
  }
  if (intensity === 'high') {
    return <div className="tl-node node-high" />;
  }
  return (
    <div className="tl-node node-vhigh">
      <div className="node-vhigh-ring" />
      <span>✦</span>
    </div>
  );
}
