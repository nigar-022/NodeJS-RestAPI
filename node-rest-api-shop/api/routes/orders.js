const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
  // res.status(200).json({
  //   message: "Get orders details",
  // });

  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", (req, res, next) => {
  // const order = {
  //   productId: req.body.productId,
  //   quantity: req.body.quantity,
  // };
  // res.status(201).json({
  //   message: "Post orders created",
  //   order: order,
  // });

  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: " Product Not found",
        });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order Stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product Not Found",
        error: err,
      });
    });
});

router.get("/:orderID", (req, res, next) => {
  Order.findById(req.params.orderID)
    .populate("product")
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: " order Not found",
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/",
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product Not Found",
        error: err,
      });
    });

  // res.status(200).json({
  //   message: "get orders id details",
  //   id: req.params.orderID,
  // });
});

router.delete("/:orderID", (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderID })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order Deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders/",
          body: { productId: "ID", quantity: "Number" },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product Not Found",
        error: err,
      });
    });
  // res.status(200).json({
  //   message: "deleted orders",
  //   id: req.params.orderID,
  // });
});

module.exports = router;
