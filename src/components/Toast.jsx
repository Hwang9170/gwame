import { useEffect, useState } from 'react';

// id가 바뀔 때마다 2초간 메시지를 보여줍니다.
export default function Toast({ msg, id }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!msg) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, [msg, id]);
  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">{msg}</div>
  );
}
