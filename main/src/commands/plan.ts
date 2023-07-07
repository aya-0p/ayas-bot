import {
  ChatInputGuildCommandInteraction,
  ExString,
  str2num,
} from "../scripts/utility.js";
import moment from "moment";
import {
  ActionRowBuilder,
  Collection,
  Guild,
  ModalBuilder,
  TextBasedChannel,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  ThreadChannel,
  VoiceChannel,
} from "discord.js";
import { setPlan, getPlans, deletePlan } from "../database/planDB.js";
import { scheduleJob } from "node-schedule";
const plans: Collection<string, Plan> = new Collection();
getPlans(plans);
export default (interaction: ChatInputGuildCommandInteraction) => {
  const type = interaction.options.getSubcommand();
  if (type === "add") {
    const channel = interaction.options.getChannel("channel", true);
    const time = interaction.options.getNumber("time", false);
    interaction
      .showModal(
        new ModalBuilder()
          .setTitle("予定の設定")
          .setCustomId("plan_m")
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId("plan_name")
                .setLabel("予定の名前")
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId("plan_desc")
                .setLabel("予定の内容")
                .setRequired(false)
                .setStyle(TextInputStyle.Paragraph)
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setCustomId("plan_date")
                .setLabel("予定の日時")
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
            )
          )
      )
      .then(() => {
        interaction
          .awaitModalSubmit({ time: 24 * 60 * 60 * 1000 })
          .then((modal) => {
            try {
              const name = modal.fields.fields.get("plan_name")?.value;
              const desc = modal.fields.fields.get("plan_desc")?.value;
              const date_ = modal.fields.fields.get("plan_date")?.value;
              if (name && date_) {
                const date = parseDate(date_);
                if (
                  channel instanceof TextChannel ||
                  channel instanceof VoiceChannel ||
                  channel instanceof ThreadChannel
                ) {
                  setPlan_(interaction.guild, date, time, channel, name, desc);
                  modal
                    .reply({
                      content: "予定を追加しました。",
                      ephemeral: true,
                    })
                    .catch(() => {});
                } else {
                  modal
                    .reply({
                      content:
                        "指定したチャンネルにメッセージを送ることができません。",
                      ephemeral: true,
                    })
                    .catch(() => {});
                }
              } else {
                modal
                  .reply({
                    content: "予定の日時を理解することができませんでした。",
                    ephemeral: true,
                  })
                  .catch(() => {});
              }
            } catch {
              modal
                .reply({
                  content: "予定の日時を理解することができませんでした。",
                  ephemeral: true,
                })
                .catch(() => {});
            }
          })
          .catch(() => {});
      });
  } else if (type === "delete") {
    const name = interaction.options.getString("title", true);
    deletePlan_(interaction.guild.id, name);
    interaction
      .reply({ content: "削除しました。", ephemeral: true })
      .catch(() => {});
  } else {
    let planList = "";
    plans
      .filter((plan) => plan.guild.id === interaction.guild.id)
      .forEach((plan) => {
        planList += `\n${plan.name}(${plan.date.format(
          "YYYY-MM-DD HH:mm:ss"
        )}開始)`;
      });
    if (planList === "")
      return interaction
        .reply({
          content: "予定はありません",
          ephemeral: true,
        })
        .catch(() => {});
    return interaction
      .reply({
        content: "予定は次の通りです。\n" + planList,
        ephemeral: true,
      })
      .catch(() => {});
  }
};
const setPlan_ = (
  guild: Guild,
  date: moment.Moment,
  n_time: number | null,
  n_channel: TextBasedChannel,
  name: string,
  description: string | undefined
): boolean => {
  if (date.isBefore()) return false;
  const time = (() => {
    switch (n_time) {
      case 1:
        return "1m";
      case 2:
        return "5m";
      case 3:
        return "1h";
      case 4:
        return "2h";
      case 5:
        return "1d";
      case 6:
        return "1w";
      case 7:
        return "1m";
      case 8:
        return "1y";
      default:
        return undefined;
    }
  })();
  plans.set(`${guild.id}_${name}`, {
    guild: guild,
    date: date,
    notificationTime: time,
    notificationDate: getDateBefore(date, time),
    notificationChannel: n_channel,
    name: name,
    description: description,
  });
  setPlan({
    guild: guild,
    date: date,
    notificationTime: time,
    notificationDate: getDateBefore(date, time),
    notificationChannel: n_channel,
    name: name,
    description: description,
  });
  return true;
};

