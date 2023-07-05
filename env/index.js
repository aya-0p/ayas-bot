module.exports.env = {
  project: {
    ports: {
      control: 0,
      log: 0,
      main: 0,
    },
    test: false,
    rootDirPath: "",
    ownerUserId: "",
    version: "",
  },
  control: {

  },
  log: {
    discordToken: "",
    channels: [],
    defaultChannel: "",
    mentionChannel: "",
    webChannel: "",
  },
  main: {
    discordToken: "",
    bot: {
      testGuildId: "",
      temporaryDirPath: "",
      googleTranslateUrl: "",
    },
    voice: [],
    database: {
      plan: "",
      settings: "",
      status: "",
      voice: "",
    },
    voicevox: {
      openjtalkDir: ""
    },
  },
}