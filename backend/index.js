import express from "express";
import mysql2 from "mysql2";
import cors from "cors";

const app = express();

//Connection with database
const db = mysql2.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "",
});

//Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Hello world");
});

//order_master Table..................................................................//

//Get request from DB to retrieve all orders from order_master tablle
//Time
//remove all cancelled orders=>orderstatus
//remove all order which are paid and delivered
// app.get("/orders24hrs", (req, res) => {
//   const q =
//     "SELECT * FROM order_master WHERE order_master.date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
//   db.query(q, (err, data) => {
//     if (err) return res.json(err);

//     return res.json(data);
//   });
// });

app.get("/orders", (req, res) => {
  const q =
    "SELECT * FROM order_master WHERE order_master.date >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND order_status <> 'cancel' AND NOT (bill_status = 'paid' AND order_status = 'delivered')";

  db.query(q, (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
});

app.post("/storeOrders", (req, res) => {
  const data = req.body;

  // Insert data into the order_master table.
  const insertOrderMasterQuery = `
    INSERT INTO order_master (user_id, date, total, order_status, discount, notes, bill_status)
    VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
  `;

  const orderMasterValues = [
    data.user_id,
    data.total,
    data.order_status,
    data.discount,
    data.notes,
    data.bill_status,
  ];

  db.query(insertOrderMasterQuery, orderMasterValues, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error inserting order master data.");
    } else {
      console.log(result);

      const insertedOrderId = result.insertId;

      // Insert data into the order_menu table.
      data.menus.forEach((menu) => {
        const insertOrderMenuQuery = `
          INSERT INTO order_menu (order_id, menu_id, quantity, total)
          VALUES (?, ?, ?, ?)
        `;

        const orderMenuValues = [
          insertedOrderId,
          menu.menu_id,
          menu.quantity,
          menu.total,
        ];

        db.query(insertOrderMenuQuery, orderMenuValues, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Order menu data inserted successfully.");
          }
        });
      });

      res.status(200).send("Data inserted successfully.");
    }
  });
});

//Delete order from order_master
app.delete("/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const q = " DELETE FROM order_master WHERE id = ? ";

  db.query(q, [orderId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

//Update order from order_master
app.put("/orders/update", (req, res) => {
  const { order_id, flag, status } = req.body;
  const q = `UPDATE order_master SET ${mysql2.escapeId(flag)} = ? WHERE id = ?`;

  // const values = [req.body.flag, req.body.order_status];

  db.query(q, [status, order_id], (err, data) => {
    if (err) return res.json(err);
    return res.json("order has been updated successfully ");
  });
});

//user_master table.....................................................//

//Get request from DB to retrieve all orders from user_master table
app.get("/users", (req, res) => {
  const q = "SELECT * FROM user_master";
  db.query(q, (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
});

//Add order to DB table user_master
app.post("/users", (req, res) => {
  const q = "INSERT INTO user_master(`name`,`mobile_no`,`address`) VALUES (?)";
  const values = [req.body.name, req.body.mobile_no, req.body.address];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json("user has been created successfully");
  });
});

//Delete order from order_master
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const q = " DELETE FROM user_master WHERE id = ? ";

  db.query(q, [userId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

//Update order from order_master
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const q =
    "UPDATE user_master SET `name`=?,`mobile_no`=?,`address`=? WHERE id = ?";

  const values = [req.body.name, req.body.mobile_no, req.body.address];

  db.query(q, [...values, userId], (err, data) => {
    if (err) return res.json(err);
    return res.json("User has been updated successfully ");
  });
});

//menu_master............................................................................................................
//Get from menu_master
app.get("/menu", (req, res) => {
  const q = "SELECT * FROM menu_master ";

  db.query(q, (err, data) => {
    if (err) return res.json(err);

    return res.json(data);
  });
});

//Port defined
app.listen(8800, () => {
  console.log("Connected to backend");
});
