import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      return res.status(401).json({
        error: ["Not authenticated"]
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    return res.status(401).json({
      error: ["Invalid or Expired Token"]
    });
  }
};