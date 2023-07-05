import { Settings, Voice, VoiceSettings } from "../scripts/settings";
import sqlite from "sqlite3";
import { Snowflake } from "discord.js";
import { env } from "../../../env";
const databasePath = env.main.database.settings;
const db = new sqlite.Database(databasePath);
export const setSettingsDB = (
  settings: Settings,
  guildId: Snowflake
): Promise<void> =>
  new Promise((resolve, reject) => {
    db.get(
      "select count(*) from guild where guild = ?",
      [guildId],
      function (err, count: DBCountRaw | null) {
        if (count?.["count(*)"] === 1) {
          db.run(
            "update guild set " +
              "autojoin = ?, " +
              "readchannel = ?, " +
              "notice = ?, " +
              "noticech = ?, " +
              "noticetext = ?, " +
              "clockch = ?, " +
              "clock0 = ?, " +
              "clock1 = ?, " +
              "clock2 = ?, " +
              "clock3 = ?, " +
              "clock4 = ?, " +
              "clock5 = ?, " +
              "clock6 = ?, " +
              "clock7 = ?, " +
              "clock8 = ?, " +
              "clock9 = ?, " +
              "clock10 = ?, " +
              "clock11 = ?, " +
              "clock12 = ?, " +
              "clock13 = ?, " +
              "clock14 = ?, " +
              "clock15 = ?, " +
              "clock16 = ?, " +
              "clock17 = ?, " +
              "clock18 = ?, " +
              "clock19 = ?, " +
              "clock20 = ?, " +
              "clock21 = ?, " +
              "clock22 = ?, " +
              "clock23 = ?, " +
              "replace = ?, " +
              "autodelete = ? " +
              "where guild = ?",
            [
              settings.autojoin ? 1 : 0, //autojoin
              settings.readch, //readchannel
              settings.voicenotice ? 1 : 0, //notice
              settings.voicenoticechannel, //noticech
              settings.voicenoticetext, //noticetext
              settings.clock.channel, //clockch
              settings.clock[0], //clock0
              settings.clock[1], //clock1
              settings.clock[2], //clock2
              settings.clock[3], //clock0
              settings.clock[4], //clock1
              settings.clock[5], //clock2
              settings.clock[6], //clock0
              settings.clock[7], //clock1
              settings.clock[8], //clock2
              settings.clock[9], //clock0
              settings.clock[10], //clock1
              settings.clock[11], //clock2
              settings.clock[12], //clock0
              settings.clock[13], //clock1
              settings.clock[14], //clock2
              settings.clock[15], //clock0
              settings.clock[16], //clock1
              settings.clock[17], //clock2
              settings.clock[18], //clock0
              settings.clock[19], //clock1
              settings.clock[20], //clock2
              settings.clock[21], //clock0
              settings.clock[22], //clock1
              settings.clock[23], //clock2
              JSON.stringify(settings.replaces), //replace
              JSON.stringify(settings.autoDeleteChannels), //autodelete
              guildId, //guild
            ],
            async function (err) {
              if (err) return reject(err);
              for (const [user, voice] of settings.voice)
                await setUserVoice(user, guildId, voice);
              return resolve();
            }
          );
        } else {
          db.run(
            "insert into guild values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              guildId, //guild
              settings.autojoin ? 1 : 0, //autojoin
              settings.readch, //readchannel
              settings.voicenotice ? 1 : 0, //notice
              settings.voicenoticechannel, //noticech
              settings.voicenoticetext, //noticetext
              settings.clock.channel, //clockch
              settings.clock[0], //clock0
              settings.clock[1], //clock1
              settings.clock[2], //clock2
              settings.clock[3], //clock0
              settings.clock[4], //clock1
              settings.clock[5], //clock2
              settings.clock[6], //clock0
              settings.clock[7], //clock1
              settings.clock[8], //clock2
              settings.clock[9], //clock0
              settings.clock[10], //clock1
              settings.clock[11], //clock2
              settings.clock[12], //clock0
              settings.clock[13], //clock1
              settings.clock[14], //clock2
              settings.clock[15], //clock0
              settings.clock[16], //clock1
              settings.clock[17], //clock2
              settings.clock[18], //clock0
              settings.clock[19], //clock1
              settings.clock[20], //clock2
              settings.clock[21], //clock0
              settings.clock[22], //clock1
              settings.clock[23], //clock2
              JSON.stringify(settings.replaces), //replace
              JSON.stringify(settings.autoDeleteChannels), //autodelete
            ],
            async function (err) {
              if (err) return reject(err);
              for (const [user, voice] of settings.voice)
                await setUserVoice(user, guildId, voice);
              return resolve();
            }
          );
        }
      }
    );
  });
