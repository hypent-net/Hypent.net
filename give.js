const mongoose = require('mongoose');
const discord = require('discord.js');

const Word = require("../../database/models/word");
const User = require("../../database/models/userwords");
mongoose.set('useFindAndModify', false);

const gotRecently = new Set();
var startTimeMS = 0;  // EPOCH Time of event count started
var timerStep = 1200000 ;   // Time beetwen calls

module.exports = {
    run: async (client, message, args) => {
        console.log(gotRecently)
        if (gotRecently.has(message.author.id)) {
            remainingTimeMS = await timeGet();
            var remainingTimeMIN = Math.floor(remainingTimeMS / 60000);
            function timeGet() {
                return timerStep - ((new Date()).getTime() - startTimeMS);
            }
            let embed = new discord.MessageEmbed()
                .setColor("#ff3c36")
                .addFields(
                    { name: ':flag_gb:\u200B', value: `Next word in **${remainingTimeMIN}** minutes!` },
                    { name: ':flag_cz:\u200B', value: `Nové slovo za **${remainingTimeMIN}** minut!` }
                ).setThumbnail("https://i.imgur.com/5UxthxL.png");
            message.channel.send(embed).then(msg => msg.delete({ timeout: 5000 }));
            message.delete();
            return;
        } else {
            gotRecently.add(message.author.id)
            startTimer();
            function startTimer() {
                startTimeMS = (new Date()).getTime();
                setTimeout(() => {
                    gotRecently.delete(message.author.id);
                }, timerStep);
            }
            let userid = message.author.id;
            mongoose.connect('mongodb://localhost:27017/UserStats', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
            });
            var db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', async function () {
                Word.estimatedDocumentCount().exec(async function (err, count) {
                    let wordcount = await Word.findOne({ "value": { $lt: 5 } }).countDocuments();
                    var random = Math.floor(Math.random() * wordcount)
                    let theWord = await Word.findOne({ "value": { $lt: 5 } }).skip(random);
                    //console.log(theWord);
                    User.findOne({ "userID": userid }, function (err, obj) {
                        if (obj) {
                            User.findOne({ "userID": userid, "wordIds": `${theWord._id}` }, function (err, obj) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send(err);
                                }
                                if (obj) {
                                    let embed = new discord.MessageEmbed()
                                        .setColor("#ffa530")
                                        .setTitle("Nic no")
                                        .addFields(
                                            { name: ':flag_cz:\u200B', value: `Už máš slovo **${theWord.wordCzech}**!` },
                                            { name: ':flag_gb:\u200B', value: `You aready have the word **${theWord.wordEnglish}**!` }
                                        )
                                        .setThumbnail("https://i.imgur.com/5Uf1EOl.png");
                                    message.channel.send(embed)
                                    return;
                                } else if (!obj) {
                                    User.findOneAndUpdate({ "userID": userid }, { $push: { "wordIds": theWord._id }, $inc: { score: theWord.value } }).exec(function (err, res) {
                                        if (err) {
                                            console.log(err);
                                            res.status(500).send(err);
                                        }else {
                                            let embed = new discord.MessageEmbed()
                                                .setColor("#ffa530")
                                                .setTitle("Nové slovo")
                                                .addFields(
                                                    { name: ':flag_cz:\u200B', value: `Teď máš slovo **${theWord.wordCzech}**!` },
                                                    { name: ':flag_gb:\u200B', value: `Now you have the word **${theWord.wordEnglish}**!` }
                                                )
                                                .setThumbnail("https://i.imgur.com/Nbgm8qo.png");
                                            message.channel.send(embed)
                                        }
                                    })
                                }
                            })
                        }else{
                            let user = new User({
                                userID: userid,
                                wordIds: theWord._id,
                                score: theWord.value + 15
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
                            message.channel.send(embed)
                        }
                    })
                });
            })
        }
    },
    aliases: ['giveword', 'newword', 'noveslovo', 'slovo', 'slovodej', 'word']
}
