import bindings from "voicevox";
const voicevoxCore = bindings("voicevox");
export const voicevox = (text, speakerId, options) =>
  new Promise((resolve, reject) => {
    const audioQueryResult = voicevoxCore.audioQuery(text, speakerId);
    if (!audioQueryResult.error) {
      const data = JSON.parse(audioQueryResult.data);
      data.speed_scale = options?.speed ?? 1;
      data.pitch_scale = options?.pitch ?? 0;
      data.intonation_scale = options?.intonation ?? 1;
      data.volume_scale = options?.volume ?? 1;
      data.pre_phoneme_length = 0;
      data.post_phoneme_length = 0;
      const synthesisResult = voicevoxCore.synthesis(
        JSON.stringify(data),
        speakerId
      );
      if (!synthesisResult.error) resolve(synthesisResult.data);
      else reject(synthesisResult.error);
    } else reject(audioQueryResult.error);
  });
export const init = (dir) => {
  voicevoxCore.initialize(dir);
};
