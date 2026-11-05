import { useState } from "react";
import Modal from "../../components/CustomModal";
import { TbEditCircle } from "react-icons/tb";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { editUserProfile, setUpdated } from "../../redux/user/userSlice";
import { useForm } from "react-hook-form";
import { MdCameraAlt } from "react-icons/md";

const ProfileEdit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser) || {};
  const { username, email, phoneNumber, adress, _id, profilePicture } = currentUser;

  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB");
      return;
    }
    setPicFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPicPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const editProfileData = async (data) => {
    try {
      setUploading(true);
      let profilePictureUrl = profilePicture;

      // If a new picture was selected, upload via Cloudinary through existing endpoint
      if (picFile) {
        const formData = new FormData();
        formData.append("profilePicture", picFile);
        formData.append("userId", _id);
        try {
          const uploadRes = await fetch(`/api/user/uploadProfilePicture/${_id}`, {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            profilePictureUrl = uploadData.profilePicture || profilePictureUrl;
          }
        } catch (uploadErr) {
          console.log("Profile picture upload failed, skipping:", uploadErr);
        }
      }

      const formData = {
        ...data,
        profilePicture: profilePictureUrl,
      };

      dispatch(editUserProfile({ ...formData }));
      const updateRes = await fetch(`/api/user/editUserProfile/${_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      if (updateRes.ok) {
        const updatedData = await updateRes.json();
        dispatch(editUserProfile(updatedData));
      }
      dispatch(setUpdated(true));
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const currentPic = picPreview || profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0ea5e9&color=fff&size=200`;

  return (
    <>
      <button type="button" className="" onClick={() => setIsModalOpen(true)}>
        <TbEditCircle />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="bg-white mt-10 rounded-md max-w-[600px] min-w-[360px]"
      >
        <form onSubmit={handleSubmit(editProfileData)}>
          <div className="p-8">
            <h2 className="font-bold text-lg mb-6">Edit Profile</h2>

            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={currentPic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0ea5e9&color=fff&size=200`;
                  }}
                />
                <label
                  htmlFor="profilePicInput"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition"
                  title="Change profile picture"
                >
                  <MdCameraAlt className="text-sm" />
                </label>
                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handlePicChange}
                />
              </div>
            </div>
            {picFile && (
              <p className="text-center text-xs text-blue-600 font-medium mb-4">
                New picture selected: {picFile.name}
              </p>
            )}

            <div className="flex flex-col mx-auto md:min-w-[500px] gap-6 my-4">
              <TextField
                id="username"
                label="Full Name"
                variant="outlined"
                {...register("username")}
                defaultValue={username}
              />
              <TextField
                id="email"
                label="Email Address"
                variant="outlined"
                defaultValue={email}
                {...register("email")}
              />
              <TextField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                variant="outlined"
                defaultValue={phoneNumber}
                {...register("phoneNumber")}
              />
              <TextField
                id="adress"
                label="Address"
                multiline
                rows={3}
                defaultValue={adress}
                {...register("adress")}
              />
            </div>

            <div className="flex justify-end items-center gap-x-2 mt-4">
              <button
                type="button"
                className="w-[100px] rounded-sm text-white bg-red-500 p-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="w-[120px] rounded-sm text-white bg-green-500 p-2 disabled:opacity-50"
              >
                {uploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProfileEdit;
