const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGOOSE_URL;
console.log('Using URI:', uri);
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(()=>{ console.log('connected'); process.exit(0); })
  .catch(err=>{ console.error('connect failed', err); process.exit(1); });
