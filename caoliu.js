const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs');


class Pacong {

    constructor(script, headless = true) {
        this.headless = headless;
        this.script = script;
        this.chrome = undefined;
    }

    async run() {
        let chromeFlags = [];
        if (this.headless) {
            chromeFlags.push('--headless');
            chromeFlags.push('--disable-gpu');
        }

        const option = {
            port: 9222,
            chromeFlags
        };

        this.chrome = await chromeLauncher.launch(option);

        // let url = 'http://cl.giit.us/read.php?tid=2652702&page=PAGE_HOLDER';
        // let url = 'http://cl.giit.us/htm_data/20/1709/2652702.html';
        // let url = 'https://ss.postcc.us/htm_data/20/1709/2672573.html';
        // let url = 'https://ss.postcc.us/htm_data/20/1709/2652702.html';
        let url = 'https://ss.postcc.us/htm_data/20/1709/2656964.html';
        let client = await CDP();
        let novel = await this.fetchSingleNovel(client,url);
        fs.writeFileSync(`novel/${novel.title}.txt`,novel.content,'utf-8');
    }

    async fetchSingleNovel(client,url) {

        let {
            Page,
            Network
        } = client;

        try {
            await Page.enable();
            await Network.enable();

            

            // 爬取每页内容
            let novel = await this.fetch(client,url);
            return novel;

        } catch (e) {
            console.log('err:', e);
        } finally {
            await client.close();
            this.end();
        }
    }

    end() {
        if (this.headless) {
            this.chrome.kill();
        }
    }

    async fetch(client,url){
        return await this.script(client,url);
    }


   

}

let wx = require('./wx');
// let headless = true;
let headless = false;
let pc = new Pacong(wx,headless);
pc.run();



async function start(chrome) {
    let startTimestmap = Date.now();
    let isSucc = true;


}