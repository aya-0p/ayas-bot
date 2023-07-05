export declare const env: Env;

declare interface Env {
  project: ProjectEnv;
  control: ControlEnv;
  log: LogEnv;
  main: MainEnv;
}

declare interface ProjectEnv {
  ports: Ports;
  /**
   * テストモードかどうか
   */
  test: boolean;
  /**
   * この一つ上のディレクトリへのフルパス
   * - 例: /home/name/bot/
   */
  rootDirPath: string;
  ownerUserId: string;
  version: string;
}

declare interface Ports {
  control: number;
  log: number;
  main: number;
}

declare interface ControlEnv {}

declare interface LogEnv {
  discordToken: string;
  channels: Array<ChannelDatas>;
  defaultChannel: string;
  mentionChannel: string;
  webChannel: string;
}

declare interface MainEnv {
  /**
   * discord token
   */
  discordToken: string;
  bot: BotEnv;
  /**
   * voices
   */
  voice: Array<VoiceEnv>;
  database: DBPaths;
  voicevox: VoicevoxEnv;
}

declare interface BotEnv {
  /**
   * testing and logging guild id
   */
  testGuildId: string;
  /**
   * `(temp)/bot/main`
   */
  temporaryDirPath: string;
  googleTranslateUrl: string;
}

declare interface VoiceEnv {
  value: number;
  name: string;
}

declare interface DBPaths {
  /**
   * `.../plan.db`
   */
  plan: string;
  /**
   * `.../settings.db`
   */
  settings: string;
  /**
   * `.../status.json`
   */
  status: string;
  /**
   * `.../voice.db`
   */
  voice: string;
}

declare interface VoicevoxEnv {
  openjtalkDir: string;
}

declare interface ChannelDatas {
  /**
   * 受け取るID
   */
  receiveId: string | undefined;
  /**
   * 送信するチャンネルID
   */
  sendChannelId: string;
}
