import {
  ActionRowBuilder,
  Guild,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import addonLog from "../addons/index.js";
import getSettings from "../scripts/settings.js";
import { ChatInputGuildCommandInteraction } from "../scripts/utility.js";

export default (interaction: ChatInputGuildCommandInteraction): void => {
  switch (interaction.options.getString("mode", true)) {
    case "add":
      interaction
        .showModal(
          new ModalBuilder()
            .setTitle("読み替え設定")
            .setCustomId("read_add_m")
            .setComponents(
              new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                  .setCustomId("read_before")
                  .setLabel("読み替える前の文字を入力")
                  .setRequired(true)
                  .setStyle(TextInputStyle.Short)
              ),
              new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                  .setCustomId("read_after")
                  .setLabel("読み替える後の文字を入力")
                  .setRequired(true)
                  .setStyle(TextInputStyle.Short)
              )
            )
        )
        .then(() => {
          interaction
            .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
            .then((modal) => {
              const before = modal.fields.fields.get("read_before")?.value;
              const after = modal.fields.fields.get("read_after")?.value;
              if (before && after)
                addReplaceAsText(before, after, modal, interaction);
            })
            .catch(() => {});
        })
        .catch(() => {});
      break;
    case "delete":
      interaction
        .showModal(
          new ModalBuilder()
            .setTitle("読み替え設定")
            .setCustomId("read_del_m")
            .setComponents(
              new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                  .setCustomId("read_delete")
                  .setLabel("削除する読み替えの文字を入力")
                  .setRequired(true)
                  .setStyle(TextInputStyle.Short)
              )
            )
        )
        .then(() => {
          interaction
            .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
            .then((modal) => {
              const del = modal.fields.fields.get("read_delete")?.value;
              if (del) deleteReplaces(del, modal, interaction);
            })
            .catch(() => {});
        })
        .catch(() => {});
      break;
    case "show":
      showReplaces(interaction);
      break;
    default:
      break;
  }
};

const addReplaceAsText = (
  before: string,
  after: string,
  modal: ModalSubmitInteraction,
  interaction: ChatInputGuildCommandInteraction
): void => {
  if (after === ".") after = "";
  addonLog.commands.read.add(interaction, before, after);
  const settings = getSettings(interaction.guild.id);
  let same = false;
  let old = "";
  settings.replaces.text.forEach((element, index) => {
    if (element.before === before) {
      same = true;
      old = settings.replaces.text[index].after;
      settings.replaces.text[index].after = after;
    }
  });
  if (same) {
    modal
      .reply({
        content: `文字の読み替えを変更しました。\n読み替え前 ${before} => ${old}\n読み替え後 ${before} => ${after}`,
        ephemeral: true,
      })
      .catch(() => {});
  } else {
    settings.replaces.text.unshift({ before: before, after: after });
    modal
      .reply({
        content: `文字を置き換えて読みます。\n${before} => ${after}`,
        ephemeral: true,
      })
      .catch(() => {});
  }
};

const deleteReplaces = async (
  before: string,
  modal: ModalSubmitInteraction,
  interaction: ChatInputGuildCommandInteraction
): Promise<void> => {
  const guild = interaction.guild;
  await modal.reply({ content: "削除中..." }).catch(() => {});
  const settings = getSettings(guild.id);
  let deleteCount = 0;
  settings.replaces.regex.forEach((e, i) => {
    if (e.before === before) {
      addonLog.commands.read.remove.regex(
        interaction,
        settings.replaces.regex[i].before,
        settings.replaces.regex[i].after
      );
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
                  name: "読み替え前",
                  value: `${settings.replaces.regex[i].before}`,
                },
                {
                  name: "読み替え後",
                  value: `${settings.replaces.regex[i].after}`,
                },
              ],
            },
          ],
        })
        .catch(() => {});
      settings.replaces.regex.splice(i, 1);
      deleteCount++;
    }
  });
  settings.replaces.text.forEach((e, i) => {
    if (e.before === before) {
      addonLog.commands.read.remove.text(
        interaction,
        settings.replaces.regex[i].before,
        settings.replaces.regex[i].after
      );
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
                  name: "読み替え前",
                  value: `${settings.replaces.text[i].before}`,
                },
                {
                  name: "読み替え後",
                  value: `${settings.replaces.text[i].after}`,
                },
              ],
            },
          ],
        })
        .catch(() => {});
      settings.replaces.text.splice(i, 1);
      deleteCount++;
    }
  });
  if (deleteCount === 0) {
    modal
      .editReply({
        content: "削除するものが見つかりませんでした。",
      })
      .then(async () => {
        setTimeout(() => {
          modal.deleteReply().catch(() => {});
        }, 5000);
      })
      .catch(() => {});
  } else {
    modal.deleteReply().catch(() => {});
  }
};

const showReplaces = (interaction: ChatInputGuildCommandInteraction): void => {
  const guild = interaction.guild;
  addonLog.commands.read.show(interaction);
  interaction
    .reply({
      content: `読み替え一覧です。\n${list(guild)}`,
      ephemeral: true,
    })
    .catch(() => {});
};

const list = (guild: Guild) => {
  const settings = getSettings(guild.id);
  let replaces: Array<string> = [];
  settings.replaces.regex.forEach((e) => {
    replaces.push(`${e.before}(正規表現)=>${e.after}`);
  });
  settings.replaces.text.forEach((e) => {
    replaces.push(`${e.before}=>${e.after}`);
  });
  return replaces.join("\n");
};
