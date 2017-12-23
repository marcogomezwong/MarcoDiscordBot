var Discord = require('discord.js');
var auth = require('./auth.json');
const ytdl = require('ytdl-core');
const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg-api-redis');
const song_queue = new Map();
var bot = new Discord.Client();
var stunk_bool = -1;


bot.on("ready", () => {
  console.log("Connected");
  console.log("Bot logged in as: " + bot.user);
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
  bot.user.setGame('Stinking Around');
});

bot.on("disconnect", () => {
  console.log("Bot disconnected");
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.content.indexOf("?") !== -1 && !(message.content.indexOf("youtube.com/watch") !== -1) && stunk_bool > 0) message.channel.send("NO DUDE!");
  if((message.content.indexOf("haha") !== -1 || message.content.indexOf("lol") !== -1 || message.content.indexOf("lmao") !== -1) && stunk_bool > 0) message.channel.send("Dude why'd you laugh?");
  if(message.content.toLowerCase().indexOf("never the") !== -1 && stunk_bool > 0) message.channel.send("Never that!!");
  if(message.content.toLowerCase().indexOf("salt") !== -1 && stunk_bool > 0) message.channel.send("That's what I said, Sodium Chloride!");
  if(message.content.indexOf("~") !== 0) return;

  var args = message.content.substring(1).split(' ');
  var command = args[0];
  var args_str = message.content.substring(args[0].length+2);

  if (command === "ping") {
    message.channel.send("pong!");
  }
  if (command === "beat") {
    message.channel.send("Fike is the most beat of all!");
  }
  if (command === "setgame") {
    bot.user.setGame(args_str);
  }
  if (command === "stunkstart") {
    message.channel.send({
      embed: {
        color: 3447003,
        author: {
          name: "Marco Bot",
          icon_url: "https://i.imgur.com/lm8s41J.png"
        },
        title: "Stinking enabled.",
        description: "",
        footer: {
          icon_url: "https://i.imgur.com/lm8s41J.png",
          text: "MarcoBot"
        },
        timestamp: new Date()
      }
    });
    stunk_bool = 1;
  }
  if (command === "stunkstop") {
    message.channel.send({
      embed: {
        color: 3447003,
        author: {
          name: "Marco Bot",
          icon_url: "https://i.imgur.com/lm8s41J.png"
        },
        title: "Stinking disabled.",
        description: "",
        footer: {
          icon_url: "https://i.imgur.com/lm8s41J.png",
          text: "MarcoBot"
        },
        timestamp: new Date()
      }
    });
    stunk_bool = -1;
  }

  if (command === "help2") {
    message.channel.send(
      { embed: {
        color: 3447003,
        author: {
          name: "Marco's Custom Bot Music Menu",
          icon_url: "https://i.imgur.com/lm8s41J.png"
        },
        title: "",
        description: "For all your music needs",
        fields: [
          {
            name: "$play [youtube_URL]",
            value: "Attempts to play a youtube video from the link provided\nDoes not perform link checking, results may be unpredictable lmeo"
          },
          {
            name: "$skip",
            value: "Tells the bot to skip the current song in the queue"
          },
          {
            name: "$stop",
            value: "Tells the bot to stop playing music and leave the voice channel"
          },
          {
            name: "$clear",
            value: "Tells the bot to clear the queue and leave the voice channel after the current song finishes playing"
          },

        ],
        footer: {
          icon_url: "https://i.imgur.com/lm8s41J.png",
          text: "MarcoBot"
        },
        timestamp: new Date()
    }});
  }
  if (command === "pubg") {
    const pubg = new PubgAPI({
      apikey: '6a1822ea-b0ba-491a-bbad-82a78fc41820',
      // redisConfig: {
      //   host: '127.0.0.1',
      //   port: 6379,
      //   expiration: 300, // Optional - defaults to 300.
      // },
    });
    pubg.getProfileByNickname('Zentagin')
      .then((profile) => {
        const data = profile.content;
        const stats = profile.getStats({
        //  region: REGION.ALL, // defaults to profile.content.selectedRegion
          //season: SEASON.EA2017pre3, // defaults to profile.content.defaultSeason
        //  match: MATCH.SOLO // defaults to SOLO
        });
        console.log(stats);
      });

  }
  if (command === "help") {
    message.channel.send(
      { embed: {
        color: 3447003,
        author: {
          name: "Marco's Custom Bot Menu",
          icon_url: "https://i.imgur.com/lm8s41J.png"
        },
        title: "",
        description: "A simple bot customized for stinky people",
        fields: [
          {
            name: "$help[number]",
            value: "Displays different help menus for music [2], users[3]"
          },
          {
            name: '$setgame [name]',
            value: 'Allows the game of the bot to be changed'
          },
          {
            name: "$status",
            value: "Displays the status of the bot"
          },
          {
            name: "$joinme",
            value: "Tells the bot to join your current voice channel"
          },
          {
            name: "$leaveme",
            value: "Tells the bot to leave any connected voice channel"
          },
          {
            name: "$purge [num]",
            value: "Permanently deletes **up to 100 messages** from the channel"
          }
        ],
        footer: {
          icon_url: "https://i.imgur.com/lm8s41J.png",
          text: "MarcoBot"
        },
        timestamp: new Date()
    }});
  }
  if (command === "status") {
    message.channel.send("Marco Bot is Online!\nMan, I am just STUNK!");
  }
  if (command === "joinme") {
    message.channel.send("joining user voice channel for: " + message.author);
    const channel = message.member.voiceChannel;
    channel.join().then(connection => console.log("Connected!")).catch(console.error);
  }
  if (command === "leaveme") {
    const channel = message.member.voiceChannel;
    channel.leave();
    console.log("Disconnected!");
  }
  if (command === "play") {
    const serverQueue = song_queue.get(message.guild.id);
    const channel = message.member.voiceChannel;
    //if (!channel) return message.channel.send("You must be connected to a voice channel to use **$play [link]**!");

    const songInfo = await ytdl.getInfo(args[1]);
    console.log("song info: ");
    console.log(songInfo.title);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
      song_queue.set(message.guild.id, queueConstruct);
      queueConstruct.songs.push(song);
      try {
        var connection = await channel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.error("Could not join voice channel");
        song_queue.delete(message.guild.id);
        return message.channel.send("Could not join voice channel" + error);
      }
      return;
    } else {
        serverQueue.songs.push(song);
        console.log("song added " + serverQueue.songs);
        return message.channel.send({
          embed: {
            color: 3447003,
            author: {
              name: "Marco Bot",
              icon_url: "https://i.imgur.com/lm8s41J.png"
            },
            title: song.title + " has been added to the queue",
            description: "Link: " + song.url,
            footer: {
              icon_url: "https://i.imgur.com/lm8s41J.png",
              text: "MarcoBot"
            },
            timestamp: new Date()
          }
        });
    }
    return;
  }
  if (command ===  "skip") {
    const serverQueue = song_queue.get(message.guild.id);
    //if (!serverQueue) return message.channel.send("There is nothing playing that I can skip.");
    // if (!message.memeber.voiceChannel) return message.channel.send("You are not in a voice channel");
    serverQueue.connection.dispatcher.end();
    if (serverQueue.songs.length === 0) {
      serverQueue.voiceChannel.leave();
      song_queue.delete(message.guild.id);
    }
    return;
  }
  if (command === "clear") {
    const serverQueue = song_queue.get(message.guild.id);
    serverQueue.songs = [];
    song_queue.delete(message.guild.id);
  }
  if (command === "stop") {
    const serverQueue = song_queue.get(message.guild.id);
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    song_queue.delete(message.guild.id);
    serverQueue.voiceChannel.leave();
    serverQueue.textChannel.send({
      embed: {
        color: 3447003,
        author: {
          name: "Marco Bot",
          icon_url: "https://i.imgur.com/lm8s41J.png"
        },
        title: "",
        description: "Queue has ended!",
        footer: {
          icon_url: "https://i.imgur.com/lm8s41J.png",
          text: "MarcoBot"
        },
        timestamp: new Date()
      }
    });
  }
});
function play(guild, song) {
  console.log("Play function");

  if (!song) {
    serverQueue.voiceChannel.leave();
    song_queue.delete(guild.id);
    return;
  }
  const serverQueue = song_queue.get(guild.id);
  console.log("song: " + song.title);
  // console.log(serverQueue.songs);
  serverQueue.textChannel.send({
    embed: {
      color: 3447003,
      author: {
        name: "Marco Bot Now Playing:",
        icon_url: "https://i.imgur.com/lm8s41J.png"
      },
      title: song.title,
      description: "Link: " + song.url,
      footer: {
        icon_url: "https://i.imgur.com/lm8s41J.png",
        text: "MarcoBot"
      },
      timestamp: new Date()
    }
  });
  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on("end", () => {
      console.log("Song ended");
      serverQueue.songs.shift();
      console.log("songs shifted");
      console.log(serverQueue.songs);
      if (serverQueue.songs.length === 0){
          serverQueue.voiceChannel.leave();
          serverQueue.textChannel.send({
            embed: {
              color: 3447003,
              author: {
                name: "Marco Bot",
                icon_url: "https://i.imgur.com/lm8s41J.png"
              },
              title: "",
              description: "Queue has ended!",
              footer: {
                icon_url: "https://i.imgur.com/lm8s41J.png",
                text: "MarcoBot"
              },
              timestamp: new Date()
            }
          });
          song_queue.delete(guild.id);
      }
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(5 / 5);
}

bot.login(auth.token);
