const { sql, getPool } = require('./db');

function mapFaculty(row) {
  return {
    faculty: row.FACULTY,
    facultyName: row.FACULTY_NAME
  };
}

function mapPulpit(row) {
  return {
    pulpit: row.PULPIT,
    pulpitName: row.PULPIT_NAME,
    faculty: row.FACULTY
  };
}

function mapTeacher(row) {
  return {
    teacher: row.TEACHER,
    teacherName: row.TEACHER_NAME,
    pulpit: row.PULPIT
  };
}

function mapSubject(row) {
  return {
    subject: row.SUBJECT,
    subjectName: row.SUBJECT_NAME,
    pulpit: row.PULPIT
  };
}

async function queryRows(sqlText, inputs = []) {
  const pool = await getPool();
  const request = pool.request();

  inputs.forEach(({ name, type, value }) => request.input(name, type, value));

  const result = await request.query(sqlText);
  return result.recordset;
}

async function execute(sqlText, inputs = []) {
  const pool = await getPool();
  const request = pool.request();

  inputs.forEach(({ name, type, value }) => request.input(name, type, value));

  return request.query(sqlText);
}

async function exists(table, keyColumn, keyValue) {
  const rows = await queryRows(
    `select count(*) as CNT from ${table} where ${keyColumn} = @id`,
    [{ name: 'id', type: sql.NVarChar, value: keyValue }]
  );

  return rows[0].CNT > 0;
}

