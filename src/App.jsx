import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = 'shindan_quest_v4';

const LEVELS = [
  { lv: 1, name: '見習い診断士', xp: 0 },
  { lv: 2, name: '一次突破者', xp: 100 },
  { lv: 3, name: '事例読者', xp: 250 },
  { lv: 4, name: '与件マスター', xp: 500 },
  { lv: 5, name: '骨子職人', xp: 900 },
  { lv: 6, name: '模範解答ハンター', xp: 1500 },
  { lv: 7, name: '2次試験合格者', xp: 2500 },
];

const QUESTS = [
  { id: 'jikenread',   name: '与件文リーディング',      xp: 30, minutes: 5,  icon: '📖' },
  { id: 'keyword',     name: 'キーワード抽出',          xp: 40, minutes: 7,  icon: '🔑' },
  { id: 'skeleton',    name: '解答骨子づくり',          xp: 50, minutes: 8,  icon: '🦴' },
  { id: 'modelread',   name: '模範解答を読む',          xp: 35, minutes: 5,  icon: '📚' },
  { id: 'framework',   name: 'フレームワーク確認',       xp: 25, minutes: 3,  icon: '🗂️' },
  { id: 'reflect',     name: '昨日の振り返り',          xp: 20, minutes: 3,  icon: '🔄' },
  { id: 'aasvideo',    name: 'AAS動画を見る',           xp: 45, minutes: 20, icon: '🎬' },
  { id: 'jireifolder', name: 'GoodNotesを整理する',    xp: 15, minutes: 2,  icon: '📁' },
  { id: 'jikosaten',   name: '自己採点・比較',          xp: 40, minutes: 10, icon: '✏️' },
  { id: 'financecalc', name: '財務計算の練習',          xp: 45, minutes: 10, icon: '💰' },
  { id: 'goodjob',     name: '今日の自分を褒める',       xp: 10, minutes: 1,  icon: '⭐' },
];

const PHASE_COLORS = {
  '準備':   '#64748b',
  '読む':   '#00e5ff',
  '考える': '#7c3aed',
  '書く':   '#ff6b35',
  '見直す': '#ffd700',
  '振り返る': '#10b981',
};

const STEPS = [
  { id: 1, phase: '準備',   title: 'GoodNotesを開く',   minutes: 2,  hint: '前回セットしておいた事例をそのまま開く' },
  { id: 2, phase: '読む',   title: '設問を読む',         minutes: 8,  hint: '設問にキーワードをマーキングしておく' },
  { id: 3, phase: '読む',   title: '与件文を読む',       minutes: 15, hint: '青=強み、赤=弱み、緑=機会、黄=脅威で色分け' },
  { id: 4, phase: '考える', title: '骨子を作る',         minutes: 10, hint: 'メモ書きでいい。文章を書こうとしない' },
  { id: 5, phase: '書く',   title: '解答を書く',         minutes: 35, hint: '骨子通りに書くことを優先' },
  { id: 6, phase: '見直す', title: '見直し・誤字確認',   minutes: 5,  hint: '設問文と解答の1行目だけ確認' },
  { id: 7, phase: '振り返る', title: '自己採点・振り返り', minutes: 10, hint: 'この振り返りを振り返りタブに入力する' },
];

const CASES = [
  { id: 'case1', name: '事例I',   full: '事例I（人事・組織）' },
  { id: 'case2', name: '事例II',  full: '事例II（マーケティング）' },
  { id: 'case3', name: '事例III', full: '事例III（生産・技術）' },
  { id: 'case4', name: '事例IV',  full: '事例IV（財務・会計）' },
];

const C = {
  bg:        '#0a0e1a',
  card:      '#111827',
  accent:    '#00e5ff',
  purple:    '#7c3aed',
  orange:    '#ff6b35',
  gold:      '#ffd700',
  text:      '#e2e8f0',
  muted:     '#64748b',
  green:     '#10b981',
  red:       '#ef4444',
  border:    '#1f2937',
};

// ============================================================
// Utilities
// ============================================================

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function getDayIndex() {
  return new Date().getDay();
}

function getLevel(xp) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xp) level = l;
  }
  return level;
}

