INSERT INTO department (name)
VALUES  ("Sales"),
        ("Engineering"),
        ("Marketing"),
        ("HR"),
        ("Finance");

INSERT INTO roles (title, salary, department_id)
VALUES  ("Lead Engineer", 100000, 2),
        ("Sales Manager", 120000, 1),
        ("Programmer", 500000, 2),
        ("Account Manager", 200000, 4),
        ("Marketing Director", 250000, 3);

INSERT INTO employee (first_name, last_name, roles_id, manager_id)
VALUES  ("Bilbo", "Baggins", 1, null), 
        ("Hermione", "Granger", 4, null),
        ("Dean", "Winchester", 3, 1),
        ("Pippin", "Took", 2, null ),
        ("Remus", "Lupin", 5, null);