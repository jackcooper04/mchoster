const fs = require('fs');
const path = require('path');
const axios = require('axios');
const request = require('request');
const { start } = require('repl');


function updateServerProperties(serverLocation, data) {
    var hardcore = false;
    if (data.gamemode == "hardcore") {
        hardcore = true;
    };
    extra =
        "\ngamemode=" + data.gamemode +
        "\ndifficulty=" + data.difficulty +
        "\nhardcore=" + hardcore +
        "\nmotd=" + data.name +
        "\nlevel-name=" + data.name +
        "\nrcon.password=" + data.rconPass +
        "\nmax-players=" + data.maxPlayers +
        "\nwhite-list=" + data.whiteList
    fs.readFile(path.resolve(__dirname, 'server.properties'), "utf8", function read(err, data) {
        if (err) { }
        data += extra;
        fs.writeFile(serverLocation + "/server.properties", data, function (err, result) {
            if (err) { return; };

        });
    });
    updateServerFile(serverLocation, data);
}
function updateServerFile(serverLocation, data) {
    fs.readdir(path.resolve(__dirname, 'cache'), function (err, files) {
        if (err) {
            return console.log("Unable To scan")
        };
        var list = new Array();
        files.forEach(function (file) {
            list.push(file);
        });
        var config = {
            method: 'get',
            url: 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
            headers: {}
        };
        axios(config)
            .then(function (response) {
                versionManifest = response.data;
                selectedVersion = data.version;
                versionInfo = { id: "", url: "" };
                if (selectedVersion.includes("+")) {
                    var versionNumber = new Array();
                    for (numbers in versionManifest.versions) {
                        var formatedVersion = selectedVersion
                            .replace(/([+ ])+/g, "")
                            .replace(/^(-)+|(-)+$/g, "");

                        if (
                            versionManifest.versions[numbers].id.includes(
                                formatedVersion
                            ) &&
                            !versionManifest.versions[numbers].id.includes("pre") &&
                            !versionManifest.versions[numbers].id.includes("rc")
                        ) {
                            versionNumber.push({
                                url: versionManifest.versions[numbers].url,
                                id: versionManifest.versions[numbers].id,
                            });
                        }
                    }
                    versionInfo = versionNumber[0];
                } else if (selectedVersion == "latest") {
                    latestVersion = versionManifest.latest.release;
                    for (versionIdx in versionManifest.versions) {
                        if (versionManifest.versions[versionIdx].id == latestVersion) {
                            versionInfo.id = latestVersion;
                            versionInfo.url = versionManifest.versions[versionIdx].url;
                        }
                    }
                }


                else {
                    for (numbers in versionManifest.versions) {
                        if (versionManifest.versions[numbers].id == selectedVersion) {
                            versionInfo.url = versionManifest.versions[numbers].url;
                            versionInfo.id = versionManifest.versions[numbers].id;
                        }
                    }
                };
                var lookingFor = versionInfo.id + ".jar";
                if (list.includes(lookingFor)) {
                    fs.unlink(serverLocation + "/server.jar", function (
                        err,
                        result
                    ) {
                        if (err) console.log(err);
                    });
                    fs.copyFile(
                        path.resolve(__dirname, 'cache') + "/" + lookingFor,
                        serverLocation + "/server.jar",
                        (err) => {
                            if (err) throw err;
                            // console.log('Copied');

                            startServer(data, serverLocation);
                            return true;
                        }
                    );
                } else {
                    // console.log(versionInfo)
                    var config = {
                        method: 'get',
                        url: versionInfo.url,
                        headers: {}
                    };
                    axios(config)
                        .then(function (response) {
                            var specificVersionInfo = response.data;
                            var downloadURL = specificVersionInfo.downloads.server.url;
                            fs.unlink(serverLocation + "/server.jar", function (
                                err,
                                result
                            ) {
                                if (err) console.log(err);
                            });
                            var getNewDownload = request(downloadURL);
                            getNewDownload.on("response", function (jarResp) {
                                jarResp.pipe(
                                    fs.createWriteStream(path.resolve(__dirname, 'cache') + "/" + lookingFor)
                                );
                                jarResp.pipe(fs.createWriteStream(serverLocation + "/server.jar"));
                            });
                            getNewDownload.on("complete", function () {
                                startServer(data, serverLocation);
                                return true;
                            })
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }

                // console.log(versionInfo)
            })
            .catch(function (error) {
                console.log(error);
            });


    })
};
function startServer(data, serverLocation) {
    const { exec } = require('child_process');
    exec("cd " + serverLocation + " && start cmd.exe /c java -Xms4G -Xmx4G -XX:+UseConcMarkSweepGC -jar " + serverLocation + "\\server.jar nogui && pause");
}
exports.launchServer = function (location, data) {


    updateServerProperties(location, data)
}



