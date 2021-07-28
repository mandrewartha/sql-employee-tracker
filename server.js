const express = require('express');
const { fstat } = require('fs');
const mysql = require('mysql2');
const { send, allowedNodeEnvironmentFlags, mainModule } = require('process');
const inquirer = require('inquirer');
const cTable = require('console.table')

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // Add MySQL password
        password: 'password',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
)

// main function to begin

const initial = () => {
    inquirer
        .prompt(
            {
                type: "list",
                message: "What would you like to do?",
                name: "initialPrompt",
                choices: ["View all departments", "View all roles", "View all employees", "Add a role", "Add a department", "Add an employee", "Update an employee role"]
            })
        .then(({initialPrompt}) => {
            console.log(initialPrompt)
            switch (initialPrompt) {
                case "View all departments":
                    seeDepartment();
                    break;

                case "View all roles":
                    seeRoles();
                    break;

                case "View all employees":
                    seeEmployees();
                    break;

                case "Add a department":
                    addDepartment();
                    break;

                case "Add a role":
                    addRole();
                    break;

                case "Add an employee":
                    addEmployee();
                    break;

                case "Update an employee role":
                    updateRole();
                    break;

                default:
                    console.log("goodbye!");
                    db.end();
                    break;
            }
        })
};

initial();

//see all departments (names & Department id)
const seeDepartment = () => {
    db.query("SELECT * FROM department", (err, data) => {
        if (err) {
            console.log(err),
                db.end();
        } else {
            console.table(data),
                initial();
        }
    });
};

//see all roles(job title, role id, department, salary)
const seeRoles = () => {
    db.query(
        "SELECT id, title, salary, department_id FROM roles", (err, data) => {
            if (err) {
                console.log(err),
                    db.end();
            } else {
                console.table(data),
                    initial();
            }
        }
    )
}

//see all employees(employee id, first name, last name, job title, department, salary, managers)

const seeEmployees = () => {
    db.query("SELECT employee.id, first_name, last_name, roles_id,manager_id FROM employee", (err, data) => {
        if (err) {
            console.log(err),
                db.end()
        } else {
            console.table(data),
                initial();
        }
    })
}

//add department (enter name)
const addDepartment = () => {
    db.query("Select * FROM department", (err, data) => {
        if (err) {
            console.log(err),
                db.end()
        } else {
            const addDept = data.map(department => {
                return {
                    name: department.name,
                    value: department.id
                }
            })
            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "What is the name of the department?",
                        name: "departmentChoice",
                        choices:  [{                    
                            name: "Sales"
                            }, 
                            {
                                name:"Engineering"
                            }, 
                            { 
                                name:"Marketing"
                            },
                            {
                                name:"HR"
                            }, 
                            {
                                name:"Finance"
                        }]
                    },
                ])
                .then(answers => {
                    db.query("INSERT INTO department (name) VALUES(?)",
                        [answers.departmentChoice], (err, data) => {
                            if (err) {
                                console.log(err);
                                db.end();
                            } else {
                                console.log("department added!");
                                seeDepartment()
                            }
                        }
                    )
                })
        }
    })
}
//add a role (enter name, salary, department)

const addRole = () => {
    db.query("Select * FROM roles", (err, data) => {
        if (err) {
            console.log(err),
                db.end()
        } else {
            const addDept = data.map(roles => {
                return {
                    name: roles.title,
                    salary: roles.salary,
                    department_id: roles.department_id,
                    value: roles.id
                }
            })
        }
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "What is the name of the role?",
                    name: "roleChoice",
                    choices: ["Lead Engineer", "Sales Manager", "Programmer", "Account Manager", "Marketing Director"]
                },
                {
                    type: "input",
                    message: "What is the salary of the role?",
                    name: "roleSalary"
                },
                {
                    type: "list",
                    message: "Which department does the role belong to?",
                    name: "roleDepartmentChoice",
                    choices: [{                    
                        name: "Sales", value: 1
                        }, 
                        {
                            name:"Engineering", value: 2
                        }, 
                        { 
                            name:"Marketing",value:3
                        },
                        {
                            name:"HR", value:4
                        }, 
                        {
                            name:"Finance", value:5
                    }]
                }
            ]).then(answers => {
                db.query(`INSERT INTO roles (title, salary) VALUES (?,?)`,
                [answers.roleChoice, answers.roleSalary],
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            db.end();
                        } else {
                            console.log("role added!")
                            seeRoles();
                        }
                    })
            })
    })
}


