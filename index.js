const fs = require("fs");
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const swagger = require("./utils/swagger.js");
const { initSocket } = require("./sockets/socket");

// ENV
require("dotenv").config();

// DATABASE
require("./dbs/mongo.db.js");

// Khởi tạo Express
const app = express();
const server = http.createServer(app); // 🔥 Dùng http để tạo server

// Tạo thư mục nếu chưa có
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created folder: ${dir}`);
  }
};

// Đảm bảo thư mục `uploads/` tồn tại
ensureDirectoryExists(path.join(__dirname, "uploads"));

// Tích hợp Swagger
swagger(app);

// CORS
var corsOptionsDelegate = function (req, callback) {
  var corsOptions = { origin: true };
  callback(null, corsOptions);
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptionsDelegate));

// Routes
app.use("/card", express.static(path.join(__dirname, "card")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(require("./routes/index"));

// Cron job
require("./cron/chatCron");

// Khởi động WebSocket
initSocket(server);

// Error Handler
app.use((err, req, res, next) => {
  const error = err.message ? err.message : err;
  const status = err.status ? err.status : 500;

  return res.status(status).json({
    error: {
      code: status,
      message: error,
    },
  });
});

// Chạy server với WebSocket
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
