/************************
  This is the completed app.js we finished for the 'Working with Dynamic Content & Adding Templating Engines' module
 *************************/
// The following lines basically write your own server. Console.log is what causes it to log down there in the terminal window.

const path = require('path'); // Helps us construct a path that will work on all operating systems.

const express = require('express'); // this imports Express.js so we can use express. 

const bodyParser = require('body-parser'); // this constant stores the 'body-parser' function that we added usng 'npm install --save body-parser' . It's used to extract user entered data from the body.
 
const mongoose = require('mongoose');

const errorController = require('./controllers/error'); // this brings our error.js controller into this file. It bundles all the exports from the error.js file for use in this file.

const User = require('./models/user'); // brings in our User class from the models/user.js

const app = express(); // this constant which you can name whatever you want, stores the express() function. That is how we use express. This app is a valid request handler.

//TO RUN ON HEROKU: the following line overrides our typical port:3000 setting so we can deploy this to Heroku
const PORT = process.env.PORT || 5000; // So we can run on heroku || (OR) localhost:5000

app.set('view engine', 'ejs'); // 'app.set' sets a global config value. In this case it's saying that the dynamic view engine is 'ejs'.
app.set('views', 'views'); // this 'app.set' sets the dynamic views folder. The first 'views' means look for views in the second value, 'views', which is the folder. You can use a folder named something other than 'views'. Also, if you leave the second value out, the default is to a folder called 'views'.


const adminRoutes = require('./routes/admin'); // this is the absolute path to our admin.js file in the routes folder.

const shopRoutes = require('./routes/shop'); // this is the absolute path to our shop.js file in the routes folder.
const { MongoCursorExhaustedError } = require('mongodb');

// 'use' allows us to add a new middleware function (middleware is like a code plugin). You have to use the 'next' value at the end of your use() function to move past it's section on to the next function.
// or you need to send a response 'res' if you don't need to move the 'next' middleware. The '/' is the path for the function. If you want it to go to a different page you would type '/pagename' .
// the order that you put these functions is very important because they're always read top to bottom.

app.use(bodyParser.urlencoded({extended: false})); // uses the 'bodyParser' const to use the 'body-parser' function. The line marks it as deprecated for some reason. This has to be placed before the page routes.

// The following line allows us to serve static files from our 'public' folder. It's called 'static' and it ships with express. It ultimately gives the 'public' folder read only access.
// we basically call 'static' from 'express' then we use 'path.join' to show a path to our 'public' folder. '__dirname' is the root folder of our project and then it finds the 'public' folder in there.
app.use(express.static(path.join(__dirname, 'public')));

// The following block is for use with the database
app.use((req, res, next) => {
 User.findById('61611b29dd911ecf621bf636') // findById is a method Mongoose will use.
   .then(user => {
     req.user = user; // We create a new user with all our user data using native mongoose functions
     next(); // remember, next(); passes to the next middleware without stopping here.
   })
   .catch(err => console.log(err));
});

// again, order matters. So list 'shopRoutes' second because it is calling our '/' page and that '/' exists in all addresses.
app.use('/admin', adminRoutes); // uses the 'adminRoutes' constant as an object, not a function, to use our admin.js file in the routes folder. I added '/admin' to this statement so that it will attach /admin to the path of the pages in admin.js, this is how we filter routes.

app.use(shopRoutes); // uses the 'shopRoutes' constant as an object to use our shop.js file in the routes folder.

// The following line handles everything that our code and routes aren't programmed to do. It's kind of like a catch-all line. We use 'app.use' to handle all http methods, not just GET or POST.
// We can use '/' in this line but that's the default anyway so we don't need to use it.
// NOTE: We can chain another method before 'send', in this case the 'status' method to set the 404 status code. You can use 'status' before any 'send' and it will show up in the Console or Network view in Dev Tools.
app.use(errorController.get404);

mongoose.connect(
  'mongodb+srv://matt:L4sQRk6keymsprU6@cluster0.uxlfb.mongodb.net/shop?retryWrites=true&w=majority'
  )
  .then(result => {
    // first we check for existing user. 'findOne()' is a mongoose function and if we don't give it arguments, simply gives us back the first user it finds.
    // then we say if there is no user (!user) go ahead and create the user.
    User.findOne().then(user => {
      if (!user) {
            // the next lines create a user
    const user = new User({
      name: 'Hortence',
      email: 'hort@aol.com',
      cart: {
        items: []
      }
    });
    user.save(); // saves our user when we start the server
      }
    });
// NEXT LINE CHANGED TO CONNECT USING HEROKU   old line was 'app.listen(3000);'
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch(err => {
    console.log("Err from mongoose.connect in /app.js file", err);
  });


// we execute the mongoConnect function here which connects us to our database. SUPERCEDED WITH MONGOOSE
// mongoConnect(() => {
//   app.listen(3000); // this line brings up our node server
// });

// The following commented out app.listen(3000); was apparently superceded during our database modules.
// app.listen(3000); // this uses Express (through the app const) to start the server and listen to port 3000. It basically creates our server using Express.