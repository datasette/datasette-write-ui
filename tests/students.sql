create table students(
  id int primary key,
  name text,
  age int,
  units_completed float,
  decade as (floor(age / 10))
);

insert into students values (1, 'alex', 10, 4.5);
insert into students values (2, 'brian', 20, 90.0);
insert into students values (3, 'craig', 30, 124.5);

create table courses(
  id int primary key,
  name text
);

insert into courses values(1, 'MATH 101');
insert into courses values(2, 'MATH 102');

create table enrollees(
  --! primarily an example of a table with composite primary keys

  course_id int,
  student_id int,
  dropped_at date,
  primary key(course_id, student_id)
);

insert into enrollees values (1, 1, null);
insert into enrollees values (1, 2, null);
insert into enrollees values (1, 3, null);
insert into enrollees values (2, 1, '2023-01-15');