const setUserVoiceSettings = (
  user: string,
  guild: string,
  voice: number,
  settings: Voice
): Promise<void> =>
  new Promise((resolve, reject) => {
    db.get(
      "select count(*) from voice where guild = ? and user = ? and id = ?",
      [guild, user, voice],
      function (err, count: DBCountRaw | null) {
        if (count?.["count(*)"] === 1) {
          db.run(
            "update voice set speed = ?, pitch = ?, intonation = ?, volume = ? where guild = ? and user = ? and id = ?",
            [
              settings.speed,
              settings.pitch,
              settings.intonation,
              settings.volume,
              guild,
              user,
              voice,
            ],
            function (err) {
              if (err) return reject(err);
              return resolve();
            }
          );
        } else {
          db.run(
            "insert into voice values(?, ?, ?, ?, ?, ?, ?)",
            [
              guild,
              user,
              voice,
              settings.speed,
              settings.pitch,
              settings.intonation,
              settings.volume,
            ],
            function (err) {
              if (err) return reject(err);
              return resolve();
            }
          );
        }
      }
    );
  });
const setUserVoice = (
  user: string,
  guild: string,
  voice: VoiceSettings
): Promise<void> =>
  new Promise((resolve, reject) => {
    db.get(
      "select count(*) from user where guild = ? and user = ?",
      [guild, user],
      function (err, count: DBCountRaw | null) {
        if (count?.["count(*)"] === 1) {
          db.run(
            "update user set voice = ? where guild = ? and user = ?",
            [voice.set, guild, user],
            async function (err) {
              if (err) return reject(err);
              for (const [id, setting] of voice.voices)
                await setUserVoiceSettings(user, guild, id, setting);
              return resolve();
            }
          );
        } else {
          db.run(
            "insert into user values(?, ?, ?)",
            [user, guild, voice.set],
            async function (err) {
              if (err) return reject(err);
              for (const [id, setting] of voice.voices)
                await setUserVoiceSettings(user, guild, id, setting);
              return resolve();
            }
          );
        }
      }
    );
  });
export const getAllSettingsDB = (): Promise<Map<Snowflake, Settings>> =>
  new Promise(async (resolve, reject) => {
    const settings: Map<Snowflake, Settings> = new Map();
    const dbGuildSettings = await getGuildSettings();
    const dbUserSettings = await getUserSettings();
    const dbVoiceSettings = await getVoiceSettings();
    dbGuildSettings.forEach((guildSetting) => {
      const voiceSetting: Map<string, VoiceSettings> = new Map();
      dbUserSettings.get(guildSetting.guild)?.forEach((voiceId, UserId) => {
        const retVoiceSetting: Map<number, Voice> = new Map();
        dbVoiceSettings
          .get(guildSetting.guild)
          ?.get(UserId)
          ?.forEach((voice, voiceId_) => {
            retVoiceSetting.set(voiceId_, voice);
          });
        voiceSetting.set(UserId, {
          set: voiceId,
          voices: retVoiceSetting,
        });
      });
      settings.set(guildSetting.guild, {
        autojoin: guildSetting.autojoin === 1,
        voice: voiceSetting,
        readch: guildSetting.readchannel,
        replaces: JSON.parse(guildSetting.replace),
        voicenotice: guildSetting.notice === 1,
        voicenoticechannel: guildSetting.noticech,
        voicenoticetext: guildSetting.noticetext,
        clock: {
          0: guildSetting.clock0,
          1: guildSetting.clock1,
          2: guildSetting.clock2,
          3: guildSetting.clock3,
          4: guildSetting.clock4,
          5: guildSetting.clock5,
          6: guildSetting.clock6,
          7: guildSetting.clock7,
          8: guildSetting.clock8,
          9: guildSetting.clock9,
          10: guildSetting.clock10,
          11: guildSetting.clock11,
          12: guildSetting.clock12,
          13: guildSetting.clock13,
          14: guildSetting.clock14,
          15: guildSetting.clock15,
          16: guildSetting.clock16,
          17: guildSetting.clock17,
          18: guildSetting.clock18,
          19: guildSetting.clock19,
          20: guildSetting.clock20,
          21: guildSetting.clock21,
          22: guildSetting.clock22,
          23: guildSetting.clock23,
          channel: guildSetting.clockch,
        },
        autoDeleteChannels: JSON.parse(guildSetting.autodelete),
      });
    });
    resolve(settings);
  });
