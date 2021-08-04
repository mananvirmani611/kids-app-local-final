var express = require('express');
var nodemailer = require("nodemailer");
var app = express();
var router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var fs = require('fs');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//package related to google
// const findOrCreate = require("mongoose-findorcreate");

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/public');
app.use(express.json())

app.use(session({
  secret: "asdkfajklaksdf",
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb+srv://admin-manan:hackathon611@cluster0.4gabj.mongodb.net/kidsDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


const userSchema2 = new mongoose.Schema({
  phone: Number,
  firstName: String,
  email: String,
  password: String,
  lastName: String,
  isVerified: Boolean,
  heirarchies: {
    type: Array,
    default: []
  },
})


//adding passportLocalMongoose and findOrCreate plugin
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);+
//creating model for userSchema main
const User = new mongoose.model("User", userSchema);
//creating model for userSchema2(which stores all data)
const UserModel2 = new mongoose.model("UserDetail", userSchema2);


var newuser = new User({
  email: "manan",
  password: "mananvirmani"
})

var newuserComplete = new UserModel2({
  phone: "+915656",
  firstName: "Parth",
  email: "manan",
  password: "asdf",
  lastName: "Virmani"
})
// newuserComplete.save();


//making Strategy using passport
passport.use(User.createStrategy());


// serializing and deserializing user, for local as well as google Strategies
passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());




app.post("/new-heirarchy", function (req, res) {
  let heData = req.body;
  console.log(heData)
  if (req.isAuthenticated()) {
    UserModel2.find({ email: req.user.username }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {

        if (docs[0].isVerified == true) {
          let prevData = [];
          UserModel2.findOne({ email: req.user.username }, (err, data) => {
            if (err) {
              res.send(err);
            } else {
              prevData = data.heirarchies;
              prevData.push(heData);
              // console.log(prevData);
              UserModel2.findOneAndUpdate({ email: req.user.username }, { $set: { 'heirarchies': prevData } }, (err, update) => {
                if (err) {
                  res.send(err);
                } else {
                  console.log(update);
                }
              })
            }
          })

          res.send('successful save')
          // res.redirect(303,'/');
        }
        else {
          console.log("user is not verified");
          res.sendFile(__dirname + "/please-verify.html");
        }
      }
    });
    // console.log(req.user);
  }

  else {
    res.redirect("/register");
  }

})


app.put("/edit-heirarchy/:id", function (req, res) {
  let urlId = req.params.id;
  let heData = req.body;
  if (req.isAuthenticated()) {
    UserModel2.find({ email: req.user.username }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {

        if (docs[0].isVerified == true) {
          let prevData = [];
          UserModel2.findOne({ email: req.user.username }, (err, data) => {
            if (err) {
              res.send(err);
            } else {
              prevData = data.heirarchies;
              prevData[urlId] = heData;
              // console.log(prevData);
              UserModel2.findOneAndUpdate({ email: req.user.username }, { $set: { 'heirarchies': prevData } }, (err, update) => {
                if (err) {
                  res.send(err);
                } else {
                  console.log(update);
                }
              })
            }
          })

          res.send('successful save')
        }
        else {
          console.log("user is not verified");
          res.sendFile(__dirname + "/please-verify.html");
        }
      }
    });
    // console.log(req.user);
  }

  else {
    res.redirect("/register");
  }

})





app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/register.html");
})
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
})

app.post("/register", function (req, res) {
  var email = req.body.username;
  var password = req.body.password;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;

  const newUser = new UserModel2({
    firstName: firstName,
    lastName: lastName,
    isVerified: false,
    email: email,
    password: password
  })
  newUser.save();
  console.log("Saved Successfully");



  User.register({ username: email }, password, function (err, user) {
    if (err) {
      console.log(err);
    }
    else {
      passport.authenticate("local")(req, res, function () {
        //authenticattion success
        console.log("success");
        //redirecting to the homepage
        res.sendFile(__dirname + "/please-verify.html");

      })
    }
  })
})


app.post("/login", function (req, res) {
  //making new user which we can pass in passport verification
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  //checking if user if correct or not
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      //if authentication fails, then coming back to login page
      res.redirect("/login");
    }
    else {
      //checking if credentials are correct or not
      passport.authenticate("local")(req, res, function () {
        //if credentials are correct, redirect to homepage
        // res.send(__dirname + "/please-verify.html");
        UserModel2.find({ email: req.user.username }, function (err, docs) {
          if (err) {
            console.log(err);
          }
          else {

            if (docs[0].isVerified == true) {
              console.log("hurray");
              res.redirect("/");
            }
            else {
              console.log("user is not verified");
              res.sendFile(__dirname + "/please-verify.html");
            }
          }
        });
      });
    }
  })

});



