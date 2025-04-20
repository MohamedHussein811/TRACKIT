import User from "../../models/Users.js";
import { compare, hashSync } from "bcrypt";
import bcrypt from "bcrypt";

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    user.password = hashedPassword;

    await user.save();


    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(201).json({ message: "Invalid old password" });
    }
    const isCurrentIsUnique = await compare(newPassword, user.password);

    if (isCurrentIsUnique) {
      return res.status(201).json({
        message: "New password cannot be the same as the old password",
      });
    }

    const hashedPassword = hashSync(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId || req.params.id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(updateData.email ){
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists && emailExists._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if(updateData.firstName.length < 3){
      return res.status(400).json({ message: "First name must be at least 3 characters long" });
    }

    if (user.password) {
      // If user has a password, verify the current password
      if (!updateData.currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isPasswordValid = bcrypt.compareSync(updateData.currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      }
    } else {
      // If user doesn't have a password, ensure a new password is provided
      if (!updateData.newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (updateData.newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      user.password = bcrypt.hashSync(updateData.newPassword, 10);
    }

    // Update user fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "currentPassword" && key !== "newPassword") {
        user[key] = updateData[key];
      }
    });

    if (updateData.newPassword && user.password) {
      if (updateData.newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      user.password = bcrypt.hashSync(updateData.newPassword, 10);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId || req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.hidden) {
      return res.status(400).json({ message: "User is already deleted" });
    }

    user.hidden = true;
    await user.save();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
