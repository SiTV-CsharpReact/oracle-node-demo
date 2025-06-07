const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: TheATM
 *   description: Quản lý thẻ ATM
 */

/**
 * @swagger
 * /theatm:
 *   get:
 *     summary: Lấy danh sách thẻ ATM
 *     tags: [TheATM]
 *     responses:
 *       200:
 *         description: Lấy danh sách thẻ thành công
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
 *                   example: Lấy danh sách thẻ thành công
 *                 Data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       MATHE:
 *                         type: string
 *                       MATK:
 *                         type: string
 *                       MAPIN:
 *                         type: string
 *                       NGAYPHATHANH:
 *                         type: string
 *                         format: date
 *                       NGAYHETHAN:
 *                         type: string
 *                         format: date
 *                       TINHTRANG:
 *                         type: string
 *                       SOTHE:
 *                         type: string
 *                       CVV:
 *                         type: string
 *       500:
 *         description: Lỗi server
 */
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

/**
 * @swagger
 * /theatm/list-atm:
 *   post:
 *     summary: Lấy danh sách thẻ ATM theo MANV
 *     tags: [TheATM]
 *     requestBody:
 *       description: Mã nhân viên (MANV) để lấy thẻ ATM
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manv
 *               - role
 *             properties:
 *               manv:
 *                 type: string
 *                 example: NV001
 *               role:
 *                 type: string
 *                 example: customer
 *     responses:
 *       200:
 *         description: Danh sách thẻ ATM trả về thành công
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
 *                   example: Lấy danh sách thẻ thành công
 *                 Data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       MATHE:
 *                         type: string
 *                       MATK:
 *                         type: string
 *                       MAPIN:
 *                         type: string
 *                       NGAYPHATHANH:
 *                         type: string
 *                         format: date
 *                       NGAYHETHAN:
 *                         type: string
 *                         format: date
 *                       TINHTRANG:
 *                         type: string
 *                       SOTHE:
 *                         type: string
 *                       CVV:
 *                         type: string
 *       400:
 *         description: Thiếu tham số manv
 *       500:
 *         description: Lỗi server
 */
router.post('/list-atm', async (req, res) => {
    const { manv, makh, role } = req.body;

    try {
        if (!role) {
            return res.status(400).json({ Code: 400, Message: "Thiếu tham số role" });
        }

        let sql = '';
        let binds = {};

        if (role === 'customer') {
            if (!makh) {
                return res.status(400).json({ Code: 400, Message: "Thiếu tham số makh cho role customer" });
            }
            // Lấy thẻ ATM theo mã khách hàng (MAKH)
            sql = `
   SELECT a.*
FROM SYSTEM.THEATM a
JOIN SYSTEM.TKNganHang t ON a.MATK = t.MATK
WHERE t.MAKH = :makh
      `;
            binds = { makh };
        } else if (role === 'personnel') {
            if (!manv) {
                return res.status(400).json({ Code: 400, Message: "Thiếu tham số manv cho role personnel" });
            }
            // Lấy thẻ ATM theo MANV qua bảng XULYTHE join THEATM
            sql = `
        SELECT t.*
        FROM SYSTEM.XULYTHE x
        JOIN SYSTEM.THEATM t ON x.MATHE = t.MATHE
        WHERE x.MANV = :manv
      `;
            binds = { manv };
        } else {
            return res.status(400).json({ Code: 400, Message: "Vai trò không hợp lệ" });
        }

        const result = await db.execute(sql, binds);
        res.json({ Code: 200, Message: "Lấy danh sách thẻ thành công", Data: result.rows });
    } catch (error) {
        console.error("Lỗi lấy danh sách thẻ:", error);
        res.status(500).json({ Code: 500, Message: "Lỗi server" });
    }
});



