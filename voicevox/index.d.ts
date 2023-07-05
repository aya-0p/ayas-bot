export declare function voicevox(
  text: string,
  speakerId: number,
  options?: SynthesisOptions
): Promise<Buffer>;
export declare function init(dir: string): void;
interface SynthesisOptions {
  speed?: number;
  pitch?: number;
  intonation?: number;
  volume?: number;
}
