var Student = (function () {
    function Student(firstname, middleinitial, lastname) {
        this.firstname = firstname;
        this.middleinitial = middleinitial;
        this.lastname = lastname;
        this.fullname = firstname + " " + middleinitial + " " + lastname;
    }
    return Student;
})();
function greeter(person) {
    var title = person.title || '';
    if (title.length > 0) {
        title += ' ';
    }
    return "Hello, " + title + person.firstname + " " + person.lastname;
}
function alerter(person) {
    alert(greeter(person));
}
var user = new Student('Joe', 'M', 'Doe');
var i = 100;
document.body.innerHTML = greeter(user);
//# sourceMappingURL=greeter.js.map