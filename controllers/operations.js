const upload = require("../middleware/upload");
const dbConfig = require("../config/db");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const ObjectId = require('mongodb').ObjectId;

var PdfPrinter = require('pdfmake');
var nodemailer = require('nodemailer');
// const fetch = require('node-fetch');

const url = dbConfig.url;
const local = "http://localhost:3000/files/";
const web = "https://orbital-node-platform.onrender.com/files/";
const baseUrl = web;
const nlocal = "http://localhost:3000/news/";
const nweb = "https://orbital-node-platform.onrender.com/news/";
const nbaseUrl = nweb;
const mongoClient = new MongoClient(url);
const orbital = require("../computations/compile-results");


const deleteImages = async (req, res) => {
    const imageIds = [
        new ObjectId("63d0eba3ecb17cf3a945d2bc"),
        new ObjectId("63d0eba3ecb17cf3a945d2be"),
        new ObjectId("63d0eba3ecb17cf3a945d2bf"),
        new ObjectId("63d0eba3ecb17cf3a945d2c1"),
        new ObjectId("63d0eba3ecb17cf3a945d2c0"),
        new ObjectId("63d0eba3ecb17cf3a945d2bd"),
        new ObjectId("63d0ec0acdc0c255f5c2e40f"),
        new ObjectId("63d0ec0acdc0c255f5c2e411"),
        new ObjectId("63d0ec0bcdc0c255f5c2e417"),
        new ObjectId("63d0ec0bcdc0c255f5c2e412"),
        new ObjectId("63d0ec0bcdc0c255f5c2e413"),
        new ObjectId("63d0ec0bcdc0c255f5c2e416"),
    ];
    try {
        var logs = [];
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);

        const filesCollection = database.collection('photos.files');
        const chunksCollection = database.collection('photos.chunks');

        imageIds.forEach(async (imageId) => {
            await filesCollection.deleteOne({ _id: imageId });
            await chunksCollection.deleteMany({ files_id: imageId });
            logs.push(`Image with id "${imageId}" deleted successfully.`);
            console.log(`Image with id "${imageId}" deleted successfully.`);
        });

        return res.send('Success');
    } catch (error) {
        console.log(error);
    }
}


