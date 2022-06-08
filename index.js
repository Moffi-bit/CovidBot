import DiscordJS, { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'
import { parse } from 'csv-parse'
import got from 'got'
import fs, { createWriteStream } from 'fs'
dotenv.config()

const myIntents = new Intents();
myIntents.add('GUILDS', 'GUILD_MESSAGES');
const client = new Client({ intents: myIntents });
const URL= 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us.csv';
const allData = [];

function getCovidInfo() {
    fs.createReadStream('data.csv')
    .pipe(parse({ delimiter: ",", from_line: 1 }))
    .on("data",  (row) => {
        allData.push(row);
    })
    .on("error", (error) => {
        console.log(error.message);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        // console.log(allData);
    });
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    got.stream(URL).pipe(createWriteStream('data.csv'));
    // Makes sure its referencing the guild the bot is in and where the interaction is taking place.
    const guild = client.guilds.cache.map(guild => guild.id);
    let commands;
    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }
    // Register covid command
    commands?.create({
        name: 'covid',
        description: 'Replies with the covid information of the day for the United States.',
    });

});

getCovidInfo()

client.on('interactionCreate', async (interaction) => {
    // Making sure the interaction is a command
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName } = interaction;

    if (commandName === 'covid') {
        interaction.reply({
            content: "United States Data for Today:\n" + allData[0][0] + ": " + allData[1][0] + "\n" + allData[0][1] + ": " + allData[1][1] + "\n" + allData[0][2] + ": " + allData[1][2],
            ephemeral: true, // Used if you only want the user who typed the command to see the message
        })
    }
})

// Make sure this line is the last line always
client.login(process.env.TOKEN); // Login bot using token