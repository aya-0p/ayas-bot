import { fork } from "child_process";
import { env } from "../../../env";
import { setVoice } from "../database/voiceDB";
import path from "path";
import * as log from "../scripts/log";

const voicevox = fork(
  path.join(env.project.rootDirPath, "main/scripts/audio/voicevox.js")
);
voicevox.setMaxListeners(100);
function sendChild(
  text: string,
  speed: number,
  pitch: number,
  intonation: number,
  volume: number,
  id: number
) {
  return new Promise<Buffer>((resolve, reject) => {
    voicevox.send({
      text: text,
      id: id,
      speed: speed,
      volume: volume,
      intonation: intonation,
      pitch: pitch,
    });
    voicevox.once("message", (msg, a) => {
      const buf = msg as any;
      if (buf.type === "Buffer") {
        resolve(Buffer.from(buf.data));
      } else {
        log.error(
          `Received ${typeof buf.data} not Buffer.\nAt: src/audio/tts.ts`
        );
        resolve(Buffer.from([]));
      }
    });
  });
}
export async function tts(
  text: string,
  id: number,
  speed: number,
  volume: number,
  intonation: number,
  pitch: number
) {
  let buffer: Buffer = Buffer.from([]);
  buffer =
    (await sendChild(text, speed, pitch, intonation, volume, id).catch(
      () => {}
    )) ?? Buffer.from([]);
  setVoice(
    text,
    {
      voiceid: id,
      speed: speed,
      pitch: pitch,
      intonation: intonation,
      volume: volume,
    },
    buffer
  );
  return buffer;
}
