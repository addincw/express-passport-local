require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const hash = require('./helpers/hash')

const isAuthenticated = require('./middlewares/isAuthenticated')

const User = require('./models/User')
const { request, response } = require('express')

//create connection to DB
const { DB_CONNECTION } = process.env
mongoose.connect(DB_CONNECTION, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(console.log('Success connect to DB'))
        .catch((err) => console.log('failed connect to DB: ' + err))

const app = express()

//handle request.body
app.use(express.urlencoded({ extended: false }))

//using flash to implement flash message (need express session)
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(flash())
app.use((request, response, next) => {
    const [error] = request.flash('error')
    let [notification] = request.flash('notification')

    if(error) {
        notification = {
            type: 'danger',
            message: error
        }
    }

    response.locals.notification = notification
    next()
})

//passport local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async function(email, password, done) {
        try {
            const user = await User.findOne({ email: email })
            
            if(!user) {
                return done(null, false, { message: 'email not registered.' })
            }
            
            if(!hash.check(password, user.password)) {
                return done(null, false, { message: 'password not match.' })
            }
            
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }
))
passport.serializeUser(function(user, done) {
    done(null, user.id)
})  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
})

app.use(passport.initialize())
app.use(passport.session())

//set template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')

//set routes
app.use('/auth', require('./routes/auth'))

app.get('/', isAuthenticated, (request, response) => {
    response.render('index')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))