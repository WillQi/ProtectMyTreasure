const {readdirSync} = require("fs");
const {join} = require("path");

const ProtectMyTreasureClient = require("./src/client/ProtectMyTreasureClient");

const TOKEN = process.env.TOKEN;

const PMTclient = new ProtectMyTreasureClient();

PMTclient.setupStorage(TOKEN).then(() => {
    const addonDirectories = readdirSync(join(__dirname, "src", "addons"));
    for (const directory of addonDirectories) require(join(__dirname, "src", "addons", directory))(PMTclient);
    PMTclient.login(TOKEN);
});