// LANDING . . .
const getSchools = async (req, res) => {
    try {
        let schoolList = [];

        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let schools_info_cursor = schools.find(
            { 'school_info.name': { $regex: new RegExp('^' + req.body.payload.trim() + '.*', 'i') } },
            { projection: { 'school_info.name': 1, _id: 0 } }
        );

        schools_info_cursor.forEach(school => schoolList.push(school)).then(() => {
            res.status(200).send({ payload: schoolList.slice(0, 8) });
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const schoolRegForm = async (req, res, url) => {
    try {
        var st = new Date();
        // var temp = new Date(date_obj_converter(st));
        // var exp = new Date(temp.setDate(temp.getDate() + 120));

        var stpname = '';
        if (url[5].filename != null) stpname = url[5].filename;

        var school_model = {
            school_info: {
                name: req.body.name.trim(),
                logo: baseUrl + url[0].filename,
                email: req.body.email.trim(),
                phone: req.body.phone.trim(),
                category: req.body.category.trim(),
                adress: req.body.adress.trim(),
                state: req.body.state.trim(),
                pic1: baseUrl + url[1].filename,
                pic2: baseUrl + url[2].filename,
                about: req.body.about.trim(),
                d_about: req.body.d_about.trim(),
                p_name: req.body.p_name.trim(),
                ppic: baseUrl + url[3].filename,
                vp1name: req.body.vp1name.trim(),
                vp1pic: baseUrl + url[4].filename,
                stamp: baseUrl + stpname,
                mission: req.body.mission.trim(),
                vision: req.body.vision.trim(),
                anthem: req.body.anthem.trim(),
                fees: req.body.fees,
                e_register: req.body.e_register,
                activation: req.body.activation.trim(),
                agent: req.body.agent.trim(),
                reg_date: date_obj_converter(st),
                nodes: 1,
                current_session: "",
                current_term: "",
                results: "3"
            },
            news: [],
            fees_info: {
                bank_name: "",
                ac_num: "",
                fees: "",
            },
            feedbacks: [],
            classes: [],
            sessions: [],
            admin: {
                admin_username: req.body.email.trim(),
                admin_password: req.body.phone.trim(),
            }
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);

        const activation = database.collection("activation");

        let activation_data = await activation.findOne({ 'pin': req.body.activation.trim() });
        if (activation_data) {
            activation.findOneAndUpdate({ "pin": req.body.activation.trim() },
                { $set: { "used": true, } },
            );
            database.collection("schools").insertOne(school_model);
            return;
        } else {
            return res.status(200).render("inner/failure", { name: req.body.name });
        }
    } catch (error) {
        console.log(error);
    }
}
const uploadRegForm = async (req, res) => {
    try {
        await upload(req, res);
        await schoolRegForm(req, res, req.files)

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'orbitaltech32@gmail.com',
                pass: 'kcmrreiekjdbfzlk'
            }
        });

        var mailOptions = {
            from: 'orbitaltech32@gmail.com',
            to: req.body.email.trim(),
            subject: 'CONGRATULATIONS,' + req.body.name + ' !',
            text: `You can now proceed to enjoying the packages for which you have subscribed

            Below are the information you will need to proceed.
            
            Admin Panel:
            The Admin Panel will be used to administrate and control the entire functionalities of your School instance created on our platform. Below are the credentials you will need to access it.
            
            Admin Panel Credentials:
            Link: https://orbital-node-platform.onrender.com/admin
            Username: ${req.body.email}
            Password: ${req.body.phone}
            
            
            School Website and Portal:
            This is where the public can access your school website and portal created on our platform. Below is how to access your school on our official website.
            1. Visit https://orbital-node-platform.onrender.com or search and download the Orbital Node App on Google Play Store
            2. Type in your school name on the "Visit your school website" field
            3. Click on your school from the search suggestions
            4. Click on "Go" to visit your school website.
            
            After following the above steps, parents and students as well can access anything they want that is available on your school website including the Student Portal where results can be downloaded anytime anywhere once it is released by the school from the admin panel.
            
            
            For detailed explanations on how to use the Admin Panel and School website, check our YouTube channel for tutorials which we have carefully created to guide you through the entire process by clicking on the links provided below.
            Admin Panel tutorial link: https://www.youtube.com/watch?v=t4zI3i9_FIs&feature=youtu.be
            School Website tutorial link: https://www.youtube.com/watch?v=WVvIqJxJw-I&feature=youtu.be
            
            Once again thank you for subscribing to our package.
            
            Regards 
            Orbital Node Technologies.`
        };

        var mailOptions2 = {
            from: 'orbitaltech32@gmail.com',
            to: 'orbitaltech32@gmail.com',
            subject: req.body.name.toUpperCase() + ' REGISTRATION NOTICE!',
            text: `The above metioned school has registered to Orbital Node Platform and an Automatic message has been sent to them already.

            Referred by: ${req.body.agent}

            If the above field is empty or 'null', it means that no agent referral code was used in registering ${req.body.name.toUpperCase()}.
            `
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        transporter.sendMail(mailOptions2, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.status(200).render("inner/success", { name: req.body.name });
    } catch (error) {
        console.log(error);

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).send({
                message: "Too many files to upload.",
            });
        }
        return res.status(500).send({
            message: `Error when trying upload many files: ${error}`,
        });
    }
};
const regAgent = async (req, res) => {
    try {

        var code = getRandomCharacters();
        var data = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            account: req.body.account,
            bank: req.body.bank,
            about: req.body.about,
            state: req.body.state,
            code: code
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        database.collection("agents").insertOne(data);

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'orbitaltech32@gmail.com',
                pass: 'kcmrreiekjdbfzlk'
            }
        });

        var mailOptions = {
            from: 'orbitaltech32@gmail.com',
            to: req.body.email.trim(),
            subject: 'CONGRATULATIONS, ' + req.body.name + ' !',
            text: `You have successfully registered as an Orbital Node agent.

            Join the whatsapp group chat throught the link below and get on board with our agent operation:
            https://chat.whatsapp.com/DdOvMKvdMX6KHZfmkIYBEz

            Your agent referral code is: ${code}

            You can use it to register schools and once we verify your referral code on the registered school, we will send you your commision.

            Welcome to the team.
            
            Regards 
            Orbital Node Technologies.`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.status(200).render("inner/success_agent", { name: req.body.name });
    } catch {
        console.log(error);
    }
}
const subscribeNode = async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        const nodePin = database.collection("nodes");
        let nodePinData = await nodePin.findOne({ 'pin': req.body.pin.trim() });
        if (nodePinData) {
            if (!nodePinData.used) {
                let school_data = await schools.findOne({ "school_info.email": req.body.email.trim() });
                var nodes = school_data.school_info.nodes;

                schools.findOneAndUpdate(
                    { "school_info.email": req.body.email.trim() },
                    { $set: { "school_info.nodes": nodes + Number(nodePinData.value) } },
                );

                nodePin.findOneAndUpdate(
                    { "pin": req.body.pin.trim() },
                    { $set: { "used": true } },
                );

                return res.send({ feedback: 'ok', value: nodePinData.value });
            } else {
                return res.send({ feedback: 'used' });
            }
        }
        else {
            return res.send({ feedback: "no" });
        }
    } catch (error) {
        console.log(error);
    }
}

const verifyTransaction = async (req, res) => {
    const axios = require("axios");
    try {
        const ref = req.query.reference;
        let output;
        await axios.get(`https://api.paystack.co/transaction/verify/${ref}`, {
            headers: {
                authorization: "sk_live_f2a65b8636dda649d084c30d981ce08317228cc0",
                //replace TEST SECRET KEY with your actual test secret 
                //key from paystack
                "content-type": "application/json",
                "cache-control": "no-cache",
            },
        }
        ).then((success) => {
            output = success;
            return res.status(200).send({ success: true });
        }).catch((error) => {
            output = error;
            return res.status(200).send({ success: true });
        });
        //now we check for internet connectivity issues
        if (!output.response && output.status !== 200) console.log("No internet Connection");
        //next,we confirm that there was no error in verification.
        if (output.response && !output.response.data.status) console.log("Error verifying payment , 'unknown Transaction Reference Id'");

        //we return the output of the transaction
    }


    catch (error) {
        console.log(error);
        return res.end();
    }
};
const verifyActivationPin = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const activation = database.collection("activation");
        let activation_data = await activation.findOne({ 'pin': req.body.pin.trim() });
        if (activation_data) {
            if (!activation_data.used) {
                if (req.xhr || req.accepts('json,html') === 'json') {
                    return res.send({ feedback: 'ok', pin: req.body.pin.trim() });
                } else {
                    return res.redirect(303, '/');
                }
            } else {
                res.send({ feedback: 'used' });
            }
        }
        else {
            res.send({ feedback: "no" });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}

