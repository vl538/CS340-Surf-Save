const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 59905; // Change to your assigned port

// Create custom helpers
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

// Setup Handlebars with helpers
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views'),
    helpers: handlebarsHelpers
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Sample data matching your INSERT statements
const sampleData = {
    customers: [
        { customerID: 1, firstName: 'Jon', lastName: 'Schema', email: 'JSch@gmail.com', phone: '(971) 123-8988' },
        { customerID: 2, firstName: 'Richard', lastName: 'Hammock', email: 'RichHam@hotmal.com', phone: '(503) 776-1453' },
        { customerID: 3, firstName: 'Bobby', lastName: 'Knuckles', email: 'BKnucks@yahoo.com', phone: '(770) 567-0098' }
    ],
    orders: [
        { orderID: 1, customerID: 1, totalCost: '200.00', orderDate: '2025-12-05', shippingAddress: '179 NW Sagebrush Dr' },
        { orderID: 2, customerID: 2, totalCost: '500.00', orderDate: '2025-12-30', shippingAddress: '889 N Halfcount Ave' },
        { orderID: 3, customerID: 3, totalCost: '48.00', orderDate: '2026-01-08', shippingAddress: '654 SE Wallaby Way' }
    ],
    products: [
        { productID: 1, productName: 'O\'mally long sleeve unisex surf shirt', price: '40.00', productTypeID: 1 },
        { productID: 2, productName: 'Richter portable shower', price: '160.00', productTypeID: 2 },
        { productID: 3, productName: 'Urex essential surfboard', price: '500.00', productTypeID: 3 },
        { productID: 4, productName: 'SurfsUp mens t-shirt', price: '24.00', productTypeID: 1 }
    ],
    productTypes: [
        { productTypeID: 1, description: 'Shirts' },
        { productTypeID: 2, description: 'Camp Supplies' },
        { productTypeID: 3, description: 'Surfboards' }
    ],
    orderItems: [
        { orderItemID: 1, orderID: 1, productID: 1, quantity: 1 },
        { orderItemID: 2, orderID: 1, productID: 2, quantity: 1 },
        { orderItemID: 3, orderID: 2, productID: 3, quantity: 1 },
        { orderItemID: 4, orderID: 3, productID: 4, quantity: 2 }
    ]
};

// Helper function to get customer name by ID
function getCustomerName(customerID) {
    const customer = sampleData.customers.find(c => c.customerID === customerID);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
}

// Helper function to get product name by ID
function getProductName(productID) {
    const product = sampleData.products.find(p => p.productID === productID);
    return product ? product.productName : 'Unknown';
}

// Helper function to get product price by ID
function getProductPrice(productID) {
    const product = sampleData.products.find(p => p.productID === productID);
    return product ? product.price : '0.00';
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home - E-commerce System',
        layout: 'main'
    });
});

app.get('/customers', (req, res) => {
    res.render('customers', { 
        title: 'Browse Customers',
        customers: sampleData.customers,
        layout: 'main',
        helpers: handlebarsHelpers
    });
});

app.get('/orders', (req, res) => {
    // Add customer names to orders for display
    const ordersWithNames = sampleData.orders.map(order => ({
        ...order,
        customerName: getCustomerName(order.customerID)
    }));
    
    res.render('orders', { 
        title: 'Browse Orders',
        orders: ordersWithNames,
        customers: sampleData.customers,
        layout: 'main',
        helpers: handlebarsHelpers
    });
});

app.get('/products', (req, res) => {
    // Add product type descriptions to products for display
    const productsWithTypes = sampleData.products.map(product => {
        const productType = sampleData.productTypes.find(pt => pt.productTypeID === product.productTypeID);
        return {
            ...product,
            productTypeDesc: productType ? productType.description : 'Unknown'
        };
    });
    
    res.render('products', { 
        title: 'Browse Products',
        products: productsWithTypes,
        productTypes: sampleData.productTypes,
        layout: 'main',
        helpers: handlebarsHelpers
    });
});

app.get('/producttypes', (req, res) => {
    res.render('producttypes', { 
        title: 'Browse Product Types',
        productTypes: sampleData.productTypes,
        layout: 'main',
        helpers: handlebarsHelpers
    });
});

app.get('/orderitems', (req, res) => {
    // Enrich order items with product and order details
    const enrichedOrderItems = sampleData.orderItems.map(item => {
        const product = sampleData.products.find(p => p.productID === item.productID);
        const order = sampleData.orders.find(o => o.orderID === item.orderID);
        const customer = order ? sampleData.customers.find(c => c.customerID === order.customerID) : null;
        
        return {
            ...item,
            productName: product ? product.productName : 'Unknown',
            productPrice: product ? product.price : '0.00',
            orderTotal: order ? order.totalCost : '0.00',
            orderDate: order ? order.orderDate : 'Unknown',
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'
        };
    });
    
    res.render('orderitems', { 
        title: 'Manage Order Items',
        orderItems: enrichedOrderItems,
        orders: sampleData.orders,
        products: sampleData.products,
        layout: 'main',
        helpers: handlebarsHelpers
    });
});

// Form submission handlers (placeholder - no actual DB operations)
app.post('/add-customer', (req, res) => {
    console.log('Would add customer:', req.body);
    res.redirect('/customers');
});

app.post('/update-customer', (req, res) => {
    console.log('Would update customer:', req.body);
    res.redirect('/customers');
});

app.post('/delete-customer', (req, res) => {
    console.log('Would delete customer ID:', req.body.customerID);
    res.redirect('/customers');
});

app.post('/add-order', (req, res) => {
    console.log('Would add order:', req.body);
    res.redirect('/orders');
});

app.post('/update-order', (req, res) => {
    console.log('Would update order:', req.body);
    res.redirect('/orders');
});

app.post('/delete-order', (req, res) => {
    console.log('Would delete order ID:', req.body.orderID);
    res.redirect('/orders');
});

app.post('/add-product', (req, res) => {
    console.log('Would add product:', req.body);
    res.redirect('/products');
});

app.post('/update-product', (req, res) => {
    console.log('Would update product:', req.body);
    res.redirect('/products');
});

app.post('/delete-product', (req, res) => {
    console.log('Would delete product ID:', req.body.productID);
    res.redirect('/products');
});

app.post('/add-producttype', (req, res) => {
    console.log('Would add product type:', req.body);
    res.redirect('/producttypes');
});

app.post('/update-producttype', (req, res) => {
    console.log('Would update product type:', req.body);
    res.redirect('/producttypes');
});

app.post('/delete-producttype', (req, res) => {
    console.log('Would delete product type ID:', req.body.productTypeID);
    res.redirect('/producttypes');
});

app.post('/add-orderitem', (req, res) => {
    console.log('Would add order item:', req.body);
    res.redirect('/orderitems');
});

app.post('/update-orderitem', (req, res) => {
    console.log('Would update order item:', req.body);
    res.redirect('/orderitems');
});

app.post('/delete-orderitem', (req, res) => {
    console.log('Would delete order item ID:', req.body.orderItemID);
    res.redirect('/orderitems');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://classwork.engr.oregonstate.edu:${PORT}`);
});