const path = require('path');
const express = require('express');
const session = require('express-session')
const createError = require('http-errors');
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars')
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const hbs = require('hbs')
const nocache = require('nocache')
const logger = require('morgan');
const multer = require('multer')
const swal=require('sweetalert')
const hbsHelper=require('./helpers/hbsHelper')

require('dotenv').config()

 mongoose.connect(process.env.MONGODB)
 .then(() => {
   console.log('MongoDB connected');
 })
 .catch(err => {
   console.error('MongoDB connection error:', err);
 });
 Handlebars.registerHelper(hbsHelper.eq(Handlebars),hbsHelper.Noteq(Handlebars), hbsHelper.incHelper(Handlebars), hbsHelper.formatTime(Handlebars), hbsHelper.mulHelper(Handlebars), hbsHelper.subHelper(Handlebars),
 hbsHelper.addHelper(Handlebars),hbsHelper.isequal(Handlebars),hbsHelper.singleIsCancelled(Handlebars),Handlebars.registerHelper(hbsHelper.formatDate(Handlebars) ),Handlebars.registerHelper(hbsHelper.ifCondition(Handlebars)),Handlebars.registerHelper(hbsHelper.isCancelled(Handlebars)));
 Handlebars.registerHelper(hbsHelper.isGreaterThanZero(Handlebars))
 Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();

let hbss = exphbs.create({})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', handlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'layout',
  partialsDir: __dirname + '/views/partials/'
}));

hbs.registerPartials(path.join(__dirname,'/views/partials'))

app.use(session({
  secret: process.env.SECRETKEY,
  saveUninitialized: true,
   cookie: { maxAge: 600000 }, 
  resave: false 
}));

app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// Error handler middleware
app.use((err, req, res, next) => {
  
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  if (err.status === 404) {
      res.render('404', { layout: 'emptyLayout' });
  } else {
      res.render('error',{layout : 'emptyLayout'}); 
  }
});
 
app.listen(process.env.PORT)