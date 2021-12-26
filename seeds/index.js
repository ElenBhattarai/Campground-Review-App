const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground')


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
}

const sample = (array) => {
    return array[Math.floor(Math.random()*array.length)];
}

const seedDB = async() => {
    await Campground.deleteMany({});
  
    for(let i = 0; i < 300; i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground ({
            author: '6188ba381c5cbb320f00af8a',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dzlvln0ps/image/upload/v1638035660/YelpCamp/ddul7ydyfglqpx0rqait.jpg',
                  filename: 'YelpCamp/ddul7ydyfglqpx0rqait'
                }
              ],
            price: price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude 
              ]
            },
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, reiciendis voluptatibus! Eligendi rerum itaque nihil earum animi, dolor voluptatibus ex Nemo reiciendis non porro deserunt quisquam tempore eum sapiente et"
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})