const {inspect} = require("util");

module.exports = PMTbot => {
    
    PMTbot.addCommand("eval", {
        botowner: true
    }, async (message, args) => {
        let JS = args.join(" ");
        let result;
        let hideResults = false;

        if (JS.toLocaleLowerCase().endsWith("/h")) {
            JS = JS.slice(0, -2);
            hideResults = true;
        }

        try {
            result = await eval(JS);
        } catch (error) {
            result = error.toString();
        }

        if (result === null) {
            result = "null";
        } else {
            switch (typeof result) {
                case "string":
                case "number":
                case "boolean":
                    result = `\`\`\`${result}\`\`\``;
                break;
                case "function":
                    result = `\`\`\`js
    ${result}
    \`\`\``;
                break;
                case "object":
                result = `\`\`\`js
${inspect(result, false, 0).slice(0, -1)+`\n${result ? "]" : "}"}`}
    \`\`\``;
                break;
            }
        }
        if (hideResults) return;
        if ((result || "").length > 2000) {
            return message.channel.send("Failed to send response, over 2000 characters.");
        }
        return message.channel.send(result || "`undefined`");
        


    });


};