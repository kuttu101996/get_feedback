import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

// the return value we are accepting from this function is a Promise
// <void> because we don't no/need the value we get inside the Promise
async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI || "", {});
    connection.isConnected = db.connections[0].readyState;

    console.log("DB connected");
  } catch (error) {
    console.log("DB connection failed\n" + error);
    process.exit(1);
  }
}

export default dbConnect;
