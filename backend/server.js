import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/musicDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const albumSchema = new mongoose.Schema({
  title: String,
  artist: String,
  description: String,
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  coverImage: String,
});

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  url: String,
});

const Album = mongoose.model('Album', albumSchema);
const Song = mongoose.model('Song', songSchema);

// Serve static files
app.use('/covers', express.static(path.join(__dirname, 'albums')));
app.use('/songs', express.static(path.join(__dirname, 'songs')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, req.body.title + path.extname(file.originalname)); // Filename format
  },
});

const upload = multer({ storage });

// Endpoint to get all albums with cover images and songs
app.get('/', async (req, res) => {
  try {
    const albums = await Album.find().populate('songs');
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to upload a song
app.post('/upload', upload.single('file'), async (req, res) => {
  const { title, artist, album } = req.body;
  const file = req.file;

  if (!title || !artist || !album || !file) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create a new song document
    const song = new Song({
      title,
      artist,
      album,
      url: `/uploads/${file.filename}`, // File URL
    });
    await song.save();

    // Optionally, you might want to update the corresponding album with this song
    const albumDoc = await Album.findOne({ title: album });
    if (albumDoc) {
      albumDoc.songs.push(song._id);
      await albumDoc.save();
    }

    res.status(201).json({ message: 'Song uploaded successfully', song });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
