const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const connectDBSQL = require("../config/databaseSQL");
require('dotenv').config({path: './config/.env'})

module.exports = {
  getProfile: async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id });
        const conn = await connectDBSQL();
        const result = await conn.execute
        (`SELECT * FROM ${process.env.SCORE_TABLE}`)
        console.log("Reading data from ")
        result[0].forEach((row,idx) => {                
            if (row.lastEarnings instanceof Date && !isNaN(row.lastEarnings)) {                    
                result[0][idx].lastEarnings = row.lastEarnings.toISOString().split('T')[0]
            } else {
                result[0][idx].lastEarnings = "N/A"
            }
            row.calcDate = row.calcDate.toISOString().split('T')[0]
            console.log(`${row.ticker} ${row.calcDate} ${row.indexName} ${row.scoreFull}`);
            // console.log(`${typeof row.ticker} ${typeof row.calcDate}`)
            // console.log(`${row.calcDate.toISOString().split('T')[0]}`)
        });
        res.render('scores.ejs', { rows: result[0], user: req.user })       
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
      // write requested ticker in db for batch-work      
      const conn = await connectDBSQL();                      

      const result = await conn.query(
        `SELECT ticker FROM workingqueue WHERE ticker = ?`,
        [req.body.tickerReq]
      );     
      
      if (result[0].length === 0) {
        const actDate = new Date().toISOString().split('T')[0]      
        const tmpTicker = req.body.tickerReq    
        const data = {ticker: tmpTicker, requestDate: actDate}
        conn.query(
          'INSERT INTO workingqueue SET ?',
          data
        );
        console.log(`Inserted ticker ${tmpTicker} with actual date in working queue...`)
      } else {
        console.log(`${req.body.tickerReq} allready in working queue...`)
      }    
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
