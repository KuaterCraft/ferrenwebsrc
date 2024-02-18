const express = require('express');
const path = require('path');
const app = express();
const passport = require('passport');
const session = require('express-session');
const DiscordStrategy = require('passport-discord').Strategy;
const chalk = require('chalk');
const mongoose = require('mongoose');
const Levels = require(`./database/models/levelsConfig`);
const profile = require(`./database/models/profile.js`);
const guildFunc = require(`./database/models/functions`);
const bodyParser = require('body-parser');
const mySecret = "---2NDQyMDk2NzY2Njk1NDI4MA.GvwAcp.siywtves8ba3itsuyvb3iukye";
const fs = require('fs');
require('dotenv').config()

//database
mongoose.set('strictQuery', false);
async function connect() {
    try {
        console.log(chalk.yellow(chalk.bold(`Ferren Data`)), (chalk.white(`|`)), chalk.red(`MongoDB`), chalk.green(`is connecting...`))
        await mongoose.connect(process.env.MONGO_TOKEN);
    } catch (err) {
        console.log(chalk.red(`[ERROR]`), chalk.white(`|`), chalk.red(`MongoDB`), chalk.white(`|`), chalk.red(`Failed to connect to MongoDB!`), chalk.white(`>>`), chalk.red(`Error: ${err}`))
        console.log(chalk.red("Exiting..."))
        process.exit(1)
    }


    mongoose.connection.once("open", () => {
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`|`)), chalk.red(`MongoDB`), chalk.green(`is ready!`))
    });
}
connect()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: '829291oZiMu50pKjN',
    resave: true,
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    name: "discordAuth"
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Define the middleware to set default avatar URL
app.use((req, res, next) => {
    const defaultAvatarURL = 'https://cdn.discordapp.com/attachments/944562237476073482/1140307704364146799/4c1b599b1ef5b9f1874fdb9933f3e03b.png';

    if (req.user && !req.user.avatar) {
        req.user.avatarURL = defaultAvatarURL;
    } else if (req.user) {
        req.user.avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    }

    next();
});
app.use((req, res, next) => {
    let pathPrefix;
    if (req.path.startsWith('/server/')) {
        pathPrefix = '../'
    } else if (req.path.startsWith('/user/')) {
        pathPrefix = '../'
    } else {
        pathPrefix = './'
    }

    res.cssUrl = [
        `${pathPrefix}css/commands.css`,
        `${pathPrefix}css/style.css`,
        `${pathPrefix}css/bootstrap.min.css`,
    ];

    next();
});


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new DiscordStrategy({
    clientID: '1064420967666954280',
    clientSecret: 'N9ErfcgD5hgRSJ56KYdjCoZiMu50pKjN',
    callbackURL: process.env.url + "/callback",
    scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname)));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Normal Routes
app.get('/changelogs', (req, res) => {
    res.render('changelogs', { css: res.cssUrl, user: req.user });
});


app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/login',
}), (req, res) => {
    res.redirect('/');
});

app.get('/', async (req, res) => {
    const BotStats = process.env.serverUrl + "/botStats"
    const respo = await fetch(BotStats);
    const data = await respo.json();
    res.render('index', { user: req.user, css: res.cssUrl, data: data });
});


app.get('/privacy', (req, res) => {
    res.render('privacy', { user: req.user, css: res.cssUrl });

});

app.get('/test', (req, res) => {
    res.render("test", { user: req.user, css: res.cssUrl });
});

app.get('/manage', (req, res) => {
    if (!req.user) {
        return res.send('<script>alert("Please login first!"); window.location.href = "/login";</script>');
    }

    const userGuilds = req.user.guilds.filter(guild => (guild.permissions & 8) === 8);
    const guildsData = userGuilds.map(guild => {
        return {
            serverId: guild.id,
            serverName: guild.name,
            avatarURL: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : "https://cdn.discordapp.com/attachments/1117705569336299592/1182312755018092544/477b12750753b3449372ab8367175d16.png?ex=65843d8f&is=6571c88f&hm=934962e12c0a0145c962ffb18e435c3e61171687a9aebd8fca63b9de5b3e2b36&",
            memberCount: guild.memberCount,
        };
    });

    res.render('manage', { css: res.cssUrl, user: req.user, guilds: guildsData });
});




app.get('/logout', function (req, res) {
    req.logout(function (err) {
        res.redirect('/');
    });
});

app.get('/servers', (req, res) => {
    res.render('servers', { user: req.user, css: res.cssUrl });
});

