import {
  ApplicationCommandDataResolvable,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandChannelOption,
  ChannelType,
  SlashCommandSubcommandBuilder,
  SlashCommandBooleanOption,
  SlashCommandIntegerOption,
  SlashCommandNumberOption,
} from "discord.js";
/**
 * スラッシュコマンドなどの内容 - 一般用
 */
export const commandData: Array<ApplicationCommandDataResolvable> = [];

commandData.push(
  new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("ボイスチャンネルから退出")
    .setDMPermission(false)
);

commandData.push(
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("コマンドの使い方を表示")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("command")
        .setDescription("ヘルプを表示するコマンド")
        .setRequired(true)
        .setChoices(
          { name: "/join", value: "join" },
          { name: "/disconnect", value: "disconnect" },
          { name: "/read", value: "read" },
          { name: "/reply", value: "reply" },
          { name: "/settings", value: "settings" },
          { name: "/voice", value: "voice" },
          { name: "/report", value: "report" },
          { name: "/plan", value: "plan" }
        )
    )
    .setDMPermission(true)
);

commandData.push(
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("ボイスチャンネルに参加")
    .setDMPermission(false)
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName("channel")
        .setDescription(
          "接続先のチャンネルを指定します。（未選択で参加中のボイスチャンネルに参加します。）"
        )
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice)
    )
);

commandData.push(
  new SlashCommandBuilder()
    .setName("read")
    .setDescription("読み替えの編集")
    .setDMPermission(false)
    .addStringOption(
      new SlashCommandStringOption()
        .setName("mode")
        .setDescription("編集モードを選択")
        .setRequired(true)
        .setChoices(
          { name: "追加", value: "add" },
          { name: "削除", value: "delete" },
          { name: "すべて表示", value: "show" }
        )
    )
);

commandData.push(
  new SlashCommandBuilder()
    .setName("reply")
    .setDescription("自動返信")
    .setDMPermission(false)
    .addStringOption(
      new SlashCommandStringOption()
        .setName("mode")
        .setDescription("編集モードを選択")
        .setRequired(true)
        .setChoices(
          { name: "追加", value: "add" },
          { name: "削除", value: "delete" },
          { name: "すべて表示", value: "show" }
        )
    )
);

commandData.push(
  new SlashCommandBuilder()
    .setName("report")
    .setDescription("いろいろなことを報告できます。")
    .setDMPermission(true)
);

commandData.push(
  new SlashCommandBuilder()
    .setName("settings")
    .setDescription("設定を変更")
    .setDMPermission(false)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("autojoin")
        .setDescription("ボイスチャンネルへの自動参加")
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("to")
            .setDescription("設定内容")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("vcnotice")
        .setDescription("ボイスチャンネル開始時のお知らせ")
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("to")
            .setDescription("設定内容")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("clock")
        .setDescription("時報の設定")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("time")
            .setDescription("時刻")
            .setRequired(true)
            .setChoices(
              { value: 1, name: "午前1時" },
              { value: 2, name: "午前2時" },
              { value: 3, name: "午前3時" },
              { value: 4, name: "午前4時" },
              { value: 5, name: "午前5時" },
              { value: 6, name: "午前6時" },
              { value: 7, name: "午前7時" },
              { value: 8, name: "午前8時" },
              { value: 9, name: "午前9時" },
              { value: 10, name: "午前10時" },
              { value: 11, name: "午前11時" },
              { value: 12, name: "午前12時/午後0時" },
              { value: 13, name: "午後1時(13時)" },
              { value: 14, name: "午後2時(14時)" },
              { value: 15, name: "午後3時(15時)" },
              { value: 16, name: "午後4時(16時)" },
              { value: 17, name: "午後5時(17時)" },
              { value: 18, name: "午後6時(18時)" },
              { value: 19, name: "午後7時(19時)" },
              { value: 20, name: "午後8時(20時)" },
              { value: 21, name: "午後9時(21時)" },
              { value: 22, name: "午後10時(22時)" },
              { value: 23, name: "午後11時(23時)" },
              { value: 0, name: "午前0時/午後12時(24時)" }
            )
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("to")
            .setDescription("設定内容")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("autodelete")
        .setDescription("自動削除の設定")
        .addChannelOption(
          new SlashCommandChannelOption()
            .setName("channel")
            .setDescription("自動削除されるチャンネルを指定してください。")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
        )
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("time")
            .setDescription("削除されるまでの時間(hour), 未指定で24時間(1日)")
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("show")
        .setDescription("現在の設定を表示します。")
    )
);

