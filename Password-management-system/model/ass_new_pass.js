const mongoose = require('mongoose')
const schema = mongoose.Schema;

const addPassSchema = schema({
    password_Category: {type:String, 
        required: true,
        index: {
            unique: true,        
        }},
        project_Name: {type:String, 
            required: true,
            },
        password_Details: {type:String, 
            required: true,
           },
    date:{
        type: Date, 
        default: Date.now }

})
mongoose.model('AddNewPassword',addPassSchema)