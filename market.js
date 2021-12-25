const discord = require('discord.js');
const mongoose = require('mongoose');
const Word = require("../../database/models/word");
const User = require("../../database/models/userwords");
mongoose.set('useFindAndModify', false);
module.exports = {
    run: async (client, message, args) => {
        mongoose.connect('mongodb://localhost:27017/UserStats', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.error(err)
                return
            }
        });
        var db = mongoose.connection;
        let userid = message.author.id;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', async function () {
            let { cache } = message.guild.emojis;
            const plusEmoji = cache.find(emoji => emoji.name === "cz_plus");
            const checkEmooji = cache.find(emoji => emoji.name === "cz_check");
            const beginnerEmoji = cache.find(emoji => emoji.name === "_beginnner");
            const intermediateEmoji = cache.find(emoji => emoji.name === "_intermediate");
            const advancedEmoji = cache.find(emoji => emoji.name === "_advanced");
            const fluentEmoji = cache.find(emoji => emoji.name === "_fluent");
            dotBEG = "<:_beginnner:694924576827899996>";
            dotADV = "<:_advanced:694924577129889804>";
            dotFLU = "<:_fluent:694924578253701120>";
            gif = "https://i.imgur.com/RZACo5l.gif"
            gifGOLD = "https://i.imgur.com/yjvkk37.gif"
            let embed = new discord.MessageEmbed()
                .setColor("#ffa530")
                .setTitle("Market")
                .setDescription(
                    `\u200B\n${intermediateEmoji} Get intermediate words\n\n${fluentEmoji} Get **hard** words`
                    )
                    // .addFields(
                    //     { name: `${intermediateEmoji}`, value: `Get intermediate words`, inline: true },
                    //     { name: `${advancedEmoji}`, value: `Get advanced words`, inline: true })
            ReactionMessage = await message.channel.send(embed)
            const time = 30000 //amount of time to collect for in milliseconds
            Reaction(ReactionMessage);
            async function Reaction(msg) {
                msg.react(intermediateEmoji);
                msg.react(fluentEmoji);
            }
            const filter = (reaction, user) => {
                return ["_intermediate", "_fluent", "↩️"].includes(reaction.emoji.name) && user.id === message.author.id;
            };
            const collector = ReactionMessage.createReactionCollector(filter, { max: 1, time: time });
            collector.on('collect', (reaction, reactionCollector) => {
                switch (reaction.emoji.name) {
                    case ("_intermediate"):
                        Trade(0, 5, 4, dotBEG, dotADV, gif);
                        break;
                    case ("_fluent"):
                        Trade(4, 8, 8, dotADV, dotFLU, gifGOLD);
                        break;
                }
            })
            async function Trade(grt, lwt, gthard, dot, dotHard, gif) {
                //console.log(lwt)
                let wordz = await User.findOne({ "userID": userid });
                let allWords = wordz.wordIds.toString().split(',');
                arrLenght = allWords.length;
                //console.log(allWords)
                var words = new Array();
                var wordsEN = new Array();
                var wordids = new Array();
                let i = 0;
                for (var s = 0; s < arrLenght; s++) {
                    //console.log(allWords[s])
                    let word = await Word.findOne({ "_id": `${allWords[s]}`, "value": {$gt : grt, $lt: lwt } });
                    //console.log(word)
                    //console.log("s " + s + "i " + i)
                    if (word !== null) {
                        words.push(dot + word.wordCzech);
                        wordsEN.push(word.wordEnglish);
                        wordids.push(word._id);
                        i++
                    }
                    //console.log("all " + allWords.length)
                    if (s + 1 === allWords.length && words.length !== 5) {
                        //console.log(words.length)
                        let missing = 5 - words.length;
                        ///console.log(missing);
                        let missingText = `${dot} xxxxxxx\n`;
                        let missingTextEng = "xxxxxxx\n";
                        words.filter(n => n);
                        const current = words.slice()
                        const currentEN = wordsEN.slice()

                        let embed = new discord.MessageEmbed()
                            .setColor("#ffa530")
                            .setTitle(`Trade`)
                            .addFields(
                                { name: 'Czech', value: `${current.toString().split(",").join("\n")}\n${missingText.repeat(missing)}\n\n⏬⏬⏬⏬\n\n${dotHard}???`, inline: true },
                                { name: 'English', value: `${currentEN.toString().split(",").join("\n")}\n${missingTextEng.repeat(missing)}\n\n⏬⏬⏬⏬\n\n???`, inline: true });
                        ReactionMessage.reactions.removeAll().then(async () => {
                            Return(embed);
                        })

                        break;
                    }
                    if (i === 5) {
                        //console.log("wolenght "+ words.length)
                        words.filter(n => n);
                        const current = words.slice()
                        const currentEN = wordsEN.slice()
                        let embed = new discord.MessageEmbed()
                            .setColor("#ffa530")
                            .setTitle(`Trade`)
                            .addFields(
                                { name: 'Czech', value: `${current.toString().split(",").join("\n")}\n\n⏬⏬⏬⏬\n\n${dotHard}???`, inline: true },
                                { name: 'English', value: `${currentEN.toString().split(",").join("\n")}\n\n⏬⏬⏬⏬\n\n???`, inline: true });
                        ReactionMessage.reactions.removeAll().then(async () => {
                            ReactionMessage.edit(embed);
                            ReactionMessage.react("✅");
                            ReactionMessage.react("❌");
                        })
                        const YesNofilter = (reaction, user) => {
                            return ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
                        };
                        const tradeCollector = ReactionMessage.createReactionCollector(YesNofilter, { max: 1, time: time });
                        tradeCollector.on('collect', async (reaction, reactionCollector) => {
                            switch (reaction.emoji.name) {
                                case ("✅"):
                                    wordids.every(async function (item) {
                                        //console.log(item)
                                        let word = await User.findOneAndUpdate({ "userID": userid }, { $pull: { "wordIds": `${item}` } });
                                    })
                                    Word.estimatedDocumentCount().exec(async function (err, count) {
                                        let wordcount = await Word.findOne({ "value": { $gt: gthard } }).countDocuments();
                                        var random = Math.floor(Math.random() * wordcount)
                                        let theWord = await Word.findOne({ "value": { $gt: gthard } }).skip(random);
                                        User.findOne({ "userID": userid }, function (err, obj) {
                                            if (obj) {
                                                User.findOne({ "userID": userid, "wordIds": `${theWord._id}` }, function (err, obj) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.status(500).send(err);
                                                    }
                                                    let embed = new discord.MessageEmbed()
                                                        .setColor("#ffa530")
                                                        .setTitle("Otevírám")
                                                        .setImage(gif);
                                                        ReactionMessage.reactions.removeAll().then(async () => {
                                                            ReactionMessage.edit(embed)
                                                        })
                                                    setTimeout(() => {
                                                        if (obj) {
                                                            let embed = new discord.MessageEmbed()
                                                                .setColor("#ffa530")
                                                                .setTitle("Škoda")
                                                                .addFields(
                                                                    { name: ':flag_cz:\u200B', value: `Už máš slovo **${theWord.wordCzech}**!` },
                                                                    { name: ':flag_gb:\u200B', value: `You aready have the word **${theWord.wordEnglish}**!` }
                                                                )
                                                                .setThumbnail("https://i.imgur.com/5Uf1EOl.png");
                                                                Return(embed);
                                                            return;
                                                        } else if (!obj) {
                                                            User.findOneAndUpdate({ "userID": userid }, { $push: { "wordIds": theWord._id }, $inc: { score: theWord.value } }).exec(function (err, res) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.status(500).send(err);
                                                                } else {
                                                                    let embed = new discord.MessageEmbed()
                                                                        .setColor("#ffa530")
                                                                        .setTitle("Nové slovo")
                                                                        .addFields(
                                                                            { name: ':flag_cz:\u200B', value: `Teď máš slovo **${theWord.wordCzech}**!` },
                                                                            { name: ':flag_gb:\u200B', value: `Now you have the word **${theWord.wordEnglish}**!` }
                                                                        )
                                                                        .setThumbnail("https://i.imgur.com/Nbgm8qo.png");
                                                                            Return(embed);
                                                                }
                                                            })
                                                        }
                                                    }, 4000);
                                                })
                                            }else {
                                                let user = new User({
                                                    userID: userid,
                                                    wordIds: theWord._id,
                                                    score: theWord.value
                                                });
                                                user.save();
                                                let embed = new discord.MessageEmbed()
                                                    .setColor("#ffa530")
                                                    .setTitle("Nové slovo")
                                                    .addFields(
                                                        { name: ':flag_cz:\u200B', value: `Teď máš slovo **${theWord.wordCzech}**!` },
                                                        { name: ':flag_gb:\u200B', value: `Now you have the word **${theWord.wordEnglish}**!` }
                                                    )
                                                    .setThumbnail("https://i.imgur.com/Nbgm8qo.png");
                                                    ReactionMessage.reactions.removeAll().then(async () => {
                                                        Return(embed);
                                                    })
                                            }
                                        })
                                        //console.log("theword" + theWord)
                                    })
                                    break;
                                case ("❌"):
                                    BackMessage()
                                    break;
                            }
                        })
                        break;
                    }
                }
            }
            function Return(embed) {
                ReactionMessage.edit(embed)
                ReactionMessage.react("↩️");
                const filter = (reaction, user) => {
                    return ["↩️"].includes(reaction.emoji.name) && user.id === message.author.id;
                };
                const collector = ReactionMessage.createReactionCollector(filter, { max: 1, time: time });
                collector.on('collect', async (reaction, reactionCollector) => {
                    switch (reaction.emoji.name) {
                        case ("↩️"):
                            let embed = new discord.MessageEmbed()
                            .setColor("#ffa530")
                            .setTitle("Market")
                            .setDescription(
                                `\u200B\n${intermediateEmoji} Get intermediate words\n\n${advancedEmoji} Get advanced words`
                                )
                                /* .addFields(
                                        { name: `${intermediateEmoji}`, value: `Get intermediate words`, inline: true },
                                        { name: `${advancedEmoji}`, value: `Get advanced words`, inline: true })
                                */
                        ReactionMessage = await message.channel.send(embed)
                        const time = 30000 //amount of time to collect for in milliseconds
                        Reaction(ReactionMessage);
                        async function Reaction(msg) {
                            msg.react(intermediateEmoji);
                            msg.react(advancedEmoji);
                        }
                        const filter = (reaction, user) => {
                            return ["_intermediate", "_advanced", "↩️"].includes(reaction.emoji.name) && user.id === message.author.id;
                        };
                        const collector = ReactionMessage.createReactionCollector(filter, { max: 1, time: time });
                        collector.on('collect', (reaction, reactionCollector) => {
                            switch (reaction.emoji.name) {
                                case ("_intermediate"):
                                    Trade(0, 5, 4, dotBEG, dotADV, gif);
                                    break;
                                case ("_advanced"):
                                    Trade(4, 8, 8, dotADV, dotFLU, gifGOLD);
                                    break;
                            }
                            })
                            break;
                    }
                })
            }
            async function BackMessage() {
                ReactionMessage.reactions.removeAll();
                let embed = new discord.MessageEmbed()
                    .setColor("#ffa530")
                    .setTitle(`Zrušeno`)
                    .setDescription(
                        `Jak chceš`
                    )
                    .setThumbnail("https://i.imgur.com/e24a3hK.png");
                        ReactionMessage.edit(embed)
                setTimeout(() => {
                    ReactionMessage.delete()
                }, 5000);
            }
        })
        message.delete();
    },
    aliases: ['shop', 'obchod', 'koupit', 'trh']
}
