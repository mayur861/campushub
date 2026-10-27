USE campushub;

-- Departments
INSERT INTO departments (name)
VALUES
('Computer Science'),
('Information Technology'),
('Artificial Intelligence'),
('Electronics'),
('Mechanical');

-- Skills
INSERT INTO skills (name)
VALUES
('Python'),
('JavaScript'),
('Java'),
('SQL'),
('React.js'),
('Node.js'),
('Machine Learning'),
('Data Science'),
('Git'),
('Docker');

-- Subjects
INSERT INTO subjects (name, code, department_id, semester)
VALUES
('Database Management System', 'CS301', 1, 5),
('Operating System', 'CS302', 1, 5),
('Computer Networks', 'CS303', 1, 5),
('Web Development', 'CS304', 1, 5),
('Machine Learning', 'AI301', 3, 5);

-- Verify
SELECT * FROM departments;
SELECT * FROM skills;
SELECT * FROM subjects;