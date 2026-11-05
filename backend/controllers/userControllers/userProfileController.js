import User from "../../models/userModel.js";
import { errorHandler } from "../../utils/error.js";
import { uploader } from "../../utils/cloudinaryConfig.js";
import { dataUri } from "../../utils/multer.js";

//user profile update

export const editUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updatedProfileData = req.body.formData;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: updatedProfileData.username,
          email: updatedProfileData.email,
          phoneNumber: updatedProfileData.phoneNumber,
          adress: updatedProfileData.adress,
          ...(updatedProfileData.profilePicture ? { profilePicture: updatedProfileData.profilePicture } : {}),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(409).json({ message: "data not updated", updatedUser });
    }
    const { password, ...rest } = await updatedUser._doc;
    await res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

//user profile picture upload via Cloudinary
export const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!req.files || req.files.length === 0) {
      return next(errorHandler(400, "No image file provided"));
    }

    const fileDataUri = dataUri(req);
    if (!fileDataUri || fileDataUri.length === 0) {
      return next(errorHandler(400, "Failed to process image file"));
    }

    const result = await uploader.upload(fileDataUri[0].data, {
      public_id: `profile_${userId}_${Date.now()}`,
      folder: "profile_pictures",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: result.secure_url } },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ profilePicture: result.secure_url, user: rest });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    next(errorHandler(500, "Failed to upload profile picture"));
  }
};
