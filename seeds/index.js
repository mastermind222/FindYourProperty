const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true

})

const db= mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("DataBase Connecteddddd");
});

const sample= array =>array[Math.floor(Math.random()*array.length)];


const seedDB= async() =>{
    await Campground.deleteMany({});
    /*for(let i=0;i<200;i++){
        const random1000= Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*15)+15;
        const camp = new Campground({
            author: '60d58104a81dd03be8cc7f47',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Edit ipsum dolor sit amet, consectetur adipisicing elit. Nihil facere quidem nulla totam ratione, dolorum omnis sed ab corrupti velit, quaerat deserunt neque doloribus at rem possimus officia aperiam debitis?',
            price,
            geometry : {
                type:"Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images:  [
                {
                  url: 'https://res.cloudinary.com/mastermind222/image/upload/v1624776402/YelpCamp/lmodzcw9taqailtvz5sc.jpg',
                  filename: 'YelpCamp/lmodzcw9taqailtvz5sc'
                },
                {
                  url: 'https://res.cloudinary.com/mastermind222/image/upload/v1624776403/YelpCamp/je2n0jgmhdnjfs24cie5.jpg',
                  filename: 'YelpCamp/je2n0jgmhdnjfs24cie5'
                },
                {
                  url: 'https://res.cloudinary.com/mastermind222/image/upload/v1624776403/YelpCamp/sds3cysisjfpcb9ysgbs.jpg',
                  filename: 'YelpCamp/sds3cysisjfpcb9ysgbs'
                }
              ]
        })
        await camp.save();
    }*/

}

seedDB().then(() =>{
    console.log('Seeding Done')
    mongoose.connection.close();
});