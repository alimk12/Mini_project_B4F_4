// Students are local development accounts. On a hosted server, set SEED_INSTRUCTOR_PASSWORD before seeding.
const instructorPassword = process.env.SEED_INSTRUCTOR_PASSWORD?.trim() || 'Instructor123';

export const SEED_USERS = [
  { fullName: 'Instructor Demo', email: 'instructor@b4f.local', password: instructorPassword, role: 'INSTRUCTOR' as const },
  { fullName: 'Lina Saleh', email: 'lina@b4f.local', password: 'Student123', role: 'STUDENT' as const },
  { fullName: 'Omar Haddad', email: 'omar@b4f.local', password: 'Student123', role: 'STUDENT' as const },
];
