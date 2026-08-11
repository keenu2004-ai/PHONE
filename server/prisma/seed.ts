import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TeamNest workforce management database with Prompt 9 mock data...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.user.deleteMany();

  // 1 Admin User
  const admin = await prisma.user.create({
    data: {
      full_name: 'Admin User',
      email: 'admin@company.com',
      role: 'ADMIN',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  });

  // 5 Employee Users
  const alex = await prisma.user.create({
    data: {
      full_name: 'Alex Rivera',
      email: 'alex@company.com',
      role: 'EMPLOYEE',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      full_name: 'Sarah Connor',
      email: 'sarah@company.com',
      role: 'EMPLOYEE',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    },
  });

  const david = await prisma.user.create({
    data: {
      full_name: 'David Kim',
      email: 'david@company.com',
      role: 'EMPLOYEE',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    },
  });

  const priya = await prisma.user.create({
    data: {
      full_name: 'Priya Sharma',
      email: 'priya@company.com',
      role: 'EMPLOYEE',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
  });

  const rohan = await prisma.user.create({
    data: {
      full_name: 'Rohan Verma',
      email: 'rohan@company.com',
      role: 'EMPLOYEE',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
  });

  console.log('✅ Created 1 Admin and 5 Employee users successfully.');

  // Current Month Holiday (August 2026)
  const holiday = await prisma.holiday.create({
    data: {
      date: new Date('2026-08-15'),
      name: 'Independence Day & Annual Team Outing',
    },
  });

  console.log('✅ Created company holiday:', holiday.name);

  // 3 Attendance check-ins for today
  const today = new Date();
  await prisma.attendance.create({
    data: {
      user_id: alex.id,
      date: today,
      clock_in: new Date(new Date().setHours(9, 0, 0, 0)),
      clock_out: new Date(new Date().setHours(17, 30, 0, 0)),
      check_in_lat: 37.7749,
      check_in_lng: -122.4194,
      status: 'PRESENT',
    },
  });

  await prisma.attendance.create({
    data: {
      user_id: sarah.id,
      date: today,
      clock_in: new Date(new Date().setHours(8, 45, 0, 0)),
      clock_out: null, // Active shift
      check_in_lat: 37.7749,
      check_in_lng: -122.4194,
      status: 'PRESENT',
    },
  });

  await prisma.attendance.create({
    data: {
      user_id: david.id,
      date: today,
      clock_in: new Date(new Date().setHours(9, 15, 0, 0)),
      clock_out: null, // Active shift
      check_in_lat: 37.7749,
      check_in_lng: -122.4194,
      status: 'PRESENT',
    },
  });

  console.log('✅ Created 3 attendance check-ins for today.');

  // Helper for current week Monday-Friday dates
  const dayOfWeek = today.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const getWeekDate = (dayOffset: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    return d;
  };

  // 2 Pending Leave Requests and 1 Approved Leave Request for current week
  await prisma.leave.create({
    data: {
      user_id: alex.id,
      start_date: getWeekDate(3), // Thursday
      end_date: getWeekDate(4), // Friday
      leave_type: 'Casual',
      comments: 'Personal family work',
      status: 'APPROVED', // 1 Approved Leave
    },
  });

  await prisma.leave.create({
    data: {
      user_id: priya.id,
      start_date: getWeekDate(2), // Wednesday
      end_date: getWeekDate(2),
      leave_type: 'Sick',
      comments: 'Fever and medical checkup',
      status: 'PENDING', // Pending 1
    },
  });

  await prisma.leave.create({
    data: {
      user_id: rohan.id,
      start_date: getWeekDate(4), // Friday
      end_date: getWeekDate(4),
      leave_type: 'Unpaid',
      comments: 'Personal trip',
      status: 'PENDING', // Pending 2
    },
  });

  console.log('✅ Created 2 Pending Leaves and 1 Approved Leave for current week.');

  // 2 Pending Expense claims with sample receipt URLs
  await prisma.expense.create({
    data: {
      user_id: alex.id,
      date: getWeekDate(1), // Tuesday
      amount: 145.5,
      category: 'Travel & Transport',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
      status: 'PENDING',
    },
  });

  await prisma.expense.create({
    data: {
      user_id: sarah.id,
      date: getWeekDate(0), // Monday
      amount: 89.99,
      category: 'Client Dinner & Meal',
      receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=400',
      status: 'PENDING',
    },
  });

  console.log('✅ Created 2 Pending Expense claims with sample receipt URLs.');

  // 5 Tasks distributed across Monday to Friday
  await prisma.task.create({
    data: {
      user_id: alex.id,
      due_date: getWeekDate(0), // Monday
      title: 'Review Q3 Client Onboarding System Logs',
      status: 'DONE',
    },
  });

  await prisma.task.create({
    data: {
      user_id: sarah.id,
      due_date: getWeekDate(1), // Tuesday
      title: 'Finalize Mobile UI Wireframes for Phase 8',
      status: 'DONE',
    },
  });

  await prisma.task.create({
    data: {
      user_id: david.id,
      due_date: getWeekDate(2), // Wednesday
      title: 'Audit Geolocation & GPS Clock-In Endpoint Security',
      status: 'TODO',
    },
  });

  await prisma.task.create({
    data: {
      user_id: priya.id,
      due_date: getWeekDate(3), // Thursday
      title: 'Prepare Weekly Payroll Report CSV Export Template',
      status: 'TODO',
    },
  });

  await prisma.task.create({
    data: {
      user_id: rohan.id,
      due_date: getWeekDate(4), // Friday
      title: 'Deploy Production Release Candidate for TeamNest OS',
      status: 'TODO',
    },
  });

  console.log('✅ Created 5 Tasks distributed across Monday to Friday.');
  console.log('🎉 Prompt 9 database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
