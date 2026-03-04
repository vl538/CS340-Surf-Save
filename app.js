//Citation for the following code:
//Date: 2/23/2026
//Adapted for microsoft Copilot
//(Explain degree of originality)Used to explain how to set up handlebars and use cases
//Source URL: https://copilot.microsoft.com/
//If AI tools were used: Prompts include:
// "provide an example of how to set up handlebars"
// "how can I use handlebars for my website" etc.
//(Explain the use of tools and include a summary of the prompts submitted to the AI tool)

//Citation for the following code:
//Date: 2/23/2026
//Based on Activity 2 - Connect webapp to database
//(Explain degree of originality) Used to set up dependancies and connect to CS340 database
//Source URL: https://canvas.oregonstate.edu/courses/2031764/assignments/10323319?module_item_id=26243357

//Citation for the following code:
//Date: 03/02/2026
//Adapted for microsoft Copilot
//(Explain degree of originality)Used to understand how to handle "delete-customer" button correctly
//Source URL: https://copilot.microsoftgit branch.com/
//If AI tools were used: Prompts include:
// "How to delete customer with related foreign key records in Express and MySQL?"

require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 51015;

//DB config use your osu credentials 
const dbConfig = {
    host: 'classmysql.engr.oregonstate.edu',
    user: "cs340_levince",
    password: "8572",
    database: "cs340_levince",  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        //console log for debugging
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}
testConnection();


const handlebarsHelpers = {
    eq: function(a, b) {
        return a === b;
    },
    multiply: function(a, b) {
        return (parseFloat(a) * parseInt(b)).toFixed(2);
    },
    formatDate: function(date) {
        return new Date(date).toLocaleDateString();
    }
};

//handlebar helpers
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views'),
    helpers: handlebarsHelpers
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// GET routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home - E-commerce System',
        layout: 'main'
    });
});


app.get('/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Customers ORDER BY customerID');
        console.log(`Found ${rows.length} customers`);
        
        res.render('customers', { 
            title: 'Browse Customers',
            customers: rows,
            layout: 'main',
            helpers: handlebarsHelpers
        });
    } catch (error) {
        console.error('Error fetching customers:');
        console.error('   Error message:', error.message);
        res.status(500).send(`
            <h1>Database Error</h1>
            <p>Error fetching customers from database:</p>
            <pre>${error.message}</pre>
            <a href="/">Go back home</a>
        `);
    }
});

app.get('/orders', async (req, res) => {
    try {
        console.log('🔍 Fetching orders from database...');
        
        const [orders] = await pool.query(`
            SELECT o.*, CONCAT(c.firstName, ' ', c.lastName) as customerName 
            FROM Orders o
            JOIN Customers c ON o.customerID = c.customerID
            ORDER BY o.orderID
        `);
        console.log(`Found ${orders.length} orders`);
        
        //dropdown for customers
        const [customers] = await pool.query('SELECT * FROM Customers ORDER BY customerID');
        
        res.render('orders', { 
            title: 'Browse Orders',
            orders: orders,
            customers: customers,
            layout: 'main',
            helpers: handlebarsHelpers
        });
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).send(`Error fetching orders: ${error.message}`);
    }
});

app.get('/products', async (req, res) => {
    try {

        const [products] = await pool.query(`
            SELECT p.*, pt.description as productTypeDesc 
            FROM Products p
            JOIN ProductTypes pt ON p.productTypeID = pt.productTypeID
            ORDER BY p.productID
        `);
        console.log(`Found ${products.length} products`);
        const [productTypes] = await pool.query('SELECT * FROM ProductTypes ORDER BY productTypeID');
        
        res.render('products', { 
            title: 'Browse Products',
            products: products,
            productTypes: productTypes,
            layout: 'main',
            helpers: handlebarsHelpers
        });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).send(`Error fetching products: ${error.message}`);
    }
});

//select for product types
app.get('/producttypes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ProductTypes ORDER BY productTypeID');
        console.log(`Found ${rows.length} product types`);
        
        res.render('producttypes', { 
            title: 'Browse Product Types',
            productTypes: rows,
            layout: 'main',
            helpers: handlebarsHelpers
        });
    } catch (error) {
        console.error('Error fetching product types:', error.message);
        res.status(500).send(`Error fetching product types: ${error.message}`);
    }
});

//select for order items
app.get('/orderitems', async (req, res) => {
    try {
        
        const [orderItems] = await pool.query(`
            SELECT 
                oi.orderItemID,
                oi.orderID,
                oi.productID,
                oi.quantity,
                p.productName,
                p.price as productPrice,
                o.totalCost as orderTotal,
                o.orderDate,
                CONCAT(c.firstName, ' ', c.lastName) as customerName
            FROM OrderItems oi
            JOIN Products p ON oi.productID = p.productID
            JOIN Orders o ON oi.orderID = o.orderID
            JOIN Customers c ON o.customerID = c.customerID
            ORDER BY oi.orderItemID
        `);
        console.log(`Found ${orderItems.length} order items`);
        
        // Drop down menu queries 
        const [orders] = await pool.query(`
            SELECT o.*, CONCAT(c.firstName, ' ', c.lastName) as customerName 
            FROM Orders o
            JOIN Customers c ON o.customerID = c.customerID
            ORDER BY o.orderID
        `);

        const [products] = await pool.query('SELECT * FROM Products ORDER BY productID');
        
        res.render('orderitems', { 
            title: 'Browse Order Items',
            orderItems: orderItems,
            orders: orders,
            products: products,
            layout: 'main',
            helpers: handlebarsHelpers
        });
    } catch (error) {
        console.error('Error fetching order items:', error.message);
        res.status(500).send(`Error fetching order items: ${error.message}`);
    }
});

