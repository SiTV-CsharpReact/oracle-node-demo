  const express = require('express');
  const router = express.Router();
  const db = require('../config/db');

  /**
   * @swagger
   * tags:
   *   name: Accounts
   *   description: API quản lý tài khoản đăng nhập
   */

  /**
   * @swagger
   * /accounts:
   *   get:
   *     summary: Lấy tất cả tài khoản đăng nhập
   *     tags: [Accounts]
   *     responses:
   *       200:
   *         description: Lấy dữ liệu thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 Code:
   *                   type: integer
   *                   example: 200
   *                 Message:
   *                   type: string
   *                   example: Lấy dữ liệu thành công
   *                 Data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       MAKH:
   *                         type: string
   *                       MANV:
   *                         type: string
   *                       TAIKHOAN:
   *                         type: string
   *                       MATKHAU:
   *                         type: string
   *                       VAITRO:
   *                         type: string
   *       500:
   *         description: Lỗi server
   */
  router.get('/', async (req, res) => {
    try {
      const sql = `SELECT * FROM SYSTEM.TKDANGNHAP`;
      const result = await db.execute(sql);
      res.json({ Code: 200, Message: "Lấy dữ liệu thành công", Data: result.rows });
    } catch (error) {
      console.error("Lỗi lấy danh sách tài khoản:", error);
      res.status(500).json({ Code: 500, Message: "Lỗi server" });
    }
  });

  /**
   * @swagger
   * /accounts/login:
   *   post:
   *     summary: Đăng nhập theo tài khoản và mật khẩu
   *     tags: [Accounts]
   *     requestBody:
   *       description: Thông tin đăng nhập
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - taikhoan
   *               - matkhau
   *             properties:
   *               taikhoan:
   *                 type: string
   *                 example: user123
   *               matkhau:
   *                 type: string
   *                 example: password123
   *     responses:
   *       200:
   *         description: Đăng nhập thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 Code:
   *                   type: integer
   *                   example: 200
   *                 Message:
   *                   type: string
   *                   example: Đăng nhập thành công
   *                 Data:
   *                   type: object
   *                   properties:
   *                     MAKH:
   *                       type: string
   *                     MANV:
   *                       type: string
   *                     TAIKHOAN:
   *                       type: string
   *                     MATKHAU:
   *                       type: string
   *                     VAITRO:
   *                       type: string
   *       401:
   *         description: Sai tài khoản hoặc mật khẩu
   *       500:
   *         description: Lỗi server
   */
 router.post('/login', async (req, res) => {
  const { taikhoan, matkhau } = req.body;
  try {
   const sql = `
      SELECT 
        t.MAKH, t.MANV, t.VAITRO, k.HOTEN
      FROM SYSTEM.TKDANGNHAP t
      LEFT JOIN SYSTEM.KHACHHANG k ON t.MAKH = k.MAKH
      WHERE t.TAIKHOAN = :taikhoan AND t.MATKHAU = :matkhau
    `;
    const result = await db.execute(sql, { taikhoan, matkhau });

    if (result.rows.length === 0) {
      return res.status(401).json({ Code: 401, Message: "Sai tài khoản hoặc mật khẩu" });
    }

    const user = result.rows[0];
    let data = {};

    if (user.VAITRO === 'customer') {
    data = {
        MAKH: user.MAKH,
        HOTEN: user.HOTEN || null,
        role: user.VAITRO
      };
    } else if (user.VAITRO === 'personnel') {
   data = {
        MAKNV: user.MAKH,
        HOTEN: user.HOTEN || null,
         role: user.VAITRO
      };
    } else {
      // Nếu vai trò khác, bạn có thể trả về dữ liệu phù hợp hoặc lỗi
      data = { message: 'Vai trò không hợp lệ' };
    }

    res.json({
      Code: 200,
      Message: "Đăng nhập thành công",
      Data: data
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ Code: 500, Message: "Lỗi server" });
  }
});

  /**
   * @swagger
   * /accounts:
   *   post:
   *     summary: Tạo tài khoản mới
   *     tags: [Accounts]
   *     requestBody:
   *       description: Thông tin tài khoản cần tạo
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - makh
   *               - manv
   *               - taikhoan
   *               - matkhau
   *               - vaitro
   *             properties:
   *               makh:
   *                 type: string
   *                 example: KH001
   *               manv:
   *                 type: string
   *                 example: NV001
   *               taikhoan:
   *                 type: string
   *                 example: newuser
   *               matkhau:
   *                 type: string
   *                 example: newpassword
   *               vaitro:
   *                 type: string
   *                 example: admin
   *     responses:
   *       201:
   *         description: Tạo tài khoản thành công
   *       500:
   *         description: Lỗi server
   */
  router.post('/', async (req, res) => {
    const { makh, manv, taikhoan, matkhau, vaitro } = req.body;
    try {
      const sql = `
        INSERT INTO SYSTEM.TKDANGNHAP (MAKH, MANV, TAIKHOAN, MATKHAU, VAITRO)
        VALUES (:makh, :manv, :taikhoan, :matkhau, :vaitro)
      `;
      await db.execute(sql, { makh, manv, taikhoan, matkhau, vaitro }, { autoCommit: true });
      res.status(201).json({ Code: 201, Message: "Tạo tài khoản thành công" });
    } catch (error) {
      console.error("Lỗi thêm tài khoản:", error);
      res.status(500).json({ Code: 500, Message: "Lỗi server" });
    }
  });

  module.exports = router;
