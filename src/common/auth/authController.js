import { login, requestLoginCode, verifyLoginCode } from "./authService.js";

export async function loginController(req, res) {
  try {
    const { username, password } = req.body;
    const { token, role } = await login(username, password);
    res.json({ success: true, token, role });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
}

export async function requestLoginCodeController(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "شماره الزامی است" });

    const result = await requestLoginCode(phone);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function verifyLoginCodeController(req, res) {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: "شماره و کد الزامی است" });
    }

    const result = await verifyLoginCode(phone, code);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
