const RealTime = require("../models/RealTime");
const Dev = require("../models/Dev");

module.exports = {
  async store(socket, io) {
    try {
      socket.on("disconnect", async reason => {
        // atualiza o registro para informar que nao esta conectado
        await RealTime.findOneAndUpdate(
          { user: socket.handshake.query.user },
          { connection: null }
        );
      });

      // busca o registro do usuario
      const item = await RealTime.findOne({
        user: socket.handshake.query.user
      });

      if (item) {
        // atualiza o id do socket
        item.connection = socket.id;

        // valida se possui matchs pendentes ja retorna os matchs que nao foram enviados
        // por conta do usuario estar deslogado
        if (item.matchs.length > 0) {
          // pegando no maximo 10 matchs para nao sobrecarregar a requsicao
          const matchs = item.matchs.splice(0, 10);
          // todos os devs
          const devs = await Dev.find({
            _id: { $in: matchs }
          }).select(["-likes", "-dislikes"]);

          io.to(socket.id).emit("match", devs);
        }
        // salva a atualizacao
        await item.save();
      } else {
        await RealTime.create({
          user: socket.handshake.query.user,
          connection: socket.id,
          matchs: []
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
};
