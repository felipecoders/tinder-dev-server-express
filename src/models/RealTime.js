const { Schema, model } = require("mongoose");

const RealTimeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Dev",
    required: true
  },
  connection: {
    type: String,
    require: true
  },
  matchs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Dev"
    }
  ]
});

module.exports = model("RealTime", RealTimeSchema);
