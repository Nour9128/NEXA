import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NEXA database...');

  // Clean existing seed data
  await prisma.user.deleteMany({
    where: { email: { in: ['demo@nexa.app', 'sarah@nexa.app', 'omar@nexa.app'] } },
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nexa.app',
      fullName: 'Karim Hassan',
      passwordHash,
      timezone: 'Africa/Cairo',
      bio: 'Product builder & tech enthusiast based in Cairo, Egypt. Turning ideas into structured momentum.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
    },
  });

  // Create partner / collaborator
  const collaborator = await prisma.user.create({
    data: {
      email: 'sarah@nexa.app',
      fullName: 'Sarah Nour',
      passwordHash,
      timezone: 'Africa/Cairo',
      bio: 'Architect & travel planner.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
    },
  });

  console.log('Created users: Karim Hassan, Sarah Nour');

  // Shared Space: Dahab Travel Crew
  const travelSpace = await prisma.sharedSpace.create({
    data: {
      name: 'Red Sea Expedition Crew',
      description: 'Collaborative travel planning, diving itinerary, and group expenses for Dahab & Sinai.',
      createdById: demoUser.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'OWNER' },
          { userId: collaborator.id, role: 'MEMBER' },
        ],
      },
      budget: {
        create: {
          totalLimit: 600,
          currency: 'USD',
          expenses: {
            create: [
              { paidById: demoUser.id, title: 'Beachfront Camp Lodging (4 nights)', amount: 240, category: 'Stay' },
              { paidById: collaborator.id, title: 'Group 4x4 Desert Safari & Dinner', amount: 120, category: 'Activities' },
            ],
          },
        },
      },
    },
  });

  // Plan 1: Exam Study Schedule (Category: STUDY)
  const studyPlan = await prisma.plan.create({
    data: {
      userId: demoUser.id,
      title: 'Final Semester Engineering Exams Prep',
      description: 'Systematic 3-week revision schedule focusing on Distributed Systems & AI Architectures.',
      category: 'STUDY',
      targetDate: new Date(Date.now() + 21 * 86400000),
      tasks: {
        create: [
          {
            userId: demoUser.id,
            title: 'Analyze past exam papers and syllabus weights',
            priority: 'HIGH',
            status: 'DONE',
            dueDate: new Date(Date.now() - 2 * 86400000),
            subtasks: {
              create: [
                { title: 'Download 2024 & 2025 past papers', isCompleted: true, order: 0 },
                { title: 'Tag high-yield chapters in textbook', isCompleted: true, order: 1 },
              ],
            },
            tags: ['Prep', 'Analysis'],
          },
          {
            userId: demoUser.id,
            title: 'Complete Distributed Consensus Problem Sets',
            priority: 'URGENT',
            status: 'IN_PROGRESS',
            dueDate: new Date(Date.now() + 3 * 86400000),
            subtasks: {
              create: [
                { title: 'Raft consensus election simulator', isCompleted: true, order: 0 },
                { title: 'Paxos leaderless edge cases review', isCompleted: false, order: 1 },
              ],
            },
            tags: ['DeepWork', 'ProblemSets'],
          },
          {
            userId: demoUser.id,
            title: 'Simulate full mock exam under timed conditions',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: new Date(Date.now() + 14 * 86400000),
            subtasks: {
              create: [
                { title: '3-hour silent block in library', isCompleted: false, order: 0 },
                { title: 'Peer review answers with study group', isCompleted: false, order: 1 },
              ],
            },
            tags: ['Mock', 'Finals'],
          },
        ],
      },
    },
  });

  // Plan 2: Weekend Trip to Dahab (Category: TRAVEL)
  const tripPlan = await prisma.plan.create({
    data: {
      userId: demoUser.id,
      spaceId: travelSpace.id,
      title: 'Sinai & Dahab Long Weekend Trip',
      description: 'Snorkeling at the Blue Hole, hiking Mount Sinai for sunrise, and relaxing by the Gulf of Aqaba.',
      category: 'TRAVEL',
      targetDate: new Date(Date.now() + 10 * 86400000),
      budget: {
        create: {
          totalLimit: 450,
          currency: 'USD',
          expenses: {
            create: [
              { paidById: demoUser.id, title: 'Snorkeling equipment rental', amount: 35, category: 'Activities' },
              { paidById: demoUser.id, title: 'Sharm el-Sheikh airport transfer', amount: 45, category: 'Transport' },
            ],
          },
        },
      },
      tasks: {
        create: [
          {
            userId: demoUser.id,
            spaceId: travelSpace.id,
            title: 'Confirm Blue Hole dive guide and transport',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: new Date(Date.now() + 4 * 86400000),
            tags: ['Diving', 'Outdoor'],
          },
          {
            userId: demoUser.id,
            spaceId: travelSpace.id,
            title: 'Pack desert hiking essentials & headlamps',
            priority: 'MEDIUM',
            status: 'TODO',
            dueDate: new Date(Date.now() + 8 * 86400000),
            tags: ['Packing'],
          },
        ],
      },
    },
  });

  // Plan 3: Weekly Grocery List (Category: PERSONAL)
  const groceryPlan = await prisma.plan.create({
    data: {
      userId: demoUser.id,
      title: 'Weekly Organic Grocery & Kitchen Restock',
      description: 'Healthy whole foods, fresh market produce, and meal prep essentials.',
      category: 'PERSONAL',
      targetDate: new Date(Date.now() + 2 * 86400000),
      budget: {
        create: {
          totalLimit: 80,
          currency: 'USD',
          expenses: {
            create: [
              { paidById: demoUser.id, title: 'Farmer market fresh vegetables & fruits', amount: 32, category: 'Food' },
            ],
          },
        },
      },
      tasks: {
        create: [
          {
            userId: demoUser.id,
            title: 'Purchase fresh market essentials',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            dueDate: new Date(Date.now() + 1 * 86400000),
            subtasks: {
              create: [
                { title: 'Greek yogurt & oat milk', isCompleted: true, order: 0 },
                { title: 'Avocados, spinach & cherry tomatoes', isCompleted: true, order: 1 },
                { title: 'Wild salmon fillets & free-range eggs', isCompleted: false, order: 2 },
                { title: 'Cold-pressed olive oil', isCompleted: false, order: 3 },
              ],
            },
            tags: ['Kitchen', 'Restock'],
          },
        ],
      },
    },
  });

  // Standalone task: Health appointment
  await prisma.task.create({
    data: {
      userId: demoUser.id,
      title: 'Annual Comprehensive Health & Dental Checkup',
      description: 'Scheduled with Dr. Tamer at Cairo Medical Center. Bring previous bloodwork charts.',
      priority: 'URGENT',
      status: 'TODO',
      dueDate: new Date(Date.now() + 5 * 86400000),
      reminderDate: new Date(Date.now() + 4 * 86400000),
      tags: ['Health', 'Appointments'],
    },
  });

  // Saved items
  await prisma.savedItem.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Dahab Hidden Coral Reefs Coordinates',
        content: 'Coordinates for Ras Abu Galum secret lagoon: Accessible via camel trek from Blue Hole. Best visibility between 8am and 11am.',
        type: 'NOTE',
        tags: ['Travel', 'SecretSpots', 'Sinai'],
        isFavorite: true,
      },
      {
        userId: demoUser.id,
        title: 'Conference Keynote: Future of Autonomous AI Agents',
        content: 'Summary of modern agentic tool-calling architecture and reactive micro-workflows.',
        sourceUrl: 'https://arxiv.org/abs/2309.07864',
        type: 'LINK',
        tags: ['AI', 'Research', 'Tech'],
        isFavorite: true,
        aiSummary: 'Paper explains how multi-step agent loops decouple planning from direct execution for enhanced safety.',
      },
      {
        userId: demoUser.id,
        title: 'Flight Booking Confirmation Screenshot',
        content: 'Flight MS 022 Cairo (CAI) to Sharm (SSH), departing Friday 07:15 AM.',
        type: 'SCREENSHOT',
        tags: ['Travel', 'Tickets'],
        isFavorite: false,
      },
    ],
  });

  // In-app notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'DEADLINE',
        title: 'Upcoming Exam Milestone',
        message: 'Your Distributed Systems problem sets are due in 3 days.',
        link: `/app/plans/${studyPlan.id}`,
        isRead: false,
      },
      {
        userId: demoUser.id,
        type: 'INVITATION',
        title: 'Sarah joined Red Sea Crew',
        message: 'Sarah Nour has joined your shared space "Red Sea Expedition Crew".',
        link: `/app/spaces/${travelSpace.id}`,
        isRead: true,
      },
    ],
  });

  console.log(' Database seeded successfully with demo user, plans, tasks, spaces, and captures.');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
