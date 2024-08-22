import mongoose from "mongoose";

async function connecToDb() {
  try {

    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGO DB CONNECTED :: " + con.connection.host);
  } catch (error) {
    console.log("Error connecting DB");
    process.exit(1);
  }
}

export default connecToDb;
