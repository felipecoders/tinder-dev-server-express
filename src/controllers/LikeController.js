const Dev = require("../models/Dev");
const RealTime = require("../models/RealTime");

module.exports = {
  async store(req, res) {
    try {
      const { devId } = req.params;
      const { user } = req.headers;

      const loggedDev = await Dev.findById(user);
      const targetDev = await Dev.findById(devId);

      // evitando bugs
      if (!targetDev) {
        return res.status(400).json({ error: "Dev not exists" });
      }

      // caso o target ja tenha dado like neste usuario
      if (targetDev.likes.includes(loggedDev._id)) {
        // busca os registros do socket salvos
        const loggedSocket = await RealTime.findOne({ user });
        const targetSocket = await RealTime.findOne({ user: devId });

        // este usuario claramente esta logado
        req.io.to(loggedSocket.connection).emit("match", [targetDev]);

        // caso o target esteja conectado ele envia
        // caso ele nao esteja conectado sera salvo nos matchs
        // para quando ele logar receber as notificacoes
        if (targetSocket && targetSocket.connection) {
          req.io.to(targetSocket.connection).emit("match", [loggedDev]);
        } else {
          targetSocket.matchs.push(user);
          await targetSocket.save();
        }
      }

      loggedDev.likes.push(targetDev._id);

      await loggedDev.save();

      return res.json(loggedDev);
    } catch (e) {
      res.status(500).json({ error: "A error ocurred on Like", exception: e });
    }
  }
};
