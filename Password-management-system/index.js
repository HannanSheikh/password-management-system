const express = require('express')
const app = express();
const mongoose = require('mongoose')
const path = require('path');
const port = process.env.PORT||5000;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/pms',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true},(err)=>{
    if(!err){
        console.log('Connection with MongoDB succeded..!')
    }else{
        console.log('error in DB connectivity..! '+err)
    }
})
require('./model/abc');
require('./model/passCat');
require('./model/ass_new_pass')
app.use(express.static(path.join(__dirname,"public")))

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
require('./routes')(app)

app.listen(port,()=>{
    console.log('Server is running on '+port)
})

