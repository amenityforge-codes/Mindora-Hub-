const mongoose = require('mongoose');
const Module = require('../models/Module');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/English-1?retryWrites=true&w=majority&appName=Cluster0');

async function getModuleId() {
  try {
    const module = await Module.findOne({ title: 'Alphabet & Phonics' });
    if (module) {
      console.log('Alphabet & Phonics Module ID:', module._id);
    } else {
      console.log('Module not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getModuleId();















