import sqlite from "sqlite3";
import { env } from "../../../env/index.js";
const databasePath = env.main.database.voice;
const db = new sqlite.Database(databasePath);
export const setVoice = (
  text: string,
  settings: VoiceSettings,
  data: Buffer
): Promise<void> =>
  new Promise((resolve, reject) => {
    db.run(
      "insert into voice values(?, ?, ?, ?, ?, ?, ?)",
      [
        text, //content
        settings.voiceid, //voiceid
        data, //voice
        settings.pitch, //pitch
        settings.intonation, //intonation
        settings.volume, //volume
        settings.speed, //speed
      ],
      function (err) {
        if (err) return reject(err);
        return resolve();
      }
    );
  });
export const getVoice = (
  text: string,
  settings: VoiceSettings
): Promise<Buffer | void> =>
  new Promise((resolve, reject) => {
    db.get(
      "select * from voice where content = ? and voiceid = ? and pitch = ? and intonation = ? and volume = ? and speed = ?",
      [
        text, //content
        settings.voiceid, //voiceid
        settings.pitch, //pitch
        settings.intonation, //intonation
        settings.volume, //volume
        settings.speed, //speed
      ],
      function (err, row: DBVoiceRaw | null) {
        if (err) return reject(err);
        if (!row) return resolve();
        return resolve(row.voice);
      }
    );
  });
interface VoiceSettings {
  voiceid: number;
  speed: number;
  pitch: number;
  intonation: number;
  volume: number;
}
interface DBVoiceRaw {
  voiceid: number;
  speed: number;
  pitch: number;
  intonation: number;
  volume: number;
  voice: Buffer;
}