// SCHOOL . . .
const downloadImage = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.imgBucket,
        });

        let downloadStream = bucket.openDownloadStreamByName(req.params.name);

        downloadStream.on("data", function (data) {
            return res.status(200).write(data);
        });

        downloadStream.on("error", function (err) {
            return res.status(404).send({ message: "Cannot download the Image!" });
        });

        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const downloadPdf = async (req, res) => {
    try {
        await mongoClient.connect();
        var student_data;
        var stdNumber = 0;

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var lses = school_data.sessions.length - 1;
        var currTermIndex = school_data.sessions[lses].terms.findIndex(i => i.name === school_data.school_info.current_term);

        for (var i = 0; i < school_data.sessions[lses].terms[currTermIndex].students.length; i++) {
            if (school_data.sessions[lses].terms[currTermIndex].students[i].name === req.params.stdname && school_data.sessions[lses].terms[currTermIndex].students[i].class === req.params.stdclass) {
                student_data = school_data.sessions[lses].terms[currTermIndex].students[i];
                break;
            }
        }

        for (var i = 0; i < school_data.sessions[lses].terms[currTermIndex].students.length; i++) {
            if (school_data.sessions[lses].terms[currTermIndex].students[i].class === req.params.stdclass) {
                stdNumber++;
            }
        }
        console.log(stdNumber)


        const fetch = require('node-fetch');
        var url = school_data.school_info.logo;
        var stampUrl = school_data.school_info.stamp;
        var rest = await fetch(url, { encoding: null });
        var stampRest = await fetch(stampUrl, { encoding: null });
        imageBuffer = await rest.buffer();
        stampBuffer = await stampRest.buffer();
        var img = new Buffer.from(imageBuffer, 'base64');
        var stamp = new Buffer.from(stampBuffer, 'base64');

        var Roboto = require('../fonts/Roboto');

        let tableItems = [
            [{ rowSpan: 2, text: 'Subjects', alignment: 'center', style: 'tableHeader' }, { text: 'C. Assessments', style: 'tableHeader', colSpan: 4, alignment: 'center' }, {}, {}, {}, { text: 'Total', style: 'tableHeader', alignment: 'center' }, { text: 'Average', style: 'tableHeader', alignment: 'center' }, { text: 'Highest', style: 'tableHeader', alignment: 'center' }, { text: 'Lowest', style: 'tableHeader', alignment: 'center' }, { text: 'Rank', style: 'tableHeader', alignment: 'center' }, { text: 'Grade', style: 'tableHeader', alignment: 'center' }],
            ['', { text: '1ST\nC.A', style: 'tableHeader', alignment: 'center' }, { text: '2ND\nC.A', style: 'tableHeader', alignment: 'center' }, { text: '3RD\nC.A', style: 'tableHeader', alignment: 'center' }, { text: 'EXAMS', style: 'tableHeader', alignment: 'center' }, '', '', '', '', '', ''],
        ];

        for (var i = 0; i < student_data.subjects.length; i++) {
            tableItems.push([{ text: student_data.subjects[i].name, style: 'tableHeader' }, { text: student_data.subjects[i].ass[0], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].ass[1], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].ass[2], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].ass[3], style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].total, style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].average.toFixed(2), style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].highest, style: 'tableHeader', alignment: 'center' }, { text: student_data.subjects[i].lowest, style: 'tableHeader', alignment: 'center' }, { text: position_qualifier(student_data.subjects[i].position), style: 'tableHeader', alignment: 'center' }, { text: gradeHelper(student_data.subjects[i].total), style: 'tableHeader', alignment: 'center' }])
        }

        var dt = new Date();
        var mm = ((dt.getMonth() + 1) >= 10) ? (dt.getMonth() + 1) : '0' + (dt.getMonth() + 1);
        var dd = ((dt.getDate()) >= 10) ? (dt.getDate()) : '0' + (dt.getDate());
        var yyyy = dt.getFullYear();
        var date = yyyy + "/" + mm + "/" + dd;

        var docDefinition = {
            content: [
                {
                    image: img,
                    fit: [60, 60],
                    style: {
                        alignment: 'center',
                    },
                },
                {
                    text: school_data.school_info.name,
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: `${school_data.school_info.state}, Nigeria`,
                    style: 'subheader',
                    alignment: 'center'
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `Name of Student: ${student_data.name}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Session: ${school_data.sessions[lses].name}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `School: ${school_data.school_info.name}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Sex: ${student_data.gender.charAt(0).toUpperCase() + student_data.gender.slice(1)}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `Term: ${school_data.sessions[lses].terms[currTermIndex].name.charAt(0).toUpperCase() + school_data.sessions[lses].terms[currTermIndex].name.slice(1)}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Date of Birth: ${student_data.dob}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'top',
                            text: `Class: ${student_data.class}`
                        },
                        {
                            width: 'auto',
                            style: 'top',
                            text: `Number in Class: ${stdNumber}`
                        },
                    ]
                },
                {
                    style: 'tableExample',
                    color: '#000',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        // headerRows: 2,
                        body: tableItems
                    }
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'bottom',
                            text: `NUMBER OF SUBJECTS: ${student_data.subjects.length}`
                        },
                        {
                            width: '*',
                            style: 'bottom',
                            text: `TOTAL OBTAINABLE MARKS: ${student_data.subjects.length * 100}`
                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: `MARKS OBTAINED: ${student_data.total}`
                        },
                    ]
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'bottom',
                            text: `CLASS AVERAGE: ${student_data.average.toFixed(2)}`
                        },
                        {
                            width: '*',
                            style: 'bottom',
                            text: `POSITION IN CLASS: ${position_qualifier(student_data.position)}`
                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: `OUT OF CLASS: ${stdNumber}`
                        },
                    ]
                },
                {
                    style: 'bottom',
                    text: `PRINCIPAL\'S REMARKS: ${htremarkHelper(student_data.average)}`,
                },
                {
                    columns: [
                        {
                            width: '*',
                            style: 'bottom',
                            text: `NAME OF PRINCIPAL: ${school_data.school_info.p_name}`
                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: 'SIGNATURE/STAMP:   '
                        },
                        {
                            width: 'auto',
                            image: stamp,
                            fit: [40, 40],

                        },
                        {
                            width: 'auto',
                            style: 'bottom',
                            text: `DATE: ${date}`
                        },
                    ]
                },
            ],
            styles: {
                header: {
                    fontSize: 15,
                    bold: true,
                    margin: [0, 5, 0, 3]
                },
                subheader: {
                    fontSize: 13,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                top: {
                    bold: true,
                    fontSize: 11,
                    color: 'black',
                    margin: [0, 0, 0, 5]
                },
                bottom: {
                    bold: false,
                    fontSize: 10,
                    color: 'black',
                    margin: [0, 5, 0, 0]
                },
                tableOpacityExample: {
                    margin: [0, 5, 0, 15],
                    fillColor: 'blue',
                    fillOpacity: 0.3
                },
                tableHeader: {
                    bold: true,
                    fontSize: 9.5,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
            },
            patterns: {
                stripe45d: {
                    boundingBox: [1, 1, 4, 4],
                    xStep: 3,
                    yStep: 3,
                    pattern: '1 w 0 1 m 4 5 l s 2 0 m 5 3 l s'
                }
            }
        };

        var printer = new PdfPrinter(Roboto);

        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        // pdfDoc.pipe(fs.createWriteStream('document.pdf'));
        pdfDoc.pipe(res);
        pdfDoc.end();


    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: error.message,
        });
    }
};
const downloadNewsImage = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.newsBucket,
        });

        let downloadStream = bucket.openDownloadStreamByName(req.params.name);

        downloadStream.on("data", function (data) {
            return res.status(200).write(data);
        });

        downloadStream.on("error", function (err) {
            return res.status(404).send({ message: "Cannot download the Image!" });
        });

        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const getListFiles = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const images = database.collection(dbConfig.imgBucket + ".files");

        const cursor = images.find({});

        if ((await cursor.count()) === 0) {
            return res.status(500).send({
                message: "No files found!",
            });
        }

        let fileInfos = [];
        await cursor.forEach((doc) => {
            fileInfos.push({
                name: doc.filename,
                url: baseUrl + doc.filename,
            });
        });

        return res.status(200).send(fileInfos);
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const portaLogin = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname.trim() });

        var lses = school_data.sessions.length - 1;
        var currTermIndex = school_data.sessions[lses].terms.findIndex(i => i.name === school_data.school_info.current_term);
        for (var i = 0; i < school_data.sessions[lses].terms[currTermIndex].students.length; i++) {
            if (req.body.admission.trim() === school_data.sessions[lses].terms[currTermIndex].students[i].admission && req.body.pin.trim() === school_data.sessions[lses].terms[currTermIndex].students[i].pin) {
                return res.send({ success: true, school_name: school_data.school_info.name, student_info: school_data.sessions[lses].terms[currTermIndex].students[i] });
            }
        }
        return res.send({ success: false });
    } catch (error) {
        return res.send({ message: error });
    }
}
const upload_feedbacks = async (req, res) => {
    try {
        var feedback_model = {
            parent: req.body.name,
            contact: req.body.number,
            message: req.body.message,
            date: Date()
        }

        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);

        database.collection("schools").updateOne({ 'school_info.name': req.params.sname },
            { $push: { feedbacks: feedback_model } }
        );

        return res.send({ success: true });
    } catch (error) {
        console.log(error);
    }
}

