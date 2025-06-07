const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: TheATM
 *   description: Quản lý thẻ ATM
 */

// Lấy danh sách thẻ ATM
router.get('/', async (req, res) => {
  try {
    const sql = `SELECT * FROM SYSTEM.THEATM`;
    const result = await db.execute(sql);
    res.json({ Code: 200, Message: "Lấy danh sách thẻ thành công", Data: result.rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách thẻ:", error);
    res.status(500).json({ Code: 500, Message: "Lỗi server" });
  }
});

// Thêm thẻ ATM mới
router.post('/', async (req, res) => {
  const { mathe, matk, mapin, ngayphathanh, ngayhethan, tinhtrang, sothe, cvv } = req.body;
  try {
    const sql = `
      INSERT INTO SYSTEM.THEATM (MATHE, MATK, MAPIN, NGAYPHATHANH, NGAYHETHAN, TINHTRANG, SOTHE, CVV)
      VALUES (:mathe, :matk, :mapin, TO_DATE(:ngayphathanh, 'YYYY-MM-DD'), TO_DATE(:ngayhethan, 'YYYY-MM-DD'), :tinhtrang, :sothe, :cvv)
    `;
    await db.execute(sql, { mathe, matk, mapin, ngayphathanh, ngayhethan, tinhtrang, sothe, cvv }, { autoCommit: true });
    res.status(201).json({ Code: 201, Message: "Thêm thẻ ATM thành công" });
  } catch (error) {
    console.error("Lỗi thêm thẻ:", error);
    res.status(500).json({ Code: 500, Message: "Lỗi server" });
  }
});

// Sửa thông tin thẻ ATM
router.put('/:mathe', async (req, res) => {
  const { mathe } = req.params;
  const { matk, mapin, ngayphathanh, ngayhethan, tinhtrang, sothe, cvv } = req.body;
  try {
    const sql = `
      UPDATE SYSTEM.THEATM SET
        MATK = :matk,
        MAPIN = :mapin,
        NGAYPHATHANH = TO_DATE(:ngayphathanh, 'YYYY-MM-DD'),
        NGAYHETHAN = TO_DATE(:ngayhethan, 'YYYY-MM-DD'),
        TINHTRANG = :tinhtrang,
        SOTHE = :sothe,
        CVV = :cvv
      WHERE MATHE = :mathe
    `;
    await db.execute(sql, { matk, mapin, ngayphathanh, ngayhethan, tinhtrang, sothe, cvv, mathe }, { autoCommit: true });
    res.json({ Code: 200, Message: "Cập nhật thẻ ATM thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật thẻ:", error);
    res.status(500).json({ Code: 500, Message: "Lỗi server" });
  }
});

// Xóa thẻ ATM
router.delete('/:mathe', async (req, res) => {
  const { mathe } = req.params;
  try {
    const sql = `DELETE FROM SYSTEM.THEATM WHERE MATHE = :mathe`;
    await db.execute(sql, { mathe }, { autoCommit: true });
    res.json({ Code: 200, Message: "Xóa thẻ ATM thành công" });
  } catch (error) {
    console.error("Lỗi xóa thẻ:", error);
    res.status(500).json({ Code: 500, Message: "Lỗi server" });
  }
});

module.exports = router;
