import {
  ActionRowBuilder,
  ChannelType,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import * as log from "../scripts/log";
import addonLog from "../addons";
import getSettings from "../scripts/settings";
import { ChatInputGuildCommandInteraction } from "../scripts/utility";

export default async (interaction: ChatInputGuildCommandInteraction) => {
  const guild = interaction.guild;
  const channel = interaction.channel;
  const subCommand = interaction.options.getSubcommand();

  const settings = getSettings(guild.id);
  switch (subCommand) {
    case "autojoin": {
      const to = interaction.options.getBoolean("to", true);
      if (to === true) {
        addonLog.commands.settings.autoJoin(interaction, true);
        settings.autojoin = true;
        settings.readch = channel.id;
        interaction
          .reply({
            content: "自動的に接続**する**ようにしました。",
            ephemeral: true,
          })
          .catch(() => {});
      } else {
        addonLog.commands.settings.autoJoin(interaction, false);
        settings.autojoin = false;
        interaction
          .reply({
            content: "自動的に接続**しない**ようにしました。",
            ephemeral: true,
          })
          .catch(() => {});
      }
      break;
    }
    case "vcnotice": {
      const to = interaction.options.getBoolean("to", true);
      if (to === true) {
        interaction
          .showModal(
            new ModalBuilder()
              .setTitle("ボイスチャンネル接続メッセージ")
              .setCustomId("vcnotice_m")
              .setComponents(
                new ActionRowBuilder<TextInputBuilder>().setComponents(
                  new TextInputBuilder()
                    .setCustomId("vc_content")
                    .setLabel("送信するメッセージを入力")
                    .setMaxLength(1000)
                    .setRequired(true)
                    .setPlaceholder("@everyone 会話が始まりました。")
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(settings.voicenoticetext)
                )
              )
          )
          .then(() => {
            interaction
              .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
              .then((modal) => {
                const message = modal.fields.fields.get("vc_content");
                if (message) {
                  addonLog.commands.settings.vcNotice.enable(
                    interaction,
                    message.value
                  );
                  settings.voicenotice = true;
                  settings.voicenoticechannel = channel.id;
                  settings.voicenoticetext = message.value;
                  modal.reply({
                    content:
                      "ボイスチャンネル接続通知を**送る** ようにしました。",
                    ephemeral: true,
                  });
                }
              })
              .catch(() => {});
          })
          .catch(() => {});
      } else {
        addonLog.commands.settings.vcNotice.disable(interaction);
        settings.voicenotice = false;
        settings.voicenoticetext = "";
        interaction
          .reply({
            content: "ボイスチャンネル接続通知を**送らない**ようにしました。",
            ephemeral: true,
          })
          .catch(() => {});
      }
      break;
    }
    case "clock": {
      const time = interaction.options.getInteger("time", true);
      const to = interaction.options.getBoolean("to", true);
      if (
        time === 0 ||
        time === 1 ||
        time === 2 ||
        time === 3 ||
        time === 4 ||
        time === 5 ||
        time === 6 ||
        time === 7 ||
        time === 8 ||
        time === 9 ||
        time === 10 ||
        time === 11 ||
        time === 12 ||
        time === 13 ||
        time === 14 ||
        time === 15 ||
        time === 16 ||
        time === 17 ||
        time === 18 ||
        time === 19 ||
        time === 20 ||
        time === 21 ||
        time === 22 ||
        time === 23
      ) {
        if (to === true) {
          interaction
            .showModal({
              title: `${time.toString()}時のメッセージ`,
              components: [
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      custom_id: "cl_content",
                      type: ComponentType.TextInput,
                      label: "送信するメッセージを入力",
                      style: TextInputStyle.Paragraph,
                      required: true,
                      value: settings.clock[time],
                      max_length: 1000,
                      placeholder: `${time.toString()}時ですよ！`,
                    },
                  ],
                },
              ],
              custom_id: "clock_m",
            })
            .then(() => {
              interaction
                .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
                .then((modal) => {
                  const message = modal.fields.fields.get("cl_content");
                  if (message) {
                    settings.clock[time] = message.value;
                    settings.clock.channel = channel.id;
                    addonLog.commands.settings.clock.enable(
                      interaction,
                      time,
                      message.value
                    );
                    modal.reply({
                      content: "時報を変更しました",
                      ephemeral: true,
                    });
                  }
                })
                .catch(() => {});
            })
            .catch(() => {});
        } else {
          addonLog.commands.settings.clock.disable(interaction, time);
          interaction
            .reply({
              content: "メッセージの送信を無効にしました。",
              ephemeral: true,
            })
            .catch(() => {});
        }
      } else {
        log.error(`Settings out of range, time(${time})`);
        interaction
          .reply({
            content: "設定を変更できませんでした",
            ephemeral: true,
          })
          .catch(() => {});
      }
      break;
    }
    case "show": {
      let param1 = "",
        param2 = "",
        param3 = "",
        param4 = "";

      if (settings.autojoin)
        (param1 = "有効"),
          (param2 = ` <#${settings.readch}>の内容を読み上げます。`);
      else param1 = "無効";
      if (settings.voicenotice)
        (param3 = "有効"),
          (param4 = ` <#${settings.voicenoticechannel}>に\n> ${settings.voicenoticetext}\n　と送信します。`);
      else param3 = "無効";
      interaction
        .reply({
          content: `現在の設定一覧です。\n自動参加は${param1}です。%${param2}\nボイスチャンネル参加時の通知は${param3}です。${param4}`,
          ephemeral: true,
        })
        .catch(() => {});

      const clock = settings.clock;
      if (clock[0])
        interaction
          .followUp({
            content: `午前0時/午後12時(24時)に<#${clock.channel}>へ\n> ${clock[0]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[1])
        interaction
          .followUp({
            content: `午前1時に<#${clock.channel}>へ\n> ${clock[1]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[2])
        interaction
          .followUp({
            content: `午前2時に<#${clock.channel}>へ\n> ${clock[2]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[3])
        interaction
          .followUp({
            content: `午前3時に<#${clock.channel}>へ\n> ${clock[3]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[4])
        interaction
          .followUp({
            content: `午前4時に<#${clock.channel}>へ\n> ${clock[4]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[5])
        interaction
          .followUp({
            content: `午前5時に<#${clock.channel}>へ\n> ${clock[5]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[6])
        interaction
          .followUp({
            content: `午前6時に<#${clock.channel}>へ\n> ${clock[6]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[7])
        interaction
          .followUp({
            content: `午前7時に<#${clock.channel}>へ\n> ${clock[7]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[8])
        interaction
          .followUp({
            content: `午前8時に<#${clock.channel}>へ\n> ${clock[8]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[9])
        interaction
          .followUp({
            content: `午前9時に<#${clock.channel}>へ\n> ${clock[9]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[10])
        interaction
          .followUp({
            content: `午前10時に<#${clock.channel}>へ\n> ${clock[10]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[11])
        interaction
          .followUp({
            content: `午前11時に<#${clock.channel}>へ\n> ${clock[11]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[12])
        interaction
          .followUp({
            content: `午前12時/午後0時に<#${clock.channel}>へ\n> ${clock[12]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[13])
        interaction
          .followUp({
            content: `午後1時(13時)に<#${clock.channel}>へ\n> ${clock[13]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[14])
        interaction
          .followUp({
            content: `午後2時(14時)に<#${clock.channel}>へ\n> ${clock[14]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[15])
        interaction
          .followUp({
            content: `午後3時(15時)に<#${clock.channel}>へ\n> ${clock[15]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[16])
        interaction
          .followUp({
            content: `午後3時(15時)に<#${clock.channel}>へ\n> ${clock[16]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[17])
        interaction
          .followUp({
            content: `午後5時(17時)に<#${clock.channel}>へ\n> ${clock[17]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[18])
        interaction
          .followUp({
            content: `午後6時(18時)に<#${clock.channel}>へ\n> ${clock[18]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[19])
        interaction
          .followUp({
            content: `午後7時(19時)に<#${clock.channel}>へ\n> ${clock[19]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[20])
        interaction
          .followUp({
            content: `午後8時(20時)に<#${clock.channel}>へ\n> ${clock[20]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[21])
        interaction
          .followUp({
            content: `午後9時(21時)に<#${clock.channel}>へ\n> ${clock[21]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[22])
        interaction
          .followUp({
            content: `午後10時(22時)に<#${clock.channel}>へ\n> ${clock[22]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      if (clock[23])
        interaction
          .followUp({
            content: `午後11時(23時)に<#${clock.channel}>へ\n> ${clock[23]}\nと送信します。`,
            ephemeral: true,
          })
          .catch(() => {});
      break;
    }
    case "autodelete": {
      const channel = interaction.options.getChannel<
        ChannelType.GuildText | ChannelType.GuildVoice
      >("channel", true);
      const time = interaction.options.getInteger("time", false);
      if (time === 0) {
        settings.autoDeleteChannels = settings.autoDeleteChannels.filter(
          (c) => c.id !== channel.id
        );
        interaction
          .reply({
            content: `${channel.name} でのメッセージ削除を解除しました。`,
            ephemeral: true,
          })
          .catch(() => {});
      } else {
        settings.autoDeleteChannels.push({
          id: channel.id,
          time: time ?? 24,
        });
        interaction
          .reply({
            content: `${channel.name} で ${
              time ?? 24
            } 時間後にメッセージを削除するように設定しました。`,
            ephemeral: true,
          })
          .catch(() => {});
        channel.messages.cache.forEach((message) => {
          setTimeout(() => {
            message.delete().catch(() => {});
          }, 1000 * 60 * 60 * (time ?? 24));
        });
      }
      break;
    }
    default: {
      break;
    }
  }
};
