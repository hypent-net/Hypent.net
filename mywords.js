const discord = require('discord.js');
const fetch = require('fetch');
module.exports = {
    run: async (client, msg, args) => {
        let userid = msg.author.id;
        var allWords = await fetch("https://martinnaj27707.ipage.com/plankto?action=getUserData&userID=" + userid).then(res => res.text())
        if (allWords == "User not found") {
            msg.channel.send("We cannot find you in our database. Sorry.");
            return;
        }
        allWords = JSON.parse(allWords)['words'];
        var words = new Array();
        var wordsEN = new Array();
        allWords.forEach(async function (item, i) {
            let word = item
            let dot;
            switch (true) {
                case (word.value <= 4):
                    dot = "<:_beginnner:694924576827899996>"
                    break;
                case (word.value > 4 && word.value <= 7):
                    dot = "<:_intermediate:694924577037484114>"
                    break;
                case (word.value > 7 && word.value <= 10):
                    dot = "<:_advanced:694924577129889804>"
                    break;
            }
            words[i] = dot + " " + word.wordCzech;
            wordsEN[i] = word.wordEnglish;
            //console.log(words)
            if (i === allWords.length - 1) {
                TheEmbed()
                return;
            }
            return;
        })
        async function TheEmbed() {
            const generateEmbed = start => {
                const current = words.slice(start, start + 10)
                const currentEN = wordsEN.slice(start, start + 10)
                let embed = new discord.MessageEmbed()
                    .setColor("#ffa530")
                    .setTitle(`Slova ${start + 1}-${start + current.length} z ${words.length}`)
                    .addFields(
                        { name: 'Česky', value: current.toString().split(",").join("\n"), inline: true },
                        { name: 'Anglicky', value: currentEN.toString().split(",").join("\n"), inline: true })
                return embed;
            }
            const author = msg.author
            msg.channel.send(generateEmbed(0)).then(message => {
                // exit if there is only one page of words (no need for all of this)
                if (words.length <= 10) return
                // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
                message.react('➡️')
                const collector = message.createReactionCollector(
                    // only collect left and right arrow reactions from the message author
                    (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === author.id,
                    // time out after a minute
                    { time: 60000 }
                )
                let currentIndex = 0
                collector.on('collect', reaction => {
                    // remove the existing reactions
                    message.reactions.removeAll().then(async () => {
                        // increase/decrease index
                        reaction.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10
                        // edit message with new embed
                        message.edit(generateEmbed(currentIndex))
                        // react with left arrow if it isn't the start (await is used so that the right arrow always goes after the left)
                        if (currentIndex !== 0) await message.react('⬅️')
                        // react with right arrow if it isn't the end
                        if (currentIndex + 10 < words.length) message.react('➡️')
                    })
                })
            })
        }
    },
    aliases: ['slova', 'maslova', 'mojeslova']
}