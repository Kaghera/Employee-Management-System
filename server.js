const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Kasagh10',
  database: 'employeedb',
});   

// Inquirer opening question
const basicQuestion = [
  {
    type: 'list',
    name: 'basic',
    message: 'What would you like to do?',
    choices: [
      'Add a department',
      'Add a role',
      'Add an employee',
      'View all departments',
      'View all roles',
      'View all employees',
      'Delete a department',
      'Delete a role',
      'Delete an employee',
      'Update an employee role',
      'Exit',
    ],
  },
];

// Inquirer add department question
const deptQuestion = [
  {
    type: 'input',
    name: 'department',
    message: 'What department would you like to add?',
  },
];


let query = '';

// Add a new department function
function newDept() {
  inquirer.prompt(deptQuestion).then(response => {
    // take the response and make a query
    query = `INSERT INTO department (name) VALUES ('${response.department}');`;
    // query to add department into database
    connection.query(query, (err, results) => {
      if (err) throw err;
    });
    // return to main menu
    askUser();
  });
}

// Add a new role function
function newRole() {
  // query the department table
  query = 'SELECT * FROM department;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    // save departments to an array and use for choices
    const deptArr = results.map((dept) => {
      return {
        value: dept.id,
        name: dept.name,
      };
    });

    // ask for role
    inquirer.prompt([
      {
        type: 'rawlist',
        name: 'title',
        message: 'What role would you like to add?',
        choices: [
          'Manager',
          'Graphic Designer',
          'Animator',
          'Head Chef',
          'Baker',
          'Prosecutor',
          'Defense Attorney',
        ],
      },
      {
        type: 'rawlist',
        name: 'salary',
        message: 'What is the salary of this role?',
        choices: [
          '40000',
          '50000',
          '60000',
          '70000',
          '80000',
          '90000',
        ],
      },
      {
        type: 'rawlist',
        name: 'deptId',
        message: 'What is the department ID?',
        choices: deptArr,
      },
    ]).then(response => {
      // take the response and make a query
      query = `INSERT INTO role (title, salary, department_id) VALUES ('${response.title}', ${response.salary}, ${response.deptId});`;
      // query to add role into database
      connection.query(query, (err, results) => {
        if (err) throw err;
      });
      // return to main menu
      askUser();
    });
  });
}


// Add a new employee function
function newEmployee() {
  // query the roles table
  query = 'SELECT * FROM role;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    // save all roles to an array and use for choices
    const allRoles = results.map((role) => {
      return {
        value: role.id,
        name: role.title,
      };
    });

    // ask about new employee
    inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'What is the employee\'s first name?',
      },
      {
        type: 'lastName',
        name: 'lastName',
        message: 'What is the employee\'s last name?',
      },
      {
        type: 'rawlist',
        name: 'roleId',
        message: 'What is the employee\'s role ID?',
        choices: allRoles,
      },
    ]).then(response => {
      // take the response and make a query
      query = `INSERT INTO employee (first_name, last_name, role_id) VALUES ('${response.firstName}', '${response.lastName}', ${response.roleId});`;
      // query to add employee into database
      connection.query(query, (err, results) => {
        if (err) throw err;
      });
      // return to main menu
      askUser();
    });
  });
}


// show all departments function
function showAllDept() {
  query = 'SELECT * FROM department;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    // return to main menu
    askUser();
  });
}

// show all roles function
function showAllRoles() {
  query = 'SELECT * FROM role;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    // return to main menu
    askUser();
  });
}

// show all employees function
function showAllEmp() {
  query = 'SELECT first_name, last_name, title, name, salary, manager_id FROM employee LEFT JOIN role On employee.role_id = role.id LEFT JOIN department On role.department_id = department.id;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    // return to main menu
    askUser();
  });
}