// ADMIN . . .
const login = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_info = await schools.findOne(
            { 'admin.admin_username': req.body.username.trim() },
            { projection: { 'school_info.name': 1, _id: 0 } }
        );
        let admin_info = await schools.findOne(
            { 'admin.admin_username': req.body.username.trim() },
            { projection: { 'admin.admin_username': 1, 'admin.admin_password': 1, _id: 0 } }
        );

        if (school_info) {
            if (admin_info.admin.admin_password === req.body.password.trim()) {
                if (req.xhr || req.accepts('json,html') === 'json') {
                    return res.send({ success: true, school_name: school_info.school_info.name });
                } else {
                    return res.redirect(303, '/admin');
                }
            } else {
                res.send({ success: false });
            }
        }
        else {
            res.send({ success: false });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const upload_news = async (req, res) => {
    try {

        var news_model = {
            header: req.body.heading,
            details: req.body.details,
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        database.collection("schools").updateOne({ 'school_info.name': req.params.sname },
            { $push: { news: news_model } }
        );

        return res.redirect(303, '/admin/' + req.params.sname + '/upcoming-news');
    } catch (error) {
        console.log(error);
    }
}
const createSession = async (req, res) => {
    try {

        var session_model = {
            name: req.body.name.trim(),
            terms: [
                {
                    name: "first",
                    start_date: 'null',
                    stop_date: 'null',
                    attendance_dates: [],
                    attendance_model: [],
                    results: 3,
                    students: [],
                    active: 'false'
                },
                {
                    name: "second",
                    start_date: 'null',
                    stop_date: 'null',
                    attendance_dates: [],
                    attendance_model: [],
                    results: 3,
                    students: [],
                    active: 'false'
                },
                {
                    name: "third",
                    start_date: 'null',
                    stop_date: 'null',
                    attendance_dates: [],
                    attendance_model: [],
                    results: 3,
                    students: [],
                    active: 'false'
                },
            ],
            current_term: 'first'
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        database.collection("schools").updateOne({ 'school_info.name': req.params.sname },
            { $push: { sessions: session_model } }
        );

        database.collection("schools").updateOne({ 'school_info.name': req.params.sname },
            { $set: { 'school_info.current_session': session_model.name, 'school_info.current_term': "first" } }
        );

        return res.send({ success: true });
    } catch {
        console.log(error);
    }
}
const createClass = async (req, res) => {
    try {

        class_model = {
            name: req.body.name.trim().toUpperCase(),
            subjects: []
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        database.collection("schools").updateOne({ 'school_info.name': req.params.sname },
            { $push: { classes: class_model } }
        );
        if (req.xhr || req.accepts('json,html') === 'json') {
            return res.send({ success: true });
        } else {
            return res.redirect(303, '/admin/' + req.params.sname + '/classes');
        }
    } catch {
        console.log(error);
    }
}
const createSubject = async (req, res) => {
    try {

        var class_subject = {
            name: req.body.name.trim(),
            teacher: req.body.teacher.trim(),
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        database.collection("schools").findOneAndUpdate({ "school_info.name": req.params.sname }, { $push: { "classes.$[t].subjects": class_subject } }, { arrayFilters: [{ "t.name": req.body.class_name }] });

        if (req.xhr || req.accepts('json,html') === 'json') {
            return res.send({ success: true });
        } else {
            return res.redirect(303, '/admin/' + req.params.sname + '/classes');
        }
    } catch {
        console.log(error);
    }
}
const createStudent = async (req, res) => {
    try {

        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);

        let school_data = await database.collection("schools").findOne({ 'school_info.name': req.params.sname });
        var lses = school_data.sessions.length - 1;
        var currTermIndex = school_data.sessions[lses].terms.findIndex(i => i.name === school_data.sessions[lses].current_term);
        var classIndex = school_data.classes.findIndex(i => i.name === req.body.class.trim());


        var subs = [];
        // Prepare selected subjects
        for (var i = 0; i < school_data.classes[classIndex].subjects.length; i++) {
            var itr = "sub_" + i;
            if (req.body[itr]) {
                subs.push(req.body[itr]);
            }
        }

        var s_subjects = [];
        // Assign class subjects to a subjects list
        for (var i = 0; i < subs.length; i++) {
            s_subjects.push(
                {
                    name: subs[i],
                    ass: [-1, -1, -1, -1],
                    total: -1,
                    position: -1,
                    highest: -1,
                    lowest: -1,
                    average: -1
                }
            )
        }

        var student_model = {
            name: req.body.name.trim(),
            password: req.body.dob,
            gender: req.body.gender,
            admission: req.body.admission,
            pin: req.body.pin,
            session: req.body.session,
            term: req.body.term,
            fees: false,
            class: req.body.class,
            subjects: s_subjects,
            total: -1,
            average: -1,
            position: -1,
            morning_attendance: school_data.sessions[lses].terms[currTermIndex].attendance_model,
            afternoon_attendance: school_data.sessions[lses].terms[currTermIndex].attendance_model
        }

        database.collection("schools").findOneAndUpdate({ "school_info.name": req.params.sname },
            { $push: { "sessions.$[sess].terms.$[term].students": student_model } },
            {
                arrayFilters: [
                    { "sess.name": req.body.session },
                    { "term.name": req.body.term }]
            })

        if (req.xhr || req.accepts('json,html') === 'json') {
            return res.send({ success: true });
        } else {
            return res.redirect(303, '/admin/' + req.params.sname + '/students');
        }
    } catch (error) {
        console.log(error);
    }
}
const getSubjects = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });


        res.status(200).send({ payload: school_data.classes });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getClassSubjects = async (req, res) => {
    try {
        // let payload = req.body.payload.trim();
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var classIndex = school_data.classes.findIndex(i => i.name === req.params.class);
        res.status(200).send({ payload: school_data.classes[classIndex].subjects });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getStudents = async (req, res) => {
    try {
        let studentsList = [];
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);

        var std = school_data.sessions[sessionIndex].terms[termIndex].students;

        std.forEach((student) => {
            if (student.class === req.body.class) {
                studentsList.push(student)
            }
        })

        res.status(200).send({
            payload: studentsList, results_status: school_data.sessions[sessionIndex].terms[termIndex].results
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const setStudentFees = async (req, res) => {
    try {
        let studentsList = [];
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);

        var std = school_data.sessions[sessionIndex].terms[termIndex].students;

        for (var i = 0; i < std.length; i++) {
            if (std[i].class === req.body.class) {
                if (req.body[std[i].name]) {
                    schools.updateOne(
                        { "school_info.name": req.params.sname },
                        { $set: { "sessions.$[sess].terms.$[term].students.$[stud].fees": true } },
                        {
                            arrayFilters:
                                [{ "sess.name": req.body.session },
                                { "term.name": req.body.term },
                                { "stud.name": std[i].name }]
                        }
                    )
                }
                else {
                    schools.updateOne(
                        { "school_info.name": req.params.sname },
                        { $set: { "sessions.$[sess].terms.$[term].students.$[stud].fees": false } },
                        {
                            arrayFilters:
                                [{ "sess.name": req.body.session },
                                { "term.name": req.body.term },
                                { "stud.name": std[i].name }]
                        }
                    )
                }
            }
        }

        res.status(200).send({ success: true });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getTermStatus = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);


        res.status(200).send({ status: school_data.sessions[sessionIndex].terms[termIndex].active, av_nodes: available_nodes(school_data.school_info.nodes) });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const activateTerm = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var nodes = school_data.school_info.nodes;


        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            {
                $set: {
                    "sessions.$[sess].terms.$[term].active": "true",
                    "school_info.nodes": nodes - 1
                }
            },
            {
                arrayFilters:
                    [{ "sess.name": req.body.session },
                    { "term.name": req.body.term }]
            });

        res.status(200).send({ success: true });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getSubjectsResultsList = async (req, res) => {
    try {
        let subjectsResultsList = [];
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        for (var i = 0; i < school_data.classes.length; i++) {
            if (school_data.classes[i].name === req.body.class) {
                subjectsResultsList = school_data.classes[i].subjects;
                break;
            }
        }

        res.status(200).send({ payload: subjectsResultsList });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getSubjectsResults = async (req, res) => {
    let subjectsAssessmentDataStudent = [];
    let subjectsAssessmentData = [];
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const schools = database.collection("schools");
    let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

    var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
    var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);
    // var classIndex = school_data.classes.findIndex(i => i.name === req.body.class);


    for (var i = 0; i < school_data.sessions[sessionIndex].terms[termIndex].students.length; i++) {
        if (school_data.sessions[sessionIndex].terms[termIndex].students[i].class === req.body.class && school_data.sessions[sessionIndex].terms[termIndex].students[i].subjects.findIndex(i => i.name === req.body.subject) >= 0) {
            subjectsAssessmentDataStudent.push(school_data.sessions[sessionIndex].terms[termIndex].students[i].name);
            subjectsAssessmentData.push(school_data.sessions[sessionIndex].terms[termIndex].students[i].subjects[school_data.sessions[sessionIndex].terms[termIndex].students[i].subjects.findIndex(i => i.name === req.body.subject)]);
        }
    }

    res.status(200).send({
        student_names: subjectsAssessmentDataStudent,
        assessments_data: subjectsAssessmentData,
    });

}
const getStudentResults = async (req, res) => {
    try {
        await mongoClient.connect();
        var std = {};

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        orbital.computeResults(req.params.sname, req.body.session, req.body.term, req.body.class);

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });


        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);
        // var classIndex = school_data.classes.findIndex(i => i.name === req.body.class.trim());

        for (var i = 0; i < school_data.sessions[sessionIndex].terms[termIndex].students.length; i++) {
            if (school_data.sessions[sessionIndex].terms[termIndex].students[i].name === req.body.name && school_data.sessions[sessionIndex].terms[termIndex].students[i].class === req.body.class) {
                std = school_data.sessions[sessionIndex].terms[termIndex].students[i];
                break;
            }
        }

        res.status(200).send({ payload: std });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getStudentProfileResults = async (req, res) => {
    try {
        await mongoClient.connect();
        var std = {};

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });


        var sessionIndex = school_data.sessions.findIndex(i => i.name === school_data.school_info.current_session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === school_data.school_info.current_term);
        // var classIndex = school_data.classes.findIndex(i => i.name === req.body.class.trim());

        for (var i = 0; i < school_data.sessions[sessionIndex].terms[termIndex].students.length; i++) {
            if (school_data.sessions[sessionIndex].terms[termIndex].students[i].name === req.params.stdname && school_data.sessions[sessionIndex].terms[termIndex].students[i].class === req.params.stdclass) {
                std = school_data.sessions[sessionIndex].terms[termIndex].students[i];
                break;
            }
        }

        res.status(200).send({ payload: std });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const importStudents = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var targetTermIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.target);
        // var destinationTermIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.destination);

        var stds = [];

        for (var i = 0; i < school_data.sessions[sessionIndex].terms[targetTermIndex].students.length; i++) {
            if (school_data.sessions[sessionIndex].terms[targetTermIndex].students[i].class === req.body.class) {
                stds.push(school_data.sessions[sessionIndex].terms[targetTermIndex].students[i]);
            }
        }

        for (var i = 0; i < stds.length; i++) {
            stds[i].term = req.body.destination;
            for (var j = 0; j < stds[i].subjects.length; j++) {
                stds[i].subjects[j].ass = [-1, -1, -1, -1];
                stds[i].subjects[j].total = -1;
                stds[i].subjects[j].average = -1;
                stds[i].subjects[j].position = -1;
                stds[i].subjects[j].highest = -1;
                stds[i].subjects[j].lowest = -1;
            }
            stds[i].total = -1;
            stds[i].average = -1;
            stds[i].position = -1;
        }

        schools.updateOne({ "school_info.name": req.params.sname },
            { $push: { "sessions.$[sess].terms.$[term].students": { $each: stds } } },
            {
                arrayFilters:
                    [{ "sess.name": req.body.session },
                    { "term.name": req.body.destination }]
            });

        return res.send({ students: stds.length });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateSubjectsResults = async (req, res) => {
    try {
        await mongoClient.connect();

        let updatedAssessment = req.body.assessments_data;
        let correspondingNames = req.body.student_names;

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);
        var classIndex = school_data.classes.findIndex(i => i.name === req.body.class);

        for (var j = 0; j < correspondingNames.length; j++) {
            for (var i = 0; i < school_data.sessions[sessionIndex].terms[termIndex].students.length; i++) {
                if (school_data.sessions[sessionIndex].terms[termIndex].students[i].name === correspondingNames[j] && school_data.sessions[sessionIndex].terms[termIndex].students[i].class === req.body.class) {
                    schools.findOneAndUpdate({ "school_info.name": req.params.sname },
                        { $set: { "sessions.$[sess].terms.$[term].students.$[stud].subjects.$[sub]": updatedAssessment[j] } },
                        {
                            arrayFilters:
                                [{ "sess.name": req.body.session },
                                { "term.name": req.body.term },
                                { "stud.name": school_data.sessions[sessionIndex].terms[termIndex].students[i].name },
                                { "sub.name": req.body.subname }]
                        })
                    break;
                }
            }
        }
        orbital.computeResults(req.params.sname, school_data.sessions[sessionIndex].name, school_data.sessions[sessionIndex].terms[termIndex].name, school_data.classes[classIndex].name);

        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateCurrentTerm = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "school_info.current_term": req.body.current_term } },
        ).then(res.send({ success: true }));
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateCurrentSession = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "school_info.current_session": req.body.current_session } },
        ).then(res.send({ success: true }));
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateAdminPassword = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        if (req.body.oldPass === school_data.admin.admin_password) {
            schools.findOneAndUpdate({ "school_info.name": req.params.sname },
                { $set: { "admin.admin_password": req.body.newPass } },
            );
            res.send({ success: true });
        } else {
            res.send({ success: false });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateResultStatus = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "school_info.results": req.body.results_status } },
        ).then(res.send({ success: true }));
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateTermDates = async (req, res) => {
    try {

        var start = new Date(req.body.start_date);
        var end = new Date(req.body.stop_date);
        let attendance_dates = [];
        let attendance_model = [];

        while (start <= end) {
            var mm = ((start.getMonth() + 1) >= 10) ? (start.getMonth() + 1) : '0' + (start.getMonth() + 1);
            var dd = ((start.getDate()) >= 10) ? (start.getDate()) : '0' + (start.getDate());
            var yyyy = start.getFullYear();
            var date = yyyy + "-" + mm + "-" + dd + "-" + start.getDay();

            start = new Date(start.setDate(start.getDate() + 1));
            attendance_dates.push(date);
            attendance_model.push("Mark");
        }

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });
        var lses = school_data.sessions.length - 1;
        var session = school_data.sessions[lses].name;

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "sessions.$[sess].terms.$[term].start_date": req.body.start_date, "sessions.$[sess].terms.$[term].stop_date": req.body.stop_date, "sessions.$[sess].terms.$[term].attendance_dates": attendance_dates, "sessions.$[sess].terms.$[term].attendance_model": attendance_model } },
            {
                arrayFilters:
                    [{ "sess.name": session }, { "term.name": school_data.sessions[lses].current_term }]
            });

        return res.send({ success: true });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const deleteNews = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });
        school_data.news.reverse().splice(Number(req.body.news_index), 1);

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "news": school_data.news } });

        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const deleteSession = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });
        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        school_data.sessions.splice(sessionIndex, 1);

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { sessions: school_data.sessions } });

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "school_info.current_session": "" } });

        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const deleteClass = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });
        var classIndex = school_data.classes.findIndex(i => i.name === req.body.class);
        school_data.classes.splice(classIndex, 1);

        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "classes": school_data.classes } });

        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const deleteSubject = async (req, res) => {
    try {

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });
        var classIndex = school_data.classes.findIndex(i => i.name === req.body.class);
        var subjectIndex = school_data.classes[classIndex].subjects.findIndex(i => i.name === req.body.subject);
        school_data.classes[classIndex].subjects.splice(subjectIndex, 1);


        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "classes": school_data.classes } });

        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const deleteStudent = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });
        var sessionIndex = school_data.sessions.findIndex(i => i.name === req.body.session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === req.body.term);
        var studentIndex = school_data.sessions[sessionIndex].terms[termIndex].students.findIndex(i => i.name === req.body.student);
        school_data.sessions[sessionIndex].terms[termIndex].students.splice(studentIndex, 1);


        schools.findOneAndUpdate({ "school_info.name": req.params.sname },
            { $set: { "sessions.$[sess].terms.$[term].students": school_data.sessions[sessionIndex].terms[termIndex].students } }, {
            arrayFilters:
                [{ "sess.name": req.body.session },
                { "term.name": req.body.term },
                ]
        });

        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
