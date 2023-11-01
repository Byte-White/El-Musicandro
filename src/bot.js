require('dotenv').config();
const { Client, IntentsBitField } = require("discord.js")
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');



const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent
    ]
})

const audioPlayer = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

client.on('ready',(c)=>{
console.log(`✅🎸 @${c.user.tag} is online`)
}
)

client.on('messageCreate',(message)=>{
    console.log(`🗣️ @${message.author.tag} said \"${message.content}\" in channel \'${message.channel.name}\'`)
    if(message.content.startsWith("!play"))
    {
        const voiceChannel = message.member.voice.channel;
        const member = message.guild.members.cache.get(message.author.id)
        // Extract the command and arguments
        const [command, ...args] = message.content.split(' ');
         
        if (args.length === 0) {
            message.reply("Amigo, necesitas especificar qué jugar.");
        } else {
            if(member.voice.channel)
            {
                if(args[0].startsWith("https://www.youtu")) //https://youtube and https://youtu.be 
                {
                    console.log(`🔴USING YTDL for ${args[0]}`);
                    const stream = ytdl(args[0], { filter: 'audioonly' }); // Use ytdl-core to get the audio stream
                    stream.on('error', (error) => {
                        console.error(`ytdl-core error: ${error.message}`);
                    });
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });
                    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
                    console.log(resource);
                    audioPlayer.play(resource);
                    connection.subscribe(audioPlayer);
                }
                else{
                    console.log(`🔵Direct MP3 File from ${args[0]}`);
                    const stream = createAudioResource(args[0], {
                        inputType: StreamType.Arbitrary,
                        //ffmpeg: "D:\\Programs\\FFmpeg\\bin\\ffmpeg.exe"
                    });
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });
                    
                    audioPlayer.play(stream);
                    connection.subscribe(audioPlayer);
                }
                console.log(`🎙️ joined ${member.voice.channel.name} voice channel`);
                //console.error("❌🎙️ couldn't join voice channel error: " + err);
            }
            else
            {
                message.reply("Amigo, únete a un canal de voz primero.");
            }
        }
    }
    //TODO: fix later
    if (message.content === '!join') {
        const voiceChannel = message.member.voice.channel;
        const member = message.guild.members.cache.get(message.author.id)
        if (!voiceChannel) {
            return message.channel.send("Amigo, únete a un canal de voz primero.");
        }
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        console.log(`🚪Joined ${voiceChannel.name}`);
    }


}
)

client.login(process.env.TOKEN)