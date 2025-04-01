const express = require('express');
const mysql = require('mysql2');
const moment = require('moment');
const router = express.Router();
// const bodyParser = require("body-parser");
const cors = require('cors');
const axios = require("axios");
const { removeFile, upload } = require("../my-back-app/util/helper")
const { TOKEN_KEY, REFRESH_TOKEN_KEY } = require("../my-back-app/util/token_key")

const app = express();
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MySQL2 Connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mainsystemdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const TELEGRAM_BOT_TOKEN = "8146405771:AAHAb08zebFGk2csJLpnGuLnUOBFZ1tWOSk";
const TELEGRAM_CHAT_ID = "1736366615";
// const TELEGRAM_CHAT_ID = "-1002403159333";
// const axios = require("axios");

app.get("/send-to-telegram", (req, res) => {
  const query = `
      SELECT 
        i.id AS invId, 
        c.name AS customerName, 
        c.orderStatus AS customerStatus, 
        i.items, 
        i.qtyTotal, 
        i.discount, 
        i.disposit, 
        i.discountPercentage, 
        i.finalAmount,
        i.currency, -- Include currency
        i.CreateAt
      FROM invoice_details i
      JOIN customers c ON i.customerId = c.id
      ORDER BY i.id DESC LIMIT 1`; // Fetch last 1 invoices


     

  db.query(query, async (err, results) => {
    if (err) {
      console.error("🔥 Database Error:", err);
      return res.status(500).send({ success: false, error: "Database error" });
    }

    if (results.length === 0) {
      return res.send({ success: false, message: "No data found in invoice_details." });
    }

    let message = `📖 *New Invoice Saved:*\n`;// i need show Id or clientName one one after save data show in telegram 
    results.forEach((invoice, index) => {
      const currencySymbol = invoice.currency === "KHR" ? "៛" : "$";
      // Determine the status emoji with labels
      let statusEmoji = "⚪ Unknown"; // Default (if status is unknown)
      if (invoice.customerStatus == 1) statusEmoji = "🟢 Paid";
      else if (invoice.customerStatus == 2) statusEmoji = "🟡 Disposit";
      else if (invoice.customerStatus == 3) statusEmoji = "🔴 Unpaid";

      // Format the createdAt date using Moment.js
      let formattedDate = moment(invoice.CreateAt).format('MMMM Do YYYY, h:mm:ss a');

      message += `\n👤 *Customer:* ${invoice.customerName}`;
      message += `\n🪪 *Invoice: 000*${invoice.invId}`;
      // message += `\n*Items:* ${invoice.items}`;
      let itemsArray = [];

      if (typeof invoice.items === "string") {
        try {
          itemsArray = JSON.parse(invoice.items); // Convert JSON string to array
        } catch (error) {
          console.error("Error parsing items JSON:", error);
        }
      }

      // Ensure `itemsArray` is an array before looping
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        itemsArray.forEach((item, index) => {
          const itemTotal = item.qty * item.price;
          // const formattedQty = invoice.currency === "KHR" ? Number(item.qty).toLocaleString() : Number(item.qty).toFixed(2);
          const formattedPrice = invoice.currency === "KHR" ? Number(item.price).toLocaleString() : Number(item.price).toFixed(2);
          const formattedTotal = invoice.currency === "KHR" ? Number(itemTotal).toLocaleString() : Number(itemTotal).toFixed(2);
          // message += `\n   ${index + 1}. ${item.name} - ${item.qty} x ${currency === "៛" ? Number(item.qty).toLocaleString() : Number(item.qty).toFixed(2)} ${currency} ${item.price.toFixed(2)} = $${item.amount.toFixed(2)}`;
          message += `\n   ${index + 1}. ${item.name} - (${item.qty}) x  ${formattedPrice} ${currencySymbol}= ${formattedTotal} ${currencySymbol} `;
        });
      } else {
        message += `\n   ❌ No items found or invalid format`;
      }
      
      message += `\n*TotalQty:* ${invoice.qtyTotal} Qty`;
      const formattedDiscount = invoice.currency === "KHR" 
      ? Number(invoice.discount).toLocaleString() + " ៛" 
      : Number(invoice.discount).toFixed(2) + " $";
      message += `\n*Discount:* ${formattedDiscount}`;
      message += `\n*D-Percentage:* ${invoice.discountPercentage} %`;
      const formattedDisposit = invoice.currency === "KHR" 
      ? Number(invoice.disposit).toLocaleString() + " ៛" 
      : Number(invoice.disposit).toFixed(2) + " $";
      message += `\n*Disposit:* ${formattedDisposit}`;
      const formattedFinalAmount = invoice.currency === "KHR" 
      ? Number(invoice.finalAmount).toLocaleString()  // Use locale format for KHR
      : Number(invoice.finalAmount).toFixed(2);     
      message += `\n*FinalAmount:* ${formattedFinalAmount} ${currencySymbol} `;
      message += `\n*CreatedAt:* ${formattedDate}`; // Properly formatted date
      message += `\n📌 *Proccess Pay:* ${statusEmoji}\n───────────────────`;
    });
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      const response = await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      });

      console.log("✅ Telegram Response:", response.data);
      res.send({ success: true, message: "Data sent to Telegram!" });

    } catch (error) {
      console.error("❌ Telegram API Error:", error.response ? error.response.data : error.message);
      res.status(500).send({
        success: false,
        error: error.response ? error.response.data.description : "Error sending message to Telegram"
      });
    }
  });
});





