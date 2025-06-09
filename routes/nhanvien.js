const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Kết nối CSDL, ví dụ dùng oracledb hoặc mysql2

/**
 * @swagger
 * tags:
 *   name: NhanVien
 *   description: Quản lý nhân viên
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NhanVien:
 *       type: object
 *       required:
 *         - manv
 *         - hoten
 *         - ngaysinh
 *         - cccd
 *         - sdt
 *         - diachi
 *         - chucvu
 *         - email
 *       properties:
 *         manv:
 *           type: string
 *           example: NV001
 *         hoten:
 *           type: string
 *           example: Nguyễn Văn A
 *         ngaysinh:
 *           type: string
 *           format: date
 *           example: 1990-01-01
 *         cccd:
 *           type: string
 *           example: 123456789012
 *         sdt:
 *           type: string
 *           example: 0987654321
 *         diachi:
 *           type: string
 *           example: Hà Nội
 *         chucvu:
 *           type: string
 *           example: Giao dịch viên
 *         email:
 *           type: string
 *           example: nv.a@email.com
 */

/**
 * @swagger
 * /nhanvien:
 *   get:
 *     summary: Lấy danh sách nhân viên
 *     tags: [NhanVien]
 *     responses:
 *       200:
 *         description: Lấy danh sách nhân viên thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NhanVien'
 */
router.get('/', async (req, res) => {
    try {
        const sql = `SELECT * FROM SYSTEM.NHANVIEN`;
        const result = await db.execute(sql);
        res.json({ code: 200, message: "Lấy danh sách nhân viên thành công", data: result.rows });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});

/**
 * @swagger
 * /nhanvien/{manv}:
 *   get:
 *     summary: Lấy thông tin 1 nhân viên theo MANV
 *     tags: [NhanVien]
 *     parameters:
 *       - in: path
 *         name: manv
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã nhân viên
 *     responses:
 *       200:
 *         description: Lấy thông tin nhân viên thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/NhanVien'
 *       404:
 *         description: Không tìm thấy nhân viên
 */
router.get('/:manv', async (req, res) => {
    try {
        const sql = `SELECT * FROM SYSTEM.NHANVIEN WHERE MANV = :manv`;
        const result = await db.execute(sql, { manv: req.params.manv });
        if (result.rows.length === 0) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy nhân viên" });
        }
        res.json({ code: 200, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});

/**
 * @swagger
 * /nhanvien:
 *   post:
 *     summary: Thêm mới nhân viên
 *     tags: [NhanVien]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NhanVien'
 *     responses:
 *       200:
 *         description: Thêm nhân viên thành công
 */
router.post('/', async (req, res) => {
    const { manv, hoten, ngaysinh, cccd, sdt, diachi, chucvu, email } = req.body;
    try {
        const sql = `
            INSERT INTO SYSTEM.NHANVIEN (MANV, HOTEN, NGAYSINH, CCCD, SDT, DIACHI, CHUCVU, EMAIL)
            VALUES (:manv, :hoten, TO_DATE(:ngaysinh, 'YYYY-MM-DD'), :cccd, :sdt, :diachi, :chucvu, :email)
        `;
        await db.execute(sql, { manv, hoten, ngaysinh, cccd, sdt, diachi, chucvu, email }, { autoCommit: true });
        res.status(200).json({ code: 200, message: "Thêm nhân viên thành công" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});

/**
 * @swagger
 * /nhanvien/{manv}:
 *   put:
 *     summary: Sửa thông tin nhân viên
 *     tags: [NhanVien]
 *     parameters:
 *       - in: path
 *         name: manv
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã nhân viên
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NhanVien'
 *     responses:
 *       200:
 *         description: Cập nhật nhân viên thành công
 */
router.put('/:manv', async (req, res) => {
    const { hoten, ngaysinh, cccd, sdt, diachi, chucvu, email } = req.body;
    try {
        const sql = `
            UPDATE SYSTEM.NHANVIEN SET
                HOTEN = :hoten,
                NGAYSINH = TO_DATE(:ngaysinh, 'YYYY-MM-DD'),
                CCCD = :cccd,
                SDT = :sdt,
                DIACHI = :diachi,
                CHUCVU = :chucvu,
                EMAIL = :email
            WHERE MANV = :manv
        `;
        const result = await db.execute(sql, { hoten, ngaysinh, cccd, sdt, diachi, chucvu, email, manv: req.params.manv }, { autoCommit: true });
        res.json({ code: 200, message: "Cập nhật nhân viên thành công" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});

/**
 * @swagger
 * /nhanvien/{manv}:
 *   delete:
 *     summary: Xóa nhân viên
 *     tags: [NhanVien]
 *     parameters:
 *       - in: path
 *         name: manv
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã nhân viên
 *     responses:
 *       200:
 *         description: Xóa nhân viên thành công
 */
router.delete('/:manv', async (req, res) => {
    try {
        const sql = `DELETE FROM SYSTEM.NHANVIEN WHERE MANV = :manv`;
        await db.execute(sql, { manv: req.params.manv }, { autoCommit: true });
        res.json({ code: 200, message: "Xóa nhân viên thành công" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server hoặc nhân viên đang được sử dụng ở bảng khác" });
    }
});

module.exports = router;
