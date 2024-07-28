const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const dbConfig = require("../config/db");

const url = dbConfig.url;
const mongoClient = new MongoClient(url);

// ORBITAL NODE LANDING . . .
const about = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/about.html`));
};
const services = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/services.html`));
};
const contact = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/contact.html`));
};
const register_pri = (req, res) => {
    return res.render("inner/register-pri");
};
const purchase_node = (req, res) => {
    return res.render("inner/purchase-node");
};
const subscribe_node_page = async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");

        let school_data = await schools.findOne({ "school_info.email": req.body.email.trim() });

        return res.render("inner/purchase-node-page", { data: school_data });
    } catch (error) {
        console.log(error);
    }
}
const register_sec = (req, res) => {
    return res.render("inner/register-sec");
};
const agent = (req, res) => {
    return res.render("inner/agent");
};

// SCHOOL . . .
const s_home = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, news: 1, _id: 0 } });
        return res.render("../school/index", {
            school_obj: school_data.school_info,
            news: school_data.news.reverse().slice(0, 4)
        });



    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const admissions = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../school/admissions", { school_obj: school_data.school_info });



    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const portal = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../school/portal", { school_obj: school_data.school_info });



    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const profile = async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, sessions: 1, _id: 0 } });

        var currSessionIndex = school_data.sessions.findIndex(i => i.name === school_data.school_info.current_session);
        var currTermIndex = school_data.sessions[currSessionIndex].terms.findIndex(i => i.name === school_data.school_info.current_term);
        var stdIndex = school_data.sessions[currSessionIndex].terms[currTermIndex].students.findIndex(i => i.name === req.params.studname);

        return res.render("../school/inner/profile", { school_obj: school_data.school_info, student_info: school_data.sessions[currSessionIndex].terms[currTermIndex].students[stdIndex], c_term: school_data.school_info.current_term.toUpperCase(), results_status: school_data.school_info.results });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const profile_results = async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, sessions: 1, _id: 0 } });

        var currSessionIndex = school_data.sessions.findIndex(i => i.name === school_data.school_info.current_session);
        var currTermIndex = school_data.sessions[currSessionIndex].terms.findIndex(i => i.name === school_data.school_info.current_term);
        var stdIndex = school_data.sessions[currSessionIndex].terms[currTermIndex].students.findIndex(i => i.name === req.params.studname);

        return res.render("../school/inner/results", { school_obj: school_data.school_info, student_info: school_data.sessions[currSessionIndex].terms[currTermIndex].students[stdIndex], c_term: school_data.school_info.current_term.toUpperCase(), results_status: school_data.school_info.results });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const fees = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../school/fees", { school_obj: school_data.school_info });



    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const follow_up = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../school/contact", { school_obj: school_data.school_info });



    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};
const s_about = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../school/about", { school_obj: school_data.school_info });



    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

};

// SCHOOL ADMIN . . .
const admin = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../admin/index.html`));
};
const dashboard = async (req, res) => {
    try {

        var dt = new Date();
        var mm = ((dt.getMonth() + 1) >= 10) ? (dt.getMonth() + 1) : '0' + (dt.getMonth() + 1);
        var dd = ((dt.getDate()) >= 10) ? (dt.getDate()) : '0' + (dt.getDate());
        var yyyy = dt.getFullYear();
        var date = dd + " - " + mm + " - " + yyyy;

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_info = await schools.findOne(
            { 'school_info.name': req.params.sname },
            { projection: { 'school_info.name': 1, 'school_info.logo': 1, 'school_info.nodes': 1, 'school_info.current_session': 1, 'school_info.current_term': 1, _id: 0 } }
        );

        return res.render("../admin/dashboard", {
            info: school_info.school_info,
            today: date
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const school_info = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../admin/school-info", { school_obj: school_data.school_info });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const upcoming_news = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, news: 1, _id: 0 } });
        return res.render("../admin/upcoming-news", { school_obj: school_data.school_info, news: school_data.news.reverse() });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const fees_info = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, _id: 0 } });
        return res.render("../admin/fees-info", { school_obj: school_data.school_info });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const student_info = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, sessions: 1, _id: 0 } });
        var currSessionIndex = school_data.sessions.findIndex(i => i.name === school_data.school_info.current_session);
        lcls = school_data.classes.length - 1;
        if (school_data.sessions.length > 0 && school_data.classes.length > 0) {
            var currTermIndex = school_data.sessions[currSessionIndex].terms.findIndex(i => i.name === school_data.school_info.current_term);
            console.log({
                school_obj: school_data.school_info,
                sessions_data: school_data.sessions,
                class_data: school_data.classes,
                start_date: school_data.sessions[currSessionIndex].terms[currTermIndex].start_date,
                stop_date: school_data.sessions[currSessionIndex].terms[currTermIndex].stop_date,
            })
            return res.render("../admin/student-info", {
                school_obj: school_data.school_info,
                sessions_data: school_data.sessions,
                class_data: school_data.classes,
                start_date: school_data.sessions[currSessionIndex].terms[currTermIndex].start_date,
                stop_date: school_data.sessions[currSessionIndex].terms[currTermIndex].stop_date,
            });
        } else {
            return res.render("../admin/student-info", {
                school_obj: school_data.school_info,
                sessions_data: school_data.sessions,
                class_data: school_data.classes,
                start_date: "null",
                stop_date: "null",
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const student_fees = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, sessions: 1, _id: 0 } });
        return res.render("../admin/student-fees", {
            school_obj: school_data.school_info,
            sessions_data: school_data.sessions,
            class_data: school_data.classes
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const blue_print = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, sessions: 1, _id: 0 } }); return res.render("../admin/blue-print", {
                school_obj: school_data.school_info,
                sessions_data: school_data.sessions,
                class_data: school_data.classes
            });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const student_register = async (req, res) => {
    try {
        var dt = new Date();
        var mm = ((dt.getMonth() + 1) >= 10) ? (dt.getMonth() + 1) : '0' + (dt.getMonth() + 1);
        var dd = ((dt.getDate()) >= 10) ? (dt.getDate()) : '0' + (dt.getDate());
        var yyyy = dt.getFullYear();
        var date = yyyy + " / " + mm + " / " + dd;

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, sessions: 1, _id: 0 } });
        if (school_data.sessions.length > 0 && school_data.classes.length > 0) {
            lses = school_data.sessions.length - 1;
            lcls = school_data.classes.length - 1;
            var currTermIndex = school_data.sessions[lses].terms.findIndex(i => i.name === school_data.sessions[lses].current_term);
            return res.render("../admin/student-register", {
                school_obj: school_data.school_info,
                students: school_data.sessions[lses].terms[currTermIndex].students.length,
                session: school_data.sessions[lses].name,
                current_term: school_data.sessions[lses].current_term,
                start_date: school_data.sessions[lses].terms[currTermIndex].start_date,
                stop_date: school_data.sessions[lses].terms[currTermIndex].stop_date,
                today: date
            });
        } else {
            return res.render("../admin/student-register", {
                school_obj: school_data.school_info,
                students: "",
                session: "null",
                current_term: "",
                start_date: "null",
                stop_date: "null",
                today: date
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const continous_assessments = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, sessions: 1, _id: 0 } });
        return res.render("../admin/subject-results", {
            school_obj: school_data.school_info,
            sessions_data: school_data.sessions,
            class_data: school_data.classes
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const student_results = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, sessions: 1, _id: 0 } });
        if (school_data.sessions.length > 0 && school_data.classes.length > 0) {
            return res.render("../admin/student-results", {
                school_obj: school_data.school_info,
                sessions_data: school_data.sessions,
                class_data: school_data.classes,
                subject_length: school_data.classes[0].subjects.length
            });
        } else {
            return res.render("../admin/student-results", {
                school_obj: school_data.school_info,
                sessions_data: school_data.sessions,
                class_data: school_data.classes,
                subject_length: 0
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const parents = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, feedbacks: 1, _id: 0 } });
        return res.render("../admin/parents", { school_obj: school_data.school_info, feedbacks: school_data.feedbacks.reverse() });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const sessions = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, sessions: 1, _id: 0 } });
           return res.render("../admin/sessions", {
                school_obj: school_data.school_info,
                session_data: school_data.sessions
            }); 
        
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const classes = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, _id: 0 } });
        return res.render("../admin/classes", {
            school_obj: school_data.school_info, class_data: school_data.classes
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const subjects = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, classes: 1, _id: 0 } });
        return res.render("../admin/subjects", { school_obj: school_data.school_info, class_data: school_data.classes });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const assessment = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, sessions: 1, _id: 0 } });
        return res.render("../admin/inner/assessment", {
            school_obj: school_data.school_info,
            sessions_data: school_data.sessions,
            className: req.params.class,
            subject: req.params.subject
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};
const result = async (req, res) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);

        const schools = database.collection("schools");
        let school_data = await schools.findOne({ 'school_info.name': req.params.sname },
            { projection: { school_info: 1, sessions: 1, _id: 0 } });
        return res.render("../admin/inner/result", {
            school_obj: school_data.school_info,
            sessions_data: school_data.sessions,
            student_name: req.params.student,
            class_name: req.params.class
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};

module.exports = {
    about,
    services,
    contact,
    purchase_node,
    register_pri,
    register_sec,
    agent,
    profile_results,
    s_home,
    admissions,
    portal,
    fees,
    follow_up,
    s_about,
    admin,
    dashboard,
    school_info,
    upcoming_news,
    fees_info,
    student_info,
    student_fees,
    blue_print,
    student_register,
    continous_assessments,
    student_results,
    parents,
    sessions,
    classes,
    subjects,
    assessment,
    result,
    profile,
    subscribe_node_page
};