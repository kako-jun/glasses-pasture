import type { TranslationKeys } from './ja';

export const en: TranslationKeys = {
  // Common
  common: {
    appName: 'Glasses Pasture',
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
  },

  // Entrance
  entrance: {
    notice: 'No entry except for the nearsighted',
    welcome: 'No one is here. Yet traces of someone linger, swaying in the wind.',
  },

  // Screening
  screening: {
    intro: 'Before naming your glasses, a small check. Please play along.',
    start: 'Begin',
    progress: '{{current}} / {{total}}',
    passed: 'You passed. Your glasses are quietly pleased.',
    failed: 'Not this time. Somewhere brighter seems to suit you.',
    locked: 'Please come back tomorrow.',
    wipeLens: 'The glasses wiped their lenses.',

    // Question 1: Eye test
    q1_question: 'A large eye test chart. Can you see the top letter?',
    q1_optionA: 'I can see it',
    q1_optionB: 'I cannot see it',

    // Question 2: Guitar hero
    q2_question: 'You became famous as an anonymous guitar hero. Will you reveal yourself for praise?',
    q2_optionA: 'Reveal and bask in glory',
    q2_optionB: 'Stay anonymous, keep playing quietly',

    // Question 3: Place
    q3_question: 'Where would you go on a day off?',
    q3_optionA: 'A crowded victory parade',
    q3_optionB: 'A quiet library',

    // Question 4: Role
    q4_question: 'If you could choose your role at an event?',
    q4_optionA: 'Give a speech on stage',
    q4_optionB: 'Fix the wiring backstage',

    // Question 5: Reply speed
    q5_question: 'Your message reply style?',
    q5_optionA: 'Reply instantly',
    q5_optionB: 'Sleep on it, reply tomorrow',

    // Question 6: Group photo
    q6_question: 'Your position in a group photo?',
    q6_optionA: 'Front and center',
    q6_optionB: 'Blending in at the edge',

    // Question 7: Notifications
    q7_question: 'Your notification settings?',
    q7_optionA: 'Always on, monitoring for buzz',
    q7_optionB: 'On only when needed',

    // Question 8: Interaction frequency
    q8_question: 'Your ideal interaction style?',
    q8_optionA: 'Greet 10 new people daily',
    q8_optionB: 'Occasionally catch up with the same 2 friends',

    // Question 9: Self-disclosure
    q9_question: 'Your profile visibility?',
    q9_optionA: 'Detailed profile, public',
    q9_optionB: 'Just glasses, nothing more',

    // Question 10: Competition
    q10_question: 'Which event would you join?',
    q10_optionA: 'Winner-takes-all tournament',
    q10_optionB: 'Solo practice with just a record',
  },

  // Glasses avatar
  glasses: {
    defaultName: 'Glass-{{number}}',
    rename: 'Rename',
    renamePrompt: 'Enter a new name',
    degree: 'Degree',
    frameColor: 'Frame color',
    lensState: 'Lens state',
    clear: 'Clear',
    foggy: 'Foggy',
    friendship: 'Friendship',
    energy: 'Energy',
  },

  // Frame colors
  frameColors: {
    black: 'Black',
    brown: 'Brown',
    silver: 'Silver',
    gold: 'Gold',
    blue: 'Blue',
    red: 'Red',
    green: 'Green',
    purple: 'Purple',
    transparent: 'Transparent',
  },

  // Interaction logs
  interaction: {
    greeted: 'Your glasses greeted {{target}}',
    encouraged: 'Your glasses encouraged {{target}}',
    exchangedItem: 'Your glasses exchanged anti-fog spray with {{target}}',
    played: 'Your glasses played with {{target}}',
    fogCleared: 'Your glasses cleared their fog',
    evolved: 'Your glasses evolved!',
  },

  // Extinction
  extinction: {
    message: 'Your glasses broke',
    newGlasses: 'New glasses have been born',
  },

  // Pasture
  pasture: {
    interactionLog: 'Interaction Log',
    noInteractions: 'No interactions yet',
  },

  // Stable
  stable: {
    title: 'Stable',
    empty: 'Nothing written yet',
    postCount: '{{count}} entries',
    writeSomething: 'Write something',
  },

  // Board
  board: {
    title: 'Board',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{{days}} days ago',
    empty: 'No entries for this day',
    readOriginal: 'Read original',
  },

  // Post
  post: {
    placeholder: 'Write something here...',
    submit: 'Post',
    draft: 'Save as draft',
    tooLong: 'Text is too long (max {{max}} characters)',
    rateLimited: 'You can only post once per minute',
  },

  // Gambit
  gambit: {
    title: 'Gambit Settings',
    condition: 'Condition',
    action: 'Action',
    probability: 'Probability',
    enabled: 'Enabled',

    // Conditions
    conditions: {
      degree_close: 'Similar degree',
      same_frame_color: 'Same frame color',
      target_foggy: 'Target is foggy',
      high_friendship: 'High friendship',
      random: 'Always',
    },

    // Actions
    actions: {
      greet: 'Greet',
      encourage: 'Encourage',
      exchange_item: 'Exchange item',
      play: 'Play together',
    },
  },

  // Time expressions
  time: {
    justNow: 'Just now',
    minutesAgo: '{{minutes}} min ago',
    hoursAgo: '{{hours}} hr ago',
    daysAgo: '{{days}} days ago',
  },
} as const;
