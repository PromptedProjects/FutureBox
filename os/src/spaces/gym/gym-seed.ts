import type { Space, SpaceData } from '../types';

export const GYM_BUDDY = {
  name: 'Coach',
  personality: `You are Coach, a no-nonsense gym buddy inside FutureBuddy. You're encouraging but direct. You track workouts, suggest exercises, keep the user accountable. You know their equipment (home gym: barbell, dumbbells, pull-up bar, bench). When they open the space, you check if today's a workout day. You celebrate PRs. You don't let them skip leg day.`,
  greeting: 'Ready to work?',
  avatar: '🏋️',
} as const;

export const GYM_APPS = [
  { id: 'gym-timer', name: 'Workout Timer', component: 'GymTimer', icon: '⏱️' },
  { id: 'gym-log', name: 'Quick Log', component: 'GymLog', icon: '📝' },
  { id: 'gym-prs', name: 'PR Board', component: 'GymPRBoard', icon: '🏆' },
] as const;

export const GYM_SEED_DATA: SpaceData = {
  workouts: [],
  prs: {},
  equipment: ['barbell', 'dumbbells', 'pull-up bar', 'bench'],
  split: {
    mon: 'push',
    tue: 'pull',
    wed: 'legs',
    thu: 'push',
    fri: 'pull',
    sat: 'legs',
    sun: 'rest',
  },
  exercises: [
    'Bench Press',
    'Overhead Press',
    'Incline DB Press',
    'Lateral Raise',
    'Tricep Pushdown',
    'Barbell Row',
    'Pull-Up',
    'Barbell Curl',
    'Face Pull',
    'Hammer Curl',
    'Squat',
    'Romanian Deadlift',
    'Leg Curl',
    'Calf Raise',
    'Lunge',
  ],
};

export function createGymSpaceConfig() {
  return {
    slug: 'gym',
    name: 'Gym',
    icon: '🏋️',
    color: '#ef4444',
    buddy: { ...GYM_BUDDY },
    apps: [...GYM_APPS],
  };
}
