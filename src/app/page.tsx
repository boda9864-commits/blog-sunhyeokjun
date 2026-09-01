import Link from 'next/link';
import TypewriterTitle from '@/components/TypewriterTitle';

export default function Home() {
  return (
    <main className="fade-in">
      <section className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 0'
      }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          
          {/* Rainy Windshield Smoked Glass Card */}
          <div 
            className="rain-glass"
            style={{ 
              maxWidth: '850px', 
              width: '100%',
              padding: '3.5rem 2.5rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <TypewriterTitle text="SUNHYEOKJUN" />

            {/* Quick Navigation Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 0
            }}>
              <Link href="/portfolio" className="btn-rain">
                PORTFOLIO
              </Link>
              <Link href="/tech" className="btn-rain" style={{ background: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                TECH STACK
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