// New endpoints ...
const getBatch2Data = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let curr_session = await schools.findOne(
            { 'school_info.name': req.params.sname },
            { projection: { 'school_info.current_session': 1, 'school_info.current_term': 1, _id: 0 } }
        );


        let sessions_data = await schools.findOne(
            { 'school_info.name': req.params.sname },
            {
                projection: {
                    'sessions': {
                        $elemMatch: {
                            name: curr_session.school_info.current_session,
                        }
                    },
                    'school_info.results': 1,
                    'school_info.current_session': 1,
                    'school_info.current_term': 1,
                    _id: 0,
                }
            }
        );

        var session_names = [];
        for (var i = 0; i < sessions_data.sessions.length; i++) {
            session_names.push(sessions_data.sessions[i].name);
        }

        var noOfStudents = 0;

        var currentSessionIndex = sessions_data.sessions.findIndex(i => i.name === sessions_data.school_info.current_session);

        if (currentSessionIndex != -1) {
            var currentTermIndex = sessions_data.sessions[currentSessionIndex].terms.findIndex(i => i.name === sessions_data.school_info.current_term);
            if (currentTermIndex != -1) {
                noOfStudents = sessions_data.sessions[currentSessionIndex].terms[currentTermIndex].students.length;
            }
        }

        res.status(200).send({ sessions: session_names, no_of_students: noOfStudents, current_session: sessions_data.school_info.current_session, current_term: sessions_data.school_info.current_term, result_status: sessions_data.school_info.results });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}

