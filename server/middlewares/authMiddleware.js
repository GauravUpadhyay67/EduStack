import { clerkClient } from "@clerk/express";

// Middleware (Protect Educator Routes)
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const response = await clerkClient.users.getUser(userId);
    const role = response.publicMetadata?.role;

    if (role !== 'educator') {
      return res.status(403).json({
        success: false,
        message:
          role === 'pending-educator'
            ? 'Your educator request is pending approval.'
            : 'Unauthorized Access',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