const deletePlan_ = (guild: string, name: string) => {
  plans.delete(`${guild}_${name}`);
  deletePlan(guild, name);
};
scheduleJob("* * * * * *", () => {
  plans
    .filter((plan) => plan.date.isBefore())
    .forEach((plan) => {
      deletePlan_(plan.guild.id, plan.name);
      plan.notificationChannel
        .send({
          content: `予定「${plan.name}」が始まりました！\n${plan.description}`,
        })
        .catch(() => {});
    });
  plans
    .filter((plan) => plan.notificationDate?.isBefore())
    .forEach((plan) => {
      plan.notificationChannel
        .send({
          content: `予定「${plan.name}」がもうすぐ始まります！\n${plan.description}`,
        })
        .catch(() => {});
      plan.notificationDate = undefined;
      plan.notificationTime = undefined;
    });
});

const parseDate = (datestr: string): moment.Moment => {
  if (new Date(datestr).toString() !== "Invalid Date")
    return moment(new Date(datestr));
  const date = moment();
  date.set("h", 0);
  date.set("m", 0);
  date.set("s", 0);
  const dateString = new ExString(datestr);
  dateString.replace(/[一二三四五六七八九十百千万億兆]+/, (n) => {
    return String(str2num(n));
  });
  dateString.replace("１", "1");
  dateString.replace("２", "2");
  dateString.replace("３", "3");
  dateString.replace("４", "4");
  dateString.replace("５", "5");
  dateString.replace("６", "6");
  dateString.replace("７", "7");
  dateString.replace("８", "8");
  dateString.replace("９", "9");
  dateString.replace("０", "0");
  dateString.replace(/睦月|むつき/, " 1月");
  dateString.replace(/如月|きさらぎ/, " 2月");
  dateString.replace(/弥生|やよい/, " 3月");
  dateString.replace(/卯月|うづき/, " 4月");
  dateString.replace(/皐月|さつき/, " 5月");
  dateString.replace(/水無月|みなづき|みなつき/, " 6月");
  dateString.replace(/文月|ふみづき|ふづき/, " 7月");
  dateString.replace(/葉月|はづき|はつき/, " 8月");
  dateString.replace(/長月|ながつき|ながづき/, " 9月");
  dateString.replace(/神無月|かんなづき/, " 10月");
  dateString.replace(/霜月|しもつき/, " 11月");
  dateString.replace(/師走|しわす/, " 12月");
  dateString.replace("正午", " 12時");
  dateString.replace("正子", " 0時");
  dateString.replace("午前", " ");
  dateString.replace(/(午|ご)(後|ご)0(時|じ)/, " 12時");
  dateString.replace(/(午|ご)(後|ご)1(時|じ)/, " 13時");
  dateString.replace(/(午|ご)(後|ご)2(時|じ)/, " 14時");
  dateString.replace(/(午|ご)(後|ご)3(時|じ)/, " 15時");
  dateString.replace(/(午|ご)(後|ご)4(時|じ)/, " 16時");
  dateString.replace(/(午|ご)(後|ご)5(時|じ)/, " 17時");
  dateString.replace(/(午|ご)(後|ご)6(時|じ)/, " 18時");
  dateString.replace(/(午|ご)(後|ご)7(時|じ)/, " 19時");
  dateString.replace(/(午|ご)(後|ご)8(時|じ)/, " 20時");
  dateString.replace(/(午|ご)(後|ご)9(時|じ)/, " 21時");
  dateString.replace(/(午|ご)(後|ご)10(時|じ)/, " 22時");
  dateString.replace(/(午|ご)(後|ご)11(時|じ)/, " 23時");
  dateString.replace(/子|夜半|やはん/, " 0時");
  dateString.replace(/丑|鶏鳴|けいめい/, " 3時");
  dateString.replace(/寅|平旦|へいたん/, " 5時");
  dateString.replace(/卯|日出|にっしゅつ/, " 7時");
  dateString.replace(/辰|食時|しょくじ/, " 9時");
  dateString.replace(/巳|偶中|ぐうちゅう/, " 11時");
  dateString.replace(/午|日中|にっちゅう/, " 13時");
  dateString.replace(/未|日昳|にってつ/, " 15時");
  dateString.replace(/申|晡時|ほじ/, " 17時");
  dateString.replace(/酉|日入|にちにゅう/, " 19時");
  dateString.replace(/戌|黄昏|こうこん/, " 21時");
  dateString.replace(/亥|人定|にんじょう/, " 23時");
  //年
  if (dateString.toString().includes("来年")) date.add(1, "year");
  if (dateString.toString().includes("再来年")) date.add(2, "year");
  if (dateString.toString().includes("去年")) date.subtract(1, "year");
  if (dateString.toString().includes("らいねん")) date.add(1, "year");
  if (dateString.toString().includes("さらいねん")) date.add(2, "year");
  if (dateString.toString().includes("きょねん")) date.subtract(1, "year");
  date.add(
    Number(
      dateString.toString().match(/(?<year>\d+)(年|ねん)(後|ご)/)?.groups
        ?.year ?? 0
    ),
    "year"
  );
  date.subtract(
    Number(
      dateString.toString().match(/(?<year>\d+)(年|ねん)(前|まえ)/)?.groups
        ?.year ?? 0
    ),
    "year"
  );
  date.set(
    "year",
    Number(
      dateString.toString().match(/(?<year>\d+)(年|ねん)(?!後|ご|前|まえ)/)
        ?.groups?.year ?? date.year()
    )
  );
  //月
  if (dateString.toString().includes("来月")) date.add(1, "month");
  if (dateString.toString().includes("再来月")) date.add(2, "month");
  if (dateString.toString().includes("先月")) date.subtract(1, "month");
  if (dateString.toString().includes("らいげつ")) date.add(1, "month");
  if (dateString.toString().includes("さらいげつ")) date.add(2, "month");
  if (dateString.toString().includes("せんげつ")) date.subtract(1, "month");
  date.add(
    Number(
      dateString.toString().match(/(?<month>\d+)(か|カ|ヶ|ヵ)(月|げつ)(後|ご)/)
        ?.groups?.month ?? 0
    ),
    "month"
  );
  date.subtract(
    Number(
      dateString
        .toString()
        .match(/(?<month>\d+)(か|カ|ヶ|ヵ)(月|げつ)(前|まえ)/)?.groups?.month ??
        0
    ),
    "month"
  );
  date.set(
    "month",
    Number(
      dateString.toString().match(/(?<month>\d+)(月|がつ)/)?.groups?.month ??
        date.month() + 1
    ) - 1
  );
  //日
  if (dateString.toString().includes("明日")) date.add(1, "days");
  if (dateString.toString().includes("明後日")) date.add(2, "days");
  if (dateString.toString().includes("昨日")) date.subtract(1, "days");
  if (dateString.toString().includes("一昨日")) date.subtract(2, "days");
  if (dateString.toString().includes("あした")) date.add(1, "days");
  if (dateString.toString().includes("あさって")) date.add(2, "days");
  if (dateString.toString().includes("きのう")) date.subtract(1, "days");
  if (dateString.toString().includes("おととい")) date.subtract(2, "days");
  if (dateString.toString().includes("おとつい")) date.subtract(2, "days");
  date.add(
    Number(
      dateString.toString().match(/(?<day>\d+)(日|にち)(後|ご)/)?.groups?.day ??
        0
    ),
    "days"
  );
  date.subtract(
    Number(
      dateString.toString().match(/(?<day>\d+)(日|にち)(前|まえ)/)?.groups
        ?.day ?? 0
    ),
    "days"
  );
  date.set(
    "date",
    Number(
      dateString.toString().match(/(?<day>\d+)(日|にち)(?!後|ご|前|まえ)/)
        ?.groups?.day ?? date.date()
    )
  );
  //週
  if (dateString.toString().includes("来週")) date.add(1, "week");
  if (dateString.toString().includes("再来週")) date.add(2, "week");
  if (dateString.toString().includes("前週")) date.subtract(1, "week");
  if (dateString.toString().includes("らいしゅう")) date.add(1, "week");
  if (dateString.toString().includes("さらいしゅう")) date.add(2, "week");
  if (dateString.toString().includes("せんしゅう")) date.subtract(1, "week");
  date.add(
    Number(
      dateString.toString().match(/(?<week>\d+)(週|しゅう)(間|かん)(後|ご)/)
        ?.groups?.week ?? 0
    ),
    "week"
  );
  date.subtract(
    Number(
      dateString.toString().match(/(?<week>\d+)(週|しゅう)(間|かん)(前|まえ)/)
        ?.groups?.week ?? 0
    ),
    "week"
  );
  //時分秒前後
  (() => {
    const addHMS = dateString
      .toString()
      .match(
        /(?<hour>\d+)(時|じ)(間|かん)(?<minute>\d+)(分|ふん)(?<second>\d+)(秒|びょう)(後|ご)/
      );
    const addHM = dateString
      .toString()
      .match(/(?<hour>\d+)(時|じ)(間|かん)(?<minute>\d+)(分|ふん)(後|ご)/);
    const addHS = dateString
      .toString()
      .match(/(?<hour>\d+)(時|じ)(間|かん)(?<second>\d+)(秒|びょう)(後|ご)/);
    const addMS = dateString
      .toString()
      .match(/(?<minute>\d+)(分|ふん)(?<second>\d+)(秒|びょう)(後|ご)/);
    const addH = dateString
      .toString()
      .match(/(?<hour>\d+)(時|じ)(間|かん)(後|ご)/)?.groups?.hour;
    const addM = dateString.toString().match(/(?<minute>\d+)(分|ふん)(後|ご)/)
      ?.groups?.minute;
    const addS = dateString.toString().match(/(?<second>\d+)(秒|びょう)(後|ご)/)
      ?.groups?.second;
    const subtractHMS = dateString
      .toString()
      .match(
        /(?<hour>\d+)(時|じ)(間|かん)(?<minute>\d+)(分|ふん)(?<second>\d+)(秒|びょう)(前|まえ)/
      );
    const subtractHM = dateString
      .toString()
      .match(/(?<hour>\d+)(時|じ)(間|かん)(?<minute>\d+)(分|ふん)(前|まえ)/);
    const subtractHS = dateString
      .toString()
      .match(/(?<hour>\d+)(時|じ)(間|かん)(?<second>\d+)(秒|びょう)(前|まえ)/);
    const subtractMS = dateString
      .toString()
      .match(/(?<minute>\d+)(分|ふん)(?<second>\d+)(秒|びょう)(前|まえ)/);
    const subtractH = dateString
      .toString()
      .match(/(?<hour>\d+)(時|じ)(間|かん)(前|まえ)/)?.groups?.hour;
    const subtractM = dateString
      .toString()
      .match(/(?<minute>\d+)(分|ふん)(前|まえ)/)?.groups?.minute;
    const subtractS = dateString
      .toString()
      .match(/(?<second>\d+)(秒|びょう)(前|まえ)/)?.groups?.second;
    if (addHMS) {
      date
        .add(Number(addHMS.groups?.hour), "hour")
        .add(moment().hour(), "hour");
      date
        .add(Number(addHMS.groups?.minute), "minute")
        .add(moment().minute(), "minute");
      date
        .add(Number(addHMS.groups?.second), "second")
        .add(moment().second(), "second");
    } else if (addHM) {
      date.add(Number(addHM.groups?.hour), "hour").add(moment().hour(), "hour");
      date
        .add(Number(addHM.groups?.minute), "minute")
        .add(moment().minute(), "minute");
      date.add(moment().second(), "second");
    } else if (addHS) {
      date.add(Number(addHS.groups?.hour), "hour").add(moment().hour(), "hour");
      date.add(moment().minute(), "minute");
      date
        .add(Number(addHS.groups?.second), "second")
        .add(moment().second(), "second");
    } else if (addMS) {
      date.add(moment().hour(), "hour");
      date
        .add(Number(addMS.groups?.minute), "minute")
        .add(moment().minute(), "minute");
      date
        .add(Number(addMS.groups?.second), "second")
        .add(moment().second(), "second");
    } else if (addH) {
      date.add(Number(addH), "hour").add(moment().hour(), "hour");
      date.add(moment().minute(), "minute");
      date.add(moment().second(), "second");
    } else if (addM) {
      date.add(moment().hour(), "hour");
      date.add(Number(addM), "minute").add(moment().minute(), "minute");
      date.add(moment().second(), "second");
    } else if (addS) {
      date.add(moment().hour(), "hour");
      date.add(moment().minute(), "minute");
      date.add(Number(addS), "second").add(moment().second(), "second");
    }
    if (subtractHMS) {
      date
        .subtract(Number(subtractHMS.groups?.hour), "hour")
        .add(moment().hour(), "hour");
      date
        .subtract(Number(subtractHMS.groups?.minute), "minute")
        .add(moment().minute(), "minute");
      date
        .subtract(Number(subtractHMS.groups?.second), "second")
        .add(moment().second(), "second");
    } else if (subtractHM) {
      date
        .subtract(Number(subtractHM.groups?.hour), "hour")
        .add(moment().hour(), "hour");
      date
        .subtract(Number(subtractHM.groups?.minute), "minute")
        .add(moment().minute(), "minute");
      date.add(moment().second(), "second");
    } else if (subtractHS) {
      date
        .subtract(Number(subtractHS.groups?.hour), "hour")
        .add(moment().hour(), "hour");
      date.add(moment().minute(), "minute");
      date
        .subtract(Number(subtractHS.groups?.second), "second")
        .add(moment().second(), "second");
    } else if (subtractMS) {
      date.add(moment().hour(), "hour");
      date
        .subtract(Number(subtractMS.groups?.minute), "minute")
        .add(moment().minute(), "minute");
      date
        .subtract(Number(subtractMS.groups?.second), "second")
        .add(moment().second(), "second");
    } else if (subtractH) {
      date.subtract(Number(subtractH), "hour").add(moment().hour(), "hour");
      date.add(moment().minute(), "minute");
      date.add(moment().second(), "second");
    } else if (subtractM) {
      date.add(moment().hour(), "hour");
      date
        .subtract(Number(subtractM), "minute")
        .add(moment().minute(), "minute");
      date.add(moment().second(), "second");
    } else if (subtractS) {
      date.add(moment().hour(), "hour");
      date.add(moment().minute(), "minute");
      date
        .subtract(Number(subtractS), "second")
        .add(moment().second(), "second");
    }
  })();
  //時
  date.set(
    "hour",
    Number(
      dateString.toString().match(/(?<hour>\d+)(時|じ)(?!間|かん)/)?.groups
        ?.hour ?? date.hour()
    )
  );
  //分
  date.set(
    "minute",
    Number(
      dateString.toString().match(/(?<minute>\d+)(分|ふん)(?!後|ご|前|まえ)/)
        ?.groups?.minute ?? date.minute()
    )
  );
  //秒
  date.set(
    "second",
    Number(
      dateString.toString().match(/(?<second>\d+)(秒|びょう)(?!後|ご|前|まえ)/)
        ?.groups?.second ?? date.second()
    )
  );
  //年-月-日
  (() => {
    const match = dateString
      .toString()
      .match(/(?<year>\d+)-(?<month>\d+)-(?<day>\d+)/);
    if (!match) return;
    const year = match.groups?.year;
    const month = match.groups?.month;
    const day = match.groups?.day;
    if (year && month && day) {
      date.set("year", Number(year));
      date.set("month", Number(month + 1));
      date.set("date", Number(day + 1));
    }
  })();
  if (dateString.toString().match(/(\d+):(\d+):(\d+)/)) {
    //時:分:秒
    (() => {
      const match = dateString
        .toString()
        .match(/(?<hour>\d+):(?<minute>\d+):(?<second>\d+)/);
      if (!match) return;
      const hour = match.groups?.hour;
      const minute = match.groups?.minute;
      const second = match.groups?.second;
      if (hour && minute && second) {
        date.set("hour", Number(hour));
        date.set("minute", Number(minute));
        date.set("second", Number(second));
      }
    })();
  } else {
    //時:分
    (() => {
      const match = dateString.toString().match(/(?<hour>\d+):(?<minute>\d+)/);
      if (!match) return;
      const hour = match.groups?.hour;
      const minute = match.groups?.minute;
      if (hour && minute) {
        date.set("hour", Number(hour));
        date.set("minute", Number(minute));
      }
    })();
  }
  return date;
};

export const getDateBefore = (time: moment.Moment, before: Time) => {
  const nTime = moment(time);
  switch (before) {
    case "1m":
      nTime.add(1, "minute");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "5m":
      nTime.add(5, "minute");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "1h":
      nTime.add(1, "hour");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "2h":
      nTime.add(2, "hour");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "1d":
      nTime.add(1, "day");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "1w":
      nTime.add(1, "week");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "1M":
      nTime.add(1, "month");
      if (nTime.isBefore()) return undefined;
      return nTime;
    case "1y":
      nTime.add(1, "year");
      if (nTime.isBefore()) return undefined;
      return nTime;
    default:
      return;
  }
};
export interface Plan {
  guild: Guild;
  date: moment.Moment;
  notificationTime: Time;
  notificationDate: moment.Moment | undefined;
  notificationChannel: TextBasedChannel;
  name: string;
  description: string | undefined;
}
type Time = "1m" | "5m" | "1h" | "2h" | "1d" | "1w" | "1M" | "1y" | undefined;
