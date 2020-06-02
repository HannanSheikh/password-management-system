const mongoose = require('mongoose')
const schema = mongoose.Schema;

const passCatSchema = schema({
    password_Category: {type:String, 
        required: true,
        index: {
            unique: true,        
        }},
    date:{
        type: Date, 
        default: Date.now }

})
mongoose.model('PasswordCategory',passCatSchema)