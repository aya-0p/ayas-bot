import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import * as log from "../scripts/log.js";
import addonLog from "../addons/index.js";

export default (interaction: ChatInputCommandInteraction) => {
  if (!interaction.isChatInputCommand()) return;
  interaction.showModal(
    new ModalBuilder()
      .setTitle("報告")
      .setCustomId("report_m")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(
          new TextInputBuilder()
            .setCustomId("re_content")
            .setLabel("報告する内容を入力")
            .setPlaceholder("例: メッセージが読み上げられないです。")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
        )
      )
  );
  interaction
    .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
    .then((modal) => {
      modal
        .reply({
          content: "送信しました。",
          ephemeral: true,
        })
        .catch(() => {});
      const report = modal.fields.fields.get("re_content");
      if (report) {
        const username = (() => {
          const member = interaction.member;
          if (member instanceof GuildMember) return `${member.displayName}(${interaction.user.username})`;
          return `${interaction.user.displayName}(${interaction.user.username})`;
        })();
        const guild = interaction.guild;
        const guildName = guild?.name ?? "DM";
        const channel = interaction.channel;
        const channelName =
          !channel || channel.type === ChannelType.DM ? "DM" : channel.name;
        if (guild) addonLog.commands.report(interaction);
        log.warning(report.value);
        log.info(
          `New report!\nuser: ${username}(${
            interaction.user.id
          })\nguild: ${guildName}(${
            guild?.id ?? ""
          })\nchannel: ${channelName}(${channel?.id ?? ""})`
        );
      }
    })
    .catch(() => {});
};
