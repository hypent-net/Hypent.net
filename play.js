const discord = require('discord.js');
const mongoose = require('mongoose');
const { MessageCollector } = require('discord.js');

const Word = require("../../database/models/word");
const User = require("../../database/models/userwords");
mongoose.set('useFindAndModify', false);
const playedRecently = new Set();
var startTimeMS = 0;  // EPOCH Time of event count started
var timerStep = 1800000;   // Time beetwen calls
time = 60000;
module.exports = {
    run: async (client, message, args) => {
        //console.log(playedRecently)
        if (playedRecently.has(message.author.id)) {
            remainingTimeMS = await timeGet();
            var remainingTimeMIN = Math.floor(remainingTimeMS / 60000);
            function timeGet() {
                return timerStep - ((new Date()).getTime() - startTimeMS);
            }
            let embed = new discord.MessageEmbed()
                .setColor("#ff3c36")
                .addFields(
                    { name: ':flag_gb:\u200B', value: `You can play in **${remainingTimeMIN}** minutes!` },
                    { name: ':flag_cz:\u200B', value: `Můžeš hrát za **${remainingTimeMIN}** minut!` }    
                ).setThumbnail("https://i.imgur.com/5UxthxL.png");

            message.channel.send(embed).then(msg => msg.delete({ timeout: 5000 }));
            message.delete();
            return;
        } else {
            playedRecently.add(message.author.id)
            startTimer();
            function startTimer() {
                startTimeMS = (new Date()).getTime();
                setTimeout(() => {
                    playedRecently.delete(message.author.id);
                }, timerStep );
            }

            username = message.member.displayName;
            userid = message.author.id;

            

            mongoose.connect('mongodb://localhost:27017/Stats', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
            });

            var db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));

            db.once('open', async function () {

                let word = await User.findOne({ "userID": userid });
                console.log(word.score)
                
                let allWords = word.wordIds.toString().split(',');
                count = allWords.length;
                if(word.score < count*3){
                    let embed = new discord.MessageEmbed()

                    .setTitle(`Nemůžeš!`)
                    .setDescription(`Potřebuješ alespoň **${count*3}** čechízů!\n(Chybí ti **${count*3 - word.score}**)`)
                    .setThumbnail("https://i.imgur.com/aqyOSdx.png")
                    .setColor('#ffa530');

            message.channel.send(embed)
                }else{
                let embed = new discord.MessageEmbed()
                        .setTitle(`Začít?`)
                        .setDescription(`Chceš hrát za **${count*3}** čechízů?`)
                        .setThumbnail("https://i.imgur.com/pYq7eBq.png")
                        .setColor('#ffa530');

                let ReactionMessage = await message.channel.send(embed)

                ReactionMessage.react("✅");
                            ReactionMessage.react("❌");
                        

                        const YesNofilter = (reaction, user) => {
                            return ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
                        };

                        const tradeCollector = ReactionMessage.createReactionCollector(YesNofilter, { max: 1, time: time });

                        tradeCollector.on('collect', async (reaction, reactionCollector) => {

                            switch (reaction.emoji.name) {
                                case ("✅"):

                                    let timerID;
                                    let oldMsg;
                        
                                    var category = client.channels.cache.find(role => role.name === "current games (/play)");
                                    let theChannel = await message.guild.channels.create(username, {
                                        type: 'text',
                                        parent: category,
                                        permissionOverwrites: [
                                            {
                                                id: message.member.guild.id,
                                                deny: ['SEND_MESSAGES'],
                                            },
                                            {
                                                id: message.author.id,
                                                allow: ['SEND_MESSAGES'],
                                            },
                                        ],
                                    });

                                    let embedder = new discord.MessageEmbed()
                        .setTitle(`Hraj!`)
                        .setDescription(`Začala ti hra v ${theChannel}!`)
                        .setColor('#ffa530');

                                    ReactionMessage.reactions.removeAll().then(async () => {
                                    let playingMessage = await ReactionMessage.edit(embedder)
                                    Start(count);
                                })

                async function Start(count) {
                    let removeCzechiez = await User.findOneAndUpdate({ "userID": userid }, { $inc: { score: -count*3 } });

                    let theWord = await GetNewWord(allWords, count);
                    ansCount = 0;
                    score = 0;
                    maxQuestionAmt = count * 2;
                    questionAmt = 0;
                    let embed = new discord.MessageEmbed()
                        .setTitle(`Translate to Czech`)
                        .setFooter(`${ansCount} | Score: ${score}`, "https://i.imgur.com/XerxQlo.png")
                        .setDescription(theWord.wordEnglish)
                        .setColor('#ffa530')
                    let infoMsg = await theChannel.send(embed);
                    
                    CheckAnswer(allWords, theWord, infoMsg, count, theChannel, ansCount, score, timerID, oldMsg)
                    setTimeout(async function () {
                        infoMsg.delete();
                        let embed = new discord.MessageEmbed()
                                .setTitle(`Good game!`)
                                .setDescription(`⏰ Time limit hit!\n\n**__You got:__**\n**${ansCount}** answers\n**${score}** Czechies`)
                                .setColor('#ffa530')
                            theChannel.send(embed)
                            await User.findOneAndUpdate({ userID: userid }, { $inc: { "score": score } });
                            setTimeout(function () {
                                theChannel.delete();
                            }, 20000);
                    }, 600000);
                   
                }

         

            async function GetNewWord(allWords, count) {
                var random = Math.floor(Math.random() * count)
                var wordId = allWords[Math.floor(Math.random() * count)];
                //console.log(wordId)
                let theWord = await Word.findOne({ "_id": wordId });
                //console.log(theWord)
                //console.log(theWord)
                return theWord;
            }
            async function EditMessage(allWords, infoMsg, count, theChannel, ansCount, score, timerID, oldMsg) {
                let theWord = await GetNewWord(allWords, count);
                let embed = new discord.MessageEmbed()
                    .setTitle(`Translate to Czech`)
                    .setFooter(`${ansCount} | Score: ${score}`, "https://i.imgur.com/XerxQlo.png")
                    .setDescription(theWord.wordEnglish)
                    .setColor('#ffa530')
                infoMsg.edit(embed)

                //console.log("edited")
                CheckAnswer(allWords, theWord, infoMsg, count, theChannel, ansCount, score, timerID, oldMsg)
            }
            async function CheckAnswer(allWords, theWord, infoMsg, count, theChannel, ansCount, score, timer, oldMsg) {
                const collector = new discord.MessageCollector(theChannel, m => m.author.id === message.author.id, { time: 600000 });
                //console.log(theWord.wordCzech)
                collector.on('collect', async hisMsg => {
                    if (hisMsg.content.toLowerCase() == theWord.wordCzech.toLowerCase()) {

                        //console.log("checked")
                        ansCount++;
                        score += theWord.value;
                        questionAmt++;
                        collector.stop();
                        hisMsg.delete();
                        if (typeof timer !== 'undefined'){
                        clearTimeout(timer);
                        }
                        let timerID = setTimeout(async function () {
                            
                            infoMsg.delete();
                            if (oldMsg !== undefined) {
                                oldMsg.delete();
                            } else {
                                ;
                            }
                            let embed = new discord.MessageEmbed()
                                .setTitle(`Good game!`)
                                .setDescription(`⏰ Too slow!\n\n**__You got:__**\n**${ansCount}** answers\n**${score}** Czechies`)
                                .setColor('#ffa530')
                            theChannel.send(embed)
                            await User.findOneAndUpdate({ userID: userid }, { $inc: { "score": score } });
                            setTimeout(function () {
                                ReactionMessage.edit();
                                theChannel.delete();
                            }, 20000);
                            return;
                            }, 30000)

                        //clearTimeout(timerId);
                        if (questionAmt == maxQuestionAmt) {
                            // theChannel.overwritePermissions(userid,   {
                            //         SEND_MESSAGES: false
                            // }
                            // )
                            if (oldMsg !== undefined) {
                                oldMsg.delete();
                            } else {
                                ;
                            }
                            infoMsg.delete();
                            let embed = new discord.MessageEmbed()
                                .setTitle(`Good game!`)
                                .setDescription(`<:czechcheck:694569579707367474> All the words were repeated!\n\n**__You got:__**\n**${ansCount}** answers\n**${score}** Czechies`)
                                .setColor('#ffa530')
                            theChannel.send(embed)
                            await User.findOneAndUpdate({ userID: userid }, { $inc: { "score": score } });
                            setTimeout(function () {
                                theChannel.delete();
                            }, 20000);
                            return;
                        }

                        if (oldMsg !== undefined) {
                            oldMsg.edit(`<:czechcheck:694569579707367474> ${theWord.wordCzech}`);
                            EditMessage(allWords, infoMsg, count, theChannel, ansCount, score, timerID, oldMsg)
                        } else {
                            let newMsg = await theChannel.send(`<:czechcheck:694569579707367474> ${theWord.wordCzech}`)
                            EditMessage(allWords, infoMsg, count, theChannel, ansCount, score, timerID, newMsg)
                            

                            return;


                        }
                        //EditMessage(infoMsg, count, theChannel, newMsg)     
                    } else {
                        collector.stop()
                        
                        if (oldMsg !== undefined) {
                            oldMsg.delete();
                        } else {
                            ;
                        }
                        infoMsg.delete();

                        let embed = new discord.MessageEmbed()
                            .setTitle(`Good game!`)
                            .setDescription(`🇬🇧 ${theWord.wordEnglish}\n<:ceskyprosim:694569579678007386> ${hisMsg.content} => ${theWord.wordCzech} <:czechcheck:694569579707367474>\n\n**__You got:__**\n**${ansCount}** answers\n**${score}** Czechies`)
                            .setColor('#ffa530')
                        theChannel.send(embed)
                        await User.findOneAndUpdate({ userID: userid }, { $inc: { "score": score } });
                        setTimeout(function () {
                            let embed = new discord.MessageEmbed()
                            .setTitle(`Super!`)
                            .setDescription(`Hra uživatele ${username} skončila`)
                            .setThumbnail("https://i.imgur.com/Nbgm8qo.png")
                            .setColor('#ffa530');
                            
                            ReactionMessage.edit(embed);
                            theChannel.delete();
                        }, 1000);
                        return
                    }
                
                })
            }
                // collector.on('end', async collected => {
                //     infoMsg.delete();
                //             let embed = new discord.MessageEmbed()
                //                 .setTitle(`Good game!`)
                //                 .setDescription(`⏰ End of time!\n\n**__You got:__**\n**${ansCount}** answers\n**${score}** Czechies`)
                //                 .setColor('#ffa530')
                //             theChannel.send(embed)
                //             await User.findOneAndUpdate({ userID: userid }, { $inc: { "score": score } });
                //             setTimeout(function () {
                //                 theChannel.delete();
                //             }, 20000);
                //             return;
                // })
                break;
                case ("❌"):
                    let embed = new discord.MessageEmbed()
                        .setTitle(`Tak nic`)
                        .setDescription(`Jak chceš!`)
                        .setThumbnail("https://i.imgur.com/5Uf1EOl.png")
                        .setColor('#ffa530');
                    message.channel.send(embed)
                    break;
                }
            })     
        }    
        })
        message.delete();

    }

    },
    aliases: ['hrat, game, wordgame']
}