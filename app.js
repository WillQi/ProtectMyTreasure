const {readdirSync} = require("fs");
const {join} = require("path");

const ProtectMyTreasureClient = require("./src/client/ProtectMyTreasureClient");

const {TOKEN} = require("./config.json");

const PMTclient = new ProtectMyTreasureClient();

PMTclient.login(TOKEN);

const addonDirectories = readdirSync(join(__dirname, "src", "addons"));

for (const directory of addonDirectories) require(join(__dirname, "src", "addons", directory))(PMTclient);