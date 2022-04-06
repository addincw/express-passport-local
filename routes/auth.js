const express = require('express')
const router = express.Router()
const passport = require('passport')

const hash = require('../helpers/hash')

const isGuest = require('../middlewares/isGuest')

const User = require('../models/User')

router.get('/login', isGuest, (request, response) => {
    response.render('login')
})

router.post('/login', (request, response, next) => {
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true 
    })(request, response, next)
})

router.get('/logout', (request, response) => {
    request.logout()
    request.flash('notification', {
        type: 'success',
        message: 'You are logout.'
    })

    response.redirect('/auth/login')
})

router.get('/register', isGuest, (request, response) => {
    response.render('register')
})

router.post('/register', async (request, response) => {
    const data = request.body
    let errors = {}

    for (var key in data) {
        if(!data[key]) errors[key] = `${key} cannot empty`
    }

    if(data.password.length < 6) {
        errors['password'] = `password should be at least 6 characters`
    }

    if(data.password !== data.re_password) {
        errors['re_password'] = `re_password not match with password field`
    }

    if(Object.keys(errors).length !== 0) {
        response.render('register', { errors, data })
        return
    }

    try {
        const userExist = await User.findOne({ email: data.email })
        if(userExist) {
            errors['email'] = 'email already used'
            response.render('register', { errors, data })
            return
        }

        const user = new User({
            name: data.name,
            email: data.email,
            password: hash.make(data.password)
        })

        const result = await user.save()

        request.flash('notification', {
            type: 'success',
            message: 'Register success, please login'
        })

        response.redirect('/auth/login')
    } catch (error) {
        console.log(error)
        response.render('register', { data })
        return
    }
})

module.exports = router