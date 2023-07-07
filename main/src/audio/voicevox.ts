import { voicevox, init } from "../../../voicevox/index.js";
import { env } from "../../../env/index.js";
init(env.main.voicevox.openjtalkDir);
process.on("message", (param: any) => {
  voicevox(param.text, param.id, {
    speed: param.speed,
    pitch: param.pitch,
    intonation: param.intonation,
    volume: param.volume,
  })
    .then((result) => {
      process.send?.(result);
    })
    .catch((_) => {
      process.send?.(Buffer.from([]));
    });
});
