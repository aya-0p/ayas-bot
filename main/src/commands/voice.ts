import addonLog from "../addons/index.js";
import getSettings from "../scripts/settings.js";
import { ChatInputGuildCommandInteraction } from "../scripts/utility.js";
import { env } from "../../../env/index.js";

const speakersArray = env.main.voice;
const speakers: Map<number, string> = new Map();
speakersArray.forEach((element) => {
  speakers.set(element.value, element.name);
});

export default async (interaction: ChatInputGuildCommandInteraction) => {
  const guild = interaction.guild;
  const member = interaction.member;
  const settings = getSettings(guild.id).voice.get(member.id);
  const currentSettings = settings?.voices.get(settings.set);
  const cmdVoiceId = interaction.options.getInteger("id", false);
  const cmdVoiceVolume = interaction.options.getNumber("volume", false);
  const cmdVoicePitch = interaction.options.getNumber("pitch", false);
  const cmdVoiceSpeed = interaction.options.getNumber("speed", false);
  const cmdVoiceIntonation = interaction.options.getNumber("intonation", false);
  const interactionData = (() => {
    const id = cmdVoiceId ?? currentSettings?.id ?? 0;
    return {
      id: id,
      volume: cmdVoiceVolume ?? settings?.voices.get(id)?.volume ?? 1,
      pitch: cmdVoicePitch ?? settings?.voices.get(id)?.pitch ?? 0,
      speed: cmdVoiceSpeed ?? settings?.voices.get(id)?.speed ?? 1,
      intonation:
        cmdVoiceIntonation ?? settings?.voices.get(id)?.intonation ?? 1,
    };
  })();
  if (interactionData.speed <= 0 || interactionData.speed >= 5)
    return interaction
      .reply({
        content:
          "設定した声の速度は範囲外です。0より大きく5より小さい数字に設定してください。",
        ephemeral: true,
      })
      .catch(() => {});
  if (interactionData.pitch > 1 || interactionData.pitch < -1)
    return interaction
      .reply({
        content:
          "設定した声の高さは範囲外です。-1から1までの数字に設定してください。",
        ephemeral: true,
      })
      .catch(() => {});
  if (interactionData.intonation > 2 || interactionData.intonation < 0)
    return interaction
      .reply({
        content:
          "設定した抑揚は範囲外です。0から2までの数字に設定してください。",
        ephemeral: true,
      })
      .catch(() => {});
  if (interactionData.volume <= 0 || interactionData.volume > 1)
    return interaction
      .reply({
        content:
          "設定した音量は範囲外です。0より大きく1までの数字に設定してください。",
        ephemeral: true,
      })
      .catch(() => {});

  if (
    cmdVoiceId === null &&
    cmdVoiceIntonation === null &&
    cmdVoicePitch === null &&
    cmdVoiceSpeed === null &&
    cmdVoiceVolume === null
  ) {
    //voiceId, intonation, pitch, speed, volumeがすべて入力されていない場合
    let rep = "";
    settings
      ? settings.voices.forEach((v) => {
          rep += `\n\n　　声「${
            speakers.get(v.id) ?? "不明"
          }」の設定:\n　　速さ(speed): ${String(
            v.speed ?? 1
          )}\n　　高さ(pitch): ${String(
            v.pitch ?? 0
          )}\n　　抑揚(intonation): ${String(
            v.intonation ?? 1
          )}\n　　音量(volume): ${String(v.volume ?? 1)}`;
        })
      : (rep = `\n\n　　声「${speakers.get(
          0
        )}」の設定:\n　　速さ(speed): 1\n　　高さ(pitch): 0\n　　抑揚(intonation): 1\n　　音量(volume): 1`);
    interaction
      .reply({
        content: `音声の設定状況です。\n現在は${
          speakers.get(settings?.set ?? 0) ?? "不明"
        }の声で喋っています。\n各声の設定...\n${rep}`,
        ephemeral: true,
      })
      .catch(() => {});
  } else if ((settings?.set ?? 0) === interactionData.id) {
    //voiceIdが現在設定されているものと入力されたものが同じ場合
    if (settings) {
      settings.voices.set(interactionData.id, interactionData);
    } else {
      const t_v = new Map();
      t_v.set(interactionData.id, interactionData);
    }
    interaction
      .reply({
        content: "あなたの声の設定を変更しました。",
        ephemeral: true,
      })
      .catch(() => {});
    await addonLog.commands.voice(
      interaction,
      interactionData,
      speakers.get(interactionData.id) ?? "Unknown"
    );
  } else {
    //voiceIdが現在設定されているものと入力されたものが異なる場合
    if (settings) {
      settings.set = interactionData.id;
      settings.voices.set(interactionData.id, interactionData);
    } else {
      const t_v = new Map();
      t_v.set(interactionData.id, interactionData);
      getSettings(guild.id).voice.set(interaction.user.id, {
        set: interactionData.id,
        voices: t_v,
      });
    }
    interaction
      .reply({
        content: "あなたの声を変更しました。",
        ephemeral: true,
      })
      .catch(() => {});
    await addonLog.commands.voice(
      interaction,
      interactionData,
      speakers.get(interactionData.id) ?? "Unknown"
    );
  }
};
