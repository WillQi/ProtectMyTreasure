class ExportMap {

    constructor () {
        this._map = new Map();
    }

    /**
     * Export a value with the key.
     * @param {string} key Key to use. 
     * @param {any} value Value to export.
     */
    set (key, value) {
        return this._map.set(key, value);
    }

    /**
     * Get a value with the key.
     * @param {string} key Key to retrieve.
     */
    get (key) {
        return this._map.get(key);
    }

};

module.exports = ExportMap;