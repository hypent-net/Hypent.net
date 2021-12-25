const fetch = require('fetch');
module.exports = {
    run: async (client, message, args) => {
        if(!(message.member.hasPermission('MUTE_MEMBERS'))){ return; }
        var response = await fetch("https://martinnaj27707.ipage.com/plankto?action=newWord&wordEnglish=" + args.split(", ")[1] + "&wordCzech=" + args.split(", ")[0] + "&value=" + args.split(", ")[2]).then(res => res.text())
        if (response == "Complete") {
            msg = message.channel.send("Done")
            msg.then((msg) => { setTimeout(msg.delete(), 5000); })
        }else{
            msg = message.channel.send(response)
            msg.then((msg) => { setTimeout(msg.delete(), 5000); })
        }
    },
    aliases: [""]
}