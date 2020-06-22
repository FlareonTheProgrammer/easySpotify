const fs = require("fs");

class autoCom {
    static com = (filepath, label) => {
        let labelStart = new RegExp(`\\/\\/ Begin auto-comment ${label}`, g);
        let labelEnd = new RegExp(`\\/\\/ End auto-comment ${label}`, g);
        let noRep = new RegExp(`autoCom\\.com\\(autoComCaller\\, \\"${label}\\"\\)`, g);
        fs.readFile(filepath, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data
                .replace(labelStart, `\u002f\u002a AC Begin Callback Label: "${label}"`)
                .replace(labelEnd, `AC End Callback Label: ${label} \u002a\u002f`)
                .replace(noRep, `\u002f\u002f autoCom.com(autoComCaller, "${label}")`);

            fs.writeFile(filepath, result, "utf8", function (err) {
                if (err) return console.log(err);
            });
        });
    }

    static uncom = (filepath, label) => {
        let labelStart = new RegExp(`\\/\\* Begin auto-uncomment ${label}`, g);
        let labelEnd = new RegExp(`End auto-uncomment ${label} \\*\\/`, g);
        let noRep = new RegExp(`autoCom\\.uncom\\(autoComCaller\\, \\"${label}\\"\\)`, g);
        fs.readFile(filepath, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data
                .replace(labelStart, `\u002f\u002f AUC Begin Callback Label: "${label}"`)
                .replace(labelEnd, `\u002f\u002f AUC End Callback Label: "${label}"`)
                .replace(noRep, `\u002f\u002f autoCom.uncom(autoComCaller, "${label}")`);

            fs.writeFile(filepath, result, "utf8", function (err) {
                if (err) return console.log(err);
            });
        });
    }
}

module.exports = autoCom;