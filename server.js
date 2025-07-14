const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const { User, Student } = require('./models');

const app = express();

mongoose.connect('mongodb://localhost:27017/simpleStudentApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'easysecret',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static('views'));

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views/register.html')));
app.get('/dashboard', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'views/dashboard.html')));

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });
  res.redirect('/login?success=1');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/api/students', requireLogin, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post('/api/students', requireLogin, async (req, res) => {
  const { name, id } = req.body;
  await Student.create({ name, id });
  res.sendStatus(201);
});

app.put('/api/students/:id', requireLogin, async (req, res) => {
  const { name, id } = req.body;
  await Student.findByIdAndUpdate(req.params.id, { name, id });
  res.sendStatus(200);
});


app.listen(3000, () => console.log("Running on http://localhost:3000"));
