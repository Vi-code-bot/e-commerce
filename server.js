const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3020;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/loginDB')
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Define the Cart Schema and Model
const cartItemSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // Associate cart with a user
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Cart = mongoose.model("Cart", cartItemSchema);

// Define the User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// Define the Login Schema and Model
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Login = mongoose.model("Login", loginSchema);

// Define the Order Schema and Model

const orderSchema = new mongoose.Schema({
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  }],
  totalAmount: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);



// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve various other HTML pages (home, index, etc.)
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});
app.get('/desktop.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'desktop.html'));
});
app.get('/electronics.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'electronics.html'));
});
app.get('/mens.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'mens.html'));
});
app.get('/order-confirmation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'order-confirmation.html'));
});
app.get('/camera.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'camera.html'));
});
app.get('/cart.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});
app.get('/womens.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'womens.html'));
});
app.get('/tablet.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'tablet.html'));
});
app.get('/lk.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'lk.html'));
});
app.get('/order-summary.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'order-summary.html'));
});
// Static files (e.g., images)
app.get('/assets/css/cart.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets/css/cart.css'));
});
app.get('/lp.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lp.png'));
});

// POST: Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      // Save login details to the "logins" collection
      const loginRecord = new Login({ email });
      await loginRecord.save();

      // Fetch all login records (for all emails)
      const allLogins = await Login.find().sort({ timestamp: -1 });

      // Fetch the user's cart items from the database
      const userCart = await Cart.find({ userEmail: email });

      res.json({
        message: "Login successful",
        user: { email: user.email },
        allLogins, // Return all login records
        cart: userCart, // Return the user's cart items
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST: Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    res.json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during sign-up" });
  }
});

// POST: Add item to cart
app.post('/add-to-cart', async (req, res) => {
  const { userEmail, name, price, image } = req.body;
  try {
    if (!userEmail || !name || !price || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newCartItem = new Cart({ userEmail, name, price, image });
    await newCartItem.save();
    res.json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Server error while adding to cart" });
  }
});
app.post('/place-order', async (req, res) => {
  const { userEmail, items, totalAmount, phone, address } = req.body;

  try {
    // Create a new order document
    const newOrder = new Order({
      userEmail,
      items,
      totalAmount,
      phone,
      address,
    });

    // Save the order to the database
    await newOrder.save();

    // Respond with success
    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
