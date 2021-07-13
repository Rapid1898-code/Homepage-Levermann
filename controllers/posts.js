const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const connectDBSQL = require("../config/databaseSQL");
const fetch = require('node-fetch');
const fs = require("fs")
require('dotenv').config({path: './config/.env'})
let savedVars = require("./auth")

module.exports = {
  getProfile: async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id });
        const conn = await connectDBSQL();
        const result = await conn.execute
       
        let erg = await fetch (
          "https://www.rapidtech1898.com/docs/scores.txt", 
          { headers: { origin: 'https://www.rapidtech1898.com' } }
        )

        // const fileStream = await fs.createWriteStream("./public");
        // await erg.body.pipe(fileStream);

        // await fs.copyFile('https://www.rapidtech1898.com/docs/scores.txt', 'destination.txt')

        let json = await erg.json()
        console.log(json)        

        res.render('scores.ejs', { rows: result[0], user: req.user })       
    } catch (err) {
        console.log(err);
    }
  },

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

  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },

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
