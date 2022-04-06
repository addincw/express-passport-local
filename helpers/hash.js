const bcrypt = require('bcryptjs')

module.exports = {
    "make": function (text) {
        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds);
        
        return bcrypt.hashSync(text, salt);
    },
    "check": function (text, textHashed) {
        return bcrypt.compareSync(text, textHashed)
    }
}