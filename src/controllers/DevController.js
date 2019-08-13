const axios = require("axios");
const bcrypt = require("bcryptjs");
const Dev = require("../models/Dev");

module.exports = {
  async index(req, res) {
    try {
      const { user } = req.headers;

      const loggedDev = await Dev.findById(user);

      const users = await Dev.find({
        // condicao AND
        $and: [
          // que o id nao seja igual ao user
          { _id: { $ne: user } },
          // que o id nao esteja dentro dos likes
          { _id: { $nin: loggedDev.likes } },
          // que o id nao esteja dentro dos dislikes
          { _id: { $nin: loggedDev.dislikes } }
        ]
      });

      return res.json(users);
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ error: "A error ocurred on listen", err: e });
    }
  },

  async store(req, res) {
    try {
      const { username, password } = req.body;

      // check user exists
      const userExists = await Dev.findOne({ user: username });
      if (userExists) {
        const correctPassword = bcrypt.compare(password, userExists.password);
        // remove password
        userExists.password = undefined;

        if (correctPassword) {
          return res.json(userExists);
        } else {
          return res.status(401).json({ message: "Failed login" });
        }
      }

      const { data } = await axios.get(
        `https://api.github.com/users/${username}`
      );

      const { name, bio, avatar_url: avatar } = data;

      const hashPassword = await bcrypt.hash(password, 10);

      const dev = await Dev.create({
        name,
        user: username,
        bio,
        avatar,
        password: hashPassword
      });

      return res.json(dev);
    } catch (e) {
      console.error(e);
      return res
        .status(503)
        .json({ error: "A error ocurred on save Dev", exception: e });
    }
  }
};