app.get("/new-heirarchy", function (req, res) {
  if (req.isAuthenticated()) {
    UserModel2.find({ email: req.user.username }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {

        if (docs[0].isVerified == true) {
          console.log("hurray");

          // var randomFileName = Math.floor((Math.random() * 10000) + 1);
          // console.log(randomFileName);
          // var fileName = randomFileName + '.html';
          // var stream = fs.createWriteStream(fileName);

          // stream.once('open', function (fd) {
          //   var html = buildHtml();

          //   stream.end(html);
          // });
          // res.send("this is the create heirarchy page, you can create new Heirarchies here. :) ");
          // res.sendFile(__dirname + "/1.html");
          res.render('./OrgChartEditor.ejs',)

        }
        else {
          console.log("user is not verified");
          res.sendFile(__dirname + "/please-verify.html");
        }
      }
    });
    // console.log(req.user);
  }

  else {
    res.redirect("/register");
  }


});


app.get("/show-heirarchies", function (req, res) {
  if (req.isAuthenticated()) {
    UserModel2.find({ email: req.user.username }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {

        if (docs[0].isVerified == true) {
          console.log("hurray");
          // console.log(docs[0].heirarchies);
          res.render('show-heirarchies', {arrayOfHeirarchies : docs[0].heirarchies});
        }
        else {
          res.sendFile(__dirname + "/please-verify.html");
        }
      }
    });
    console.log(req.user);
  }

  else {
    res.redirect('/register');
  }
})

app.get("/edit-heirarchy/:id", function (req, res) {
  let urlId = req.params.id;
  if (req.isAuthenticated()) {
    UserModel2.find({ email: req.user.username }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {

        if (docs[0].isVerified == true) {

        //  console.log(typeof [docs[0].heirarchies[urlId]]);
          res.render('edit-heirarchy.ejs',{data: JSON.stringify(docs[0].heirarchies[urlId]),urlId});
        }
        else {
          res.sendFile(__dirname + "/please-verify.html");
        }
      }
    });
  }

  else {
    res.redirect('/register');
  }
})



app.get('/', function (req, res) {
  console.log(req.isAuthenticated());
  res.sendFile(__dirname + "/home.html");
  // if(req.isAuthenticated() ){
  //     UserModel2.find({email : req.user.username}, function(err, docs){
  //       if(err){
  //         console.log(err);
  //       }
  //       else{
  //
  //            // if(docs[0].isVerified == true){
  //              console.log("hurray");
  //
  //            // }
  //            // else{
  //            //   console.log("user is not verified");
  //            // }
  //            }
  //    });
  //   console.log(req.user);
  // }
  //here it is
});




/*
  Here we are configuring our SMTP Server details.
  STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "hackathonproject77@gmail.com",
    pass: "hackathon611"
  }
});
var rand, mailOptions, host, link;
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

app.get('/', function (req, res) {
  res.send("check your email to verify");
});
app.get('/pleaseVerify', function (req, res) {
  res.sendFile(__dirname + "/please-verify.html");
});
app.get('/send', function (req, res) {
  rand = Math.floor((Math.random() * 100) + 54);
  host = req.get('host');
  link = "http://" + req.get('host') + "/verify?id=" + rand;
  mailOptions = {
    to: req.query.to,
    subject: "Please confirm your Email account",
    html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
  }
  console.log(mailOptions);
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      res.end("error");
    } else {
      console.log("Message sent: " + response.message);
      res.end("sent");
    }
  });
});

app.get('/verify', function (req, res) {
  console.log("request in the verify page is" + req.isAuthenticated());
  console.log(req.protocol + ":/" + req.get('host'));
  if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
    console.log("Domain is matched. Information is from Authentic email");
    if (req.query.id == rand) {

      var email = req.user.username;
      UserModel2.findOneAndUpdate({ email: email }, { isVerified: true }, { upsert: true }, function (err, doc) {
        if (err) return res.send(500, { error: err });
        console.log("email is verified with isVerified set true");
      });

      res.sendFile(__dirname + "/verified.html");

    }
    else {
      console.log("email is not verified");
      res.end("<h1>Bad Request</h1>");
    }
  }
  else {
    res.end("<h1>Request is from unknown source");
  }
});

/*--------------------Routing Over----------------------------*/

const port = process.env.PORT;
app.listen(port || 3000, function(){
  console.log("server started ");
});







function buildHtml(req) {
  var header = '';
  var body = '';

  // concatenate header string
  // concatenate body string

  return '<!DOCTYPE html>'
    + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};

app.get("/logged-out", function(req, res ){
  res.sendFile(__dirname + '/logged-out.html');
})
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/logged-out');
});
