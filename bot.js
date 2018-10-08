var Discord = require('discord.js');
var auth = require('./auth.json');
const ytdl = require('ytdl-core');
const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg-api-redis');
const song_queue = new Map();
var bot = new Discord.Client();
var response_bool = -1;
var play_bool = false;
var blackjack_bool = -1;
var command_indicator = "$";
const fs = require("fs");
var blackjack_ante = 0;
var player_list = [];
var player_hit = -1;
const dealer = new Object(); 
  dealer.player = "DEALER";
  dealer.cards = [];
bot.totals = require("./totals.json");
var card_num = 0;
var dealer_turn = 0;
var cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
			 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
			 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 
			 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];

bot.on("ready", () => {
  console.log("Connected");
  console.log("Bot logged in as: " + bot.user);
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
  bot.user.setGame('nothing');
});

bot.on("disconnect", () => {
  console.log("Bot disconnected");
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.content.indexOf("?") !== -1 && !(message.content.indexOf("youtube.com/watch") !== -1) && response_bool > 0) message.channel.send("NO DUDE!");
  if((message.content.indexOf("haha") !== -1 || message.content.indexOf("lol") !== -1 || message.content.indexOf("lmao") !== -1) && response_bool > 0) message.channel.send("Dude why'd you laugh?");
  if(message.content.toLowerCase().indexOf("never the") !== -1 && response_bool > 0) message.channel.send("Never that!!");
  if(message.content.toLowerCase().indexOf("salt") !== -1 && response_bool > 0) message.channel.send("That's what I said, Sodium Chloride!");
  if(message.content.indexOf(command_indicator) !== 0) return;

  var args = message.content.substring(1).split(' ');
  var command = args[0];
  var args_str = message.content.substring(args[0].length+2);

  if (command === "poker") {
  	bot.user.setGame("Poker");
  	message.channel.send("Feature not yet implemented. Stunk!");
  }

  

  if (command === "blackjack") {
  	bot.user.setGame("Blackjack");
  	blackjack_bool = blackjack_bool * -1;
  	if (blackjack_bool === 1) {
  		message.channel.send("Game of Blackjack has begun!");
  		
  		
	} else {
		message.channel.send("Game of Blackjack has ended!");
		player_list = [];
	}
  	
  }

  
  if (command === "dev0") {
  	message.channel.send(player_list[0].player);
  	message.channel.send(player_list[0].balance);
  	message.channel.send(player_list[0].chips);
  	message.channel.send(player_list[0].cards);
  }

  	if (blackjack_bool === 1) {
  		if (command === "set_ante") {
  			blackjack_ante = parseInt(args_str);
  		}

  		if (command === "rules") {
  			message.channel.send("Command not implemented.");
  		}

  		if (command === "bet") {
  			var bet = parseInt(args_str);
  			if (bet < blackjack_ante) {
  				message.channel.send(message.author + ", your bet must be at least $" + blackjack_ante + ".");
  			} else {
  			
	  			for (var i = 0; i < player_list.length; i++) {
	  				if (bet > player_list[i].chips) {
	  					message.channel.send(message.author + ", you do not have enough chips to make this bet.");
	  					break;
	  				}
		  			if (player_list[i].player == message.author.toString()) {
		  				player_list[i].bet = player_list[i].bet + bet;
		  				player_list[i].chips = player_list[i].chips - bet;
	  					message.channel.send(message.author + " has bet $" + player_list[i].bet + " total!");

		  			}
		  		}
	  		}
  		}
	  	if (command === "buy") {
	  		var pos = 0;
	  		for (var i = 0; i < player_list.length; i++) {
	  			if (player_list[i].player == message.author.toString()) {
	  				if (isNaN(args_str) || parseInt(args_str) < 0) {
	  					message.channel.send(message.author + ", please enter a valid amount (>$0)");
	  				} else {
	  				player_list[i].chips = player_list[i].chips + parseInt(args_str);
	  				player_list[i].balance = player_list[i].balance - parseInt(args_str);
	  				pos = i;
	  				message.channel.send(message.author + " has bought $" + args_str + " worth of chips! (Chips: $" + player_list[pos].chips + " | Balance: $" + player_list[pos].balance + ")");

	  			}
	  			}
	  		}
	  	}
	  	if (command === "join") {
		  	message.channel.send(message.author + " has joined the game!");
		  	const newb = new blackjack_player(message.author.toString());
		  	player_list.push(newb);
	  	}

	  	if (command === "cashout") {
	  		var pos = 0;
	  		for (var i = 0; i < player_list.length; i++) {
	  			if (player_list[i].player == message.author.toString()) {
	  				pos = i;
	  			}
	  		}
	  		var net = player_list[pos].balance + player_list[pos].chips;
	  		message.channel.send(message.author + " has cashed out! Player left the table with a net of $" + net + ".");
	  		player_list.splice(pos,1);
	  	}

	  	if (command === "deal") {
	  		card_num = 0;
	  		cards = shuffle(cards);
	  		for (var j = 0; j < 2; j++) {
		  		for(var i = 0; i < player_list.length; i++) {
		  			player_list[i].cards.push(cards[card_num]);
		  			card_num = card_num + 1;
		  		}

		  		dealer.cards.push(cards[card_num]);
		  		card_num = card_num + 1;
	  		}
	  		player_hit = 0;

	  		for(var i = 0; i < player_list.length; i++) {
	  			var data = {}
			  	data.files = []
			  	for (var j = 0; j < 2; j++) {
			  		data.files[j] = {
				  		attachment: "",
				  		name: ""						
			  		}
				  	data.files[j].attachment = "./PNG-cards-1.3/" + player_list[i].cards[j] + ".png";
				  	data.files[j].name = "card_" + player_list[i].cards[j] + ".png";

			  	}
		  		var card_val = num_to_value(player_list[i].cards[0]) + num_to_value(player_list[i].cards[1]);
		  		message.channel.send(message.author + " has: (Card value: " + card_val + ")", data);
		  		if (card_val === 21) {
		  			player_list[i].blackjack = 1;
		  		}
		  		player_list[i].card_val = player_list[i].card_val + card_val;

	  		}	
		  	var data = {}
		  	data.files = []
		  	for (var i = 0; i < 1; i++) {
		  		data.files[i] = {
			  		attachment: "",
			  		name: ""						
		  	}
			  	data.files[i].attachment = "./PNG-cards-1.3/" + dealer.cards[i] + ".png";
			  	data.files[i].name = "card_" + dealer.cards[i] + ".png";
		  	}
	  		var card_val = num_to_value(dealer.cards[0]);
	  		message.channel.send("The dealer has: (Card value: " + card_val + ")", data);
	  		message.channel.send(player_list[0].player + ", it's your turn!");
	  	}

	  	if (command === "show_players"){
	  		for(var i = 0; i < player_list.length; i++) {
	  			message.channel.send(player_list[i].player + ": " + player_list[i].cards);
	  		}
	  	}

	  	if (command === "hit" && player_hit != -1) {
	  		if (player_list[player_hit].player === message.author.toString()) {

	  			if (player_list[player_hit].card_val === 21 || player_list[player_hit].blackjack === 1) {
	  				message.channel.send("You have 21, you are required to stay");

	  			} else {
	  			player_list[player_hit].cards.push(card_num);
	  			player_list[player_hit].card_val = player_list[player_hit].card_val + num_to_value(card_num);
	  			card_num = card_num + 1;

	  			var data = {}
			  	data.files = []
			  	for (var j = 0; j < player_list[player_hit].cards.length; j++) {
			  		data.files[j] = {
				  		attachment: "",
				  		name: ""						
			  		}
				  	data.files[j].attachment = "./PNG-cards-1.3/" + player_list[player_hit].cards[j] + ".png";
				  	data.files[j].name = "card_" + player_list[player_hit].cards[j] + ".png";

			  	}
		  		message.channel.send(message.author + " has: (Card value: " + player_list[player_hit].card_val + ")", data);
		  		



	  			if (player_list[player_hit].card_val > 21) {
	  				message.channel.send(message.author + " has busted!");
	  				player_hit = player_hit + 1;
	  				if (player_hit >= player_list.length) {
	  					dealer_turn = 1;
	  					player_hit = -1;
	  				} 
	  			}
	  		}
	  		} else {
	  			message.channel.send("It is not your turn yet!");
	  		}
	  	}

	  	if (command === "stay") {
	  		if (player_list[player_hit].player === message.author.toString()){ 
		  		player_hit = player_hit + 1;
		  		if (player_hit >= player_list.length) {
		  			dealer_turn = 1;
		  			player_hit = -1;
		  		}
	  		}
	  	}

	  	



	  	if (dealer_turn === 1) {

		  	var data = {}
		  	data.files = []
		  	for (var i = 0; i < 2; i++) {
		  		data.files[i] = {
		  		attachment: "",
		  		name: ""						
		  	}
		  	data.files[i].attachment = "./PNG-cards-1.3/" + dealer.cards[i] + ".png";
		  	data.files[i].name = "card_" + dealer.cards[i] + ".png";
		  	}
	  		var card_val = num_to_value(dealer.cards[0]) + num_to_value(dealer.cards[1]);
	  		// message.channel.send("The dealer has: (Card value: " + card_val + ")", data);
	  		while (card_val < 17) {
	  			dealer.cards.push(card_num);
	  			card_num = card_num + 1;
	  			card_val = 0;
	  			for(var i = 0; i < dealer.cards.length; i++) {
	  				card_val = card_val + num_to_value(dealer.cards[i]);
	  			}
	  			data.files = []
			  	for (var i = 0; i < dealer.cards.length; i++) {
			  		data.files[i] = {
				  		attachment: "",
				  		name: ""						
			  		}
				  	data.files[i].attachment = "./PNG-cards-1.3/" + dealer.cards[i] + ".png";
				  	data.files[i].name = "card_" + dealer.cards[i] + ".png";
	  			}
	  			if (card_val > 21) {
	  				break;
	  			}
	  			
	  		}
	  		message.channel.send("The dealer has: (Card value: " + card_val + ")", data);

	  		if (card_val > 21) {
	  				message.channel.send("The dealer has busted!");
	  				message.channel.send("Payouts: ");
	  				for (var j = 0; j < player_list.length; j++) {
	  					var earnings = 0;
	  					if (player_list[j].blackjack === 1) {
	  						earnings = (player_list[j].bet * 2) + (player_list[j].bet * 0.5);
	  						player_list[j].chips = player_list[j].chips + earnings;
	  						message.channel.send("Blackjack! " + player_list[j].player + " wins $" + earnings);
	  					} else if (player_list[j].card_val < 22) { // normal win 
	  						earnings = player_list[j].bet * 2;
	  						message.channel.send(player_list[j].player + "wins $" + earnings);
	  						player_list[j].chips = player_list[j].chips + earnings;
	  					} else {
	  						message.channel.send(player_list[j].player + " loses!");
	  					}
	  				}
  					player_list[j].cards = [];
  					player_list[j].bet = 0;
  					player_list[j].blackjack = 0;
  					player_list[j].card_val = 0;
	  				
	  				dealer.cards = [];
	  				dealer_turn = 0;
	  				
	  			}
	  			if (card_val >= 17) {
	  				message.channel.send("Payouts: ");
	  				for (var j = 0; j < player_list.length; j++) {
	  					var earnings = 0;
	  					if (player_list[j].blackjack === 1) {
	  						earnings = (player_list[j].bet * 2) + (player_list[j].bet * 0.5);
	  						player_list[j].chips = player_list[j].chips + earnings;
	  						message.channel.send("Blackjack! " + player_list[j].player + "wins $" + earnings);
	  					}
	  					else if ( (player_list[j].card_val > card_val) && (player_list[j].card_val < 22)) { // normal win 
	  						earnings = player_list[j].bet * 2;
	  						message.channel.send(player_list[j].player + "wins $" + earnings);
	  						player_list[j].chips = player_list[j].chips + earnings;
	  					}
	  					else if (player_list[j].card_val === card_val) {
	  						earnings = player_list[j].bet;
	  						message.channel.send("Tied the dealer. " + player_list[j].player + " receives $" + earnings);
	  						player_list[j].chips = player_list[j].chips + earnings;
	  					} else {
	  						message.channel.send(player_list[j].player + " loses!");
	  					}
	  					player_list[j].cards = [];
	  					player_list[j].bet = 0;
	  					player_list[j].blackjack = 0;
	  					player_list[j].card_val = 0;
	  					
	  				}
	  				dealer.cards = [];
	  				dealer_turn = 0;
	  				
	  			}
	  		dealer.cards = [];
	  		dealer_turn = 0;
	  	}
	  	if (command === "devme") {
	  		for (var i = 0; i < player_list.length; i++) {
	  			if (player_list[i].player == message.author.toString()) {
	  				  	message.channel.send(player_list[i].player);
					  	message.channel.send(player_list[i].balance);
					  	message.channel.send(player_list[i].chips);
					  	message.channel.send(player_list[i].cards);
	  			}
	  		}
	  	}

  }

  if (command === "write") {
  	message.channel.send(args_str);
  }
  if (command === "ping") {
    message.channel.send("pong!");
  }
  if (command === "setgame") {
    bot.user.setGame(args_str);
  }
  if (command === "reflextions") {
    message.channel.send("hey this reflextions is playing your game rewind I'm going to record some a video playthrough to give you some feedback and my first impressions sorry I read the concept in your description sounds pretty interesting the like turns are based on or our combat is based on how much time you have left you something in that regard I like this this is an eye cleric nice clean menu I like the selection options when I like how you that logo has like the clock in it it's pretty  cool with this yeah it like snaps bagon huh maybe you just start ticking it the other way or have go around but I'm what kind of interesting itemization like that also full screen would be nice or some options here for  sound but it's a demo so it's not too  bad nice to transition I don't know if this is about if it's an RP RPG maker game I think not having full screen is kind of a dead giveaway that which can maybe be detrimental those first impression all right yeah your pics are it's great");
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
    response_bool = 1;
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
    response_bool = -1;
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
            value: "Attempts to play a youtube video from the link provided\nDoes not perform link checking, results may be unpredictable."
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
  // if (command === "pubg") {
  //   const pubg = new PubgAPI({
  //     apikey: '6a1822ea-b0ba-491a-bbad-82a78fc41820',
  //     // redisConfig: {
  //     //   host: '127.0.0.1',
  //     //   port: 6379,
  //     //   expiration: 300, // Optional - defaults to 300.
  //     // },
  //   });
  //   pubg.getProfileByNickname('marco_')
  //     .then((profile) => {
  //       const data = profile.content;
  //       const stats = profile.getStats({
  //         region: REGION.ALL, // defaults to profile.content.selectedRegion
  //       //  season: SEASON.EA2017pre3, // defaults to profile.content.defaultSeason
  //         match: MATCH.SOLO // defaults to SOLO
  //       });
  //       console.log(stats);
  //     });
  // }
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.

    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[1], 10);

    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({count: deleteCount});

    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
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
        description: "A simple bot customized for Marco's Server",
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
    message.channel.send("Marco Bot is Online!");
  }
  if (command === "joinme") {
    if (!channel) return message.channel.send("You must be connected to a voice channel to use command: \"joinme\"");
    message.channel.send("joining user voice channel for: " + message.author);
    const channel = message.member.voiceChannel;
    channel.join().then(connection => console.log("Connected to voice channel!")).catch(console.error);

  }
  if (command === "leaveme") {
    if (!channel) return message.channel.send("You must be connected to a voice channel to use command: \"leaveme\"");
    const channel = message.member.voiceChannel;
    channel.leave();
    console.log("Disconnected from voice channel!");
  }

  if (command === "getid") {
    return message.channel.send("User id: " + message.author.id );
  }
  if (command === "toggleplay") {
    if (message.author.id == 192394142196826112) {
      play_bool = !play_bool;
      return message.channel.send("Status of Media player set to: " + play_bool);
    } else {
      return message.channel.send("You do not have permission to change the status of the bot");
    }
  }
  if (command === "random") {
    if (isNaN(args[1]) && typeof(args[1]) != "undefined") {
      return message.channel.send("Random requires a numeric parameter");
    } else if (args[1]) {
      var min = Math.min(0,args[1]);
      var max = Math.max(0,args[1]);
      return message.channel.send("Random number("+min+"-" + max + "): " + Math.floor(Math.random()* args[1]));
    } else {
      return message.channel.send("Random number(0-100): " + Math.floor(Math.random()* 100));
    }
  }
  if (command === "play") {
    if (!play_bool) {
      return message.channel.send("Media has been disabled. Contact an administrator to re-enable");
    }
    const serverQueue = song_queue.get(message.guild.id);
    const channel = message.member.voiceChannel;
    if (!channel) return message.channel.send("You must be connected to a voice channel to use command: \"play\"");

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

function blackjack_player(player_name) {
	this.player = player_name;
	this.balance = 0;
	this.chips = 0;
	this.bet = 0;
	this.card_val = 0;
	this.cards = [];
	this.blackjack = 0;
}

function num_to_value(val) {
	var ret_val = val % 13;
	if (ret_val > 10 || ret_val === 0) {
		ret_val = 10;
	}
	return ret_val;
}
function num_to_card(val){
	if (val === 1) {
		return "Ace of Spades";
	}
}
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function poker(guild) {  
	message.channel.send("is now playing poker!");
	return;
}
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
