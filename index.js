require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const url = require('url');
const mongoose = require('mongoose')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// The Challenge
mongoose.connect("mongodb+srv://fadidajunaedy:vqdVa0F6Z6dZH7wt@cluster0.36ptmgc.mongodb.net/?retryWrites=true&w=majority");

const shortUrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    unique: true
  },
})

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.post('/api/shorturl', async function (req, res) {
  let originalUrl = req.body.url

  originalUrl = originalUrl.replace(/\/$/, '')

  const parsedUrl = url.parse(originalUrl)
  
  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: "Invalid URL" })
  }

  const checkUrlExisted = await ShortUrl.findOne({ original_url: originalUrl })
  if (checkUrlExisted) {
    return res.json({ original_url: checkUrlExisted.original_url, short_url: checkUrlExisted.short_url })
  }

  try {
    const data = await ShortUrl.find({})
    const newShortUrl = new ShortUrl({ original_url: originalUrl })
    newShortUrl.short_url = data.length + 1
    await newShortUrl.save()
    res.json({ original_url: originalUrl, short_url: newShortUrl.short_url })
  } catch (err) {
    res.json({ error: "Error creating short URL" })
  }
})

app.get('/api/shorturl/:short_url', async function (req, res) {
  const formatedShortUrl = parseInt(req.params.short_url)
  if (isNaN(formatedShortUrl)) {
    return res.json({ error: "Wrong format" })
  }

  const checkShortUrl = await ShortUrl.findOne({ short_url: formatedShortUrl })
  if (!checkShortUrl) {
    return res.json({ error: "No short URL found for the given input" })
  }

  res.redirect(checkShortUrl.original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