function getNextLevel(xp) {
  return LEVELS.find(l => l.xp > xp) || null;
}

function getXpProgress(xp) {
  const cur = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  return Math.min((xp - cur.xp) / (next.xp - cur.xp), 1);
}

function formatTimer(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDateTime() {
  const d = new Date();
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ============================================================
// localStorage
// ============================================================

const DEFAULT_DATA = {
  xp: 0,
  totalTasks: 0,
  streak: 0,
  lastDate: null,
  completedToday: [],
  history: [],
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
  weekStart: '',
  notes: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : { ...DEFAULT_DATA };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function applyDateReset(d) {
  const today = todayStr();
  const weekStart = getWeekStart();
  let u = { ...d };

  if (u.lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    u.streak = u.lastDate === yStr ? (u.streak || 0) + 1 : 0;
    u.completedToday = [];
  }

  if (u.weekStart !== weekStart) {
    u.weeklyData = [0, 0, 0, 0, 0, 0, 0];
    u.weekStart = weekStart;
  }

  return u;
}

// ============================================================
// TimerModal
// ============================================================

function TimerModal({ item, onClose, onComplete }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  const target = item.minutes * 60;
  const over = seconds > target;

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: C.card, borderRadius: 20, padding: '32px 28px',
        width: 320, textAlign: 'center', border: `1px solid ${C.border}`,
        boxShadow: `0 0 40px ${C.accent}22`,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          {item.title || item.name}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>
          目安: {item.minutes}分
        </div>
        <div style={{
          fontSize: 60, fontWeight: 700, fontFamily: 'monospace',
          color: over ? C.orange : C.accent, marginBottom: 8,
          letterSpacing: 2,
        }}>
          {formatTimer(seconds)}
        </div>
        {over && (
          <div style={{ fontSize: 12, color: C.orange, marginBottom: 4 }}>
            ⚠ 目安時間を超えました
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28 }}>
          <button onClick={() => setRunning(r => !r)} style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: running ? C.muted + '55' : C.accent,
            color: running ? C.text : '#000',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}>
            {running ? '停止' : '開始'}
          </button>
          <button onClick={onComplete} style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: C.green, color: '#fff',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}>
            完了
          </button>
          <button onClick={onClose} style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: '#1f2937', color: C.muted,
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RewardPopup
// ============================================================

function RewardPopup({ reward, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #1a1040, #0d1a2e)',
      border: `2px solid ${C.gold}`,
      borderRadius: 18, padding: '20px 32px',
      textAlign: 'center', zIndex: 2000,
      boxShadow: `0 0 40px ${C.gold}44`,
      minWidth: 240,
      animation: 'fadeSlideIn 0.3s ease',
    }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{reward.icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>{reward.title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.accent, margin: '8px 0' }}>
        +{reward.xp} XP
      </div>
      <div style={{ fontSize: 12, color: C.text }}>{reward.message}</div>
    </div>
  );
}

// ============================================================
// XPParticles
// ============================================================

function XPParticles({ xp, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', top: '45%', left: '50%',
      transform: 'translate(-50%,-50%)',
      pointerEvents: 'none', zIndex: 1500,
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          color: C.gold,
          fontWeight: 700, fontSize: 13,
          left: `${(i - 3) * 28}px`,
          top: 0,
          opacity: 0,
          animation: `floatUp${i % 3} 1.4s ease-out forwards`,
          animationDelay: `${i * 60}ms`,
        }}>
          +{xp}XP
        </div>
      ))}
      <style>{`
        @keyframes floatUp0 { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-60px)} }
        @keyframes floatUp1 { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-80px)} }
        @keyframes floatUp2 { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-50px)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  );
}

// ============================================================
// WeeklyChart
// ============================================================

function WeeklyChart({ weeklyData, todayIndex }) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const max = Math.max(...weeklyData, 1);

  return (
    <div style={{ background: C.card, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>週間達成数</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {weeklyData.map((val, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ fontSize: 10, color: C.muted, minHeight: 14 }}>{val > 0 ? val : ''}</div>
            <div style={{
              width: '100%',
              height: `${Math.max((val / max) * 56, 4)}px`,
              background: i === todayIndex
                ? `linear-gradient(180deg, ${C.accent}, ${C.purple})`
                : C.muted + '44',
              borderRadius: 4,
              transition: 'height 0.4s ease',
            }} />
            <div style={{
              fontSize: 11,
              color: i === todayIndex ? C.accent : C.muted,
              fontWeight: i === todayIndex ? 700 : 400,
            }}>{days[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// QuestTab
// ============================================================

function QuestTab({ data, onCompleteQuest, onNavigate }) {
  const [timerItem, setTimerItem] = useState(null);

  const level = getLevel(data.xp);
  const nextLevel = getNextLevel(data.xp);
  const progress = getXpProgress(data.xp);
  const todayIndex = getDayIndex();
  const todayDone = data.completedToday.length;
  const thisWeek = data.weeklyData.reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Level card */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1a2e, #1a0d2e)',
        border: `1px solid ${C.accent}33`,
        borderRadius: 16, padding: '20px 20px 16px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Lv.{level.lv}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{level.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.gold }}>{data.xp}</div>
            <div style={{ fontSize: 11, color: C.muted }}>XP</div>
          </div>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${C.purple}, ${C.accent})`,
            borderRadius: 4, transition: 'width 0.6s ease',
          }} />
        </div>
        {nextLevel ? (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: 'right' }}>
            あと {nextLevel.xp - data.xp} XP → {nextLevel.name}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.gold, marginTop: 6, textAlign: 'right' }}>最高レベル達成！</div>
        )}
      </div>

      {/* Streak badge */}
      {data.streak > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#1f1508', border: `1px solid ${C.orange}55`,
          borderRadius: 20, padding: '6px 14px', marginBottom: 16,
          fontSize: 14, color: C.orange, fontWeight: 700,
        }}>
          🔥 {data.streak}日連続
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: '今日完了', value: todayDone,      color: C.accent  },
          { label: '累計',    value: data.totalTasks, color: C.purple  },
          { label: '今週',    value: thisWeek,        color: C.gold    },
        ].map(s => (
          <div key={s.label} style={{
            background: C.card, borderRadius: 12, padding: '12px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <WeeklyChart weeklyData={data.weeklyData} todayIndex={todayIndex} />

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button onClick={() => onNavigate('procedure')} style={{
          background: `${C.purple}22`, border: `1px solid ${C.purple}`,
          borderRadius: 12, padding: '12px 14px',
          color: C.text, cursor: 'pointer', textAlign: 'left',
          fontSize: 14, fontWeight: 600,
        }}>
          📋 手順ガイドを開く
        </button>
        <button onClick={() => onNavigate('reflection')} style={{
          background: `${C.green}22`, border: `1px solid ${C.green}`,
          borderRadius: 12, padding: '12px 14px',
          color: C.text, cursor: 'pointer', textAlign: 'left',
          fontSize: 14, fontWeight: 600,
        }}>
          📝 振り返りを書く
        </button>
      </div>

      {/* Quest list */}
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>デイリークエスト</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUESTS.map(quest => {
          const done = data.completedToday.includes(quest.id);
          return (
            <div
              key={quest.id}
              onClick={() => !done && setTimerItem(quest)}
              style={{
                background: done ? '#0d1a10' : C.card,
                border: `1px solid ${done ? C.green + '44' : C.border}`,
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: done ? 'default' : 'pointer',
                opacity: done ? 0.65 : 1,
              }}
            >
              <div style={{ fontSize: 22 }}>{quest.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{quest.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>▶ {quest.minutes}分 · +{quest.xp} XP</div>
              </div>
              {done ? (
                <div style={{ fontSize: 20, color: C.green }}>✓</div>
              ) : (
                <div style={{
                  background: `${C.accent}22`, border: `1px solid ${C.accent}`,
                  borderRadius: 8, padding: '3px 9px',
                  fontSize: 12, color: C.accent, fontWeight: 700,
                }}>
                  +{quest.xp}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {timerItem && (
        <TimerModal
          item={timerItem}
          onClose={() => setTimerItem(null)}
          onComplete={() => { onCompleteQuest(timerItem); setTimerItem(null); }}
        />
      )}
    </div>
  );
}

// ============================================================
// ProcedureTab
// ============================================================

function ProcedureTab({ onCompleteCase, onNavigate }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [timerItem, setTimerItem] = useState(null);

  const allDone = checkedSteps.length === STEPS.length;

  function toggleStep(id) {
    setCheckedSteps(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleComplete() {
    onCompleteCase(selectedCase);
    setSelectedCase(null);
    setCheckedSteps([]);
    onNavigate('reflection');
  }

  if (!selectedCase) {
    return (
      <div style={{ padding: '16px 16px 80px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>事例を選択</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          どの事例の手順ガイドを使いますか？
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CASES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCase(c)}
              style={{
                background: C.card, border: `1px solid ${C.accent}44`,
                borderRadius: 14, padding: '18px 20px',
                color: C.text, cursor: 'pointer', textAlign: 'left',
                fontSize: 16, fontWeight: 600,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              {c.full}
              <span style={{ color: C.accent, fontSize: 20 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => { setSelectedCase(null); setCheckedSteps([]); }}
          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 22, padding: 0 }}
        >
          ←
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{selectedCase.full}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{checkedSteps.length}/{STEPS.length} 完了</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 20 }}>
        <div style={{
          height: '100%', width: `${(checkedSteps.length / STEPS.length) * 100}%`,
          background: C.green, borderRadius: 2, transition: 'width 0.3s',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map(step => {
          const done = checkedSteps.includes(step.id);
          const pc = PHASE_COLORS[step.phase] || C.muted;
          return (
            <div key={step.id} style={{
              background: done ? '#0d1a10' : C.card,
              border: `1px solid ${done ? C.green + '44' : C.border}`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Number circle */}
                <div
                  onClick={() => toggleStep(step.id)}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: done ? C.green : pc + '22',
                    border: `2px solid ${done ? C.green : pc}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                    fontSize: done ? 14 : 13, fontWeight: 700,
                    color: done ? '#fff' : pc,
                  }}
                >
                  {done ? '✓' : step.id}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: pc,
                      background: pc + '22', borderRadius: 4, padding: '1px 6px',
                    }}>{step.phase}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{step.hint}</div>
                </div>

                <button
                  onClick={() => setTimerItem(step)}
                  style={{
                    background: pc + '22', border: `1px solid ${pc}`,
                    borderRadius: 8, padding: '6px 10px',
                    color: pc, cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  ▶ {step.minutes}分
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete button */}
      {allDone && (
        <button
          onClick={handleComplete}
          style={{
            width: '100%', marginTop: 20, padding: 16,
            background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`,
            border: 'none', borderRadius: 14,
            color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          }}
        >
          🎉 事例クリア！ +100 XP
        </button>
      )}

      {timerItem && (
        <TimerModal
          item={timerItem}
          onClose={() => setTimerItem(null)}
          onComplete={() => { toggleStep(timerItem.id); setTimerItem(null); }}
        />
      )}
    </div>
  );
}

// ============================================================
// ReflectionTab
// ============================================================

function ReflectionTab({ data, onSaveNote }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [date, setDate]           = useState(todayStr());
  const [good, setGood]           = useState('');
  const [improve, setImprove]     = useState('');
  const [keywords, setKeywords]   = useState('');
  const [nextAction, setNextAction] = useState('');
  const [saved, setSaved]         = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  function handleSave() {
    if (!selectedCase) return;
    onSaveNote({
      id: Date.now(),
      caseName: selectedCase.full,
      date, good, improve, keywords, nextAction,
      time: formatDateTime(),
    });
    setGood(''); setImprove(''); setKeywords(''); setNextAction('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete(id) {
    onSaveNote(null, id);
    setSelectedNote(null);
  }

  // Note detail view
  if (selectedNote) {
    return (
      <div style={{ padding: '16px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setSelectedNote(null)}
            style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 22, padding: 0 }}
          >←</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{selectedNote.caseName}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{selectedNote.date} · {selectedNote.time}</div>
          </div>
        </div>

        {[
          { label: 'よかった点',    value: selectedNote.good,       color: C.green  },
          { label: '改善点',       value: selectedNote.improve,    color: C.orange },
          { label: '重要キーワード', value: selectedNote.keywords,   color: C.accent },
          { label: '次回やること',  value: selectedNote.nextAction, color: C.purple },
        ].filter(f => f.value).map(f => (
          <div key={f.label} style={{
            background: f.color + '11', border: `1px solid ${f.color}33`,
            borderRadius: 12, padding: 16, marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: f.color, marginBottom: 6 }}>{f.label}</div>
            <div style={{ fontSize: 14, color: C.text, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{f.value}</div>
          </div>
        ))}

        <button
          onClick={() => handleDelete(selectedNote.id)}
          style={{
            width: '100%', marginTop: 12, padding: 14,
            background: C.red + '22', border: `1px solid ${C.red}`,
            borderRadius: 12, color: C.red, cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
          }}
        >
          削除
        </button>
      </div>
    );
  }

  const ta = {
    width: '100%', padding: 12, background: '#1f2937',
    border: `1px solid #374151`, borderRadius: 8,
    color: C.text, fontSize: 14, resize: 'vertical',
    minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Case selector */}
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>事例を選択</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {CASES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCase(c)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none',
              background: selectedCase?.id === c.id ? C.accent : C.card,
              color: selectedCase?.id === c.id ? '#000' : C.muted,
              fontWeight: selectedCase?.id === c.id ? 700 : 400,
              cursor: 'pointer', fontSize: 12,
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Date */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>解いた日付</div>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{
            background: '#1f2937', border: '1px solid #374151',
            borderRadius: 8, padding: '8px 12px', color: C.text,
            fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none',
          }}
        />
      </div>

      {/* Text fields */}
      {[
        { label: '✅ よかった点',    value: good,       setter: setGood,       color: C.green  },
        { label: '🔧 改善点',       value: improve,    setter: setImprove,    color: C.orange },
        { label: '🔑 重要キーワード', value: keywords,   setter: setKeywords,   color: C.accent },
        { label: '🎯 次回やること',  value: nextAction, setter: setNextAction, color: C.purple },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: f.color, fontWeight: 600, marginBottom: 6 }}>{f.label}</div>
          <textarea
            value={f.value}
            onChange={e => f.setter(e.target.value)}
            style={ta}
            placeholder={`${f.label}を入力...`}
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={!selectedCase}
        style={{
          width: '100%', padding: 14,
          background: selectedCase
            ? `linear-gradient(135deg, ${C.purple}, ${C.accent})`
            : C.muted + '44',
          border: 'none', borderRadius: 12,
          color: selectedCase ? '#fff' : C.muted,
          fontWeight: 700, fontSize: 15,
          cursor: selectedCase ? 'pointer' : 'not-allowed',
        }}
      >
        {saved ? '✓ 保存しました' : '保存'}
      </button>

      {/* Saved notes */}
      {data.notes.length > 0 && (
        <>
          <div style={{ fontSize: 13, color: C.muted, margin: '20px 0 8px' }}>
            保存済みノート ({data.notes.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...data.notes].reverse().map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '12px 16px',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{note.caseName}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{note.date}</div>
                </div>
                <span style={{ color: C.accent, fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// HistoryTab
// ============================================================

function HistoryTab({ history }) {
  const recent = [...history].slice(-40).reverse();

  if (!recent.length) {
    return (
      <div style={{ padding: '80px 16px', textAlign: 'center', color: C.muted }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📜</div>
        <div style={{ fontSize: 16 }}>まだ履歴がありません</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>クエストを完了すると表示されます</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
        完了タスク（最新{recent.length}件）
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map((item, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 22 }}>{item.icon || '✅'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{item.time}</div>
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.gold,
              background: C.gold + '22', borderRadius: 8, padding: '3px 8px',
            }}>
              +{item.xp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BottomNav
// ============================================================

function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'quest',      label: 'クエスト', icon: '⚔️' },
    { id: 'procedure',  label: '手順',    icon: '📋' },
    { id: 'reflection', label: '振り返り', icon: '📝' },
    { id: 'history',    label: '履歴',    icon: '📜' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#0d1117', borderTop: `1px solid ${C.border}`,
      display: 'flex', height: 60,
      maxWidth: 480, margin: '0 auto',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            background: 'none', border: 'none', cursor: 'pointer',
            color: active === tab.id ? C.accent : C.muted,
            borderTop: active === tab.id ? `2px solid ${C.accent}` : '2px solid transparent',
          }}
        >
          <span style={{ fontSize: 18 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, fontWeight: active === tab.id ? 700 : 400 }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// App
// ============================================================

export default function App() {
  const [tab, setTab]         = useState('quest');
  const [data, setData]       = useState(() => applyDateReset(loadData()));
  const [reward, setReward]   = useState(null);
  const [particles, setParticles] = useState(null);

  function commit(newData) {
    setData(newData);
    saveData(newData);
  }

  function buildHistoryItem(icon, name, xp) {
    return { icon, name, xp, time: formatDateTime() };
  }

  function applyXpGain(base, xp, historyItem) {
    const today = todayStr();
    const weekStart = getWeekStart();
    const dayIdx = getDayIndex();
    let d = { ...base };

    if (d.weekStart !== weekStart) {
      d.weeklyData = [0, 0, 0, 0, 0, 0, 0];
      d.weekStart = weekStart;
    }
    if (d.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      d.streak = d.lastDate === yesterday.toISOString().slice(0, 10) ? (d.streak || 0) + 1 : 0;
      d.completedToday = [];
    }

    d.xp = (d.xp || 0) + xp;
    d.totalTasks = (d.totalTasks || 0) + 1;
    d.lastDate = today;

    const weekly = [...(d.weeklyData || [0,0,0,0,0,0,0])];
    weekly[dayIdx] = (weekly[dayIdx] || 0) + 1;
    d.weeklyData = weekly;

    const hist = [...(d.history || []), historyItem];
    d.history = hist.length > 40 ? hist.slice(-40) : hist;

    return d;
  }

  function handleCompleteQuest(quest) {
    if (data.completedToday.includes(quest.id)) return;

    const hi = buildHistoryItem(quest.icon, quest.name, quest.xp);
    let d = applyXpGain(data, quest.xp, hi);
    d.completedToday = [...(d.completedToday || []), quest.id];
    commit(d);
    setReward({ icon: quest.icon, title: quest.name, xp: quest.xp, message: 'クエスト完了！' });
    setParticles(quest.xp);
  }

  function handleCompleteCase(caseItem) {
    const xp = 100;
    const hi = buildHistoryItem('🎯', `${caseItem.full} クリア`, xp);
    const d = applyXpGain(data, xp, hi);
    commit(d);
    setReward({ icon: '🎯', title: `${caseItem.full} クリア！`, xp, message: '手順ガイド完了！' });
    setParticles(xp);
  }

  function handleSaveNote(note, deleteId) {
    let notes = [...(data.notes || [])];
    if (deleteId) {
      notes = notes.filter(n => n.id !== deleteId);
    } else if (note) {
      notes = [...notes, note];
    }
    commit({ ...data, notes });
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      maxWidth: 480, margin: '0 auto', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: '#0d1117', borderBottom: `1px solid ${C.border}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.accent }}>⚔️ 診断士クエスト</div>
        <div style={{ fontSize: 15, color: C.gold, fontWeight: 700 }}>{data.xp} XP</div>
      </div>

      {/* Tab content */}
      {tab === 'quest'      && <QuestTab      data={data} onCompleteQuest={handleCompleteQuest} onNavigate={setTab} />}
      {tab === 'procedure'  && <ProcedureTab  onCompleteCase={handleCompleteCase} onNavigate={setTab} />}
      {tab === 'reflection' && <ReflectionTab data={data} onSaveNote={handleSaveNote} />}
      {tab === 'history'    && <HistoryTab    history={data.history} />}

      <BottomNav active={tab} onChange={setTab} />

      {reward   && <RewardPopup reward={reward} onClose={() => setReward(null)} />}
      {particles && <XPParticles xp={particles} onDone={() => setParticles(null)} />}
    </div>
  );
}