// RESET
app.get('/reset', async (req, res) => {
    try {
        await pool.query('CALL sp_reset_db()');
        res.redirect('/');
        } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


// POST routes
app.post('/add-customer', async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;

        if (!firstName || !lastName || !email) {
            throw new Error('First name, last name, and email are required');
        }

        const [result] = await pool.query(
            'INSERT INTO Customers (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, phone || null]
        );

        console.log(`✅ Customer added successfully with ID: ${result.insertId}`);

        res.redirect('/customers');
        
    } catch (error) {
        console.error('❌ Error adding customer:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send(`
                <h1>Error Adding Customer</h1>
                <p>A customer with this email already exists.</p>
                <a href="/customers">Go back to Customers</a>
            `);
        } else {
            res.status(500).send(`
                <h1>Error Adding Customer</h1>
                <p>Error: ${error.message}</p>
                <a href="/customers">Go back to Customers</a>
            `);
        }
    }
});

app.post('/update-customer', (req, res) => {
    console.log(' Update customer:', req.body);
    res.redirect('/customers');
});

app.post('/delete-customer', async (req, res) => {
    const customerID = req.body.customerID;

    try {

        await pool.query(
            `DELETE FROM OrderItems
             WHERE orderID IN (
                 SELECT orderID FROM Orders
                 WHERE customerID = ?
             )`,
            [customerID]
        );

        await pool.query(
            'DELETE FROM Orders WHERE customerID = ?',
            [customerID]
        );

        await pool.query(
            'DELETE FROM Customers WHERE customerID = ?',
            [customerID]
        );

        res.redirect('/customers');

    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).send(error.message);
    }
});

app.post('/add-order', (req, res) => {
    console.log('Add order:', req.body);
    res.redirect('/orders');
});

app.post('/update-order', (req, res) => {
    console.log('Update order:', req.body);
    res.redirect('/orders');
});

app.post('/delete-order',  async (req, res) => {
    try {
        const orderID  =  req.body.orderID;

        await pool.query(
            'DELETE FROM OrderItems WHERE orderID = ?',
            [orderID]
        );

        await pool.query(
            'DELETE FROM Orders WHERE orderID = ?',
            [orderID]
        );

        res.redirect('/orders');
    }   catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


app.post('/add-product', (req, res) => {
    console.log('Add product:', req.body);
    res.redirect('/products');
});

app.post('/update-product', (req, res) => {
    console.log('Update product:', req.body);
    res.redirect('/products');
});

app.post('/delete-product', async (req, res) => {
    try {
        const productID  =  req.body.productID;

        await pool.query(
            'DELETE FROM OrderItems WHERE productID = ?',
            [productID]
        );

        await pool.query(
            'DELETE FROM Products WHERE productID = ?',
            [productID]
        );

        res.redirect('/products');
    }   catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


app.post('/add-producttype', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || description.trim() === '') {
            throw new Error('Product type description is required');
        }

        const trimmedDescription = description.trim();
        const [result] = await pool.query(
            'INSERT INTO ProductTypes (description) VALUES (?)',
            [trimmedDescription]
        );
        res.redirect('/producttypes');
        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send(`
                <h1>Error Adding Product Type</h1>
                <p>Product type already exists.</p>
                <a href="/producttypes">Go back to Product Types</a>
            `);
        } else {
            res.status(500).send(`
                <h1>Error Adding Product Type</h1>
                <p>Error: ${error.message}</p>
                <a href="/producttypes">Go back to Product Types</a>
            `);
        }
    }
});

app.post('/update-producttype', (req, res) => {
    console.log('Update product type:', req.body);
    res.redirect('/producttypes');
});

app.post('/delete-producttype', async (req, res) => {
    try {
        const productTypeID  =  req.body.productTypeID;

        const [products]  =  await pool.query(
            'SELECT productID FROM Products WHERE productTypeID = ?',
            [productTypeID]
        );

        for (let product of products) {
            await pool.query(
                'DELETE FROM OrderItems WHERE productID = ?',
                [product.productID]
        );
    }

    await pool.query(
        'DELETE FROM Products WHERE productTypeID = ?',
        [productTypeID]
    );

    await pool.query(
        'DELETE FROM ProductTypes WHERE productTypeID = ?',
        [productTypeID]
    );

    res.redirect('/producttypes');
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    }
});

// Order Items
app.post('/add-orderitem', (req, res) => {
    console.log('Add order item:', req.body);
    res.redirect('/orderitems');
});

app.post('/update-orderitem', (req, res) => {
    console.log('Update order item:', req.body);
    res.redirect('/orderitems');
});

app.post('/delete-orderitem',  async (req,  res)  =>  {
    try {
        const  orderItemID  =  req.body.orderItemID

        await  pool.query(
            'DELETE  FROM  OrderItems  WHERE  orderItemID  =  ?',
            [orderItemID]
        )

        res.redirect('/orderitems')
    }   catch  (err)  {
        console.error(err)
        res.status(500).send(err.message)
    }
})


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Access at: http://classwork.engr.oregonstate.edu:${PORT}`);
    console.log('\n📊 Pages:');
    console.log('   - /customers');
    console.log('   - /orders');
    console.log('   - /products');
    console.log('   - /producttypes');
    console.log('   - /orderitems');
});