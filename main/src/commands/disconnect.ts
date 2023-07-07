import { Snowflake } from "discord.js";
import * as log from "../scripts/log.js";
import addonLog from "../addons/index.js";
import { voiceConnectionMap } from "../scripts/connection.js";
import { ChatInputGuildCommandInteraction } from "../scripts/utility.js";

export default (interaction: ChatInputGuildCommandInteraction): void => {
  if (voiceConnectionMap.has(interaction.guild.id)) {
    voiceConnectionMap.get(interaction.guild.id)?.connection.destroy();
    interaction
      .reply({ content: "切断しました。", ephemeral: true })
      .catch(() => {});
    addonLog.commands.disconnect.success(interaction);
    voiceConnectionMap.delete(interaction.guild?.id);
    return;
  } else {
    log.warning(
      `Did not disconnect from voice channel\nServer: ${interaction.channel.name}(${interaction.channel.id})`
    );
    addonLog.commands.disconnect.error(interaction);
    interaction
      .reply({
        content:
          "接続されていません。\n接続されたままですか？一度'/join'を行ってから'/disconnect'を実行してください。",
        ephemeral: true,
      })
      .catch(() => {});
    return;
  }
};

export const disconnect = (guildId: Snowflake): boolean => {
  const voiceConnection = voiceConnectionMap.get(guildId);
  if (voiceConnection === undefined) return false;
  try {
    voiceConnection.connection.destroy();
  } catch {}
  voiceConnectionMap.delete(guildId);
  return true;
};
