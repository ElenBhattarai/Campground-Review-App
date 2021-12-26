const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const Review = require('./review');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const Schema = mongoose.Schema;


const ImageSchema = new Schema({
  url:String,
  filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload','/upload/w_200')
})

const opts = {toJSON: {virtuals: true}};

const CampGroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry : {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    price: Number,
    description: String, 
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviews: [
      {
        type : Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
},opts);


CampGroundSchema.virtual('properties.popUpMarkup').get(function(){
  return `<strong><a href = "/campgrounds/${this._id}">${this.title}</a></strong><p>${this.description.substring(0,20)}...</p>`
})

CampGroundSchema.post('findOneAndDelete', async (doc) => {
  if(doc)
  {
    await Review.remove({
      _id: {
        $in: doc.reviews
      }
    })
  }
})  

module.exports = mongoose.model('Campground', CampGroundSchema);