// TEACHERS APP . . .
const staffLogin = async (req, res) => {
    try {
        await mongoClient.connect();
        console.log(req.body.username);

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'admin.admin_username': req.body.username.trim() });
        if (school_data) {
            if (school_data.admin.admin_password === req.body.password.trim()) {
                return res.send({ success: true, school_name: school_data.school_info.name });
            } else {
                res.send({ success: false });
            }
        } else {
            res.send({ success: false });
        }
    } catch (error) {
        return res.send({ message: error });
    }
}
const getClassList = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        let clsNames = [];

        school_data.classes.forEach((cls) => {
            clsNames.push(cls.name);
        })

        res.status(200).send(clsNames);

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const getAttendanceForClass = async (req, res) => {
    try {
        let studentsList = [];
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });

        lses = school_data.sessions.length - 1;
        var currTermIndex = school_data.sessions[lses].terms.findIndex(i => i.name === school_data.sessions[lses].current_term);

        var std = school_data.sessions[lses].terms[currTermIndex].students;
        std.forEach((student) => {
            if (student.class === req.params.class) {
                studentsList.push({
                    name: student.name,
                    gender: student.gender,
                    morning: student.morning_attendance,
                    afternoon: student.afternoon_attendance
                })
            }
        })


        var today = new Date();
        var mm = ((today.getMonth() + 1) >= 10) ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1);
        var dd = ((today.getDate()) >= 10) ? (today.getDate()) : '0' + (today.getDate());
        var yyyy = today.getFullYear();
        var date = yyyy + "-" + mm + "-" + dd + "-" + today.getDay();
        var todayIndex = school_data.sessions[lses].terms[currTermIndex].attendance_dates.findIndex(i => i === date);

        var attendance_dates = [];
        school_data.sessions[lses].terms[currTermIndex].attendance_dates.forEach((day) => {
            attendance_dates.push({
                date: day,
                active: false
            });
        })

        res.status(200).send({
            attendance_dates: attendance_dates,
            today_index: todayIndex,
            students: studentsList
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}
const updateStudentsAttendance = async (req, res) => {
    try {
        await mongoClient.connect();

        let classAttendance = req.body.assessments_data;

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname });




        return res.send({});
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}

