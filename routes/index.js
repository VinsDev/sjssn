const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const operationsController = require("../controllers/operations");
const pagesController = require("../controllers/pages");

const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

let routes = app => {
  // LANDING PAGES . . .
  router.get("/delete-images", operationsController.deleteImages);
  router.get("/", homeController.first);
  router.get("/home", homeController.home);
  router.get("/about", pagesController.about);
  router.get("/services", pagesController.services);
  router.get("/contact", pagesController.contact);
  router.get("/purchase-node", pagesController.purchase_node);
  router.post("/subscribeNodePage", pagesController.subscribe_node_page);
  router.get("/register-pri", pagesController.register_pri);
  router.get("/register-sec", pagesController.register_sec);
  router.get("/agent", pagesController.agent);

  // OPERATIONS . . .
  router.post("/register", operationsController.uploadRegForm);
  router.get("/verify_transaction", operationsController.verifyTransaction);
  router.post("/agent", operationsController.regAgent);
  router.post("/verify", operationsController.verifyActivationPin);
  router.get("/files", operationsController.getListFiles);
  router.get("/files/:name", operationsController.downloadImage);
  router.get("/schools/:sname/portal/:stdclass/:stdname/term-result", operationsController.downloadPdf);
  router.get("/schools/:sname/portal/:stdclass/:stdname/preview-result", operationsController.getStudentProfileResults);
  router.get("/news/:name", operationsController.downloadNewsImage);
  router.post("/getSchools", operationsController.getSchools);
  router.post("/subscribeNode", operationsController.subscribeNode);
  router.post("/admin/:sname/getSubjects", operationsController.getSubjects);
  router.get("/admin/:sname/getClassSubjects/:class", operationsController.getClassSubjects);
  router.post("/admin/:sname/getStudents", operationsController.getStudents);
  router.get("/admin/:sname/getBatch2Data", operationsController.getBatch2Data);
  router.post("/admin/:sname/student-fees", operationsController.setStudentFees);
  router.post("/admin/:sname/getSubjectsResultsList", operationsController.getSubjectsResultsList);
  router.post("/admin/:sname/getSubjectsResults", operationsController.getSubjectsResults);
  router.post("/admin/:sname/getStudentResults", operationsController.getStudentResults);
  router.post("/admin/:sname/getTermStatus", operationsController.getTermStatus);
  router.post("/admin/:sname/activateTerm", operationsController.activateTerm);
  router.post("/admin/:sname/updateSubjectsResults", operationsController.updateSubjectsResults);
  router.post("/admin/:sname/upcoming-news/delete", operationsController.deleteNews);
  router.post("/admin/:sname/sessions/delete", operationsController.deleteSession);
  router.post("/admin/:sname/classes/delete", operationsController.deleteClass);
  router.post("/admin/:sname/subjects/delete", operationsController.deleteSubject);
  router.post("/admin/:sname/student-info/import", operationsController.importStudents);
  router.post("/admin/:sname/student-info/delete", operationsController.deleteStudent);
  router.post("/admin/:sname/updateCurrentTerm", operationsController.updateCurrentTerm);
  router.post("/admin/:sname/updateCurrentSession", operationsController.updateCurrentSession);
  router.post("/admin/:sname/changePassword", operationsController.updateAdminPassword);
  router.post("/admin/:sname/updateTermDates", operationsController.updateTermDates);
  router.post("/admin/:sname/updateResultStatus", operationsController.updateResultStatus);
  router.post("/admin/login", urlencodedParser, operationsController.login);
  router.post("/schools/:sname/portal/login", urlencodedParser, operationsController.portaLogin);
  router.post("/schools/:sname/follow", urlencodedParser, operationsController.upload_feedbacks);
  router.post("/admin/:sname/upcoming-news", operationsController.upload_news);
  router.post("/admin/:sname/sessions", operationsController.createSession);
  router.post("/admin/:sname/classes", operationsController.createClass);
  router.post("/admin/:sname/subjects", operationsController.createSubject);
  router.post("/admin/:sname/students", operationsController.createStudent);

  // SCHOOL PAGES . . .
  router.all("/schools/:sname/home", pagesController.s_home);
  router.get("/schools/:sname/admissions", pagesController.admissions);
  router.get("/schools/:sname/fees", pagesController.fees);
  router.get("/schools/:sname/portal", pagesController.portal);
  router.get("/schools/:sname/portal/:stdclass/:studname", pagesController.profile);
  router.get("/schools/:sname/portal/:stdclass/:studname/preview", pagesController.profile_results);
  router.get("/schools/:sname/follow", pagesController.follow_up);
  router.get("/schools/:sname/about", pagesController.s_about);

  // ADMIN PANEL . . .
  router.get("/admin", pagesController.admin);
  router.all("/admin/:sname/dashboard", pagesController.dashboard);
  router.get("/admin/:sname/school-info", pagesController.school_info);
  router.get("/admin/:sname/upcoming-news", pagesController.upcoming_news);
  router.get("/admin/:sname/fees-info", pagesController.fees_info);
  router.get("/admin/:sname/student-info", pagesController.student_info);
  router.get("/admin/:sname/student-fees", pagesController.student_fees);
  router.get("/admin/:sname/blue-print", pagesController.blue_print);
  router.get("/admin/:sname/student-register", pagesController.student_register);
  router.get("/admin/:sname/continous-assessments", pagesController.continous_assessments);
  router.get("/admin/:sname/student-results", pagesController.student_results);
  router.get("/admin/:sname/parents", pagesController.parents);
  router.get("/admin/:sname/sessions", pagesController.sessions);
  router.get("/admin/:sname/classes", pagesController.classes);
  router.get("/admin/:sname/subjects", pagesController.subjects);
  router.get("/admin/:sname/assessment/:class/:subject", pagesController.assessment);
  router.get("/admin/:sname/result/:class/:student", pagesController.result);

  // TEACHERS APP . . .
  router.post("/ontap/staffLogin", operationsController.staffLogin);
  router.get("/ontap/:sname/getClassList", operationsController.getClassList);
  router.get("/ontap/:sname/getAttendanceForClass/:class", operationsController.getAttendanceForClass);

  return app.use("/", router);
};

module.exports = routes;