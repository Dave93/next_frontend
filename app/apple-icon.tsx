import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #FFD86E 0%, #FAAF04 60%, #E89A00 100%)',
          color: '#1B3D7C',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          CP
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginTop: 6,
            letterSpacing: 1.5,
          }}
        >
          PIZZA
        </div>
      </div>
    ),
    size
  )
}
