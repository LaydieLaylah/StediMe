import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Clock3,
} from 'lucide-react';

import { useStore } from '../hooks/useStore';
import {
  greeting,
  formatRelative,
  pct,
} from '../utils/format';

import StatCard from '../components/StatCard';
import ChallengeCard from '../components/ChallengeCard';
import CommitmentCard from '../components/CommitmentCard';

export default function HomePage() {
  const { store } = useStore();

  const active = store.challenges.filter(
    (challenge) => challenge.status === 'active'
  );

  const commits = store.commitments.filter(
    (commitment) => commitment.status === 'active'
  );

  const totalDone = store.challenges.reduce(
    (total, challenge) => total + challenge.completedSessions,
    0
  );

  const totalTarget = store.challenges.reduce(
    (total, challenge) => total + challenge.threshold,
    0
  );

  const best = Math.max(
    0,
    ...store.challenges.map((challenge) => challenge.bestStreak),
    ...store.commitments.map((commitment) => commitment.bestStreak)
  );

  const currentStreak = Math.max(
    0,
    ...store.challenges.map((challenge) => challenge.streak),
    ...store.commitments.map((commitment) => commitment.streak)
  );

  return (
    <div className="page home-page">
      <section className="home-hero">
        <div>
          <div className="eyebrow">
            YOUR CONSISTENCY SPACE
          </div>

          <h1>
            {store.user.username
              ? greeting(store.user.username)
              : 'Welcome back'}
          </h1>

          <p>
            Keep your promises to yourself, one completed session at a time.
          </p>
        </div>

        <Link
          className="primary"
          to="/challenges/new"
        >
          Create challenge
        </Link>
      </section>

      <section>
        <div className="section-label">
          Today
        </div>

        <div className="stats-grid">
          <StatCard
            label="Progress"
            value={`${pct(totalDone, totalTarget)}%`}
            detail={`${totalDone} completed sessions`}
            accent
          />

          <StatCard
            label="Current streak"
            value={`${currentStreak} days`}
            detail="Across your active routines"
          />

          <StatCard
            label="Best streak"
            value={`${best} days`}
            detail="Your strongest run"
          />

          <StatCard
            label="Active goals"
            value={`${active.length + commits.length}`}
            detail={`${active.length} challenges · ${commits.length} commitments`}
          />
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <div className="section-label">
              Active challenges
            </div>

            <p>
              Time-bound consistency goals currently in progress.
            </p>
          </div>

          <Link
            className="text-link"
            to="/challenges"
          >
            See all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="stack">
          {active.slice(0, 2).map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <div className="section-label">
              Active commitments
            </div>

            <p>
              Ongoing routines without a fixed end date.
            </p>
          </div>

          <Link
            className="text-link"
            to="/commitments"
          >
            See all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="cards-grid">
          {commits.slice(0, 2).map((commitment) => (
            <CommitmentCard
              key={commitment.id}
              commitment={commitment}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">
          Recent activity
        </div>

        <div className="activity-card">
          {store.activity.slice(0, 5).map((activity) => (
            <div
              className="activity-row"
              key={activity.id}
            >
              <div className="activity-icon">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <strong>
                  {activity.title}
                </strong>

                <p>
                  {activity.text}
                </p>
              </div>

              <time>
                <Clock3 size={14} />
                {formatRelative(activity.time)}
              </time>
            </div>
          ))}
        </div>
      </section>

      <section className="home-note">
        <div>
          <Flame size={20} />

          <strong>
            Consistency is the product.
          </strong>

          <p>
            StediMe keeps the proof, progress and streak logic close to the work itself.
          </p>
        </div>

        <Link
          to="/commitments"
          className="secondary"
        >
          Build an ongoing routine
        </Link>
      </section>
    </div>
  );
}