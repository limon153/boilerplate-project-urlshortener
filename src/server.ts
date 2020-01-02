import express from 'express';
import path from 'path';
import cors from 'cors';
// import mongoose from 'mongoose';
// import mongo from 'mongodb';

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

// your first API endpoint...
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log('Node.js listening ...');
});
