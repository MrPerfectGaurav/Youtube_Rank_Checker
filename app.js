//jshint esversion: 8

const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const csvjson = require('csvjson');
const readFile = require('fs').readFile;
const writeFile = require('fs').writeFile;

const port = 3000;

const app = express();
app.use(express.static(__dirname + "/public"));
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render("index")
});

app.get("/result", (req, res) => {
    res.render("result")
})

app.post('/', async (req, res) => {
    var url = (req.body.url);
    const name = (req.body.name);
    var keywords = (req.body.keywords);

    url = url.split(".com")[1];

    while (keywords.includes("\r\n")) {
        keywords = keywords.replace("\r\n", "")
    }
    let keywordsArray = []
    if (keywords.includes(",")) {
        keywords = keywords.split(",");
        keywords.forEach(keyword => {
            if (keyword.trim() !== "") {
                keywordsArray.push(keyword.trim())
            }
        });
    } else {
        keywordsArray.push(keywords);
    }
    let resultArray = [];
    for (keyword of keywordsArray) {
        const localKyeword = keyword
        while (await keyword.includes(" ")) {
            keyword = keywords.replace(" ", "+")
        }
        const ranking = await main(url, name, keyword)
        const position = {
            keyword: localKyeword,
            ranking: ranking,
        };
        resultArray.push(position);
    }

    console.log(resultArray);

    const csvData = csvjson.toCSV(...resultArray, {
        header: "key"
    });
    
    writeFile("./test-data.csv", csvData, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Success!");
        }
    });

    res.render("result", {
        results: resultArray
    })
});

app.listen(port, () => {
    console.log("working on http://localhost:" + port);
});

const openUrl = require('./openUrl');
const { parse } = require('path');

async function main(url, name, keywords) {
    var page = await openUrl("https://www.youtube.com/results?search_query=" + keywords);

    while ((await page.$$("#contents > ytd-video-renderer")).length < 100) {
        await autoScroll(page);
        // await delay(5000);
    }

    // await delay(5000);
    var a = await page.$$("#contents > ytd-video-renderer > #dismissable #channel-info > #channel-name > #container > #text-container > #text")

    for (i = 0; i < a.length; i++) {
        var channelUrl = await a[0].$eval("a", anchor => anchor.getAttribute("href"));
        var channelName = await a[0].$eval("a", anchor => anchor.innerText);

        if (channelUrl === url && channelName === name) {
            await page.browser().close()
            return (i + 1);
        }
        await page.browser().close()
        return ("Not Ranking");
    }
};

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 10000;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
