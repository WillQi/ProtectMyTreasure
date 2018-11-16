const Enmap = require("enmap");
const {createCipheriv, createHash, createDecipheriv} = require("crypto");

/**
 * Encrypts storage before saving it into the bot, complying with Discord TOS.
 */
class StorageEnmap {

    constructor () {

        this._enmap = new Enmap({ name: "database", dataDir: "./database" });

        this.defer = this._enmap.defer;

        this.key = null;
        
    }

    /**
     * Get a value from storage.
     * @param {string} prop Property to retrieve.
     * @param {any} fallback Fallback if property does not exist.
     */
    get (prop, fallback) {
        if (!this.key) throw new Error("Unable to get data without a key set.");
        const value = this._enmap.get(prop);
        if (!value) return fallback;
        const IV = Buffer.from(value.IV, "hex");
        const decrypted = this.decrypt(value.encrypted, IV);
        return JSON.parse(decrypted);
    }

    /**
     * Set a property in storage.
     * @param {string} key Property to set.
     * @param {any} value Value to set.
     */
    set (key, value) {
        if (!this.key) throw new Error("Unable to set data without a key set.");
        const encryptedData = this.encrypt(JSON.stringify(value));
        this._enmap.set(key, encryptedData);
        return encryptedData;
    }

    /**
     * Delete something in storage.
     * @param {string} key Property to delete.
     */
    delete (key) {
        this._enmap.delete(key);
    }

    /**
     * Encrypt a value.
     * @param {any} value Value to encrypt.
     */
    encrypt (value) {
        if (!this.key) throw new Error("Unable to decrypt without a key set.");
        const IV = Buffer.from(
            createHash("md5")
                .update(Math.random().toLocaleString())
                .digest("hex"),
            "hex"
        );
        const cipher = createCipheriv(
            "aes-256-ctr",
            createHash("md5")
                .update(this.key)
                .digest("hex"),
            IV
        );
        let encrypted = cipher.update(JSON.stringify(value), "utf8", "hex");
        encrypted += cipher.final("hex");
        return {
            IV: IV.toString("hex"),
            encrypted
        };
    }

    /**
     * Decrypt something.
     * @param {string} encrypted Encrypted text.
     * @param {Buffer} IV IV the text is encrypted with.
     */
    decrypt (encrypted, IV) {
        if (!this.key) throw new Error("Unable to decrypt without a key set.");
        const cipher = createDecipheriv(
            "aes-256-ctr",
            createHash("md5")
                .update(this.key)
                .digest("hex"),
            IV
        );
        const data = cipher.update(encrypted, "hex", "utf8");
        return JSON.parse(data);
    }

    /**
     * Called by ProtectMyTreausre, sets the key to use for the bot.
     * @param {string} key Key to use for encryption.
     */
    setKey (key) {
        this.key = key;
    }
};

module.exports = StorageEnmap;