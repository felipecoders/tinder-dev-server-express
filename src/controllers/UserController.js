const axios = require("axios");
const bcrypt = require("bcryptjs");
const Dev = require("../models/Dev");

module.exports = {
  async store(req, res) {
    try {
      const { username, password, email } = req.body;

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
        password: hashPassword,
        email
      });

      return res.json(dev);
    } catch (e) {
      console.error("Um erro ocorreu ao cadastrar o usuario");
      return res
        .status(401)
        .send({ message: "Usuario e/ou email ja esta em uso" });
    }
  }
};
