const discord = require("discord.js");
const config = require("./config/config.js");
const prefix = config.discord.prefix;
const token = config.discord.TOKEN;
//const keepAlive = require("./server.js")
const fs = require("fs");

const client = new discord.Client();
client.commands = new discord.Collection();

const fsRead = fs
    .readdirSync(`./commands/`)
    .filter((files) => files.endsWith(".js"));
for (const file of fsRead) {
    const command = require(`./commands/${file}`);
    console.log(`Loading command ${file}`);
    client.commands.set(command.name.toLowerCase(), command);
}

const queue = new Map();

client.on("ready", () => {
    client.user.setActivity("Kemaluanmu", {
        type: "PIG",
    });
});

client.once("ready", () => {
    console.log("Ready!");
});

client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

client.once("disconnect", () => {
    console.log("Disconnect!");
});

client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);
    const argument = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = argument.shift().toLowerCase();
    const cmd =
        client.commands.get(command) ||
        client.commands.find(
            (cmd) => cmd.alliases && cmd.alliases.includes(command)
        );
    if (cmd) {
        cmd.execute(message, serverQueue, argument, queue);
    }
    if (message.content == prefix + "find" && message.attachments.size > 0) {
        const findAnime = require("./findimg/findAnime.js");
        const result = await findAnime({
            imageUrl: message.attachments.first().attachment,
        });
        if (result == undefined) {
            message.channel.send("queue is full");
        } else {
            message.channel.send(result);
        }
    }
});
//server keep live
//keepAlive();
client.login(token);
