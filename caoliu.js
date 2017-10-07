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
        this.startTimestamp = Date.now();

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
        let url = 'https://ss.postcc.us/htm_data/20/1709/2652702.html';
        // let url = 'https://ss.postcc.us/htm_data/20/1709/2650549.html';
        // let url = 'https://ss.postcc.us/htm_data/20/1709/2654677.html';
        let client = await CDP();
        try {
            let {
                Page,
                Network
            } = client;
            await Page.enable();
            await Network.enable();


            let {
                basicUrl,
                fetchSingle,
                fetchList,
                processData
            } = this.script;

            let list = await fetchList(client, basicUrl);
            // list = list.slice(0,10);

            // let list = ['https://ss.postcc.us/htm_data/20/1710/2690980.html'];

            for (let i = 0; i < list.length; i++) {
                let url = list[i];
                let data = await fetchSingle(client, url);
                processData(data);
                // console.log(data);
            }
        } catch (e) {
            console.log('err:', e);
        } finally {
            console.log('done succ');
            await client.close();
            this.end();
        }
    }

    

    end() {
        if (this.headless) {
            this.chrome.kill();
        }

        this.endTimestamp = Date.now();

        console.log('ELAPSED TIME:',this.endTimestamp - this.startTimestamp);
    }

  



}

// 文学
let wx = require('./wx');
let headless = true;
// let headless = false;
let pc = new Pacong(wx, headless);
pc.run();

