#include <napi.h>
#include "core/voicevox_core.h"
#include <stdio.h>
#include <string>
#include <iostream>

using namespace Napi;

Napi::Object audio_query(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();
	Napi::Object obj = Napi::Object::New(env);

	//params
	//0, text, string
	//1, speaker_id, number
	std::string text = info[0].As<Napi::String>().ToString().Utf8Value() + '\0';
	uint32_t speaker_id = info[1].As<Napi::Number>().Uint32Value();
	VoicevoxAudioQueryOptions options = voicevox_make_default_audio_query_options();
	char* output_audio_query_json = nullptr;

	if (!voicevox_is_model_loaded(speaker_id)) {
		voicevox_load_model(speaker_id);
	}

	VoicevoxResultCode result = voicevox_audio_query(
		text.c_str(),
		speaker_id,
		options,
		&output_audio_query_json
	);
	if (result == VOICEVOX_RESULT_OK) {
		obj.Set("error", false);
		obj.Set("data", output_audio_query_json);
	}
	else {
		obj.Set("error", voicevox_error_result_to_message(result));
	}
	//voicevox_audio_query_json_free(output_audio_query_json);
	return obj;
}

Napi::Object synthesis(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();
	Napi::Object obj = Napi::Object::New(env);

	//params
	//0, audio_query_json, string
	//1, speaker_id, number
	VoicevoxSynthesisOptions options = voicevox_make_default_synthesis_options();
	std::string text = info[0].As<Napi::String>().ToString().Utf8Value() + '\0';
	const char* audio_query_json = text.c_str();
	uint32_t speaker_id = info[1].As<Napi::Number>().Uint32Value();
	uintptr_t output_wav_length = 0;
	uint8_t* output_wav = nullptr;

	options.enable_interrogative_upspeak = true;

	
	VoicevoxResultCode result = voicevox_synthesis(
		audio_query_json,
		speaker_id,
		options,
		&output_wav_length,
		&output_wav
	);
	if (result == VOICEVOX_RESULT_OK) {
		obj.Set("error", false);
		obj.Set("data", Napi::Buffer<uint8_t>::New(env, output_wav, output_wav_length));
	}
	else {
		obj.Set("error", Napi::String::New(env, voicevox_error_result_to_message(result)));
	}
	//voicevox_wav_free(output_wav);
	return obj;
}

Napi::String init(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();
	auto initOpt = voicevox_make_default_initialize_options();
	initOpt.load_all_models = false;
	std::string dir = info[0].As<Napi::String>().ToString().Utf8Value() + '\0';
	initOpt.open_jtalk_dict_dir = dir.c_str();
	auto result = voicevox_initialize(initOpt);
	return Napi::String::New(env, voicevox_error_result_to_message(result));
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set("initialize", Napi::Function::New(env, init));
	exports.Set("audioQuery", Napi::Function::New(env, audio_query));
	exports.Set("synthesis", Napi::Function::New(env, synthesis));

	return exports;
}

NODE_API_MODULE(voicevox, Init)