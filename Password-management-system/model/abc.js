const mongoose = require('mongoose')
const schema = mongoose.Schema;

const abcSchema = schema({
    username: {type:String, 
        required: true,
        index: {
            unique: true,        
        }},

	email: {
        type:String, 
        required: true,
        index: {
            unique: true, 
        },},
    password: {
        type:String, 
        required: true
    },
    date:{
        type: Date, 
        default: Date.now }

})
mongoose.model('abc',abcSchema)