app.get('/user/:userId', async (req, res) => {
    if (!req.user) {
        return res.send('<script>alert("Please login first!"); window.location.href = "/login";</script>');
    }

    const userId = req.params.userId;

    try {
        let levelsData = await Levels.findOne({ userID: userId });
        let profileData = await profile.findOne({ User: userId });
        if (!levelsData) {
            levelsData = new Levels({ userID: userId });
        }
        const mySecret = userId;

        res.render('user', { user: req.user, userId, levelsData, profileData, mySecret, css: res.cssUrl });
    } catch (error) {
        console.error('Error retrieving levels data:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/tos', (req, res) => {
    res.render('tos', { user: req.user, css: res.cssUrl });
});
app.get('/login', passport.authenticate('discord'));

app.get('/server/:serverId', async (req, res) => {
    if (!req.user) {
        return res.send('<script>alert("Please login first!"); window.location.href = "/login";</script>');
    }

    const userGuilds = req.user.guilds.filter(guild => (guild.permissions & 8) === 8);
    const guildsData = userGuilds.map(guild => {
        return {
            serverId: guild.id,
            serverName: guild.name,
            avatarURL: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : "https://cdn.discordapp.com/attachments/1117705569336299592/1182312755018092544/477b12750753b3449372ab8367175d16.png?ex=65843d8f&is=6571c88f&hm=934962e12c0a0145c962ffb18e435c3e61171687a9aebd8fca63b9de5b3e2b36&",
            memberCount: guild.memberCount,
        };
    });

    const serverId = req.params.serverId;

    let guildDataFunc = await guildFunc.findOne({ Guild: serverId });

    if (!guildDataFunc) {
        guildDataFunc = new guildFunc({ Guild: serverId });
    }

    const currentGuild = guildsData.find((guild) => guild.serverId === serverId);

    if (!currentGuild) {
        return res.send('<script>alert("The server does not exist!"); window.location.href = "/manage";</script>');
    }

    try {
        const response = await fetch(`${process.env.serverUrl}/getGuildInfo`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${mySecret}`,
                'Content-Type': 'application/json',
                'X-Server-Id': serverId
            },
        });

        if (response.status === 404) {
            // Bot is not in the server, redirect to the bot invite page
            const inviteURL = 'https://discord.com/oauth2/authorize?client_id=1064420967666954280&permissions=1513962695871&guild_id=' + serverId + '&scope=bot%20applications.commands';
            return res.redirect(inviteURL);
        }

        if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
        }

        const guildInfo = await response.json();


        res.render('server', { user: req.user, currentGuild, guildInfo, guildFunc: guildDataFunc, css: res.cssUrl });
    } catch (error) {
        console.error('Error fetching guild information:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/createProfile', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    new profile({
        User: req.user.id
    }).save();

    res.redirect(`/user/${req.user.id}`);
});

app.post('/saveProfileData', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { gender, age, birthday, color, pet, country, songs, movies, actors, artists, food, hobbys, status, aboutme } = req.body;
    try {
        const profilesData = await profile.findOne({ User: userId });

        profilesData.Gender = gender;
        profilesData.Age = age;
        profilesData.Birthday = birthday;
        profilesData.Color = color;
        profilesData.Pets = pet;
        profilesData.Orgin = country;
        profilesData.Songs = songs;
        profilesData.Movies = movies;
        profilesData.Actors = actors;
        profilesData.Artists = artists;
        profilesData.Food = food;
        profilesData.Hobbys = hobbys;
        profilesData.Status = status;
        profilesData.Aboutme = aboutme;


        await profilesData.save();
        res.redirect(`/user/${userId}`)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
})
app.post('/saveRankCard', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { progressBarColors, discriminatorColor } = req.body;

    try {
        let levelsData = await Levels.findOne({ userID: userId });
        if (!levelsData) {
            levelsData = new Levels({ userID: userId });
        }


        levelsData.RankCard.progressBarColors = progressBarColors;
        levelsData.RankCard.discriminatorColor = discriminatorColor;


        await levelsData.save();

        res.redirect(`/user/${req.user.id}`);
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


app.use((req, res, next) => {
    res.status(404).render('404', { user: req.user, css: res.cssUrl });
});

app.listen(80, () => {
    console.log(chalk.yellow(chalk.bold(`Ferren`)), (chalk.white(`|`)), chalk.red(`Dashboard`), chalk.green(`online!`))
});
