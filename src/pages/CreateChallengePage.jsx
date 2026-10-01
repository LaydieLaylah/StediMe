import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../components/PageHeader';
import { createChallenge } from '../services/store';
import { useStore } from '../hooks/useStore';

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const getMaximumSessions = (form) => {
  const duration = Math.max(1, Number(form.durationDays) || 1);

  if (form.frequency === 'Daily') {
    return duration;
  }

  if (form.frequency === 'Weekly') {
    const weeks = Math.ceil(duration / 7);
    const sessionsPerWeek = Math.max(
      1,
      Number(form.sessionsPerWeek) || 1
    );

    return weeks * sessionsPerWeek;
  }

  if (form.frequency === 'Monthly') {
    const months = Math.ceil(duration / 30);
    const sessionsPerMonth = Math.max(
      1,
      Number(form.sessionsPerMonth) || 1
    );

    return months * sessionsPerMonth;
  }

  if (form.customType === 'interval') {
    const interval = Math.max(
      1,
      Number(form.customInterval) || 1
    );

    const unitDays = {
      days: 1,
      weeks: 7,
      months: 30,
    };

    const intervalDays =
      interval * (unitDays[form.customUnit] || 1);

    return Math.ceil(duration / intervalDays);
  }

  if (form.customType === 'weeklyFrequency') {
    const weeks = Math.ceil(duration / 7);
    const sessionsPerWeek = Math.max(
      1,
      Number(form.customWeeklySessions) || 1
    );

    return weeks * sessionsPerWeek;
  }

  return duration;
};

const initial = {
  title: '',
  description: '',
  frequency: 'Daily',
  durationDays: 30,
  startDate: getToday(),
  threshold: 26,
  reward: '',

  sessionsPerWeek: 1,
  sessionsPerMonth: 1,

  customType: 'interval',
  customInterval: 2,
  customUnit: 'days',
  customWeeklySessions: 1,
};

