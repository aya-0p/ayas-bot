import {
  ActionRowBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import addonLog from "../addons/index.js";
import getReply from "../scripts/reply.js";
import { ChatInputGuildCommandInteraction } from "../scripts/utility.js";

export default (interaction: ChatInputGuildCommandInteraction) => {
  switch (interaction.options.getString("mode", true)) {
    case "add":
      interaction
        .showModal(
          new ModalBuilder()
            .setTitle("自動返信設定")
            .setCustomId("reply_add_m")
            .setComponents(
              new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                  .setCustomId("reply_before")
                  .setLabel("反応する文字を入力")
                  .setRequired(true)
                  .setStyle(TextInputStyle.Short)
              ),
              new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                  .setCustomId("reply_after")
                  .setLabel("返信する文字を入力")
                  .setRequired(true)
                  .setStyle(TextInputStyle.Short)
              )
            )
        )
        .then(() => {
          interaction
            .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
            .then((modal) => {
              const before = modal.fields.fields.get("reply_before")?.value;
              const after = modal.fields.fields.get("reply_after")?.value;
              if (before && after) addReply(before, after, interaction, modal);
            })
            .catch(() => {});
        })
        .catch(() => {});
      break;
    case "delete":
      interaction
        .showModal(
          new ModalBuilder()
            .setTitle("自動返信設定")
            .setCustomId("reply_del_m")
            .setComponents(
              new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                  .setCustomId("reply_delete")
                  .setLabel("削除する反応するときの文字を入力")
                  .setRequired(true)
                  .setStyle(TextInputStyle.Short)
              )
            )
        )
        .then(() => {
          interaction
            .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
            .then((modal) => {
              const del = modal.fields.fields.get("reply_delete")?.value;
              if (del) deleteReplys(del, interaction, modal);
            })
            .catch(() => {});
        })
        .catch(() => {});
      break;
    case "show":
      showReplys(interaction);
      break;
    default:
      break;
  }
};

const addReply = (
  search: string,
  returnMsg: string,
  interaction: ChatInputGuildCommandInteraction,
  modal: ModalSubmitInteraction
): void => {
  const guild = interaction.guild;
  addonLog.commands.reply.add(interaction, search, returnMsg);
  modal
    .reply({
      content: `自動で返信します。\n${search} => ${returnMsg}`,
      ephemeral: true,
    })
    .catch(() => {});
  getReply(guild.id).push({ search: search, returnmsg: returnMsg });
};

const deleteReplys = async (
  ser: string,
  interaction: ChatInputGuildCommandInteraction,
  modal: ModalSubmitInteraction
): Promise<void> => {
  const guild = interaction.guild;
  await modal.reply({ content: "削除中..." }).catch(() => {});
  let deleteCount: number = 0;
  getReply(guild.id).forEach((e, i) => {
    if (e.search === ser) {
      addonLog.commands.reply.remove(interaction, e.search, e.returnmsg);
      modal
        .followUp({
          embeds: [
            {
              title: "削除しました。",
              color: 0,
              timestamp: new Date().toISOString(),
              footer: {
                text: "✖を押してメッセージを削除",
              },
              fields: [
                {
                  name: "反応する言葉",
                  value: `${e.search}`,
                },
                {
                  name: "返信する言葉",
                  value: `${e.returnmsg}`,
                },
              ],
            },
          ],
        })
        .catch(() => {});
      getReply(guild.id).splice(i, 1);
      deleteCount++;
    }
  });
  if (deleteCount === 0) {
    modal
      .editReply({
        content: "削除するものが見つかりませんでした。",
      })
      .then(() => {
        setTimeout(() => {
          modal.deleteReply().catch(() => {});
        }, 5000);
      })
      .catch(() => {});
  } else {
    modal.deleteReply().catch(() => {});
  }
};
const showReplys = (interaction: ChatInputGuildCommandInteraction): void => {
  const guild = interaction.guild;
  addonLog.commands.reply.show(interaction);
  const replys_: Array<string> = [];
  getReply(guild.id).forEach((e) => {
    replys_.push(`${e.search}=>${e.returnmsg}`);
  });
  if (!interaction.replied)
    interaction
      .reply({
        content: `自動返信一覧です。\n${replys_.join("\n")}`,
        ephemeral: true,
      })
      .catch(() => {});
};
