create table students(
  id integer primary key autoincrement,
  name text not null,
  age int check (age >= 0),
  units_completed float,
  [weird (column)] int,
  decade as (floor(age / 10))
);

insert into students values (1, 'alex', 10, 4.5, 0);
insert into students values (2, 'brian', 20, 90.0, 0);
insert into students values (3, 'craig', 30, 124.5, 0);

create table courses(
  name text primary key
);

insert into courses values('MATH 101');
insert into courses values('MATH 102');

create table enrollees(
  --! primarily an example of a table with composite primary keys

  course_id text,
  student_id int,
  dropped_at date,
  primary key(course_id, student_id)
);

insert into enrollees values ('MATH 101', 1, null);
insert into enrollees values ('MATH 101', 2, null);
insert into enrollees values ('MATH 101', 3, null);
insert into enrollees values ('MATH 102', 1, '2023-01-15');

create table t(a int);

insert into t(a) values (1);