commandData.push(
  new SlashCommandBuilder()
    .setName("voice")
    .setDescription("声の変更")
    .setDMPermission(false)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox1")
        .setDescription("VOICEVOXから選択(1期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 0, name: "四国めたん-あまあま" },
              { value: 2, name: "四国めたん-ノーマル" },
              { value: 4, name: "四国めたん-セクシー" },
              { value: 6, name: "四国めたん-ツンツン" },
              { value: 36, name: "四国めたん-ささやき" },
              { value: 37, name: "四国めたん-ヒソヒソ" },
              { value: 1, name: "ずんだもん-あまあま" },
              { value: 3, name: "ずんだもん-ノーマル" },
              { value: 5, name: "ずんだもん-セクシー" },
              { value: 7, name: "ずんだもん-ツンツン" },
              { value: 22, name: "ずんだもん-ささやき" },
              { value: 38, name: "ずんだもん-ヒソヒソ" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox2")
        .setDescription("VOICEVOXから選択(2期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 8, name: "春日部つむぎ-ノーマル" },
              { value: 9, name: "波音リツ-ノーマル" },
              { value: 65, name: "波音リツ-クイーン" },
              { value: 10, name: "雨晴はう-ノーマル" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox3")
        .setDescription("VOICEVOXから選択(3期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 11, name: "玄野武宏-ノーマル" },
              { value: 39, name: "玄野武宏-喜び" },
              { value: 40, name: "玄野武宏-ツンギレ" },
              { value: 41, name: "玄野武宏-悲しみ" },
              { value: 12, name: "白上虎太郎-ふつう" },
              { value: 32, name: "白上虎太郎-わーい" },
              { value: 33, name: "白上虎太郎-びくびく" },
              { value: 34, name: "白上虎太郎-おこ" },
              { value: 35, name: "白上虎太郎-びえーん" },
              { value: 13, name: "青山龍星-ノーマル" },
              { value: 14, name: "冥鳴ひまり-ノーマル" },
              { value: 15, name: "九州そら-あまあま" },
              { value: 16, name: "九州そら-ノーマル" },
              { value: 17, name: "九州そら-セクシー" },
              { value: 18, name: "九州そら-ツンツン" },
              { value: 19, name: "九州そら-ささやき" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox4")
        .setDescription("VOICEVOXから選択(4期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 20, name: "もち子(cv明日葉よもぎ)-ノーマル" },
              { value: 66, name: "もち子(cv明日葉よもぎ)-セクシー／あん子" },
              { value: 21, name: "剣崎雌雄-ノーマル" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox5")
        .setDescription("VOICEVOXから選択(5期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 23, name: "WhiteCUL-ノーマル" },
              { value: 24, name: "WhiteCUL-たのしい" },
              { value: 25, name: "WhiteCUL-かなしい" },
              { value: 26, name: "WhiteCUL-びえーん" },
              { value: 27, name: "後鬼-人間ver." },
              { value: 28, name: "後鬼-ぬいぐるみver." },
              { value: 29, name: "No7-ノーマル" },
              { value: 30, name: "No7-アナウンス" },
              { value: 31, name: "No7-読み聞かせ" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox6")
        .setDescription("VOICEVOXから選択(6期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 42, name: "ちび式じい-ノーマル" },
              { value: 43, name: "櫻歌ミコ-ノーマル" },
              { value: 44, name: "櫻歌ミコ-第二形態" },
              { value: 45, name: "櫻歌ミコ-ロリ" },
              { value: 46, name: "小夜/SAYO-ノーマル" },
              { value: 47, name: "ナースロボ＿タイプＴ-ノーマル" },
              { value: 48, name: "ナースロボ＿タイプＴ-楽々" },
              { value: 49, name: "ナースロボ＿タイプＴ-恐怖" },
              { value: 50, name: "ナースロボ＿タイプＴ-内緒話" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("voicevox7")
        .setDescription("VOICEVOXから選択(7期)")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("声の名前")
            .setRequired(false)
            .setChoices(
              { value: 51, name: "†聖騎士 紅桜†-ノーマル" },
              { value: 52, name: "雀松朱司-ノーマル" },
              { value: 53, name: "麒ヶ島宗麟-ノーマル" },
              { value: 54, name: "春歌ナナ-ノーマル" },
              { value: 55, name: "猫使アル-ノーマル" },
              { value: 56, name: "猫使アル-おちつき" },
              { value: 57, name: "猫使アル-うきうき" },
              { value: 58, name: "猫使ビィ-ノーマル" },
              { value: 59, name: "猫使ビィ-おちつき" },
              { value: 60, name: "猫使ビィ-人見知り" },
              { value: 61, name: "中国うさぎ-ノーマル" },
              { value: 62, name: "中国うさぎ-おどろき" },
              { value: 63, name: "中国うさぎ-こわがり" },
              { value: 64, name: "中国うさぎ-へろへろ" }
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("speed")
            .setDescription("速度(0より大きく5より小さい数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("pitch")
            .setDescription("高さ(-1から1までの数字, デフォルト0)")
            .setMaxValue(1)
            .setMinValue(-1)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("intonation")
            .setDescription("抑揚(0から2までの数字, デフォルト1)")
            .setMaxValue(2)
            .setMinValue(0)
            .setRequired(false)
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("volume")
            .setDescription("音量(0より大きく1までの数字, デフォルト1)")
            .setMaxValue(5)
            .setMinValue(0)
            .setRequired(false)
        )
    )
);

commandData.push(
  new SlashCommandBuilder()
    .setName("plan")
    .setDescription("予定")
    .setDMPermission(false)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("予定を追加します。")
        .addChannelOption(
          new SlashCommandChannelOption()
            .setName("channel")
            .setDescription("開始通知などを送るチャンネル")
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildVoice,
              ChannelType.PublicThread,
              ChannelType.PrivateThread
            )
        )
        .addNumberOption(
          new SlashCommandNumberOption()
            .setName("time")
            .setDescription("予定開始前通知を送る時間を指定")
            .setChoices(
              { value: 1, name: "1分前" },
              { value: 2, name: "5分前" },
              { value: 3, name: "1時間前" },
              { value: 4, name: "2時間前" },
              { value: 5, name: "1日前" },
              { value: 6, name: "1週間前" },
              { value: 7, name: "1か月前" },
              { value: 8, name: "1年前" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("delete")
        .setDescription("予定を削除します。")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("title")
            .setDescription("削除する予定の名前")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("show")
        .setDescription("予定を表示します。")
    )
);
