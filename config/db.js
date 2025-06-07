const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: 'system',
  password: '22102001',
  connectString: 'localhost:1521/ORCL',
};

let connectionPool;

async function initPool() {
  try {
    connectionPool = await oracledb.createPool(dbConfig);
    console.log('✔️ Oracle connection pool created');
  } catch (err) {
    console.error('❌ Lỗi tạo connection pool Oracle:', err);
    throw err;
  }
}

async function getConnection() {
  if (!connectionPool) {
    await initPool();
  }
  try {
    const connection = await connectionPool.getConnection();
    return connection;
  } catch (err) {
    console.error('❌ Lỗi lấy connection từ pool:', err);
    throw err;
  }
}

async function closePool() {
  if (connectionPool) {
    try {
      await connectionPool.close(10);
      console.log('✔️ Oracle connection pool closed');
    } catch (err) {
      console.error('❌ Lỗi đóng connection pool:', err);
    }
  }
}

/**
 * Thực thi câu lệnh SQL với tham số và tuỳ chọn.
 * Tự động lấy connection từ pool, commit nếu cần, rồi đóng connection.
 * @param {string} sql Câu lệnh SQL
 * @param {object|array} binds Tham số bind
 * @param {object} options Tuỳ chọn execute (ví dụ {autoCommit: true})
 * @returns {Promise<object>} Kết quả execute
 */
async function execute(sql, binds = {}, options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, options);
    if (options.autoCommit) {
      await connection.commit();
    }
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Lỗi đóng connection:', err);
      }
    }
  }
}

module.exports = {
  initPool,
  getConnection,
  closePool,
  execute,
};
