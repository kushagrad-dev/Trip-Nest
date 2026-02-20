const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/TripNest";


main().then(() =>{
    console.log("connected to DB"); // executed when the database is connected properly 
}).catch(err =>{
    console.log(err); //otherwise it shows error
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () =>{
    await Listing.deleteMany({}); // by this we are cleaning the previous data which is present
    initData.data = initData.data.map((obj) => ({...obj,owner : "696efcbe89b953483bd619cd"})) // with the help of this line we have provided an owner delta-student to all the listings with the help of object id
    await Listing.insertMany(initData.data); // as we wanna access the key data thats why we wtote .data
    console.log("data was initialized");
};

initDB();
