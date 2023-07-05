import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default (interaction: ChatInputCommandInteraction): void => {
  const cmd = interaction.options.getString("command", true);
  switch (cmd) {
    case "disconnect":
      disconnect(interaction);
      break;
    case "join":
      join(interaction);
      break;
    case "read":
      read(interaction);
      break;
    case "reply":
      reply(interaction);
      break;
    case "report":
      report(interaction);
      break;
    case "settings":
      settings(interaction);
      break;
    case "voice":
      voice(interaction);
      break;
    case "plan":
      plan(interaction);
    default:
      break;
  }
};

const disconnect = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/disconnect")
    .setDescription("Botを参加中のボイスチャンネルから退出させます。")
    .setColor(2848233);
  interaction.reply({ embeds: [embed], ephemeral: true });
};
const join = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/join")
    .setDescription(
      "Botをボイスチャンネルに参加させます。このコマンドを実行したチャンネルを読み上げます。"
    )
    .setColor(2848233)
    .setFields([
      {
        name: "channel",
        value:
          "Botが参加するボイスチャンネルを指定します。指定しないと現在参加しているボイスチャンネルに参加します。",
      },
    ]);
  interaction.reply({ embeds: [embed], ephemeral: true });
};
const read = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/read")
    .setDescription("読み上げる際の読み方を調整します。")
    .setColor(2848233);
  interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
};
const reply = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/reply")
    .setDescription("チャットへの自動的な返信を設定します。")
    .setColor(2848233);
  interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
};
const report = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/report")
    .setDescription("Botの問題や意見などを報告します。")
    .setColor(2848233);
  interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
};
const settings = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/settings")
    .setDescription("様々な設定を行います。なお、声の変更は/voiceで行います。")
    .setColor(2848233)
    .setFields([
      {
        name: "autojoin to",
        value:
          "Botが自動的にボイスチャンネルに参加するようになります。この設定コマンドを実行したチャンネルのメッセージを読み上げます。",
      },
      {
        name: "vcnotice to",
        value:
          "ボイスチャンネルに誰かが参加したときにお知らせを行います。この設定コマンドを実行したチャンネルにメッセージを送ります。",
      },
      {
        name: "clock time to",
        value:
          "指定時間にメッセージを送ります。この設定コマンドを実行したチャンネルにメッセージを送ります。",
      },
      {
        name: "autodelete channel time",
        value:
          "指定されたチャンネルにメッセージ送信後、指定時間後に自動的に削除するようにします。",
      },
      {
        name: "show",
        value: "現在の設定状況を表示します。",
      },
    ]);
  interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
};
const voice = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/voice")
    .setDescription("読み上げで利用している声を変更します。")
    .setColor(2848233)
    .setFields([
      {
        name: "id",
        value: "声の名前",
      },
      {
        name: "speed",
        value: "声の速度",
      },
      {
        name: "pitch",
        value: "声の高さ",
      },
      {
        name: "intonation",
        value: "声の抑揚",
      },
      {
        name: "volume",
        value: "声の大きさ",
      },
    ]);
  interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
};
const plan = (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("/plan")
    .setDescription("予定を設定/削除します")
    .setColor(2848233)
    .setFields([
      {
        name: "add",
        value: "予定を追加します。",
      },
      {
        name: "add/channel",
        value: "予定の開始前に通知を送るチャンネルを指定します。",
      },
      {
        name: "add/time",
        value: "予定開始前に通知を送る際の、送る時刻を指定します。",
      },
      {
        name: "delete title",
        value: "指定したタイトルの予定を削除します。",
      },
      {
        name: "show",
        value: "予定をすべて表示します。",
      },
    ]);
  interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
};