module.exports = {
    deleteImages,
    uploadRegForm,
    regAgent,
    verifyTransaction,
    verifyActivationPin,
    getSchools,
    getSubjects,
    getClassSubjects,
    getStudents,
    getStudentProfileResults,
    getListFiles,
    getTermStatus,
    // New Endpoints ...
    getBatch2Data,

    /* ... */
    downloadImage,
    downloadPdf,
    downloadNewsImage,
    upload_feedbacks,
    login,
    portaLogin,
    upload_news,
    createSession,
    createClass,
    createSubject,
    createStudent,
    activateTerm,
    getSubjectsResultsList,
    getSubjectsResults,
    getStudentResults,
    setStudentFees,
    updateSubjectsResults,
    updateCurrentTerm,
    updateCurrentSession,
    updateResultStatus,
    importStudents,
    updateAdminPassword,
    updateStudentsAttendance,
    updateTermDates,
    deleteNews,
    deleteSession,
    deleteClass,
    deleteStudent,
    deleteSubject,
    staffLogin,
    getClassList,
    getAttendanceForClass,
    subscribeNode,
};

function htremarkHelper(score) {
    if (score <= 100 && score >= 80) {
        return "Wonderful performance. Keep it up.";
    } else {
        if (score < 80 && score >= 70) {
            return "An Amazing Result. Keep it up";
        } else {
            if (score < 70 && score >= 60) {
                return "Good Result. You can do more";
            } else {
                if (score < 60 && score >= 50) {
                    return "Satisfactory Result. You can do better.";
                } else {
                    if (score < 50 && score >= 40) {
                        return "Average Result, Work harder";
                    } else if (score < 40 && score >= 0) {
                        return "Poor performance. Do better next time.";
                    } else {
                        return "Your Scores are not within the stipulated range. Form teacher please make corrections";
                    }
                }
            }
        }
    }
}
function date_obj_converter(date) {
    var mm = ((date.getMonth() + 1) >= 10) ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    var dd = ((date.getDate()) >= 10) ? (date.getDate()) : '0' + (date.getDate());
    var yyyy = date.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
}
function position_qualifier(pos) {
    if (!isNaN(pos)) {
        if (p(pos, 1) || p(pos, 21) || p(pos, 31) || p(pos, 41) || p(pos, 51) || p(pos, 61) || p(pos, 71) || p(pos, 81) || p(pos, 91) || p(pos, 101) || p(pos, 121) || p(pos, 131) || p(pos, 141) || p(pos, 151) || p(pos, 161) || p(pos, 171) || p(pos, 181) || p(pos, 191) || p(pos, 201)) {
            return pos + "ST";
        }
        else {
            if (p(pos, 2) || p(pos, 22) || p(pos, 32) || p(pos, 42) || p(pos, 52) || p(pos, 62) || p(pos, 72) || p(pos, 82) || p(pos, 92) || p(pos, 102) || p(pos, 122) || p(pos, 132) || p(pos, 142) || p(pos, 152) || p(pos, 162) || p(pos, 172) || p(pos, 182) || p(pos, 192) || p(pos, 202)) {
                return pos + "ND";
            } else {
                if (p(pos, 3) || p(pos, 23) || p(pos, 33) || p(pos, 43) || p(pos, 53) || p(pos, 63) || p(pos, 73) || p(pos, 83) || p(pos, 93) || p(pos, 103) || p(pos, 123) || p(pos, 133) || p(pos, 143) || p(pos, 153) || p(pos, 163) || p(pos, 173) || p(pos, 183) || p(pos, 193) || p(pos, 203)) {
                    return pos + "RD";
                } else {
                    if (btw(pos, 4, 20) || btw(pos, 24, 30) || btw(pos, 34, 40) || btw(pos, 44, 50) || btw(pos, 54, 60) || btw(pos, 64, 70) || btw(pos, 74, 80) || btw(pos, 84, 90) || btw(pos, 94, 100) || btw(pos, 104, 120) || btw(pos, 124, 130) || btw(pos, 134, 140) || btw(pos, 144, 150) || btw(pos, 154, 160) || btw(pos, 164, 170) || btw(pos, 174, 180) || btw(pos, 184, 190) || btw(pos, 194, 200)) {
                        return pos + "TH";
                    } else {
                        return pos;
                    }
                }
            }
        }
    }
    else {
        return ''
    }
}
function p(pos, num) {
    if (pos === num) { return true; } else { return false; }
}
function btw(p, a, b) {
    if (p >= a && p <= b) { return true; } else { return false; }
}
function gradeHelper(score) {
    if (!isNaN(score)) {
        if (score <= 100 && score >= 75) {
            return "A";
        }
        else {
            if (score < 75 && score >= 65) {
                return "B";
            }
            else {
                if (score < 65 && score >= 55) {
                    return "C";
                }
                else {
                    if (score < 55 && score >= 40) {
                        return "D";
                    }
                    else {
                        if (score < 40 && score >= 0) {
                            return "E";
                        }
                        else {
                            return "-"
                        }
                    }
                }
            }
        }
    }
    else {
        return "-"
    }

}
function available_nodes(num) {
    if (num > 0) {
        return "yes";
    }
    else {
        return "no";
    }
}
function getRandomCharacters() {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
