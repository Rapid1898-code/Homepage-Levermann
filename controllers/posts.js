const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const connectDBSQL = require("../config/databaseSQL");
const fetch = require('node-fetch');
const fs = require("fs")
require('dotenv').config({path: './config/.env'})
// let savedVars = require("./auth")

module.exports = {
  // Initialize the main site - all levermann scores for all stocks
  getProfile: async (req, res) => {
    try {       
        const conn = await connectDBSQL(); 
        const result = await conn.query(
          `SELECT * FROM ${process.env.SCORE_TABLE}`
        );   
        // console.log(result[0][0])
        let ergObj = {}
        ergObj["data"] = []
        for (const [idx, elem] of result[0].entries()) {
          ergObj["data"].push(
            {
              "ticker": elem["ticker"],
              "name": elem["stockName"],
              "calcDate": elem["calcDate"].toISOString().split('T')[0],
              "index": elem["indexName"],
              "currency": elem["currency"],
              "sector": elem["sector"],
              "industry": elem["industry"],
              "cap": elem["cap"],
              "finStock": elem["financeStock"],
              "score": elem["scoreFull"],
              "recommend": elem["recommendFull"]
            }
          )
        }
        // console.log(ergObj)

        await fs.writeFile("./public/scores.txt", JSON.stringify(ergObj), function(err) {
          if (err) {
              console.log(err);
          }
        });

        res.render('scores.ejs', {user: req.user })       
    } catch (err) {
        console.log(err);
    }
  },

  // Read / fetch data from rapidtech-webpage - functionality currently not used
  getScores: async (req, res) => {
    try {
      let erg = await fetch (
        "https://www.rapidtech1898.com/docs/scores.txt", 
        { headers: { origin: 'https://www.rapidtech1898.com' } }
      )
      let json = await erg.json()
      console.log(json)

    } catch (err) {
      console.log(err);
    }
  },

  // NOT used now
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },

  // read levermann score detail data for one stock
  detailScore: async (req, res) => {
    try {
      // console.log(req.params.id)
      const conn = await connectDBSQL(); 
      const result = await conn.query(
        `SELECT * FROM ${process.env.SCORE_TABLE} WHERE ticker = ?
          AND calcDate = (SELECT max(calcDate)
          from ${process.env.SCORE_TABLE} WHERE ticker = ?)`,
        [req.params.id,req.params.id]
      );   
      console.log(`Read detail score data for ${req.params.id}...`)
      console.log(result[0][0])
      res.render("detailScores.ejs", { details: result[0][0], user: req.user });
    } catch (err) {
      console.log(err);
    }
  },

  // NOT used now
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },

  // request ticker for update - ticker is stored in db-workingqueue
  tickerRequest: async (req, res) => {
    try {
      const errors = {};
      const data = {};

      if (!req.body.tickerRequestField) {
        errors.name = 'Name is required.';
      }
      if (Object.keys(errors).length) {
        data.success = false;
        data.errors = errors;
      } else {
        // write requested ticker in db for batch-work      
        const conn = await connectDBSQL();                      
        const result = await conn.query(
          `SELECT ticker FROM workingqueue WHERE ticker = ?`,
          [req.body.tickerRequestField]
        );     
        if (result[0].length === 0) {
          const actDate = new Date().toISOString().split('T')[0]      
          const tmpTicker = req.body.tickerRequestField    
          // console.log(`DEBUG User: ${req.user.userName}`)
          // console.log(`DEBUG User: ${req.user.email}`)
          // console.log(`MailCheckbox: ${req.body.tickerReqMail}`)

          const data = {ticker: tmpTicker.toUpperCase(),
                        requestDate: actDate,
                        email: req.user.email,
                        userName: req.user.userName,
                        mailSend: req.body.tickerReqMail === "true" ? 1 : 0}
          conn.query(
            'INSERT INTO workingqueue SET ?',
            data
          );
          console.log(`Inserted ticker ${tmpTicker} with actual date in working queue...`)
          
        } else {
          console.log(`Stock ${req.body.tickerRequestField} allready in working queue...`)
        }  
        data.success = true;
        data.message = 'Success!';
      }      
      res.status(200).json(data);
    } catch (err) {
      console.log("An Error...")
      console.log(err);
    }
  },

  // NOT used now
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },

  // NOT used now
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