/**
 * @swagger
 * /theatm:
 *   post:
 *     summary: Thêm thẻ ATM mới
 *     tags: [TheATM]
 *     requestBody:
 *       description: Thông tin thẻ ATM cần thêm
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mathe
 *               - matk
 *               - mapin
 *               - ngayphathanh
 *               - ngayhethan
 *               - tinhtrang
 *               - sothe
 *               - cvv
 *             properties:
 *               mathe:
 *                 type: string
 *                 example: TH001
 *               matk:
 *                 type: string
 *                 example: TK001
 *               mapin:
 *                 type: string
 *                 example: 1234
 *               ngayphathanh:
 *                 type: string
 *                 format: date
 *                 example: 2023-01-01
 *               ngayhethan:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-01
 *               tinhtrang:
 *                 type: string
 *                 example: active
 *               sothe:
 *                 type: string
 *                 example: 1234567890123456
 *               cvv:
 *                 type: string
 *                 example: 123
 *     responses:
 *       201:
 *         description: Thêm thẻ ATM thành công
 *       500:
 *         description: Lỗi server
 */
router.post('/', async (req, res) => {
    const { mathe, matk, mapin, ngayphathanh, ngayhethan, tinhtrang, sothe, cvv } = req.body;
    try {
        const sql = `
      INSERT INTO SYSTEM.THEATM (MATHE, MATK, MAPIN, NGAYPHATHANH, NGAYHETHAN, TINHTRANG, SOTHE, CVV)
      VALUES (:mathe, :matk, :mapin, TO_DATE(:ngayphathanh, 'YYYY-MM-DD'), TO_DATE(:ngayhethan, 'YYYY-MM-DD'), :tinhtrang, :sothe, :cvv)
    `;
        await db.execute(sql, { mathe, matk, mapin, ngayphathanh, ngayhethan, tinhtrang, sothe, cvv }, { autoCommit: true });
        res.status(200).json({ Code: 200, Message: "Thêm thẻ ATM thành công" });
    } catch (error) {
        console.error("Lỗi thêm thẻ:", error);
        res.status(500).json({ Code: 500, Message: "Lỗi server" });
    }
});

/**
 * @swagger
 * /theatm/{mathe}:
 *   put:
 *     summary: Cập nhật thông tin thẻ ATM
 *     tags: [TheATM]
 *     parameters:
 *       - in: path
 *         name: mathe
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã thẻ cần cập nhật
 *     requestBody:
 *       description: Thông tin thẻ ATM cần cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matk:
 *                 type: string
 *                 example: TK001
 *               mapin:
 *                 type: string
 *                 example: 1234
 *               ngayphathanh:
 *                 type: string
 *                 format: date
 *                 example: 2023-01-01
 *               ngayhethan:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-01
 *               tinhtrang:
 *                 type: string
 *                 example: active
 *               sothe:
 *                 type: string
 *                 example: 1234567890123456
 *               cvv:
 *                 type: string
 *                 example: 123
 *     responses:
 *       200:
 *         description: Cập nhật thẻ ATM thành công
 *       500:
 *         description: Lỗi server
 */
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

/**
 * @swagger
 * /theatm/{mathe}:
 *   delete:
 *     summary: Xóa thẻ ATM
 *     tags: [TheATM]
 *     parameters:
 *       - in: path
 *         name: mathe
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã thẻ cần xóa
 *     responses:
 *       200:
 *         description: Xóa thẻ ATM thành công
 *       500:
 *         description: Lỗi server
 */
router.delete('/:mathe', async (req, res) => {
  const { mathe } = req.params;
  try {
    await db.execute(
      'DELETE FROM SYSTEM.XULYTHE WHERE MATHE = :mathe',
      { mathe },
      { autoCommit: true }
    );
    // Xóa các bản ghi phụ thuộc trước theo đúng thứ tự
    await db.execute(
      'DELETE FROM SYSTEM.GIAODICH WHERE MATHE = :mathe',
      { mathe },
      { autoCommit: true }
    );

    // Sau cùng xóa THEATM
    await db.execute(
      'DELETE FROM SYSTEM.THEATM WHERE MATHE = :mathe',
      { mathe },
      { autoCommit: true }
    );
    res.json({ Code: 200, Message: "🗑️ Xóa thẻ ATM thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa thẻ:", error);
    res.status(500).json({
      Code: 500,
      Message: "Lỗi server hoặc thẻ đang được sử dụng ở bảng khác"
    });
  }
});

module.exports = router;
