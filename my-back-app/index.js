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
  // let discountAmount = (subtotal * discount) / 100;
  // let discountAmount = ((discount / subtotal) * 100).toFixed(2); 
  let discountPercentage = subtotal > 0 ? ((discount / subtotal) * 100).toFixed(2) : "0.00";   
  // let finalAmount = subtotal - discountAmount - disposit;
  let finalAmount = subtotal - discount;

  db.query(
    'INSERT INTO invoice_details (customerId, items, qtyTotal, discount,discountPercentage, disposit, finalAmount, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [customerId, JSON.stringify(items), qtyTotal, discount,discountPercentage, disposit, finalAmount, currency], // Store currency
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true,discountPercentage: discountPercentage + "%", finalAmount, currency});
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
          SUM(CASE WHEN currency = 'KHR' THEN finalAmount ELSE 0 END) AS totalKHR,
          SUM(CASE WHEN currency = 'USD' THEN finalAmount ELSE 0 END) AS totalUSD
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






// Start Server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});