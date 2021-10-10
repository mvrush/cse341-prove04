/********* This is the Admin Controller  **************/

// we import the class from the models folder, the product.js file. We use a capital starting character for classes, hence 'Product'.
const Product = require('../models/product');


// this next functions exports 'getAddProduct' to our routes/admin.js file
exports.getAddProduct = (req, res, next) => {
    // res.render tells router.get to render our 'edit-product.ejs' page. Then it gives it a JavaScript object filled with keynames that have data assigned to them.
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product', // this is the path the user types in the browser address
        editing: false // this sets the editing parameter to 'false' which means you will not be in 'editMode' as defined in getEditProduct so the 'Add Product' button is then displayed.
    });
};

// this next functions exports 'postAddProduct' to our routes/admin.js file
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // next lines create a new 'product' constant from the Product class with the product info in it. This is based on our Mongoose schema values.
    // the 'title:' is our schema, and 'title' is our value from the 'const title' above.
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user // in mongoose it will look at the req.user and pull the _id from it automatically
    });
    product.save().then(result => { // the .save() is called from Mongoose we don't define it. Mongoose also gives us the .then() method. It's not technically a promise anymore.
      // console.log(result);
      console.log('From controllers/admin.js postAddProduct. It say...CREATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log("postAddProduct err from controllers/admin.js", err);
    });
};


// this next functions exports 'getEditProduct' to our routes/admin.js file
exports.getEditProduct = (req, res, next) => {
    // res.render tells router.get to render our 'edit-product.ejs' page. Then it gives it a JavaScript object filled with keynames that have data assigned to them.
    const editMode = req.query.edit; // this says to look for a query in the url and look at the key/value pair for 'edit'. The key is 'edit' and if the value is 'true' then enable editing.
    if (!editMode) { // this says if it's not (!) editMode then send a response to redirect back to '/'.
        return res.redirect('/');
    }
    const prodId = req.params.productId; // this pulls the product id from the URL. That product id was added to the url in our routes/admin.js file on line 24.
    Product.findById(prodId) // Product is a mongoose model and findById is a mongoose method, all built-in. // (old note before Mongoose ->) here we reference our 'Product' class that we required at the top of this page from 'models/product' and we get our prodId from there.
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log("getEditProduct err from controllers/admin.js", err));
};

exports.postEditProduct = (req, res, next) => {
    // the following const's pulls the hidden value for name="productId" out of our hidden input on the edit-product.ejs. name="whateverTheNameIs" on the rest of the consts.
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

    // We use mongoose Product and then the findById(prodId) tp fetch our 'product' which it brings in as a full mongoose object that gives us access to our mongoose functions. 
    // Using our mongoose .save() function it will save our changes to the existing product behind the scenes.
    Product.findById(prodId).then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save()  
    })
    .then(result => {
      console.log('From controllers/admin.js postEditProduct. It say...UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};


exports.getProducts = (req, res, next) => {
  Product.find() // find() is a mongoose function that gives us all the documents.
  //  .select('title price -_id') // select() allows us to choose which data to display. So here we select the 'title', 'price' and with the minus '-' sign we tell it do not include the id. Commented out because we don't need it.
  //  .populate('userID') // populate() tells mongoose to populate a certain field with all the detail information and not just the ID. So it will looks at 'userId' and gets all detail associated with that userId. Commented out because we don't need it.
    .then(products => {
      res.render('admin/products', {
        prods: products, // keyname is 'prods' for the value of our 'products' array which is defined above with global scope. All the rest follow the same syntax.
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};


// the following exports deletes a product by calling the built-in 'findByIdAndRemove()' mongoose function.
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('From controllers/admin.js postDeleteProduct. It say...DESTROYED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log("err generated from postDeleteProduct found in controllers/admin.js", err));
};
