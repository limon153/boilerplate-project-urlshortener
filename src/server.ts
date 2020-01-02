import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import dns from 'dns';
import mongoose from 'mongoose';
import url from 'url';
import dotenv from 'dotenv';

const dnsPromises = dns.promises;

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

const MONGO_DB_LOGIN = process.env.MONGO_DB_LOGIN;
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD;
const MONGO_CLUSTER_ADDRESS = process.env.MONGO_CLUSTER_ADDRESS;

const MONGO_DB_URL = `mongodb+srv://${MONGO_DB_LOGIN}:${MONGO_DB_PASSWORD}@${MONGO_CLUSTER_ADDRESS}.mongodb.net/test?retryWrites=true&w=majority`;

const urlSchema = new mongoose.Schema({
  originalUrl: String,
});

const Urls = mongoose.model('Urls', urlSchema);

app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect(MONGO_DB_URL, { useNewUrlParser: true }, err => {
  if (err) return console.log(err);

  app.listen(PORT, () => console.log('Node.js listening ...'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

const getShortUrl = async (originalUrl: string): Promise<mongoose.Document> => {
  const sameUrls = await Urls.find({ originalUrl });

  if (sameUrls.length !== 0) {
    return sameUrls[0];
  }

  const newUrl = new Urls({ originalUrl });
  await newUrl.save();

  return newUrl;
};

app.post('/api/shorturl/new', async (req, res) => {
  try {
    const originalUrl = new url.URL(req.body?.url);
    const hostname = originalUrl.hostname;
    const originalHref = originalUrl.href;

    await dnsPromises.lookup(hostname);
    const shortUrl = await getShortUrl(originalHref);

    // eslint-disable-next-line @typescript-eslint/camelcase
    res.json({ original_url: originalHref, short_url: shortUrl._id });
  } catch {
    res.json({ error: 'invalid URL' });
  }
});
