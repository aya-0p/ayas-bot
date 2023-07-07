import schedule from "node-schedule";
import { client } from "../server.js";
import { voiceConnectionMap, playNothing } from "./connection.js";
import * as log from "./log.js";
import addonLog from "../addons/index.js";
import { VoiceConnectionStatus } from "@discordjs/voice";
import { AuditLogEvent, Snowflake } from "discord.js";
import { disconnect } from "../commands/disconnect.js";

const reason = {
  0: "WebSocketClose",
  1: "AdapterUnavailable",
  2: "EndpointRemoved",
  3: "Manual",
};

schedule.scheduleJob("* * * * * *", async () => {
  for (const guildId of voiceConnectionMap.keys()) {
    const voiceConnection = voiceConnectionMap.get(guildId);
    if (!voiceConnection) return;
    const vCState = voiceConnectionMap.get(guildId)?.connection.state;
    if (vCState?.status === VoiceConnectionStatus.Destroyed) {
      destroyConnection(guildId, 0);
      return;
    } else if (vCState?.status === VoiceConnectionStatus.Disconnected) {
      const audit = (
        await client.guilds.cache
          .get(guildId)
          ?.fetchAuditLogs({ type: AuditLogEvent.MemberDisconnect })
          .catch(() => {})
      )?.entries.first();
      if (audit) {
        const difTime = Math.abs(
          new Date().getTime() - audit.createdAt.getTime()
        );
        if (difTime < 10000) {
          addonLog.checkVoiceConnections.disconnect.user(
            guildId,
            audit,
            difTime,
            reason[vCState.reason]
          );
          voiceConnection.connectionErrors = 10;
          destroyConnection(guildId, 1, reason[vCState.reason]);
          return;
        } else {
          destroyConnection(guildId, 1, reason[vCState.reason]);
          addonLog.checkVoiceConnections.disconnect.user(
            guildId,
            audit,
            difTime,
            reason[vCState.reason]
          );
        }
      } else {
        destroyConnection(guildId, 1, reason[vCState.reason]);
        addonLog.checkVoiceConnections.disconnect.noLog(
          guildId,
          reason[vCState.reason]
        );
      }
      addonLog.checkVoiceConnections.reJoin(guildId);
      voiceConnection.connection.rejoin({
        channelId: voiceConnection.speakingChannel.id,
        selfMute: false,
        selfDeaf: false,
      });
    } else {
      if (
        voiceConnection.speakingChannel.members.filter(
          (member) => !member.user.bot
        ).size === 0
      ) {
        destroyConnection(
          guildId,
          2,
          voiceConnection.speakingChannel.members
            .filter((member) => !member.user.bot)
            .size.toString()
        );
        return;
      }
    }
    voiceConnection.connectionErrors = 0;
    if (!voiceConnection.speaking) {
      playNothing(guildId);
    }
  }
});

const destroyConnection = (
  guildId: Snowflake,
  errorNumber: number,
  other: string = "Unknown reason"
): void => {
  const voiceConnection = voiceConnectionMap.get(guildId);
  if (!voiceConnection) return;
  let reason;
  switch (errorNumber) {
    case 0:
      reason = "Bot's connection Destroyed";
      break;
    case 1:
      reason = `Bot's connection Disconnected(${other})`;
      break;
    case 2:
      reason = `No Member at this Connection(${other})`;
      break;
    default:
      reason = other;
      break;
  }
  if (voiceConnection.connectionErrors > 5) {
    disconnect(guildId);
    log.info(
      `Connection destroyed forcibly\n    server: ${guildId}\n    reason: ${reason}`
    );
    addonLog.checkVoiceConnections.disconnect.force(guildId, reason);
  } else {
    log.info(
      `:exclamation:  Connection will destroyed forcibly \nServer: ${
        client.guilds.cache.get(guildId)?.name
      }(${guildId})\nReason: ${reason}\nCount: ${
        voiceConnection.connectionErrors + 1
      }`
    );
    voiceConnection.connectionErrors++;
  }
};
