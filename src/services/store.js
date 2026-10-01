import {
  seedUser,
  seedChallenges,
  seedCommitments,
  seedActivity,
} from '../data/seed';

const KEY = 'stedime-store-v1';

const clone = (value) =>
  JSON.parse(JSON.stringify(value));

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const endOfDay = (date) => {
  const result = startOfDay(date);

  result.setHours(23, 59, 59, 999);

  return result;
};

const startOfWeek = (date) => {
  const result = startOfDay(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  return result;
};

const endOfWeek = (date) => {
  const result = startOfWeek(date);

  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);

  return result;
};

const startOfMonth = (date) => {
  const result = new Date(date);

  result.setDate(1);
  result.setHours(0, 0, 0, 0);

  return result;
};

const endOfMonth = (date) => {
  const result = new Date(date);

  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);

  return result;
};

const getChallengeEndDate = (
  startDate,
  durationDays
) => {
  const end = new Date(startDate);

  end.setDate(end.getDate() + durationDays - 1);

  return endOfDay(end);
};

const getChallengeSessions = (payload) => {
  const start = startOfDay(
    new Date(payload.startDate)
  );

  const durationDays =
    Number(payload.durationDays) || 30;

  const challengeEnd = getChallengeEndDate(
    start,
    durationDays
  );

  const sessions = [];

  const addSession = (dueDate, index) => {
    const due = new Date(dueDate);

    if (due < start || due > challengeEnd) {
      return;
    }

    sessions.push({
      id: `session-${Date.now()}-${index}`,
      dueDate: due.toISOString(),
      status: 'pending',
      proof: null,
    });
  };

  if (payload.frequency === 'Daily') {
    let cursor = new Date(start);
    let index = 0;

    while (cursor <= challengeEnd) {
      addSession(endOfDay(cursor), index);
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }
  }

  if (payload.frequency === 'Weekly') {
    const sessionsPerWeek = Math.min(
      7,
      Math.max(
        1,
        Number(payload.sessionsPerWeek) || 1
      )
    );

    let weekStart = startOfWeek(start);
    let index = 0;

    while (weekStart <= challengeEnd) {
      const weekEnd = endOfWeek(weekStart);

      for (
        let session = 0;
        session < sessionsPerWeek;
        session += 1
      ) {
        addSession(weekEnd, index);
        index += 1;
      }

      weekStart = new Date(weekStart);
      weekStart.setDate(
        weekStart.getDate() + 7
      );
    }
  }

  if (payload.frequency === 'Monthly') {
    const sessionsPerMonth = Math.min(
      31,
      Math.max(
        1,
        Number(payload.sessionsPerMonth) || 1
      )
    );

    let monthStart = startOfMonth(start);
    let index = 0;

    while (monthStart <= challengeEnd) {
      const monthEnd = endOfMonth(monthStart);

      for (
        let session = 0;
        session < sessionsPerMonth;
        session += 1
      ) {
        addSession(monthEnd, index);
        index += 1;
      }

      monthStart = new Date(monthStart);
      monthStart.setMonth(
        monthStart.getMonth() + 1
      );
    }
  }

  if (
    payload.frequency === 'Custom' &&
    payload.customType === 'interval'
  ) {
    const interval = Math.max(
      1,
      Number(payload.customInterval) || 1
    );

    const unitDays = {
      days: 1,
      weeks: 7,
      months: 30,
    };

    const intervalDays =
      interval *
      (unitDays[payload.customUnit] || 1);

    let cursor = new Date(start);
    let index = 0;

    while (cursor <= challengeEnd) {
      addSession(endOfDay(cursor), index);

      cursor = new Date(cursor);
      cursor.setDate(
        cursor.getDate() + intervalDays
      );

      index += 1;
    }
  }

  if (
    payload.frequency === 'Custom' &&
    payload.customType === 'weeklyFrequency'
  ) {
    const sessionsPerWeek = Math.min(
      7,
      Math.max(
        1,
        Number(payload.customWeeklySessions) || 1
      )
    );

    let weekStart = startOfWeek(start);
    let index = 0;

    while (weekStart <= challengeEnd) {
      const weekEnd = endOfWeek(weekStart);

      for (
        let session = 0;
        session < sessionsPerWeek;
        session += 1
      ) {
        addSession(weekEnd, index);
        index += 1;
      }

      weekStart = new Date(weekStart);
      weekStart.setDate(
        weekStart.getDate() + 7
      );
    }
  }

  return sessions;
};

