var express = require('express'); // Микрофреймворк
var path = require('path'); // Пакет для работы с локальными файлами и путями
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); // Middleware (обрабатывает body у http запроса)
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash'); // пушит сообщения, которые отображает хэндлбарс
var session = require('express-session'); //
var passport = require('passport'); // для аутентификации пакет
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb'); // основной пакет для монго
var mongoose = require('mongoose'); // для работы с монго, подключаем модель юзера и хелперы (вспомогательные функции)

mongoose.connect('mongodb://trump:123123@ds133296.mlab.com:33296/users'); // конектимся к МЛАБ
var db = mongoose.connection; // это уже наша база (этот объект – ссылка на базу), в нее можно писать, читать с нее и т д

var routes = require('./routes/index'); // Dashboard загружаем
var users = require('./routes/users'); // подгружаем API для юзеров, там у нас роуты вида /users/register

// Инициализируем приложение, создаем т.е. объект app, который далее будем настраивать
var app = express();

// Подключаем hanblebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'})); 
app.set('view engine', 'handlebars');

// Подключаем обработчики: 1.) парсит входной контент запросов как json, 2.) парсит куки
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Подключаем папку с файлами, которые будем отдавать как есть (папку public)
app.use(express.static(path.join(__dirname, 'public')));

// задаем ключ, которым будем шифровать сессии;
app.use(session({ 
    secret: 'odfigjodfgjeorijt8etj3984j24jf',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars; тут подключаем флэш к экспрессу
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});



app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});