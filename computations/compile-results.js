const dbConfig = require("../config/db");
const MongoClient = require("mongodb").MongoClient;

const url = dbConfig.url;

const mongoClient = new MongoClient(url);
mongoClient.connect();

const database = mongoClient.db(dbConfig.database);
const schools = database.collection("schools");


const computeResults = async (sname, session, term, s_class) => {
    try {
        let school_data = await schools.findOne({ 'school_info.name': sname });

        var sessionIndex = school_data.sessions.findIndex(i => i.name === session);
        var termIndex = school_data.sessions[sessionIndex].terms.findIndex(i => i.name === term);
        var classIndex = school_data.classes.findIndex(i => i.name === s_class);

        subjectsTotal(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        termTotal(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        subjectPositions(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        termPositions(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        termAverage(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        subjectAverage(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        highest(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        lowest(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);
        remarks(sname, session, term, school_data.sessions[sessionIndex].terms[termIndex].students, s_class, school_data.classes[classIndex].subjects);

    } catch (error) {
        return console.log(error);
    }

}
function subjectsTotal(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    var total = 0;
    for (var i = 0; i < classStudents.length; i++) {
        for (var j = 0; j < classStudents[i].subjects.length; j++) {
            for (var a = 0; a < 4; a++) {
                total += classStudents[i].subjects[j].ass[a];
            }
            schools.updateOne({ "school_info.name": sname },
                { $set: { "sessions.$[sess].terms.$[term].students.$[stud].subjects.$[sub].total": total } },
                {
                    arrayFilters:
                        [{ "sess.name": session },
                        { "term.name": term },
                        { "stud.name": classStudents[i].name },
                        { "sub.name": classStudents[i].subjects[j].name }]
                })
            total = 0;
        }
    }
}
function termTotal(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    var total = 0;
    for (var i = 0; i < classStudents.length; i++) {
        for (var j = 0; j < classStudents[i].subjects.length; j++) {
            total += classStudents[i].subjects[j].total;
        }
        schools.updateOne({ "school_info.name": sname },
            { $set: { "sessions.$[sess].terms.$[term].students.$[stud].total": total } },
            {
                arrayFilters:
                    [{ "sess.name": session },
                    { "term.name": term },
                    { "stud.name": classStudents[i].name }]
            })
        total = 0;
    }
}
function subjectPositions(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    var namesAndSubjectTotal = [];

    for (var ref_student = 0; ref_student < classStudents.length; ref_student++) {
        for (var rs_subject = 0; rs_subject < classStudents[ref_student].subjects.length; rs_subject++) {
            for (var sample_student = 0; sample_student < classStudents.length; sample_student++) {
                for (var sample_subject = 0; sample_subject < classStudents[sample_student].subjects.length; sample_subject++) {
                    if (classStudents[sample_student].subjects[sample_subject].name === classStudents[ref_student].subjects[rs_subject].name) {
                        namesAndSubjectTotal.push({
                            name: classStudents[sample_student].name,
                            total: classStudents[sample_student].subjects[sample_subject].total
                        });
                        break;
                    }
                }
            }

            namesAndSubjectTotal.sort((a, b) => b.total - a.total);

            schools.updateOne({ "school_info.name": sname },
                { $set: { "sessions.$[sess].terms.$[term].students.$[stud].subjects.$[sub].position": namesAndSubjectTotal.findIndex(s => s.name === classStudents[ref_student].name) + 1 } },
                {
                    arrayFilters:
                        [{ "sess.name": session },
                        { "term.name": term },
                        { "stud.name": classStudents[ref_student].name },
                        { "sub.name": classStudents[ref_student].subjects[rs_subject].name }]
                })

            namesAndSubjectTotal = [];

        }
    }


}
function termPositions(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    var sortedStudentsList = classStudents;
    sortedStudentsList.sort((a, b) => b.total - a.total);
    for (var i = 0; i < subjects.length; i++) {
        for (var k = 0; k < classStudents.length; k++) {
            schools.updateOne({ "school_info.name": sname },
                { $set: { "sessions.$[sess].terms.$[term].students.$[stud].position": sortedStudentsList.findIndex(s => s.name === classStudents[k].name) + 1 } },
                {
                    arrayFilters:
                        [{ "sess.name": session },
                        { "term.name": term },
                        { "stud.name": classStudents[k].name }]
                })
        }
    }
}
function termAverage(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    for (var i = 0; i < classStudents.length; i++) {
        schools.updateOne({ "school_info.name": sname },
            { $set: { "sessions.$[sess].terms.$[term].students.$[stud].average": classStudents[i].total / classStudents[i].subjects.length } },
            {
                arrayFilters:
                    [{ "sess.name": session },
                    { "term.name": term },
                    { "stud.name": classStudents[i].name }]
            })
    }
}
function subjectAverage(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });

    var takers = 0;
    var total = 0;

    for (var ref_student = 0; ref_student < classStudents.length; ref_student++) {
        for (var rs_subject = 0; rs_subject < classStudents[ref_student].subjects.length; rs_subject++) {
            // count takers
            for (var sample_student = 0; sample_student < classStudents.length; sample_student++) {
                for (var sample_subject = 0; sample_subject < classStudents[sample_student].subjects.length; sample_subject++) {
                    if (classStudents[sample_student].subjects[sample_subject].name === classStudents[ref_student].subjects[rs_subject].name) {
                        takers++;
                        break;
                    }
                }
            }
            // sum total for all students offering a subject
            for (var sample_student = 0; sample_student < classStudents.length; sample_student++) {
                for (var sample_subject = 0; sample_subject < classStudents[sample_student].subjects.length; sample_subject++) {
                    if (classStudents[sample_student].subjects[sample_subject].name === classStudents[ref_student].subjects[rs_subject].name) {
                        total += classStudents[sample_student].subjects[sample_subject].total;
                        break;
                    }
                }
            }

            schools.updateOne({ "school_info.name": sname },
                { $set: { "sessions.$[sess].terms.$[term].students.$[stud].subjects.$[sub].average": total / takers } },
                {
                    arrayFilters:
                        [{ "sess.name": session },
                        { "term.name": term },
                        { "stud.name": classStudents[ref_student].name },
                        { "sub.name": classStudents[ref_student].subjects[rs_subject].name }]
                });
            total = 0;
            takers = 0;
        }
    }
}
function highest(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });

    for (var ref_student = 0; ref_student < classStudents.length; ref_student++) {
        for (var rs_subject = 0; rs_subject < classStudents[ref_student].subjects.length; rs_subject++) {
            // count takers
            for (var sample_student = 0; sample_student < classStudents.length; sample_student++) {
                for (var sample_subject = 0; sample_subject < classStudents[sample_student].subjects.length; sample_subject++) {
                    if (classStudents[sample_student].subjects[sample_subject].name === classStudents[ref_student].subjects[rs_subject].name) {
                        if (classStudents[sample_student].subjects[sample_subject].position === 1) {
                            schools.updateOne({ "school_info.name": sname },
                                { $set: { "sessions.$[sess].terms.$[term].students.$[stud].subjects.$[sub].highest": classStudents[sample_student].subjects[sample_subject].total } },
                                {
                                    arrayFilters:
                                        [{ "sess.name": session },
                                        { "term.name": term },
                                        { "stud.name": classStudents[ref_student].name },
                                        { "sub.name": classStudents[ref_student].subjects[rs_subject].name }]
                                })
                            break;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
    }
}
function lowest(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    var takers = 0;

    for (var ref_student = 0; ref_student < classStudents.length; ref_student++) {
        for (var rs_subject = 0; rs_subject < classStudents[ref_student].subjects.length; rs_subject++) {
            // count takers
            for (var sample_student = 0; sample_student < classStudents.length; sample_student++) {
                for (var sample_subject = 0; sample_subject < classStudents[sample_student].subjects.length; sample_subject++) {
                    if (classStudents[sample_student].subjects[sample_subject].name === classStudents[ref_student].subjects[rs_subject].name) {
                        takers++;
                        break;
                    }
                }
            }

            for (var sample_student = 0; sample_student < classStudents.length; sample_student++) {
                for (var sample_subject = 0; sample_subject < classStudents[sample_student].subjects.length; sample_subject++) {
                    if (classStudents[sample_student].subjects[sample_subject].name === classStudents[ref_student].subjects[rs_subject].name) {
                        if (classStudents[sample_student].subjects[sample_subject].position === takers) {
                            schools.updateOne({ "school_info.name": sname },
                                { $set: { "sessions.$[sess].terms.$[term].students.$[stud].subjects.$[sub].lowest": classStudents[sample_student].subjects[sample_subject].total } },
                                {
                                    arrayFilters:
                                        [{ "sess.name": session },
                                        { "term.name": term },
                                        { "stud.name": classStudents[ref_student].name },
                                        { "sub.name": classStudents[ref_student].subjects[rs_subject].name }]
                                })
                            break;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            takers = 0;
        }
    }
}
function remarks(sname, session, term, students, s_class, subjects) {
    var classStudents = students.filter(function (value) {
        return value.class === s_class;
    });
    for (var i = 0; i < classStudents.length; i++) {
        schools.updateOne({ "school_info.name": sname },
            { $set: { "sessions.$[sess].terms.$[term].students.$[stud].remarks": remarkHelper(classStudents[i].average) } },
            {
                arrayFilters:
                    [{ "sess.name": session },
                    { "term.name": term },
                    { "stud.name": classStudents[i].name }]
            })
    }
}
function remarkHelper(average) {
    if (average <= 100 && average >= 75) {
        return "An Outstanding result. Keep it up.";
    }
    else {
        if (average < 75 && average >= 65) {
            return "An Excellent Performance. Keep it up.";
        }
        else {
            if (average < 65 && average >= 55) {
                return "A Good Result. You can do better.";
            }
            else {
                if (average < 55 && average >= 40) {
                    return "A fair performance. Improve next time.";
                }
                else {
                    if (average < 40 && average >= 0) {
                        return "Poor result. Sit up.";
                    }
                    else {
                        return "R"
                    }
                }
            }
        }
    }
}

module.exports = { computeResults }