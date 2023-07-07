import { client } from "../server.js";
import * as log from "../scripts/log.js";
import {
  ChatInputCommandInteraction,
  DMChannel,
  GuildMember,
} from "discord.js";

import disconnect from "../commands/disconnect.js";
import help from "../commands/help.js";
import join from "../commands/join.js";
import read from "../commands/read.js";
import reply from "../commands/reply.js";
import report from "../commands/report.js";
import settings from "../commands/settings.js";
import voice from "../commands/voice.js";
import plan from "../commands/plan.js";

import { ChatInputGuildCommandInteraction } from "../scripts/utility.js";

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (checkChatInputGuildCommandInteraction(interaction)) {
      runInteraction(interaction);
    } else {
      runInteractionDM(interaction);
    }
  }
});

const runInteraction = (
  interaction: ChatInputGuildCommandInteraction
): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      switch (interaction.command?.name) {
        case "disconnect":
          disconnect(interaction);
          break;
        case "help":
          help(interaction);
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
          break;
      }
      resolve();
    } catch (err) {
      log.error(err);
      if (interaction.replied) {
        try {
          interaction.editReply("実行中にエラーが発生しました。");
        } catch {}
      } else {
        interaction.reply({
          content: "実行中にエラーが発生しました。",
          ephemeral: true,
        });
      }
      reject();
    }
  });

const runInteractionDM = (
  interaction: ChatInputCommandInteraction
): Promise<void> =>
  new Promise((resolve) => {
    try {
      interaction.user.createDM();
      switch (interaction.command?.name) {
        case "help":
          help(interaction);
          break;
        case "report":
          report(interaction);
          break;
        default:
          interaction.reply({
            content: "DMでは/help, /reportのみ利用できます。",
          });
      }
      resolve();
    } catch (err) {
      log.error(err);
      if (interaction.replied) {
        try {
          interaction.editReply("実行中にエラーが発生しました。");
        } catch {}
      } else {
        interaction.reply({
          content: "DMでは/help, /reportのみ利用できます。",
        });
      }
      resolve();
    }
  });

function checkChatInputGuildCommandInteraction(
  interaction: ChatInputCommandInteraction
): interaction is ChatInputGuildCommandInteraction {
  if (
    interaction.guild === null ||
    interaction.channel instanceof DMChannel ||
    !(interaction.member instanceof GuildMember)
  )
    return false;
  else return true;
}
