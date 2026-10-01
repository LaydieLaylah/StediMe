import React, { useState } from 'react';

import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useStore } from '../hooks/useStore';
import {
  getStore,
  setStore,
} from '../services/store';

export default function ProfilePage() {
  const { store, refresh } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(store.user);

  const completed = store.challenges.filter(
    (challenge) => challenge.status === 'completed'
  ).length;

  const current = Math.max(
    0,
    ...store.challenges.map(
      (challenge) => challenge.streak
    ),
    ...store.commitments.map(
      (commitment) => commitment.streak
    )
  );

  const best = Math.max(
    0,
    ...store.challenges.map(
      (challenge) => challenge.bestStreak
    ),
    ...store.commitments.map(
      (commitment) => commitment.bestStreak
    )
  );

  const save = (event) => {
    event.preventDefault();

    const currentStore = getStore();

    currentStore.user = {
      ...currentStore.user,
      name: form.name,
      username: form.username,
      email: form.email,
    };

    setStore(currentStore);
    refresh();
    setEditing(false);
  };

  return (
    <div className="page">
      <PageHeader
        title="Profile"
        subtitle="Manage the account details attached to your consistency history."
      />

      <div className="profile-grid">
        <section className="profile-card">
          <div className="avatar">
            {(store.user.name || 'U')
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div>
            <h2>{store.user.name}</h2>
            <p>{store.user.username}</p>
          </div>

          <button
            className="secondary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit profile'}
          </button>
        </section>

        {editing ? (
          <form
            className="form-card profile-form"
            onSubmit={save}
          >
            <label>
              Name

              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Username

              <input
                value={form.username}
                onChange={(event) =>
                  setForm({
                    ...form,
                    username: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Email

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
              />
            </label>

            <button
              className="primary"
              type="submit"
            >
              Save changes
            </button>
          </form>
        ) : (
          <section className="account-card">
            <div>
              <span>Name</span>
              <strong>{store.user.name}</strong>
            </div>

            <div>
              <span>Username</span>
              <strong>{store.user.username}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{store.user.email}</strong>
            </div>
          </section>
        )}
      </div>

      <section>
        <div className="section-label">
          Consistency summary
        </div>

        <div className="stats-grid">
          <StatCard
            label="Challenges completed"
            value={completed}
          />

          <StatCard
            label="Current streak"
            value={`${current} days`}
          />

          <StatCard
            label="Best streak"
            value={`${best} days`}
          />

          <StatCard
            label="Active commitments"
            value={
              store.commitments.filter(
                (commitment) =>
                  commitment.status === 'active'
              ).length
            }
          />
        </div>
      </section>
    </div>
  );
}