//add employee (enter first name, last name, role, manager)

const addEmployee = () => {
    db.query("SELECT * FROM employee", (err, data) => {
        if (err) {
            console.log(err);
            db.end();
        } else {
            const addEmp = data.map(employee => {
                return {
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    roles_id: employee.roles_id,
                    manager_id: employee.manager_id,
                    value: employee.id
                }
            })
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What is the employee's first name?",
                        name: "employeeFirstName"
                    },
                    {
                        type: "input",
                        message: "What is the employee's last name?",
                        name: "employeeLastName"
                    },
                    {
                        type: "list",
                        message: "What is the employee's role?",
                        name: "employeeRole",
                        choices: [
                            {
                                name:"Lead Engineer", value:1
                            },
                            {
                                name: "Sales Manager", value:2
                            },
                            {
                                name: "Programmer", value:3
                            },
                            {
                                name:"Account Manager", value:4
                            },
                            {
                                name:"Marketing Director", values:5
                            }
                        ]
                    },
                    {
                        type: "list",
                        message: "Who is the employee's manager?",
                        name: "employeeManager",
                        choices: [
                            {
                                name: "Bilbo Baggins", value: 1
                            },
                            {
                                name: "Hermione Granger", value:2
                            },
                            {
                                name:"Pippin Took", value: 3
                            },
                            {
                                name: "Remus Lupin", value: 4
                            }
                        ]
                    },
                ])
                .then(answers => {
                    console.log(answers);
                    db.query(`INSERT INTO employee (first_name, last_name,roles_id, manager_id) VALUES (?,?,?,?)`, [answers.employeeFirstName, answers.employeeLastName, answers.employeeRole, answers.employeeManager],
                        (err, data) => {
                            if (err) {
                                console.log(err);
                                db.end();
                            } else {
                                console.log("employee added!");
                                seeEmployees();
                            }
                        }
                    )
                })

        }
    })
}

//update employee role (select employee, new role)

const updateRole = () => {
    db.query("SELECT * FROM employee", (err, data) => {
        if (err) {
            console.log(err);
            db.end()
        } else {
            const upRole = data.map(employee => {
                return {
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    roles_id: employee.roles_id,
                }
            })
            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which employee do you want to update?",
                        name: "employeeUpdateChoice",
                        choices: [
                            {
                                name:"Bilbo"
                            },
                            {
                                name:"Hermione"
                            },
                            {
                                name:"Dean"
                            },
                            {
                                name:"Pippin"
                            },
                            {
                                name:"Remus"
                            }
                            ]
                    },
                    {
                        type: "list",
                        message: "What is the employees last name?",
                        name: "employeeLastChoice",
                        choices:[
                            {
                                name: "Baggins"
                            },
                            {
                                name: "Granger"
                            },
                            {
                                name: "Winchester"
                            },
                            {
                                name:"Took"
                            },
                            {
                                name:"Lupin"
                            }
                        ]
                    },
                    {
                        type:"list",
                        message: "What is their new role?",
                        name: "newRole",
                        choices: [
                            {
                                name:"Lead Engineer", value:1
                            },
                            {
                                name: "Sales Manager", value:2
                            },
                            {
                                name: "Programmer", value:3
                            },
                            {
                                name:"Account Manager", value:4
                            },
                            {
                                name:"Marketing Director", values:5
                            }
                        ],
                    }
                ])
                .then(answers => {
                    console.log(answers);
                    db.query(`INSERT INTO employee (first_name, last_name, roles_id) VALUES (?,?,?)`, [answers.employeeUpdateChoice,answers.employeeLastChoice, answers.newRole], (err,data) =>{
                        if (err) {
                            console.log(err);
                            db.end();
                        }else {
                            console.log("Role updated!");
                            seeEmployees();
                        }
                    }
                    )
                })
        }
    })
}


app.listen(PORT, () => {
    console.log("Server Running!")
});