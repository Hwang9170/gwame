import { SHOP } from '../shop.js';

export default function Footer() {
  const [first, second] = SHOP.name.split(' ');
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="flogo">{first} <b>{second}</b></div>
        <p>{SHOP.address} · 대표 {SHOP.owner} · 사업자등록번호 {SHOP.bizNo}</p>
        <p>통신판매업신고 {SHOP.mailOrderNo} · 전화 {SHOP.phone}</p>
        <p className="copy">© {new Date().getFullYear()} {SHOP.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
