module.exports = (request, response, next) => {
    if(request.isAuthenticated()) {
        response.locals.user = request.user
        return next()
    }

    request.flash('notification', {
        type: 'danger',
        message: 'You are not login.'
    })

    response.redirect('/auth/login')
}