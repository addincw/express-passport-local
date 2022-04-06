module.exports = (request, response, next) => {
    if(request.isAuthenticated() === false) {
        return next()
    }
    
    response.redirect('back')
}