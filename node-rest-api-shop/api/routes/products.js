const expres = require("express");
const router = expres.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");
//const upload = multer({ dest: "uploads/" });

//storing images

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  //store/ accept and reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((data) => {
      console.log(data);
      if (data) {
        const response = {
          count: data.length,
          products: data.map((d) => {
            return {
              name: d.name,
              price: d.price,
              productImage: d.productImage,
              _id: d._id,
              request: {
                type: "GET",
                url: "http://localhost:3000/products/" + d._id,
              },
            };
          }),
        };
        res.status(200).json({
          message: "Handling GET request to /products",
          response,
        });
      }
    })
    .catch((error) => {
      console.log(error);

      res.status(500).json({ error: error });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  //   const product = {
  //     name: req.body.name,
  //     price: req.body.price,
  //   };

  //Using Mongoose Object model and schma

  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created product succesfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "POST",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
});

router.get("/:productID", (req, res, next) => {
  const id = req.params.productID;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((data) => {
      console.log("getting data from database", data);
      if (data) {
        res.status(200).json({
          product: data,
          request: {
            type: "GET",
            description: "Get All Products",
            url: "http://localhost:3000/products/",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No Valid Entry found for provided id" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });

  // if (id === "special") {
  //   res.status(200).json({
  //     message: "You discovered special id",
  //     id: id,
  //   });
  // } else {
  //   res.status(200).json({
  //     message: "You passed an ID",
  //   });
  // }
});

router.patch("/:productID", (req, res, next) => {
  const id = req.params.productID;
  const updateOps = {};
  // this code is written to change any one property only it could be name or price ...not all. if name change price remain intact(not changes).
  // in body we pass array of objects[{}]
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Updated Product",
        result,
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
});

router.delete("/:productID", (req, res, next) => {
  const id = req.params.productID;

  Product.deleteOne({ _id: id })
    .exec()
    .then((data) => {
      res.status(200).json({
        message: "Deleted Product",
        data,
        request: {
          type: "POST",
          url: "http://localhost:3000/products/",
          body: { name: "String", price: "Number" },
        },
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});
module.exports = router;
