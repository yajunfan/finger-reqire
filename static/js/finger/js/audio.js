define(function() {
    var audioFingerPrinting = function() {
        var finished = false;
        try{
        var audioCtx = new (window.AudioContext || window.webkitAudioContext), //由音频模块连接而成的音频处理图
            oscillator = audioCtx.createOscillator(),
            analyser = audioCtx.createAnalyser(),
            gainNode = audioCtx.createGain(),
            scriptProcessor = audioCtx.createScriptProcessor(4096,1,1);
        var destination = audioCtx.destination;  //表示当前audio context中所有节点的最终节点，一般表示音频渲染设备
        //sampleRate 返回用浮点数表示的采样率，也就是每秒的采样数，同一个AudioContext中的所有节点采样率相同，所以不支持采样率转换。
        return (audioCtx.sampleRate).toString() + '_' + destination.maxChannelCount + "_" + destination.numberOfInputs + '_' + destination.numberOfOutputs + '_' + destination.channelCount + '_' + destination.channelCountMode + '_' + destination.channelInterpretation;
        }
        catch (e) {
            return "not supported";
        }
    };    
    return audioFingerPrinting;
});

