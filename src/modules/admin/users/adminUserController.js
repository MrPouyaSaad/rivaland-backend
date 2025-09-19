import * as userService from "./adminUserService.js";

export async function listUsers(req, res) {
  try {
    const { filter, search } = req.query;
    const users = await userService.getUsers(filter, search);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ success: true, message: "کاربر حذف شد" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