const getChallengeGraceEnd = (session) => {
  const due = new Date(session.dueDate);

  return new Date(
    due.getTime() + DAY_MS
  );
};

const getPendingSession = (challenge, now) => {
  const currentTime = now.getTime();

  return challenge.sessions.find((session) => {
    if (session.status !== 'pending') {
      return false;
    }

    const due = new Date(session.dueDate).getTime();
    const graceEnd =
      getChallengeGraceEnd(session).getTime();

    return currentTime <= graceEnd && due >= 0;
  });
};

const updateMissedSessions = (
  challenge,
  now
) => {
  const currentTime = now.getTime();

  challenge.sessions.forEach((session) => {
    if (session.status !== 'pending') {
      return;
    }

    const graceEnd =
      getChallengeGraceEnd(session).getTime();

    if (currentTime > graceEnd) {
      session.status = 'missed';
      challenge.missedSessions += 1;
    }
  });
};

const getNextAvailableChallengeSession = (
  challenge,
  now
) => {
  updateMissedSessions(challenge, now);

  return getPendingSession(challenge, now);
};

const getPeriodKey = (
  frequency,
  date
) => {
  if (
    frequency === 'Weekly' ||
    frequency === 'weeklyFrequency'
  ) {
    const week = startOfWeek(date);

    return `week-${week.toISOString().slice(0, 10)}`;
  }

  if (frequency === 'Monthly') {
    return `month-${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  return `day-${startOfDay(date)
    .toISOString()
    .slice(0, 10)}`;
};

const getCommitmentSchedule = (
  commitment
) => {
  if (commitment.frequency === 'Daily') {
    return {
      type: 'daily',
      interval: 1,
    };
  }

  if (commitment.frequency === 'Weekly') {
    return {
      type: 'weekly',
      sessions: 1,
    };
  }

  if (commitment.frequency === 'Monthly') {
    return {
      type: 'monthly',
      sessions: 1,
    };
  }

  if (commitment.frequency === 'Annually') {
    return {
      type: 'annual',
      sessions: 1,
    };
  }

  if (commitment.frequency === 'Custom') {
    if (
      commitment.customType ===
      'weeklyFrequency'
    ) {
      return {
        type: 'weekly',
        sessions: Math.min(
          7,
          Math.max(
            1,
            Number(
              commitment.customWeeklySessions
            ) || 1
          )
        ),
      };
    }

    return {
      type: 'interval',
      interval: Math.max(
        1,
        Number(commitment.customEvery) || 1
      ),
      unit: commitment.customUnit || 'days',
    };
  }

  return {
    type: 'daily',
    interval: 1,
  };
};

const getCommitmentPeriodKey = (
  commitment,
  date
) => {
  const schedule =
    getCommitmentSchedule(commitment);

  if (schedule.type === 'weekly') {
    const week = startOfWeek(date);

    return `week-${week.toISOString().slice(0, 10)}`;
  }

  if (schedule.type === 'monthly') {
    return `month-${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  if (schedule.type === 'annual') {
    return `year-${date.getFullYear()}`;
  }

  if (schedule.type === 'interval') {
    return `interval-${startOfDay(date)
      .toISOString()
      .slice(0, 10)}`;
  }

  return `day-${startOfDay(date)
    .toISOString()
    .slice(0, 10)}`;
};

export function getStore() {
  const raw = localStorage.getItem(KEY);

  if (raw) {
    return JSON.parse(raw);
  }

  const initial = {
    user: clone(seedUser),
    challenges: clone(seedChallenges),
    commitments: clone(seedCommitments),
    activity: clone(seedActivity),
    authenticated: true,
  };

  localStorage.setItem(
    KEY,
    JSON.stringify(initial)
  );

  return initial;
}

export function setStore(next) {
  localStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return next;
}

export function resetStore() {
  localStorage.removeItem(KEY);

  return getStore();
}

export function createAccount(payload) {
  const store = getStore();

  store.user = {
    id: 'user-1',
    ...payload,
  };

  store.authenticated = true;

  return setStore(store);
}

export function signIn() {
  const store = getStore();

  store.authenticated = true;

  return setStore(store);
}

export function signOut() {
  const store = getStore();

  store.authenticated = false;

  return setStore(store);
}

export function createChallenge(payload) {
  const store = getStore();

  const id = `challenge-${Date.now()}`;

  const duration =
    Number(payload.durationDays) || 30;

  const start = startOfDay(
    new Date(payload.startDate)
  );

  const end = getChallengeEndDate(
    start,
    duration
  );

  const sessions =
    getChallengeSessions(payload);

  const threshold = Math.min(
    Math.max(
      1,
      Number(payload.threshold) || 1
    ),
    sessions.length
  );

  const item = {
    id,
    title: payload.title,
    description: payload.description,
    target: `${threshold} successful sessions`,
    durationDays: duration,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    frequency: payload.frequency,
    sessionsPerWeek:
      payload.sessionsPerWeek || null,
    sessionsPerMonth:
      payload.sessionsPerMonth || null,
    customType:
      payload.customType || null,
    customInterval:
      payload.customInterval || null,
    customUnit:
      payload.customUnit || null,
    customWeeklySessions:
      payload.customWeeklySessions || null,
    threshold,
    reward: payload.reward,
    status: 'active',
    completedSessions: 0,
    missedSessions: 0,
    lateSessions: 0,
    streak: 0,
    bestStreak: 0,
    sessions,
  };

  store.challenges.unshift(item);

  return setStore(store);
}

export function createCommitment(payload) {
  const store = getStore();

  const item = {
    id: `commitment-${Date.now()}`,
    ...payload,
    streak: 0,
    bestStreak: 0,
    status: 'active',
    history: [],
  };

  store.commitments.unshift(item);

  return setStore(store);
}

export function submitChallengeProof(
  id,
  { text, imageName }
) {
  const store = getStore();

  const challenge = store.challenges.find(
    (item) => item.id === id
  );

  if (!challenge) {
    return false;
  }

  if (
    challenge.completedSessions >=
    challenge.threshold
  ) {
    return false;
  }

  const now = new Date();

  const session =
    getNextAvailableChallengeSession(
      challenge,
      now
    );

  if (!session) {
    return false;
  }

  const due = new Date(session.dueDate);

  const graceEnd =
    getChallengeGraceEnd(session);

  if (now > graceEnd) {
    session.status = 'missed';
    challenge.missedSessions += 1;

    return false;
  }

  const late =
    now.getTime() > due.getTime();

  const proof = {
    text: text?.trim() || '',
    imageName: imageName || null,
    submittedAt: now.toISOString(),
  };

  session.status = late
    ? 'late'
    : 'completed';

  session.proof = proof;

  challenge.completedSessions += 1;

  if (late) {
    challenge.lateSessions += 1;
  }

  challenge.streak += 1;

  challenge.bestStreak = Math.max(
    challenge.bestStreak,
    challenge.streak
  );

  if (
    challenge.completedSessions >=
    challenge.threshold
  ) {
    challenge.status = 'completed';
  }

  store.activity.unshift({
    id: `a-${Date.now()}`,
    type: 'proof',
    title: challenge.title,
    text: late
      ? 'Late proof accepted within the 24-hour grace period.'
      : proof.text || 'Proof submitted.',
    time: now.toISOString(),
  });

  return setStore(store);
}

export function submitCommitmentCheckin(
  id,
  { text, imageName }
) {
  const store = getStore();

  const commitment = store.commitments.find(
    (item) => item.id === id
  );

  if (!commitment) {
    return false;
  }

  const now = new Date();
  const schedule =
    getCommitmentSchedule(commitment);

  const periodKey =
    getCommitmentPeriodKey(
      commitment,
      now
    );

  const completedInPeriod =
    commitment.history.filter(
      (historyItem) =>
        historyItem.periodKey === periodKey
    ).length;

  const allowedSessions =
    schedule.type === 'weekly' ||
    schedule.type === 'monthly' ||
    schedule.type === 'annual'
      ? schedule.sessions
      : 1;

  if (completedInPeriod >= allowedSessions) {
    return false;
  }

  const proofText =
    text?.trim() || 'Check-in completed.';

  commitment.history.unshift({
    id: `checkin-${Date.now()}`,
    date: now.toISOString(),
    periodKey,
    status: 'completed',
    proof: proofText,
    imageName: imageName || null,
  });

  commitment.streak += 1;

  commitment.bestStreak = Math.max(
    commitment.bestStreak,
    commitment.streak
  );

  store.activity.unshift({
    id: `a-${Date.now()}`,
    type: 'proof',
    title: commitment.name,
    text: proofText,
    time: now.toISOString(),
  });

  return setStore(store);
}