export default function CreateChallengePage() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  const nav = useNavigate();
  const { refresh } = useStore();

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError('');
  };

  const maximumSessions = useMemo(
    () => getMaximumSessions(form),
    [form]
  );

  useEffect(() => {
    setForm((current) => {
      const currentThreshold = Number(current.threshold) || 1;

      if (currentThreshold <= maximumSessions) {
        return current;
      }

      return {
        ...current,
        threshold: maximumSessions,
      };
    });
  }, [maximumSessions]);

  const submit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const durationDays = Number(form.durationDays);
    const threshold = Number(form.threshold);
    const startDate = form.startDate;

    if (!title || !startDate || !threshold) {
      setError(
        'Add a title, start date and completion threshold.'
      );
      return;
    }

    if (startDate < getToday()) {
      setError(
        'The challenge start date cannot be before today.'
      );
      return;
    }

    if (!Number.isInteger(durationDays) || durationDays < 1) {
      setError(
        'Challenge duration must be at least 1 day.'
      );
      return;
    }

    if (!Number.isInteger(threshold) || threshold < 1) {
      setError(
        'Required sessions must be at least 1.'
      );
      return;
    }

    if (threshold > maximumSessions) {
      setError(
        `This schedule allows a maximum of ${maximumSessions} scheduled session${
          maximumSessions === 1 ? '' : 's'
        } for this challenge.`
      );
      return;
    }

    const challenge = {
      ...form,
      title,
      durationDays,
      threshold,
    };

    createChallenge(challenge);
    refresh();
    nav('/challenges');
  };

  return (
    <div className="page">
      <PageHeader
        title="Create challenge"
        subtitle="Set the rules clearly so StediMe can track them for you."
      />

      <div className="form-layout">
        <form
          className="form-card"
          onSubmit={submit}
        >
          <label>
            Challenge name

            <input
              value={form.title}
              onChange={(event) =>
                set('title', event.target.value)
              }
              placeholder="e.g. Study consistently"
            />
          </label>

          <label>
            Description

            <textarea
              value={form.description}
              onChange={(event) =>
                set('description', event.target.value)
              }
              placeholder="What does showing up look like?"
            />
          </label>

          <div className="two-col">
            <label>
              Frequency

              <select
                value={form.frequency}
                onChange={(event) =>
                  set('frequency', event.target.value)
                }
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
            </label>

            <label>
              Duration (days)

              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(event) =>
                  set('durationDays', event.target.value)
                }
              />
            </label>
          </div>

          {form.frequency === 'Weekly' && (
            <label>
              Sessions per week

              <input
                type="number"
                min="1"
                max="7"
                value={form.sessionsPerWeek}
                onChange={(event) =>
                  set('sessionsPerWeek', event.target.value)
                }
              />

              <span className="field-hint">
                Choose how many sessions should be completed each week.
              </span>
            </label>
          )}

          {form.frequency === 'Monthly' && (
            <label>
              Sessions per month

              <input
                type="number"
                min="1"
                max="31"
                value={form.sessionsPerMonth}
                onChange={(event) =>
                  set('sessionsPerMonth', event.target.value)
                }
              />

              <span className="field-hint">
                Choose how many sessions should be completed each month.
              </span>
            </label>
          )}

          {form.frequency === 'Custom' && (
            <div className="form-section">
              <label>
                Custom schedule

                <select
                  value={form.customType}
                  onChange={(event) =>
                    set('customType', event.target.value)
                  }
                >
                  <option value="interval">
                    Every X days, weeks or months
                  </option>

                  <option value="weeklyFrequency">
                    Multiple times per week
                  </option>
                </select>
              </label>

              {form.customType === 'interval' && (
                <div className="two-col">
                  <label>
                    Every

                    <input
                      type="number"
                      min="1"
                      value={form.customInterval}
                      onChange={(event) =>
                        set(
                          'customInterval',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Unit

                    <select
                      value={form.customUnit}
                      onChange={(event) =>
                        set(
                          'customUnit',
                          event.target.value
                        )
                      }
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </label>
                </div>
              )}

              {form.customType === 'weeklyFrequency' && (
                <label>
                  Sessions per week

                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={form.customWeeklySessions}
                    onChange={(event) =>
                      set(
                        'customWeeklySessions',
                        event.target.value
                      )
                    }
                  />

                  <span className="field-hint">
                    For example: once, twice or three times per week.
                  </span>
                </label>
              )}
            </div>
          )}

          <div className="two-col">
            <label>
              Start date

              <input
                type="date"
                min={getToday()}
                value={form.startDate}
                onChange={(event) =>
                  set('startDate', event.target.value)
                }
              />
            </label>

            <label>
              Required sessions

              <input
                type="number"
                min="1"
                max={maximumSessions}
                value={form.threshold}
                onChange={(event) =>
                  set('threshold', event.target.value)
                }
              />

              <span className="field-hint">
                Maximum for this schedule: {maximumSessions}
              </span>
            </label>
          </div>

          <label>
            Reward <span className="optional">optional</span>

            <input
              value={form.reward}
              onChange={(event) =>
                set('reward', event.target.value)
              }
              placeholder="What will completing this earn you?"
            />
          </label>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary full"
            type="submit"
          >
            Create challenge
          </button>
        </form>

        <aside className="preview-card">
          <div className="eyebrow">
            PREVIEW
          </div>

          <h3>
            {form.title || 'Your challenge'}
          </h3>

          <p>
            {form.description ||
              'A focused, time-bound consistency goal.'}
          </p>

          <div className="preview-stat">
            <span>Frequency</span>

            <strong>
              {form.frequency}
            </strong>
          </div>

          {form.frequency === 'Weekly' && (
            <div className="preview-stat">
              <span>Sessions per week</span>

              <strong>
                {form.sessionsPerWeek}
              </strong>
            </div>
          )}

          {form.frequency === 'Monthly' && (
            <div className="preview-stat">
              <span>Sessions per month</span>

              <strong>
                {form.sessionsPerMonth}
              </strong>
            </div>
          )}

          {form.frequency === 'Custom' && (
            <div className="preview-stat">
              <span>Schedule</span>

              <strong>
                {form.customType === 'interval'
                  ? `Every ${form.customInterval} ${form.customUnit}`
                  : `${form.customWeeklySessions}× per week`}
              </strong>
            </div>
          )}

          <div className="preview-stat">
            <span>Duration</span>

            <strong>
              {form.durationDays} days
            </strong>
          </div>

          <div className="preview-stat">
            <span>Scheduled sessions</span>

            <strong>
              {maximumSessions}
            </strong>
          </div>

          <div className="preview-stat">
            <span>Minimum</span>

            <strong>
              {form.threshold} sessions
            </strong>
          </div>
        </aside>
      </div>
    </div>
  );
}