// Update employee role function
function updateEmpRole() {
  // showing all the roles
  query = 'SELECT * FROM role;';
  connection.query(query, (err, results) => {
    if (err) throw err;

    // console.log(results) will return an array of objects
    // saving all the roles from the database to a variable
    const rolesArr = results.map((role) => {
      // for each role in results, create an object with title and roleid
      return {
        value: role.id,
        name: role.title,
      };
    });

    // showing all the employees from the database and saving to a variable
    query = 'SELECT * FROM employee;';
    connection.query(query, (err, res) => {
      if (err) throw err;

      // for each employee, create an object; get first and last name, and employeeid from database
      const employeesArr = res.map((emp) => {
        return {
          value: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
        };
      });

      // then prompt user
      inquirer.prompt([
        {
          type: 'rawlist',
          name: 'employeeUpdate',
          choices: employeesArr, // <---- employee array we made above are now choices
          message: 'Which employee do you want to update?',
        },
        {
          type: 'rawlist',
          name: 'newEmpRole',
          choices: rolesArr, // <---- roles array we made above are now choices
          message: 'What is their new role?',
        },
      ]).then(response => {
        // take the response and make a query
        query = `UPDATE employee SET role_id = '${response.newEmpRole}' WHERE id = '${response.employeeUpdate}';`;
        // query to add employee into database
        connection.query(query, (err, results) => {
          if (err) throw err;
          // console.log(results);
          askUser();
        });
      });
    });
  });
}

// Delete department function
function deleteDept() {
  // query the department table
  query = 'SELECT * FROM department;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    // save departments to an array and use for choices
    const deptArr = results.map((dept) => {
      return {
        value: dept.id,
        name: dept.name,
      };
    });

    inquirer.prompt([
      {
        type: 'rawlist',
        name: 'deptId',
        message: 'Which department would you like to remove?',
        choices: deptArr,
      },
    ]).then(response => {
      query = `DELETE FROM department WHERE id = ${response.deptId};`;
      connection.query(query, (err, results) => {
        if (err) throw err;
        askUser();
      });
    });
  });
}

// Delete role function
function deleteRole() {
  // query the role table
  query = 'SELECT * FROM role;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    // save role to an array and use for choices
    const roleArr = results.map((role) => {
      return {
        value: role.id,
        name: role.title,
      };
    });

    inquirer.prompt([
      {
        type: 'rawlist',
        name: 'roleId',
        message: 'Which role would you like to remove?',
        choices: roleArr,
      },
    ]).then(response => {
      query = `DELETE FROM role WHERE id = ${response.roleId};`;
      connection.query(query, (err, results) => {
        if (err) throw err;
        askUser();
      });
    });
  });
}


// Delete employee function
function deleteEmp() {
  // query the employee table
  query = 'SELECT * FROM employee;';
  connection.query(query, (err, results) => {
    if (err) throw err;
    // save employee to an array and use for choices
    const allEmpsArr = results.map((employee) => {
      return {
        value: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
      };
    });

    inquirer.prompt([
      {
        type: 'rawlist',
        name: 'employee',
        message: 'Which employee would you like to remove?',
        choices: allEmpsArr,
      },
    ]).then(response => {
      query = `DELETE FROM employee WHERE id = ${response.employee};`;
      connection.query(query, (err, results) => {
        if (err) throw err;
        askUser();
      });
    });
  });
}

// Prompt the user
function askUser() {
  // ask the user what they want to do
  inquirer.prompt(basicQuestion).then(response => {
    // filter out the response here
    switch (response.basic) {
      case 'Add a department':
        newDept();
        break;

      case 'Add a role':
        newRole();
        break;

      case 'Add an employee':
        newEmployee();
        break;

      case 'View all departments':
        showAllDept();
        break;

      case 'View all roles':
        showAllRoles();
        break;

      case 'View all employees':
        showAllEmp();
        break;

      case 'Update an employee role':
        updateEmpRole();
        break;

      case 'Delete a department':
        deleteDept();
        break;

      case 'Delete a role':
        deleteRole();
        break;

      case 'Delete an employee':
        deleteEmp();
        break;

      case 'Exit':
        connection.end();
        break;

      default:
        break;
    }
  });
}

askUser();