const getGuildSettings = (): Promise<Array<DBGuildSettings>> =>
  new Promise((res, rej) =>
    db.all(
      "select * from guild",
      function (err, rows: Array<DBGuildSettings> | null) {
        if (err) return rej(err);
        return res(rows ?? []);
      }
    )
  );
const getUserSettings = (): Promise<Map<Snowflake, Map<Snowflake, number>>> =>
  new Promise((res, rej) =>
    db.all(
      "select * from user",
      function (err, rows: Array<DBUserSettingsRaw> | null) {
        if (err) return rej(err);
        const ret: Map<Snowflake, Map<Snowflake, number>> = new Map();
        rows?.forEach((row) => {
          const guild = ret.get(row.guild);
          if (guild) {
            guild.set(row.user, row.voice);
          } else {
            ret.set(row.guild, new Map().set(row.user, row.voice));
          }
        });
        return res(ret);
      }
    )
  );
const getVoiceSettings = (): Promise<
  Map<Snowflake, Map<Snowflake, Map<number, Voice>>>
> =>
  new Promise((res, rej) =>
    db.all(
      "select * from voice",
      function (err, rows: Array<DBVoiceSettingsRaw> | null) {
        if (err) return rej(err);
        const ret: Map<
          Snowflake,
          Map<Snowflake, Map<number, Voice>>
        > = new Map();
        rows?.forEach((row) => {
          const guild = ret.get(row.guild);
          if (guild) {
            const user = guild.get(row.user);
            if (user) {
              user.set(row.id, {
                id: row.id,
                volume: row.volume,
                pitch: row.pitch,
                speed: row.speed,
                intonation: row.intonation,
              });
            } else {
              guild.set(
                row.user,
                new Map().set(row.id, {
                  id: row.id,
                  volume: row.volume,
                  pitch: row.pitch,
                  speed: row.speed,
                  intonation: row.intonation,
                })
              );
            }
          } else {
            ret.set(
              row.guild,
              new Map().set(
                row.user,
                new Map().set(row.id, {
                  id: row.id,
                  volume: row.volume,
                  pitch: row.pitch,
                  speed: row.speed,
                  intonation: row.intonation,
                })
              )
            );
          }
        });
        res(ret);
      }
    )
  );
interface DBGuildSettings {
  guild: string;
  autojoin: number;
  readchannel: string;
  notice: number;
  noticech: string;
  noticetext: string;
  clockch: string;
  clock0: string;
  clock1: string;
  clock2: string;
  clock3: string;
  clock4: string;
  clock5: string;
  clock6: string;
  clock7: string;
  clock8: string;
  clock9: string;
  clock10: string;
  clock11: string;
  clock12: string;
  clock13: string;
  clock14: string;
  clock15: string;
  clock16: string;
  clock17: string;
  clock18: string;
  clock19: string;
  clock20: string;
  clock21: string;
  clock22: string;
  clock23: string;
  replace: string;
  autodelete: string;
}
interface DBUserSettingsRaw {
  guild: string;
  user: string;
  voice: number;
}
interface DBVoiceSettingsRaw {
  guild: string;
  user: string;
  id: number;
  volume: number;
  pitch: number;
  speed: number;
  intonation: number;
}
interface DBCountRaw {
  "count(*)": number;
}
