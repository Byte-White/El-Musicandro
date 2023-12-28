require('dotenv').config();
const { Client, IntentsBitField } = require("discord.js")
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const fs = require('fs');


function getRandomLine(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  
  // Check if the file has at least one line
  if (lines.length === 0) {
    return 'File is empty';
  }

  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
}
function getLine(filePath,index)
{
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    if (index >= 0 && index < lines.length) {
        return lines[index];
    }
    else{
        return getRandomLine(filepath);
    }
}


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
                    // Listen for the audio player to finish playing
                    audioPlayer.on('stateChange', (oldState, newState) => {
                    if (newState.status === 'idle') {
                            // Cleanup after the song has finished playing
                            audioPlayer.stop();
                            connection.destroy();
                            console.log(`🎵 Finished playing ${args[0]}`);
                        }
                    });
                    connection.subscribe(audioPlayer);
                    message.channel.send("reproduciendo ahora " + args[0]);
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
    if (message.content.startsWith('!freestyle'))
    {
        const [command, ...args] = message.content.split(' ');
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
        let song;
        if (args.length === 0) {
        song = getRandomLine("favourites.txt");
        }
        else{
            song = getLine("favourites.txt",parseInt(args[0]));
        }
        console.log(`🔴USING YTDL for ${song}`);
                    const stream = ytdl(song, { filter: 'audioonly' }); // Use ytdl-core to get the audio stream
                    stream.on('error', (error) => {
                        console.error(`ytdl-core error: ${error.message}`);
                    });
        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
        console.log(resource);
        audioPlayer.play(resource);

        // Listen for the audio player to finish playing
        audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle') {
                // Cleanup after the song has finished playing
                audioPlayer.stop();
                connection.destroy();
                console.log(`🎵 Finished playing ${song}`);
            }
        });

        connection.subscribe(audioPlayer);
        message.channel.send("reproduciendo ahora " + song);
    }

}
)

client.login(process.env.TOKEN)