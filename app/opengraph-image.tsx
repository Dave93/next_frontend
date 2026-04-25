import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Chopar Pizza — доставка пиццы в Узбекистане'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'linear-gradient(135deg, #FFD86E 0%, #FAAF04 50%, #E89A00 100%)',
          fontFamily: 'sans-serif',
          color: '#1F2937',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            color: '#1B3D7C',
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#FFC22A',
              marginRight: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
            }}
          >
            🍕
          </div>
          CHOPAR PIZZA
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#1F2937',
              maxWidth: 1000,
            }}
          >
            Доставка пиццы с тандырным тестом
          </div>
          <div
            style={{
              fontSize: 36,
              color: 'rgba(31,41,55,0.75)',
              fontWeight: 600,
            }}
          >
            Халяль · Бесплатная доставка · Узбекистан
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 28,
            color: 'rgba(31,41,55,0.7)',
            fontWeight: 600,
          }}
        >
          <div>choparpizza.uz</div>
          <div>205 11 11</div>
        </div>
      </div>
    ),
    size
  )
}