const resolvers = {
  async getFaculties({ faculty }) {
    const rows = await queryRows(
      `select FACULTY, FACULTY_NAME
       from FACULTY
       where @faculty is null or FACULTY = @faculty
       order by FACULTY`,
      [{ name: 'faculty', type: sql.NVarChar, value: faculty || null }]
    );

    return rows.map(mapFaculty);
  },

  async getTeachers({ teacher }) {
    const rows = await queryRows(
      `select TEACHER, TEACHER_NAME, PULPIT
       from TEACHER
       where @teacher is null or TEACHER = @teacher
       order by TEACHER`,
      [{ name: 'teacher', type: sql.NVarChar, value: teacher || null }]
    );

    return rows.map(mapTeacher);
  },

  async getPulpits({ pulpit }) {
    const rows = await queryRows(
      `select PULPIT, PULPIT_NAME, FACULTY
       from PULPIT
       where @pulpit is null or PULPIT = @pulpit
       order by PULPIT`,
      [{ name: 'pulpit', type: sql.NVarChar, value: pulpit || null }]
    );

    return rows.map(mapPulpit);
  },

  async getSubjects({ subject }) {
    const rows = await queryRows(
      `select SUBJECT, SUBJECT_NAME, PULPIT
       from SUBJECT
       where @subject is null or SUBJECT = @subject
       order by SUBJECT`,
      [{ name: 'subject', type: sql.NVarChar, value: subject || null }]
    );

    return rows.map(mapSubject);
  },

  async setFaculty({ faculty }) {
    await execute(
      `merge FACULTY as target
       using (select @faculty as FACULTY, @facultyName as FACULTY_NAME) as source
       on target.FACULTY = source.FACULTY
       when matched then
         update set FACULTY_NAME = source.FACULTY_NAME
       when not matched then
         insert (FACULTY, FACULTY_NAME) values (source.FACULTY, source.FACULTY_NAME);`,
      [
        { name: 'faculty', type: sql.NVarChar, value: faculty.faculty },
        { name: 'facultyName', type: sql.NVarChar, value: faculty.facultyName }
      ]
    );

    return (await resolvers.getFaculties({ faculty: faculty.faculty }))[0];
  },

  async setTeacher({ teacher }) {
    await execute(
      `merge TEACHER as target
       using (select @teacher as TEACHER, @teacherName as TEACHER_NAME, @pulpit as PULPIT) as source
       on target.TEACHER = source.TEACHER
       when matched then
         update set TEACHER_NAME = source.TEACHER_NAME, PULPIT = source.PULPIT
       when not matched then
         insert (TEACHER, TEACHER_NAME, PULPIT)
         values (source.TEACHER, source.TEACHER_NAME, source.PULPIT);`,
      [
        { name: 'teacher', type: sql.NVarChar, value: teacher.teacher },
        { name: 'teacherName', type: sql.NVarChar, value: teacher.teacherName },
        { name: 'pulpit', type: sql.NVarChar, value: teacher.pulpit }
      ]
    );

    return (await resolvers.getTeachers({ teacher: teacher.teacher }))[0];
  },

  async setPulpit({ pulpit }) {
    await execute(
      `merge PULPIT as target
       using (select @pulpit as PULPIT, @pulpitName as PULPIT_NAME, @faculty as FACULTY) as source
       on target.PULPIT = source.PULPIT
       when matched then
         update set PULPIT_NAME = source.PULPIT_NAME, FACULTY = source.FACULTY
       when not matched then
         insert (PULPIT, PULPIT_NAME, FACULTY)
         values (source.PULPIT, source.PULPIT_NAME, source.FACULTY);`,
      [
        { name: 'pulpit', type: sql.NVarChar, value: pulpit.pulpit },
        { name: 'pulpitName', type: sql.NVarChar, value: pulpit.pulpitName },
        { name: 'faculty', type: sql.NVarChar, value: pulpit.faculty }
      ]
    );

    return (await resolvers.getPulpits({ pulpit: pulpit.pulpit }))[0];
  },

  async setSubject({ subject }) {
    await execute(
      `merge SUBJECT as target
       using (select @subject as SUBJECT, @subjectName as SUBJECT_NAME, @pulpit as PULPIT) as source
       on target.SUBJECT = source.SUBJECT
       when matched then
         update set SUBJECT_NAME = source.SUBJECT_NAME, PULPIT = source.PULPIT
       when not matched then
         insert (SUBJECT, SUBJECT_NAME, PULPIT)
         values (source.SUBJECT, source.SUBJECT_NAME, source.PULPIT);`,
      [
        { name: 'subject', type: sql.NVarChar, value: subject.subject },
        { name: 'subjectName', type: sql.NVarChar, value: subject.subjectName },
        { name: 'pulpit', type: sql.NVarChar, value: subject.pulpit }
      ]
    );

    return (await resolvers.getSubjects({ subject: subject.subject }))[0];
  },

  async delFaculty({ faculty }) {
    if (!(await exists('FACULTY', 'FACULTY', faculty.faculty))) {
      return false;
    }

    await execute('delete from FACULTY where FACULTY = @faculty', [
      { name: 'faculty', type: sql.NVarChar, value: faculty.faculty }
    ]);

    return true;
  },

  async delTeacher({ teacher }) {
    if (!(await exists('TEACHER', 'TEACHER', teacher.teacher))) {
      return false;
    }

    await execute('delete from TEACHER where TEACHER = @teacher', [
      { name: 'teacher', type: sql.NVarChar, value: teacher.teacher }
    ]);

    return true;
  },

  async delPulpit({ pulpit }) {
    if (!(await exists('PULPIT', 'PULPIT', pulpit.pulpit))) {
      return false;
    }

    await execute('delete from PULPIT where PULPIT = @pulpit', [
      { name: 'pulpit', type: sql.NVarChar, value: pulpit.pulpit }
    ]);

    return true;
  },

  async delSubject({ subject }) {
    if (!(await exists('SUBJECT', 'SUBJECT', subject.subject))) {
      return false;
    }

    await execute('delete from SUBJECT where SUBJECT = @subject', [
      { name: 'subject', type: sql.NVarChar, value: subject.subject }
    ]);

    return true;
  },

  async getTeachersByFaculty({ faculty }) {
    const rows = await queryRows(
      `select t.TEACHER, t.TEACHER_NAME, t.PULPIT
       from TEACHER t
       join PULPIT p on p.PULPIT = t.PULPIT
       where p.FACULTY = @faculty
       order by t.TEACHER`,
      [{ name: 'faculty', type: sql.NVarChar, value: faculty }]
    );

    return rows.map(mapTeacher);
  },

  async getSubjectsByFaculties({ faculty }) {
    const rows = await queryRows(
      `select p.PULPIT, p.PULPIT_NAME, p.FACULTY, s.SUBJECT, s.SUBJECT_NAME
       from PULPIT p
       left join SUBJECT s on s.PULPIT = p.PULPIT
       where p.FACULTY = @faculty
       order by p.PULPIT, s.SUBJECT`,
      [{ name: 'faculty', type: sql.NVarChar, value: faculty }]
    );

    const pulpits = new Map();

    rows.forEach((row) => {
      if (!pulpits.has(row.PULPIT)) {
        pulpits.set(row.PULPIT, {
          pulpit: row.PULPIT,
          pulpitName: row.PULPIT_NAME,
          faculty: row.FACULTY,
          subjects: []
        });
      }

      if (row.SUBJECT) {
        pulpits.get(row.PULPIT).subjects.push(
          mapSubject({
            SUBJECT: row.SUBJECT,
            SUBJECT_NAME: row.SUBJECT_NAME,
            PULPIT: row.PULPIT
          })
        );
      }
    });

    return Array.from(pulpits.values());
  }
};

module.exports = resolvers;
