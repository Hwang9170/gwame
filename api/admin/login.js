import { body, checkPassword, clearLoginCookie, isAdmin, route, send, setLoginCookie } from '../../server/http.js';

// GET: 로그인 상태 확인 / POST: 로그인 / DELETE: 로그아웃
export default route(['GET', 'POST', 'DELETE'], async (req, res) => {
  if (req.method === 'GET') return send(res, 200, { loggedIn: isAdmin(req) });
  if (req.method === 'DELETE') {
    clearLoginCookie(res);
    return send(res, 200, { loggedIn: false });
  }
  if (!checkPassword(body(req).password)) {
    await new Promise((r) => setTimeout(r, 800)); // 무작위 대입 늦추기
    return send(res, 401, { error: '비밀번호가 맞지 않아요.' });
  }
  setLoginCookie(res);
  send(res, 200, { loggedIn: true });
});
