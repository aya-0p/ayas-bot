{
  "targets": [
    {
      "target_name": "voicevox",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "voicevox.cc", 
        "<!@(node -p \"require('fs').readdirSync('./core').map(f => 'core/'+f).join(' ')\")"
        ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
      "libraries": [
        "<(module_root_dir)/core/libvoicevox_core.so"
      ]
    }
  ]
}