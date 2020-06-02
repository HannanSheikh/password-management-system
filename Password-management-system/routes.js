const mongoose = require('mongoose')
const crypto = require('crypto');
const users = mongoose.model('abc')
const passCat = mongoose.model('PasswordCategory')
const addNewPass = mongoose.model('AddNewPassword')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const {check,validationResult} = require('express-validator')

module.exports=(app)=>{

    app.use(cookieParser('secret'));
app.use(session({
    secret:'secret',
    maxAge:3600000,
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())

    app.use(flash())
app.use((req,res,next)=>{
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next()
})
const checkAuthenticated = (req, res, next)=>{
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/');
    }
}
     //Authenticate strategy
     var LocalStrategy = require('passport-local').Strategy;
     passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
         users.findOne({ email: email }, function (err, data) {
           if (err) { return done(err); }
           if (!data) {
             return done(null, false,{message:'user doesnot exist'});
           }
           bcrypt.compare(password,data.password,(err,match)=>{
               if(err){
                   return done(null,false)
               }
               if(!match){
                 return done(null,false ,{message:'password doesnot match'})
             }
             if(match){
                 return done(null,data)
             }
           })
         });
       }
     ));
     passport.serializeUser((user,cb)=>{
         cb(null,user.id)
     })
     passport.deserializeUser((id,cb)=>{
         users.findById(id,(err,user)=>{
             cb(err,user)
         })
     })
     //Authenticate strategy end
     
    app.get('/',(req,res)=>{
        if(req.user){
            res.redirect('/dashboard')
        }else{
        res.render('index',{title:'Password Management System'})
        }
    })
    app.post('/',(req,res,next)=>{
        passport.authenticate('local',{
            failureRedirect:'/',
            successRedirect:'/dashboard',
            failureFlash: true,
    
        })(req,res,next);
    })
    app.get('/logout',(req,res)=>{
        req.logout();
        res.redirect('/')
    })
    app.get('/signup',(req,res)=>{
        if(req.user){
            res.redirect('/dashboard')
        }else{
        res.render('signup',{title:'Password Management System',msg:''})
        }
    })
    const CheckEmail = (req,res,next)=>{
        var email = req.body.email
        var IsEmailExixt= users.findOne({email:email})
        IsEmailExixt.exec((err,data)=>{
            if(err) throw err
            if(data){
                return res.render('signup',{title:'Password Management System',msg:'email already exist'})
            }
            next();
        })
    }
    const CheckUserName = (req,res,next)=>{
        var username = req.body.uname
        var IsNameExixt= users.findOne({username:username})
        IsNameExixt.exec((err,data)=>{
            if(err) throw err
            if(data){
                return res.render('signup',{title:'Password Management System',msg:'username already exist'})
            }
            next();
        })
    }
    app.post('/signup',CheckUserName,CheckEmail,(req,res)=>{
        var {uname,email,password,confpassword}=req.body;
        if(password != confpassword){
            res.render('signup',{title:'Password Management System',msg:'password doesnot match'})
        }
        else{
            password = bcrypt.hashSync(password,10)
        var user = new users({
            username:uname,
            email:email,
            password:password
        }).save((err,doc)=>{
            if(err) throw err
            res.render('signup',{title:'Password Management System',msg:'Registered Successfullly'})
        })
    }
    })
    app.get('/passwordCategory',checkAuthenticated,(req,res)=>{
        var findPass = passCat.find({})
        findPass.exec((err,data)=>{
            if(err) throw err
            res.render('password_category',{title:'Password Category','user':req.user,records:data})
        })  
    })
    app.get('/passwordCategory/delete/:id',checkAuthenticated,(req,res)=>{
        var findPassId = passCat.findByIdAndDelete(req.params.id)
        findPassId.exec((err,data)=>{
            if(err) throw err
            res.redirect('/passwordCategory')
        })  
    })
    app.get('/passwordCategory/edit/:id',checkAuthenticated,(req,res)=>{
        var findPassId = passCat.findById(req.params.id)
        findPassId.exec((err,data)=>{
            if(err) throw err
            res.render('edit_pass_cat',{title:'Password Category','user':req.user,errors:'',success:'',records:data,id:req.params.id})
        })  
    })
    app.post('/passwordCategory/edit/',checkAuthenticated,(req,res)=>{
        var findPassIdUpdate = passCat.findByIdAndUpdate(req.body.id,{password_Category:req.body.passwordCategory})
        findPassIdUpdate.exec((err,data)=>{
            if(err) throw err
            res.redirect('/passwordCategory')
        })  
    })
    app.get('/addNewCategory',(req,res)=>{
        res.render('addNewCategory',{title:'Add New Category','user':req.user,errors:'',success:''})
    })
    app.post('/addNewCategory',checkAuthenticated,[check('passwordCategory','Enter Password').isLength({ min: 1 })],(req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('addNewCategory',{title:'Add New Category','user':req.user,errors:errors.mapped(),success:''})
        }else{
            var passwordCat = new passCat({
                password_Category:req.body.passwordCategory
            }).save((err,doc)=>{
                if(err) throw err
                res.render('addNewCategory',{title:'Add New Category','user':req.user,errors:'',success:'Successfully Inserted'})
            })
        
        }
    })
    app.get('/addNewPassword',checkAuthenticated,(req,res)=>{
        var findPass = passCat.find({})
        findPass.exec((err,data)=>{
            if(err) throw err
            res.render('add-new-password',{title:'Add New Password','user':req.user,records:data,success:''})
        })
        
    })
    //isko dobara dekhna h..
    app.post('/addNewPassword',checkAuthenticated,(req,res)=>{
        
        var AddPass =  addNewPass({
            password_Category:req.body.pass_cat,
            project_Name:req.body.project_name,
            password_Details:req.body.pass_details
        }).save((err,data)=>{
            var findPass = passCat.find({})
            findPass.exec((err,data)=>{
                if(err) throw err
                res.render('add-new-password',{title:'Add New Password','user':req.user,records:data,success:'password Details Insert Successfuly'})
                var findPass = passCat.find({})
    
    // findPass.exec((err,data)=>{
        // if(err) throw err
        // res.render('add-new-password',{title:'Add New Password','user':req.user,records:data,success:'password Details Insert Successfuly'})
})
})  
    })
    app.get('/viewAllPassword/',checkAuthenticated,(req,res)=>{
        var perPage = 1;
      var page = 1;
        var getAllPass = addNewPass.find({})
        getAllPass.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err,data){
            if(err) throw err
            addNewPass.countDocuments({}).exec((err,count)=>{
            if(err) throw err
            res.render('view-all-password',{title:'View All Password','user':req.user,current:page,pages: Math.ceil(count / perPage),records:data,success:''})
        })   
    })
    })
    app.get('/viewAllPassword/:page',checkAuthenticated,(req,res)=>{
        var perPage = 1;
      var page = req.params.page ||1;
        var getAllPass = addNewPass.find({})
        getAllPass.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err,data){
            if(err) throw err
            addNewPass.countDocuments({}).exec((err,count)=>{
            if(err) throw err
            res.render('view-all-password',{title:'View All Password','user':req.user,current:page,pages: Math.ceil(count / perPage),records:data,success:''})
        })   
    })
    })
    app.get('/viewAllPassword/edit/:id',checkAuthenticated,(req,res)=>{
        var getAllPass = addNewPass.findById(req.params.id)
        getAllPass.exec((err,data)=>{
            if(err) throw err
            var findPass = passCat.find({})
        findPass.exec((err,data1)=>{
            res.render('editpassdetails',{title:'View All Password','user':req.user,records:data1,record:data,success:''})
        })
        })   
        
    })
    app.post('/viewAllPassword/edit/:id',checkAuthenticated,(req,res)=>{
        addNewPass.findByIdAndUpdate(req.params.id,{password_Category:req.body.pass_cat,project_Name:req.body.project_name,password_Details:req.body.pass_details}).exec((err)=>{
        if(err) throw err
            var getAllPass = addNewPass.findById(req.params.id)
        getAllPass.exec((err,data)=>{
            if(err) throw err
            var findPass = passCat.find({})
        findPass.exec((err,data1)=>{
            res.render('editpassdetails',{title:'View All Password','user':req.user,records:data1,record:data,success:'password update successfuly'})
        })
        })
        })   
        
    })
    app.get('/viewAllPassword/delete/:id',checkAuthenticated,(req,res)=>{
        var delPas = addNewPass.findByIdAndDelete(req.params.id)
        delPas.exec((err,data)=>{
            if(err) throw err
            res.redirect('/viewAllPassword')
        })   
        
    })
    app.get('/dashboard',checkAuthenticated,(req,res)=>{
        addNewPass.countDocuments({}).exec((err,count)=>{
            passCat.countDocuments({}).exec((err,countasscat)=>{
                res.render('dashboard',{title:'View All Password','user':req.user,totalPassword:count, totalPassCat:countasscat })    
          //res.render('dashboard', { title: 'Password Management System', loginUser:loginUser,msg:'',totalPassword:count, totalPassCat:countasscat });
          });
        });
    })
}