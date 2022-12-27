
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const axios = require('axios');
const hbs = require('handlebars');
const fsExtra = require('fs-extra');
const path = require('path');
const app = require('express')();
const PORT = process.env.PORT || 8080;
global.appRoot = path.resolve(__dirname);



app.get('/hello',(req,res)=>{
    console.log("Hit here");
  res.send("Hello");
});
app.get('/course/:id', (req, res) => {
    console.log("hit");
    var varaible = req.params['id'];
    console.log(varaible);

    const url =
        "https://academy-staging.abundent.com/v1/courses/" + varaible + "/public";
    console.log(url);
    const config = {
        headers: {
            "Content-Type": "application/json",
        },
    };


    axios.defaults.headers.common = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "api-key": "DMO3gNvT/Kg0vQO1B/UVTSvf/lehFljCc5rx1IRlNks=",
        "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://abundent.academy/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    var data = '';
    (async function () {

        try {
            await axios({
                method: "get",
                url: url,
                config,
            })
                .then(response => {

                    fs.writeFileSync('cd.json', JSON.stringify(response.data));
                    data = require('./cd.json');
                    (async function () {
                        try {

                            const browser = await puppeteer.launch();
                            const page = await browser.newPage();
                            const headerTemplate = `<span style="font-size: 30px; width: 200px; height: 200px; background-color: black; color: white; margin: 20px;">Header</span>`;
                            const content = await compile('index', data);
                            await page.setContent(content);
                            await page.addStyleTag({ path: './template/index.css' })
                            await page.emulateMediaType('print');
                            await page.pdf({

                                path: `./pdfs/${varaible}.pdf`,
                                format: 'A4',
                                displayHeaderFooter: true,
                                headerTemplate: '<header style=" border-bottom: 1px solid #000;font-size:9px ; width:100%">'
                                    + '<div style=" display: flex;flex-direction: row;flex-wrap: wrap; width: 100%;">'
                                    + ' <div style=" display: flex;flex-direction: column;flex-basis: 100%;  flex: 1;">'
                                    + '    <div  style="font-size: 12px; color: rgb(50, 70, 247);padding-bottom: 1em;padding-left: 1em;">'
                                    + '        Level 1, The Horizon Tower 3, Avenue 7<br>'
                                    + '         No 8, Jalan Kerinchi, Bangsar South City 59200<br>'
                                    + '        Federal Territory Kuala Lumpur, Malaysia<br>'
                                    + '         T: (+60) 03 2242 0231 | E: <a href="info@abundent.com">info@abundent.com </a><br>'
                                    + '     </div>'
                                    + ' </div>'
                                    + ' <div style=" display: flex;flex-direction: column;flex-basis: 100%;  flex: 1; align-items: center;">'

                                    + x

                                    + ' </div></div>'
                                    + '</header>',
                                printBackground: true,
                                margin: {
                                    bottom: "10px",
                                    top: "150px"
                                }


                            }).then(() => {
                                fs.unlink('./cd.json', function (err) {
                                    if (err && err.code == 'ENOENT') {
                                        // file doens't exist
                                        console.info("File doesn't exist, won't remove it.");
                                    } else if (err) {
                                        // other errors, e.g. maybe we don't have enough permission
                                        console.error("Error occurred while trying to remove file");
                                    } else {
                                        console.info(`removed`);
                                    }
                                });

                                const file = `./pdfs/${varaible}.pdf`;
                                res.status(200).download(file);
                            })
                        

                            console.log('done');

                            await browser.close();
                            //process.exit();


                        } catch (error) {
                            console.log(error);
                        }

                    })();

                })
                .catch(error => {
                    console.log(error);
                });;


        } catch (error) {
            console.log(error);
        }
    })();
})

app.get('/clear/', (req, res) => {
    fsExtra.emptyDirSync("./pdfs/");
    res.status(200).send("Cleared");
   
})

function base64Encode(file) {
    return fs.readFileSync(file, { encoding: 'base64' });
}

function logo() {
    return '<img  width="90" height="70" src="data:image/png;base64,' + base64Encode(appRoot + "/" + "logo.png") + '"/>';
}

var x = logo()
breakCounter = 0;


const compile = async function (temp, data) {

    course = {
        "name": data.name ? data.name : "",
        "code": data.id ? data.id : "",
        "prerequisites": data.prerequisites ? data.prerequisites : "",
        "qualification": data.qualification ? data.qualification : "",
        "audiences": data.audiences ? data.audiences : "",
        "methodologies": data.methodologies ? data.methodologies : "",
        "description": data.description ? data.description : "",
        "summary": data.summary ? data.summary : "",
        "modules": data.outline ? data.outline : "",
        "objectives": data.objectives ? data.objectives : "",
        "modulecount": data.moduleCnt ? data.moduleCnt : "",
        "cousreHours": data.trainingDuration ? data.trainingDuration : 0,
        "tdays": data.durationStr ? data.durationStr : 0,
        "trainerNames": data.trainerNames ? data.trainerNames : "",
        "durationStr": data.durationStr ? data.durationStr : ""
    };
    const filePath = path.join(process.cwd(), 'template', `${temp}.hbs`);
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(course);

};

hbs.registerHelper('switch', function (value, options) {
    this.switch_value = value;
    this.switch_break = false;
    return options.fn(this);
});

hbs.registerHelper('case', function (value, options) {
    if (value == this.switch_value) {
        this.switch_break = true;
        return options.fn(this);
    }
});

hbs.registerHelper('default', function (value, options) {
    if (this.switch_break == false) {
        return options.fn(this);
    }
});

hbs.registerHelper("counter", function () {
    return breakCounter++;
});

hbs.registerHelper("sub", function (index) {
    return index - breakCounter;
});






app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
}); 



