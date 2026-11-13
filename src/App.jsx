import { useCallback, useEffect, useRef, useState } from 'react';
import { PRODUCTS } from './shop.js';
import useReveal from './hooks/useReveal.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Story from './components/Story.jsx';
import Features from './components/Features.jsx';
import Process from './components/Process.jsx';
import Products from './components/Products.jsx';
import HowTo from './components/HowTo.jsx';
import Nutrition from './components/Nutrition.jsx';
import Faq from './components/Faq.jsx';
import Order from './components/Order.jsx';
import Footer from './components/Footer.jsx';
import MobileBar from './components/MobileBar.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  useReveal();

  const [cart, setCart] = useState(() => Object.fromEntries(PRODUCTS.map((p) => [p.id, 0])));
  const [toast, setToast] = useState({ msg: '', id: 0 });
  const [pastHero, setPastHero] = useState(false);
  const heroRef = useRef(null);

  const showToast = useCallback((msg) => setToast((t) => ({ msg, id: t.id + 1 })), []);

  const changeQty = useCallback((id, delta) => {
    setCart((c) => ({ ...c, [id]: Math.max(0, Math.min(99, c[id] + delta)) }));
  }, []);

  const addToCart = (p) => {
    changeQty(p.id, 1);
    showToast(`${p.name} 담았어요 (${cart[p.id] + 1}개)`);
  };

  useEffect(() => {
    const onScroll = () => {
      const h = heroRef.current?.offsetHeight ?? 600;
      setPastHero(window.scrollY > h * 0.6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="topbar">
        <div className="wrap">🐟 <b>2026 햇과메기 출하 시작</b> · 오후 2시 이전 주문 당일 발송</div>
      </div>
      <Header />
      <main id="top">
        <Hero ref={heroRef} />
        <Story />
        <Features />
        <Process />
        <Products onAdd={addToCart} />
        <HowTo />
        <Nutrition />
        <Faq />
        <Order cart={cart} onChangeQty={changeQty} showToast={showToast} />
      </main>
      <Footer />
      <MobileBar show={pastHero} count={count} />
      <Toast msg={toast.msg} id={toast.id} />
    </>
  );
}