// create Customers
app.post("/customers", (req, res) => {
  const { name, discount, disposit, orderStatus, status } = req.body;
  const sql = "INSERT INTO customers (name, discount, disposit, orderStatus, status) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, discount, disposit, orderStatus, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Customer added", id: result.insertId });
  });
});

// Delete Customer
app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM customers WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Customer deleted" });
  });
});
// Update Customer
app.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const { name, discount, disposit, orderStatus, status } = req.body;
  const sql = "UPDATE customers SET name=?, discount=?, disposit=?, orderStatus=?, status=? WHERE id=?";
  db.query(sql, [name, discount, disposit, orderStatus, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Customer updated" });
  });
});

// Get all customers
app.get('/customers', (req, res) => {
  db.query('SELECT * FROM customers ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get items by customer
app.get('/items/:customerId', (req, res) => {
  const { customerId } = req.params;
  db.query('SELECT * FROM items WHERE customerId = ?', [customerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Save Invoice
// app.post('/invoices', (req, res) => {
//   const { customerId, items, discount, disposit } = req.body;
//   let qtyTotal = items.reduce((sum, item) => sum + item.qty, 0);
//   let subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
//   let discountAmount = (subtotal * discount) / 100;
//   let finalAmount = subtotal - discountAmount - disposit;

//   db.query('INSERT INTO invoice_details (customerId, items, qtyTotal, discount, disposit, finalAmount) VALUES (?, ?, ?, ?, ?, ?)',
//     [customerId, JSON.stringify(items), qtyTotal, discount, disposit, finalAmount],
//     (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ success: true, finalAmount });
//     }
//   );
// });


app.post('/invoices', (req, res) => {
  const { customerId, items, discount, disposit, currency } = req.body; // Accept currency
  let qtyTotal = items.reduce((sum, item) => sum + item.qty, 0);
  let subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  let totalAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  
  // let discountAmount = (subtotal * discount) / 100;
  // let discountAmount = ((discount / subtotal) * 100).toFixed(2); 
  // let discountPercentage = subtotal > 0 ? ((discount / subtotal) * 100).toFixed(2) : "0.00";   
  let discountPercentage = (subtotal * discount) / 100;  
  // let finalAmount = subtotal - discountAmount - disposit;
  let finalAmount = subtotal - discountPercentage - disposit;
 

  db.query(
    'INSERT INTO invoice_details (customerId, items, qtyTotal, discount,discountPercentage, disposit,totalAmount, finalAmount, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [customerId, JSON.stringify(items), qtyTotal, discount,discountPercentage, disposit,totalAmount, finalAmount, currency], // Store currency
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true,discountPercentage: discountPercentage + "%",totalAmount, finalAmount, currency});
    }
  );
});




// app.get("/invoices/getlist", (req, res) => {
//   const query = `
//       SELECT 
//         i.id AS invId, 
//         c.name AS customerName, 
//         c.orderStatus,
//         c.status,
//         i.items, 
//         i.qtyTotal, 
//         i.discount, 
//         i.disposit, 
//         i.finalAmount,
//         i.CreateAt
//       FROM invoice_details i
//       JOIN customers c ON i.customerId = c.id
//       ORDER BY i.id DESC  `;

//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(result);
//   });
// });

// app.get("/invoices/getlist", (req, res) => {
//   const query = `
//       SELECT 
//         i.id AS invId, 
//         c.name AS customerName, 
//         c.orderStatus,
//         c.status,
//         i.items, 
//         i.qtyTotal, 
//         i.discount, 
//         i.discountPercentage, 
//         i.disposit, 
//         i.finalAmount,
//         i.currency, -- Include currency
//         i.CreateAt
//       FROM invoice_details i
//       JOIN customers c ON i.customerId = c.id
//       WHERE i.deleted_at IS NULL  -- Only show active invoices
//       ORDER BY i.id DESC`;

//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(result);
//   });
// });

app.get("/invoices/getlist", (req, res) => {
  const { id, orderStatus } = req.query; // Get filters from query parameters

  let query = `
      SELECT 
          i.id AS invId,
          c.name AS customerName,
          c.orderStatus,
          c.status,
          i.items, 
          i.customerId, 
          i.qtyTotal, 
          i.discount, 
          i.discountPercentage, 
          i.disposit, 
          i.finalAmount,
          i.currency, 
          i.CreateAt
      FROM invoice_details i
      JOIN customers c ON i.customerId = c.id
      WHERE i.deleted_at IS NULL
  `;

  const queryParams = [];

  if (id) {
      query += ` AND i.id = ?`;
      queryParams.push(id);
  }

  if (orderStatus) {
      query += ` AND c.orderStatus = ?`; // Filter by orderStatus
      queryParams.push(orderStatus);
  }

  query += ` ORDER BY i.id DESC`; // Keep sorting

  db.query(query, queryParams, (err, result) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(result);
  });
});




app.get("/invoices/getlist/:id", (req, res) => {
  const invoiceId = req.params.id; // Get the invoice ID from the URL

  const query = `
    SELECT 
      i.id AS invId, 
      c.name AS customerName, 
      c.orderStatus AS customerStatus,
      c.status,
      i.items, 
      i.qtyTotal, 
      i.discount, 
      i.disposit, 
      i.finalAmount,
      i.CreateAt
    FROM invoice_details i
    JOIN customers c ON i.customerId = c.id
    WHERE i.id = ?`;  // ✅ Fetch invoice by ID

  db.query(query, [invoiceId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (result.length === 0) {
      return res.json({ success: false, message: "No invoice found." });
    }
    res.json({ success: true, invoice: result[0] });
  });
});



// Delete Invoice by ID
// app.delete("/invoices/:id", (req, res) => {
//   const { id } = req.params;

//   db.query("DELETE FROM invoice_details WHERE id = ?", [id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Invoice not found" });
//     }

//     res.json({ message: "Invoice deleted successfully" });
//   });
// });



app.delete("/invoices/:id",  (req, res) => {
  const { id } = req.params;
  try {
      const [result] = db.query(`
          UPDATE invoice_details 
          SET deleted_at = NOW() 
          WHERE id = ? AND deleted_at IS NULL
      `, [id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Invoice not found or already deleted" });
      }

      res.json({ message: "Invoice moved to trash successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



app.get("/invoices/trash", (req, res) => {
  db.query(
    `SELECT 
        i.id AS invId, 
        c.name AS customerName, 
        c.orderStatus,
        i.items, 
        i.qtyTotal, 
        i.finalAmount, 
        i.currency, 
        i.deleted_at
    FROM invoice_details i
    JOIN customers c ON i.customerId = c.id
    WHERE i.deleted_at IS NOT NULL  -- Only show deleted invoices
    ORDER BY i.deleted_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});





app.put("/invoices/restore/:id", (req, res) => {
  const { id } = req.params;

  db.query(
      `UPDATE invoice_details 
       SET deleted_at = NULL 
       WHERE id = ? AND deleted_at IS NOT NULL`,
      [id],
      (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Invoice not found or already restored" });
          }

          res.json({ message: "Invoice restored successfully" });
      }
  );
});


app.delete("/invoices/trash/:id", (req, res) => {
  const { id } = req.params;

  db.query(
      `DELETE FROM invoice_details 
       WHERE id = ? AND deleted_at IS NOT NULL`,
      [id],
      (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Invoice not found or already deleted permanently" });
          }

          res.json({ message: "Invoice permanently deleted" });
      }
  );
});






app.get("/export-data", (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Both start Date and endDate are required" });
  }

  // Updated query to JOIN invoice_details with customer table
  const query = `
   SELECT 
       i.id AS invId, 
        c.name AS customerName, 
        c.orderStatus,
        c.status,
        i.items, 
        i.qtyTotal, 
        i.discount, 
        i.disposit, 
        i.finalAmount,
        i.currency, -- Include currency
        i.CreateAt
FROM invoice_details i
JOIN customers c ON i.customerId = c.id
WHERE DATE(i.CreateAt) BETWEEN ? AND ?;

  `;

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});



app.get('/user', (req, res) => {
  db.query('SELECT * FROM user ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/user-post', upload.single("Image"), (req, res) => {
  var { Name, Gender, Email, Tel, password, Status, Image } = req.body;
  var Image = null;
  if (req.file) {
    Image = req.file.filename
  }



  db.query('INSERT INTO user (Name, Gender, Email, Tel,password, Status ,Image ) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [Name, Gender, Email, Tel, password, Status, Image],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, });
    }
  );
});


app.delete("/user-delete/:Id", (req, res) => {
  const { Id } = req.params;

  // Fetch user to get the image filename before deletion
  db.query("SELECT Image FROM user WHERE Id = ?", [Id], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const imageFile = result[0].Image;

    // Delete user from the database
    db.query("DELETE FROM user WHERE Id = ?", [Id], async (err, deleteResult) => {
      if (err) return res.status(500).json({ error: err.message });

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete the image file if it exists
      if (imageFile) {
        try {
          await removeFile(imageFile); // Call helper function
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }

      res.json({ message: "User and image deleted successfully" });
    });
  });
});

app.put("/user-update/:Id", upload.single("Image"), (req, res) => {
  const { Id } = req.params;
  const { Name, Gender, Email, Tel, password, Status } = req.body;
  let newImage = null;

  if (req.file) {
    newImage = req.file.filename; // Get new image filename
  }

  // Fetch old image before updating
  db.query("SELECT Image FROM user WHERE Id = ?", [Id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldImage = result[0].Image;

    // Prepare SQL query & values
    const updateQuery = "UPDATE user SET Name=?, Gender=?, Email=?, Tel=?, password=?, Status=?, Image=? WHERE Id=?";
    const values = [Name, Gender, Email, Tel, password, Status, newImage || oldImage, Id];

    // Update user details in database
    db.query(updateQuery, values, async (err, updateResult) => {
      if (err) return res.status(500).json({ error: err.message });

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: "User not updated" });
      }

      // Delete old image if a new one is uploaded
      if (newImage && oldImage) {
        try {
          await removeFile(oldImage);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      res.json({ message: "User updated successfully", newImage });
    });
  });
});


app.get('/exchangerate-riel', (req, res) => {
  db.query('SELECT * FROM exchangerate ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put("/exchangerate-riel/:id", (req, res) => {
  const { id } = req.params;
  const { khriel } = req.body;
  const sql = "UPDATE exchangerate SET khriel=? WHERE id=?";
  db.query(sql, [khriel, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "exchangerate updated" });
  });
});

app.delete("/exchangerate-riel/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM exchangerate WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "exchangerate deleted" });
  });
});

app.post("/exchangerate-riel", (req, res) => {
  const { khriel } = req.body;
  const sql = "INSERT INTO exchangerate (khriel) VALUES (?)";
  db.query(sql, [khriel], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "exchangerate added", id: result.insertId });
  });
});

// app.get('/invoices/total-by-currency', (req, res) => {
//   try {
//       const [rows] = db.execute(`
//           SELECT currency, SUM(finalAmount) AS total FROM invoice_details GROUP BY currency
//       `);
//       res.json(rows);
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// });


app.get('/invoices/total-by-currency', (req, res) => {
  db.query(' SELECT currency, SUM(finalAmount) AS total FROM invoice_details GROUP BY currency', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/dashboard", (req, res) => {
  const query = `
      SELECT 
          SUM(CASE WHEN currency = 'KHR' THEN totalAmount ELSE 0 END) AS totalKHR,
          SUM(CASE WHEN currency = 'USD' THEN totalAmount ELSE 0 END) AS totalUSD
      FROM invoice_details
      WHERE deleted_at IS NULL
  `;

  db.query(query, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
          KHR: result[0].totalKHR || 0,
          USD: result[0].totalUSD || 0
      });
  });
});





// app.get("/dashboard-list", (req, res) => {
//   // Query to get the monthly balance for USD & KHR with disposit handling
//   const chartQuery = `
//   WITH PaymentAdjustments AS (
//     SELECT 
//         i.customerId,
//         MONTH(i.CreateAt) AS invoiceMonth,  -- Get the month of the invoice
//         c.orderStatus,
//         i.currency,
//         i.totalAmount,
//         i.finalAmount,
//         i.disposit,
//         LAG(c.orderStatus) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevOrderStatus,  -- Get previous month's orderStatus
//         LAG(i.disposit) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevDisposit,  -- Get previous month's disposit
//         LAG(MONTH(i.CreateAt)) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevMonth  -- Get previous month's month
//     FROM invoice_details i
//     JOIN customers c ON i.customerId = c.id
//     WHERE i.deleted_at IS NULL 
//       AND YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Filter for the current year
//   )
//   SELECT 
//     invoiceMonth AS month,
//     -- Calculate total amount considering deposits and payments
//     SUM(CASE 
//         WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth THEN totalAmount  -- Paid in the same month as deposit
//         WHEN prevOrderStatus IS NULL AND orderStatus = 1 THEN totalAmount  -- Fully paid with no previous deposit
//         WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth THEN totalAmount - prevDisposit  -- Paid after previous deposit
//         WHEN orderStatus = 2 THEN disposit  -- Only deposit shown
//         ELSE 0  
//     END) AS totalAmount,
    
//     -- Calculate total amount in KHR currency
//     SUM(CASE 
//         WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth AND currency = 'KHR' THEN totalAmount
//         WHEN prevOrderStatus IS NULL AND orderStatus = 1 AND currency = 'KHR' THEN totalAmount
//         WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth AND currency = 'KHR' THEN totalAmount - prevDisposit
//         WHEN orderStatus = 2 AND currency = 'KHR' THEN disposit
//         ELSE 0
//     END) AS totalKHR,
    
//     -- Calculate total amount in USD currency
//     SUM(CASE 
//         WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth AND currency = 'USD' THEN totalAmount
//         WHEN prevOrderStatus IS NULL AND orderStatus = 1 AND currency = 'USD' THEN totalAmount
//         WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth AND currency = 'USD' THEN totalAmount - prevDisposit
//         WHEN orderStatus = 2 AND currency = 'USD' THEN disposit
//         ELSE 0
//     END) AS totalUSD
//   FROM PaymentAdjustments
//   GROUP BY invoiceMonth;
//   `;

//   // Query to get the order statuses summary for each month
//   const orderStatusQuery = `
//   SELECT 
//       MONTH(i.CreateAt) AS month,  -- Get the month of the invoice
//       SUM(CASE WHEN c.orderStatus = 1 THEN 1 ELSE 0 END) AS paidOrders,
//       SUM(CASE WHEN c.orderStatus = 2 THEN 1 ELSE 0 END) AS dispositOrders,
//       SUM(CASE WHEN c.orderStatus = 3 THEN 1 ELSE 0 END) AS unpaidOrders
//   FROM invoice_details i
//   JOIN customers c ON i.customerId = c.id
//   WHERE YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Filter for the current year
//   GROUP BY MONTH(i.CreateAt);
//   `;

//   // Execute the chart query
//   db.query(chartQuery, (err, chartResults) => {
//       if (err) return res.status(500).json({ error: err.message });

//       // Execute the order status query
//       db.query(orderStatusQuery, (err, orderStatusResults) => {
//           if (err) return res.status(500).json({ error: err.message });

//           if (!chartResults || !orderStatusResults) {
//               return res.status(404).json({ error: 'Data not found for the given criteria.' });
//           }

//           // Return both chart data and order status data in the response
//           res.json({
//               chartData: chartResults,
//               orderStatusData: orderStatusResults
//           });
//       });
//   });
// });

// app.get("/dashboard-for-month", (req, res) => {
//   const currentMonth = new Date().getMonth() + 1;  // Get current month (1-12)
//   const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;  // Next month logic

//   const query = `
//     SELECT 
//         -- Total amounts for KHR and USD in current month
//         SUM(CASE WHEN i.currency = 'KHR' AND MONTH(i.CreateAt) = ? THEN i.totalAmount ELSE 0 END) AS totalKHRCurrent,
//         SUM(CASE WHEN i.currency = 'USD' AND MONTH(i.CreateAt) = ? THEN i.totalAmount ELSE 0 END) AS totalUSDCurrent,
        
//         -- Total amounts for KHR and USD in next month
//         SUM(CASE WHEN i.currency = 'KHR' AND MONTH(i.CreateAt) = ? THEN i.totalAmount ELSE 0 END) AS totalKHRNext,
//         SUM(CASE WHEN i.currency = 'USD' AND MONTH(i.CreateAt) = ? THEN i.totalAmount ELSE 0 END) AS totalUSDNext,

//         -- Paid, Disposit, and Unpaid for current month (based on c.orderStatus from customers table)
//         SUM(CASE WHEN MONTH(i.CreateAt) = ? AND c.orderStatus = 1 THEN i.totalAmount ELSE 0 END) AS paidCurrent,
//         SUM(CASE WHEN MONTH(i.CreateAt) = ? AND c.orderStatus = 2 THEN i.finalAmount ELSE 0 END) AS dispositCurrent, 
//         SUM(CASE WHEN MONTH(i.CreateAt) = ? AND c.orderStatus = 3 THEN i.totalAmount ELSE 0 END) AS unpaidCurrent,

//         -- Paid, Disposit, and Unpaid for next month (based on c.orderStatus from customers table)
//         SUM(CASE WHEN MONTH(i.CreateAt) = ? AND c.orderStatus = 1 THEN i.totalAmount ELSE 0 END) AS paidNext,
//         SUM(CASE WHEN MONTH(i.CreateAt) = ? AND c.orderStatus = 2 THEN i.finalAmount ELSE 0 END) AS dispositNext, 
//         SUM(CASE WHEN MONTH(i.CreateAt) = ? AND c.orderStatus = 3 THEN i.totalAmount ELSE 0 END) AS unpaidNext

//     FROM invoice_details i
//     JOIN customers c ON i.customerId = c.id  -- Join with customers table to get orderStatus
//     WHERE i.deleted_at IS NULL
//   `;

//   // Execute query with current and next month parameters
//   db.query(query, [currentMonth, currentMonth, nextMonth, nextMonth, currentMonth, currentMonth, currentMonth, nextMonth, nextMonth, nextMonth], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });

//     const data = result[0];

//     // Send the response with calculated totals for current and next month
//     res.json({
//       totalKHRCurrent: data.totalKHRCurrent || 0,
//       totalUSDCurrent: data.totalUSDCurrent || 0,
//       totalKHRNext: data.totalKHRNext || 0,
//       totalUSDNext: data.totalUSDNext || 0,
//       paidCurrent: data.paidCurrent || 0,
//       dispositCurrent: data.dispositCurrent || 0,
//       unpaidCurrent: data.unpaidCurrent || 0,
//       paidNext: data.paidNext || 0,
//       dispositNext: data.dispositNext || 0,
//       unpaidNext: data.unpaidNext || 0,
//     });
//   });
// });
























































// Start Server



app.get("/dashboard-list", (req, res) => {
  const currentMonth = new Date().getMonth() + 1;  // Get current month (1-12)
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;  // Next month logic

  // Query to get the monthly balance for USD & KHR with disposit handling
  const chartQuery = `
WITH PaymentAdjustments AS (
  SELECT 
      i.customerId,
      MONTH(i.CreateAt) AS invoiceMonth,  -- Invoice creation month
      MONTH(i.paidAt) AS paidMonth,  -- Paid month (if applicable)
      c.orderStatus,
      i.currency,
      i.totalAmount,
      i.finalAmount,
      i.disposit,
      i.paidAmount,
      LAG(c.orderStatus) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevOrderStatus,  -- Previous month's order status
      LAG(i.disposit) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevDisposit,  -- Previous month's deposit
      LAG(MONTH(i.CreateAt)) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevMonth  -- Previous month's invoice month
  FROM invoice_details i
  JOIN customers c ON i.customerId = c.id
  WHERE i.deleted_at IS NULL 
    AND YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Filter for the current year
)
SELECT 
  COALESCE(paidMonth, invoiceMonth) AS month,  -- If paid, use paidAt month; otherwise, use invoice month

  -- Adjusted total amount calculation (reflects payment in correct month)
  SUM(CASE 
      WHEN paidMonth IS NOT NULL AND paidMonth <> invoiceMonth THEN paidAmount  -- If paid in a later month, show in that month
      WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth THEN totalAmount  -- Paid in the same month as deposit
      WHEN prevOrderStatus IS NULL AND orderStatus = 1 THEN totalAmount  -- Fully paid with no previous deposit
      WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth THEN totalAmount - prevDisposit  -- Paid after previous deposit
      WHEN orderStatus = 2 THEN disposit  -- Only deposit shown
      ELSE 0  
  END) AS totalAmount,

  -- Total amount in KHR
  SUM(CASE 
      WHEN paidMonth IS NOT NULL AND paidMonth <> invoiceMonth AND currency = 'KHR' THEN paidAmount
      WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth AND currency = 'KHR' THEN totalAmount
      WHEN prevOrderStatus IS NULL AND orderStatus = 1 AND currency = 'KHR' THEN totalAmount
      WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth AND currency = 'KHR' THEN totalAmount - prevDisposit
      WHEN orderStatus = 2 AND currency = 'KHR' THEN disposit
      ELSE 0
  END) AS totalKHR,

  -- Total amount in USD
  SUM(CASE 
      WHEN paidMonth IS NOT NULL AND paidMonth <> invoiceMonth AND currency = 'USD' THEN paidAmount
      WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth AND currency = 'USD' THEN totalAmount
      WHEN prevOrderStatus IS NULL AND orderStatus = 1 AND currency = 'USD' THEN totalAmount
      WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth AND currency = 'USD' THEN totalAmount - prevDisposit
      WHEN orderStatus = 2 AND currency = 'USD' THEN disposit
      ELSE 0
  END) AS totalUSD
FROM PaymentAdjustments
GROUP BY COALESCE(paidMonth, invoiceMonth);



  `;

  // Query to get the order statuses summary for each month
  const orderStatusQuery = `
    SELECT 
        MONTH(i.CreateAt) AS month,  -- Get the month of the invoice
        SUM(CASE WHEN c.orderStatus = 1 THEN 1 ELSE 0 END) AS paidOrders,
        SUM(CASE WHEN c.orderStatus = 2 THEN 1 ELSE 0 END) AS dispositOrders,
        SUM(CASE WHEN c.orderStatus = 3 THEN 1 ELSE 0 END) AS unpaidOrders
    FROM invoice_details i
    JOIN customers c ON i.customerId = c.id
    WHERE YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Filter for the current year
    GROUP BY MONTH(i.CreateAt);
  `;

  // Query to get totals for current and next month
  const totalsQuery = `
    SELECT 
    -- Total amounts for KHR and USD in current month
    SUM(CASE WHEN i.currency = 'KHR' AND MONTH(i.CreateAt) = ${currentMonth} THEN i.totalAmount ELSE 0 END) AS totalKHRCurrent,
    SUM(CASE WHEN i.currency = 'USD' AND MONTH(i.CreateAt) = ${currentMonth} THEN i.totalAmount ELSE 0 END) AS totalUSDCurrent,

    -- Total amounts for KHR and USD in next month
    SUM(CASE WHEN i.currency = 'KHR' AND MONTH(i.CreateAt) = ${nextMonth} THEN i.totalAmount ELSE 0 END) AS totalKHRNext,
    SUM(CASE WHEN i.currency = 'USD' AND MONTH(i.CreateAt) = ${nextMonth} THEN i.totalAmount ELSE 0 END) AS totalUSDNext,

    -- Paid amounts for current month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 1 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS paidCurrentKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 1 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS paidCurrentUSD,

    -- Disposit amounts for current month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'KHR' THEN i.finalAmount ELSE 0 END) AS dispositCurrentKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'USD' THEN i.finalAmount ELSE 0 END) AS dispositCurrentUSD,

    -- Disposit amounts for current month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'KHR' THEN i.disposit ELSE 0 END) AS dispositcsCurrentKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'USD' THEN i.disposit ELSE 0 END) AS dispositcsCurrentUSD,

    -- Unpaid amounts for current month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 3 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS unpaidCurrentKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 3 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS unpaidCurrentUSD,

    -- Paid amounts for next month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 1 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS paidNextKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 1 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS paidNextUSD,

    -- Disposit amounts for next month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 2 AND i.currency = 'KHR' THEN i.finalAmount ELSE 0 END) AS dispositNextKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 2 AND i.currency = 'USD' THEN i.finalAmount ELSE 0 END) AS dispositNextUSD,

    -- Unpaid amounts for next month (both KHR and USD separately)
    SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 3 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS unpaidNextKHR,
    SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 3 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS unpaidNextUSD
  FROM invoice_details i
  JOIN customers c ON i.customerId = c.id  -- Join with customers table to get orderStatus
  WHERE i.deleted_at IS NULL

  `;

  // Execute the chart query
  db.query(chartQuery, (err, chartResults) => {
    if (err) return res.status(500).json({ error: err.message });

    // Execute the order status query
    db.query(orderStatusQuery, (err, orderStatusResults) => {
      if (err) return res.status(500).json({ error: err.message });

      // Execute the totals query with current and next month parameters
      db.query(totalsQuery, [currentMonth, currentMonth, nextMonth, nextMonth, currentMonth, currentMonth, currentMonth, nextMonth, nextMonth, nextMonth], (err, totalsResults) => {
        if (err) return res.status(500).json({ error: err.message });

        // Return both chart data, order status data, and totals data in the response
        res.json({
          chartData: chartResults,
          orderStatusData: orderStatusResults,
          totalsData: totalsResults[0]  // Assuming only one row is returned from totals query
        });
      });
    });
  });
});



app.put("/update-order-status/:customerId", (req, res) => {
  const { customerId } = req.params;
  const { orderStatus } = req.body; // Expecting the new orderStatus (e.g., 1 for paid, 2 for disposit)

  if (!orderStatus) {
    return res.status(400).json({ error: "orderStatus is required" });
  }

  // Update the customer order status
  const updateOrderStatusQuery = `
    UPDATE customers
    SET orderStatus = ?
    WHERE id = ?
  `;

  db.query(updateOrderStatusQuery, [orderStatus, customerId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // If orderStatus is changed to paid (1), trigger the payment update
    if (orderStatus === 1) {
      const updatePaymentQuery = `
   UPDATE invoice_details i
JOIN customers c ON i.customerId = c.id
SET i.paidAt = CURRENT_TIMESTAMP(), i.paidAmount = i.finalAmount
WHERE i.customerId = ?
  AND c.orderStatus = 1;




      `;
      console.log(updatePaymentQuery);
      db.query(updatePaymentQuery, [customerId], (err, result) => {
        if (err) {
          console.error('Error updating payment:', err);
          return res.status(500).json({ error: err.message });
        }
      
        console.log('Update result:', result);
        res.json({ message: "Order status updated to paid, payment details updated." });
      });
      
    } else {
      res.json({ message: "Order status updated successfully." });
    }
  });
});








// app.get("/dashboard-list", (req, res) => {
//   const currentMonth = new Date().getMonth() + 1;  // Get current month (1-12)
//   const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;  // Next month logic

//   // Query to get the monthly balance for USD & KHR with disposit handling
//   const chartQuery = `
//     WITH PaymentAdjustments AS (
//       SELECT 
//           i.customerId,
//           MONTH(i.CreateAt) AS invoiceMonth,  -- Get the month of the invoice
//           c.orderStatus,
//           i.currency,
//           i.totalAmount,
//           i.finalAmount,
//           i.disposit,
//           LAG(c.orderStatus) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevOrderStatus,  -- Get previous month's orderStatus
//           LAG(i.disposit) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevDisposit,  -- Get previous month's disposit
//           LAG(MONTH(i.CreateAt)) OVER (PARTITION BY i.customerId ORDER BY i.CreateAt) AS prevMonth  -- Get previous month's month
//       FROM invoice_details i
//       JOIN customers c ON i.customerId = c.id
//       WHERE i.deleted_at IS NULL 
//         AND YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Filter for the current year
//     )
//     SELECT 
//       invoiceMonth AS month,
//       -- Calculate total amount considering deposits and payments
//       SUM(CASE 
//           WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth THEN totalAmount  -- Paid in the same month as deposit
//           WHEN prevOrderStatus IS NULL AND orderStatus = 1 THEN totalAmount  -- Fully paid with no previous deposit
//           WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth THEN totalAmount - prevDisposit  -- Paid after previous deposit
//           WHEN orderStatus = 2 THEN disposit  -- Only deposit shown
//           ELSE 0  
//       END) AS totalAmount,
      
//       -- Calculate total amount in KHR currency
//       SUM(CASE 
//           WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth AND currency = 'KHR' THEN totalAmount
//           WHEN prevOrderStatus IS NULL AND orderStatus = 1 AND currency = 'KHR' THEN totalAmount
//           WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth AND currency = 'KHR' THEN totalAmount - prevDisposit
//           WHEN orderStatus = 2 AND currency = 'KHR' THEN disposit
//           ELSE 0
//       END) AS totalKHR,
      
//       -- Calculate total amount in USD currency
//       SUM(CASE 
//           WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth = invoiceMonth AND currency = 'USD' THEN totalAmount
//           WHEN prevOrderStatus IS NULL AND orderStatus = 1 AND currency = 'USD' THEN totalAmount
//           WHEN prevOrderStatus = 2 AND orderStatus = 1 AND prevMonth <> invoiceMonth AND currency = 'USD' THEN totalAmount - prevDisposit
//           WHEN orderStatus = 2 AND currency = 'USD' THEN disposit
//           ELSE 0
//       END) AS totalUSD
//     FROM PaymentAdjustments
//     GROUP BY invoiceMonth;
//   `;

//   // Query to get the order statuses summary for each month
//   const orderStatusQuery = `
//     SELECT 
//         MONTH(i.CreateAt) AS month,  -- Get the month of the invoice
//         SUM(CASE WHEN c.orderStatus = 1 THEN 1 ELSE 0 END) AS paidOrders,
//         SUM(CASE WHEN c.orderStatus = 2 THEN 1 ELSE 0 END) AS dispositOrders,
//         SUM(CASE WHEN c.orderStatus = 3 THEN 1 ELSE 0 END) AS unpaidOrders
//     FROM invoice_details i
//     JOIN customers c ON i.customerId = c.id
//     WHERE YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Filter for the current year
//     GROUP BY MONTH(i.CreateAt);
//   `;

//   // Query to get totals for current and next month
//   const totalsQuery = `
//     SELECT 
//     -- Total amounts for KHR and USD in current month
//     SUM(CASE WHEN i.currency = 'KHR' AND MONTH(i.CreateAt) = ${currentMonth} THEN i.totalAmount ELSE 0 END) AS totalKHRCurrent,
//     SUM(CASE WHEN i.currency = 'USD' AND MONTH(i.CreateAt) = ${currentMonth} THEN i.totalAmount ELSE 0 END) AS totalUSDCurrent,

//     -- Total amounts for KHR and USD in next month
//     SUM(CASE WHEN i.currency = 'KHR' AND MONTH(i.CreateAt) = ${nextMonth} THEN i.totalAmount ELSE 0 END) AS totalKHRNext,
//     SUM(CASE WHEN i.currency = 'USD' AND MONTH(i.CreateAt) = ${nextMonth} THEN i.totalAmount ELSE 0 END) AS totalUSDNext,

//     -- Paid amounts for current month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 1 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS paidCurrentKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 1 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS paidCurrentUSD,

//     -- Disposit amounts for current month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'KHR' THEN i.finalAmount ELSE 0 END) AS dispositCurrentKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'USD' THEN i.finalAmount ELSE 0 END) AS dispositCurrentUSD,

//     -- Disposit amounts for current month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'KHR' THEN i.disposit ELSE 0 END) AS dispositcsCurrentKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 2 AND i.currency = 'USD' THEN i.disposit ELSE 0 END) AS dispositcsCurrentUSD,

//     -- Unpaid amounts for current month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 3 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS unpaidCurrentKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${currentMonth} AND c.orderStatus = 3 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS unpaidCurrentUSD,

//     -- Paid amounts for next month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 1 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS paidNextKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 1 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS paidNextUSD,

//     -- Disposit amounts for next month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 2 AND i.currency = 'KHR' THEN i.finalAmount ELSE 0 END) AS dispositNextKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 2 AND i.currency = 'USD' THEN i.finalAmount ELSE 0 END) AS dispositNextUSD,

//     -- Unpaid amounts for next month (both KHR and USD separately)
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 3 AND i.currency = 'KHR' THEN i.totalAmount ELSE 0 END) AS unpaidNextKHR,
//     SUM(CASE WHEN MONTH(i.CreateAt) = ${nextMonth} AND c.orderStatus = 3 AND i.currency = 'USD' THEN i.totalAmount ELSE 0 END) AS unpaidNextUSD
//   FROM invoice_details i
//   JOIN customers c ON i.customerId = c.id  -- Join with customers table to get orderStatus
//   WHERE i.deleted_at IS NULL

//   `;

//   // Execute the chart query
//   db.query(chartQuery, (err, chartResults) => {
//     if (err) return res.status(500).json({ error: err.message });

//     // Execute the order status query
//     db.query(orderStatusQuery, (err, orderStatusResults) => {
//       if (err) return res.status(500).json({ error: err.message });

//       // Execute the totals query with current and next month parameters
//       db.query(totalsQuery, [currentMonth, currentMonth, nextMonth, nextMonth, currentMonth, currentMonth, currentMonth, nextMonth, nextMonth, nextMonth], (err, totalsResults) => {
//         if (err) return res.status(500).json({ error: err.message });

//         // Return both chart data, order status data, and totals data in the response
//         res.json({
//           chartData: chartResults,
//           orderStatusData: orderStatusResults,
//           totalsData: totalsResults[0]  // Assuming only one row is returned from totals query
//         });
//       });
//     });
//   });
// });








  
  // API to update order status and trigger the payment update








// app.put("/update-paid-status/:customerId", (req, res) => {
//   const { customerId } = req.params;

//   // Update invoice details to reflect payment for the customer, moving payment from month 2 to month 3
//   const updatePaidStatus = `
//     UPDATE invoice_details i
//     JOIN customers c ON i.customerId = c.id
//     SET 
//       i.paidAt = CURRENT_TIMESTAMP(),
//       i.paidAmount = i.finalAmount  -- Setting paid amount as the final amount
//     WHERE i.customerId = ?
//       AND c.orderStatus = 2  -- Assuming "2" represents the "disposit" status
//       AND MONTH(i.CreateAt) = 2  -- Previous month (February)
//       AND YEAR(i.CreateAt) = YEAR(CURRENT_DATE())  -- Current year
//   `;
//   console.log(updatePaidStatus);
//   db.query(updatePaidStatus, [customerId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "No invoices found for the customer to update." });
//     }

//     res.status(200).json({ message: "Payment successfully moved to Month 3 and updated." });
//   });
// });

// API to get the invoice details for a specific customer and month


// app.get("/invoice-details/:customerId", (req, res) => {
//   const { customerId } = req.params;
//   const currentMonth = new Date().getMonth() + 1; // Current month (1-12)

//   // Query to fetch invoice details for the given customer and the current month
//   const invoiceDetailsQuery = `
//     SELECT 
//       id, customerId, items, qtyTotal, discount, discountPercentage,
//       disposit, totalAmount, finalAmount, currency, deleted_at, CreateAt, paidAt, paidAmount
//     FROM invoice_details
//     WHERE customerId = ? 
//       AND MONTH(CreateAt) = ? 
//       AND YEAR(CreateAt) = YEAR(CURRENT_DATE())  -- For the current year
//   `;

//   console.log(`Running query for customerId: ${customerId} and current month: ${currentMonth}`);

//   db.query(invoiceDetailsQuery, [customerId, currentMonth], (err, result) => {
//     if (err) {
//       console.error("Error executing query:", err.message);
//       return res.status(500).json({ error: err.message });
//     }

//     if (result.length === 0) {
//       console.log("No invoice details found.");
//       return res.status(404).json({ message: "Invoice details not found for this customer." });
//     }

//     console.log("Invoice details found:", result);
//     res.json({ invoiceDetails: result });
//   });
// });






// app.put("/update-invoice/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name, orderStatus, disposit, totalAmount, finalAmount } = req.body;

//   const connection = await db.getConnection(); // Get DB connection
//   try {
//       await connection.beginTransaction(); // Start transaction

//       // 1. Update customer data
//       const updateCustomerQuery = `
//           UPDATE customers 
//           SET name = ?, orderStatus = ?
//           WHERE id = (SELECT customerId FROM invoice_details WHERE id = ?)
//       `;
//       await connection.query(updateCustomerQuery, [name, orderStatus, id]);

//       // 2. Update invoice details
//       const updateInvoiceQuery = `
//           UPDATE invoice_details 
//           SET disposit = ?, totalAmount = ?, finalAmount = ?
//           WHERE id = ?
//       `;
//       await connection.query(updateInvoiceQuery, [disposit, totalAmount, finalAmount, id]);

//       await connection.commit(); // Commit transaction
//       res.json({ message: "Invoice updated successfully" });
//   } catch (error) {
//       await connection.rollback(); // Rollback if error
//       res.status(500).json({ error: error.message });
//   } finally {
//       connection.release(); // Release connection
//   }
// });











app.listen(5000, () => {
  console.log('Server running on port 5000');
});