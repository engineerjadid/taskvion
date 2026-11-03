import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TaskVion IT Solutions — Property Preservation Back Office Support';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '68px 76px', background: 'linear-gradient(135deg, #06152b 0%, #0b2851 62%, #123e78 100%)', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>T</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 27, fontWeight: 800, letterSpacing: '-1px' }}>TASKVION<span style={{ fontSize: 13, letterSpacing: 5, color: '#91baff', marginTop: 5 }}>IT SOLUTIONS</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 970 }}>
          <div style={{ fontSize: 18, letterSpacing: 4, color: '#8db9ff', fontWeight: 700, marginBottom: 20 }}>U.S.-FOCUSED OPERATIONS SUPPORT</div>
          <div style={{ fontSize: 62, lineHeight: 1.08, letterSpacing: -2, fontWeight: 800 }}>Property Preservation</div>
          <div style={{ fontSize: 62, lineHeight: 1.08, letterSpacing: -2, fontWeight: 800, color: '#7fb4ff' }}>Back Office Support</div>
          <div style={{ fontSize: 23, color: '#d3e0f3', marginTop: 24 }}>Work orders · Documentation · Bids · Invoices · BPO</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,.25)', paddingTop: 20, color: '#b7c9e2', fontSize: 17 }}>
          <span>Process-led. Quality-focused. Clear communication.</span><span>PROPERTY PRESERVATION · BPO · IT SOLUTIONS</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
