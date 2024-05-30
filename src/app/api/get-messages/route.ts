import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const loggedUser: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  // the actual way of converting the id before make the database query
  const userId = new mongoose.Types.ObjectId(loggedUser._id);

  try {
    // $unwind remove the array and provide the items only
    const userMessages = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!userMessages || userMessages.length === 0) {
      return Response.json({ success: false, message: "" }, { status: 401 });
    }
    return Response.json(
      { success: true, messages: userMessages[0].messages },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Internal server error", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
