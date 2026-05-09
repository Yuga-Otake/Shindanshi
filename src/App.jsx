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
// Finance Problems
// ============================================================

const FINANCE_TYPE_COLORS = {
  cvp:       '#00e5ff',
  npv:       '#7c3aed',
  ratio:     '#ff6b35',
  cashflow:  '#10b981',
};

const FINANCE_TYPE_LABELS = {
  cvp:      'CVP分析',
  npv:      'NPV分析',
  ratio:    '財務比率',
  cashflow: 'CF計算',
};

const FINANCE_PROBLEMS = [
  // ===== CVP分析 =====
  {
    id: 'cvp_01', type: 'cvp', title: '損益分岐点売上高の計算', icon: '📊',
    xp: 60, partialXp: 15,
    intro: '売上高500万円、変動費300万円、固定費150万円の企業がある。損益分岐点売上高と安全余裕率を求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】限界利益率を求めよ。',
        choices: [
          'A. 40%　（限界利益200万 ÷ 売上高500万）',
          'B. 30%　（固定費150万 ÷ 売上高500万）',
          'C. 60%　（変動費300万 ÷ 売上高500万）',
          'D. 50%　（売上高500 ÷ 変動費300 − 10%）',
        ],
        correct: 0,
        explanation: '限界利益 ＝ 売上高 − 変動費 ＝ 500 − 300 ＝ 200万円。限界利益率 ＝ 200 ÷ 500 ＝ 40%。変動費率（60%）と混同しやすいので注意。',
      },
      {
        id: 2, question: '【Step 2】損益分岐点売上高を求めよ。',
        choices: [
          'A. 375万円　（固定費150万 ÷ 限界利益率40%）',
          'B. 250万円　（固定費150万 ÷ 変動費率60%）',
          'C. 500万円　（売上高そのまま）',
          'D. 450万円　（固定費150万 ÷ 33%）',
        ],
        correct: 0,
        explanation: '損益分岐点売上高 ＝ 固定費 ÷ 限界利益率 ＝ 150 ÷ 0.40 ＝ 375万円。分母は限界利益率であり、変動費率ではない。',
      },
      {
        id: 3, question: '【Step 3】安全余裕率を求めよ。',
        choices: [
          'A. 25%　（（500 − 375）÷ 500）',
          'B. 75%　（BEP375 ÷ 売上高500）',
          'C. 40%　（限界利益率と同値）',
          'D. 30%　（（500 − 350）÷ 500）',
        ],
        correct: 0,
        explanation: '安全余裕率 ＝（実際売上高 − BEP売上高）÷ 実際売上高 ＝（500 − 375）÷ 500 ＝ 25%。この値が大きいほど赤字になりにくい。',
      },
    ],
  },
  {
    id: 'cvp_02', type: 'cvp', title: '目標利益を達成する売上高', icon: '🎯',
    xp: 60, partialXp: 15,
    intro: '固定費200万円、変動費率55%の企業が、目標営業利益60万円を達成するために必要な売上高を求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】限界利益率を求めよ。',
        choices: [
          'A. 45%　（1 − 変動費率0.55）',
          'B. 55%　（変動費率そのまま）',
          'C. 36%　（目標利益60万 ÷ 固定費200万 × 120%）',
          'D. 40%　（1 − 変動費率0.60）',
        ],
        correct: 0,
        explanation: '限界利益率 ＝ 1 − 変動費率 ＝ 1 − 0.55 ＝ 0.45（45%）。',
      },
      {
        id: 2, question: '【Step 2】目標利益達成のための必要売上高を求めよ。',
        choices: [
          'A. 578万円　（（200 ＋ 60）÷ 0.45）',
          'B. 444万円　（固定費200 ÷ 0.45）',
          'C. 520万円　（（200 ＋ 60）÷ 0.50）',
          'D. 600万円　（（200 ＋ 60）÷ 0.43）',
        ],
        correct: 0,
        explanation: '必要売上高 ＝（固定費 ＋ 目標利益）÷ 限界利益率 ＝（200 ＋ 60）÷ 0.45 ≒ 578万円。',
      },
      {
        id: 3, question: '【Step 3】変動費率が55%から65%に上昇した場合、同じ目標利益を達成するための売上高は？',
        choices: [
          'A. 743万円　（（200 ＋ 60）÷ 0.35）',
          'B. 650万円　（（200 ＋ 60）÷ 0.40）',
          'C. 578万円　（変動費率変化の影響なし）',
          'D. 520万円　（260 ÷ 0.50）',
        ],
        correct: 0,
        explanation: '新限界利益率 ＝ 1 − 0.65 ＝ 35%。必要売上高 ＝ 260 ÷ 0.35 ≒ 743万円。変動費率が上がるほど必要売上高は増加する。',
      },
    ],
  },
  {
    id: 'cvp_03', type: 'cvp', title: '限界利益と営業利益の計算', icon: '📈',
    xp: 50, partialXp: 12,
    intro: '製品A 単価5,000円・変動費2,000円、月次固定費300万円、販売数1,000個。損益分岐点との関係と利益を計算せよ。',
    steps: [
      {
        id: 1, question: '【Step 1】製品1単位あたりの限界利益（貢献利益）を求めよ。',
        choices: [
          'A. 3,000円　（単価5,000 − 変動費2,000）',
          'B. 5,000円　（単価そのまま）',
          'C. 2,000円　（変動費そのまま）',
          'D. 1,500円　（単価5,000 × 30%）',
        ],
        correct: 0,
        explanation: '単位あたり限界利益 ＝ 単価 − 変動費 ＝ 5,000 − 2,000 ＝ 3,000円。',
      },
      {
        id: 2, question: '【Step 2】1,000個販売時の限界利益合計を求めよ。',
        choices: [
          'A. 300万円　（3,000円 × 1,000個）',
          'B. 500万円　（単価5,000円 × 1,000個）',
          'C. 200万円　（変動費2,000円 × 1,000個）',
          'D. 250万円　（3,000円 × 1,000個 × 83%）',
        ],
        correct: 0,
        explanation: '限界利益合計 ＝ 3,000円 × 1,000個 ＝ 300万円。これが固定費に充当される。',
      },
      {
        id: 3, question: '【Step 3】この販売数1,000個における営業利益を求めよ。',
        choices: [
          'A. 0円　（損益分岐点ちょうど）',
          'B. 100万円　（300万 − 200万）',
          'C. 300万円　（限界利益と同額）',
          'D. −50万円　（固定費超過）',
        ],
        correct: 0,
        explanation: '営業利益 ＝ 限界利益 − 固定費 ＝ 300万 − 300万 ＝ 0円。ちょうど損益分岐点。利益を出すには1,000個超の販売が必要。',
      },
    ],
  },
  // ===== NPV・投資判断 =====
  {
    id: 'npv_01', type: 'npv', title: 'NPVによる投資判断', icon: '💹',
    xp: 80, partialXp: 20,
    intro: '初期投資1,000万円、耐用年数3年、毎年CF400万円、割引率10%。年金現価係数（3年・10%）＝2.487。NPVを計算し投資の可否を判断せよ。',
    steps: [
      {
        id: 1, question: '【Step 1】3年間のキャッシュフロー現在価値合計を求めよ。',
        choices: [
          'A. 994.8万円　（400万 × 2.487）',
          'B. 1,200万円　（400万 × 3年、割引なし）',
          'C. 909.1万円　（400万 ÷ 1.10 の1年分のみ）',
          'D. 1,050万円　（400万 × 2.625）',
        ],
        correct: 0,
        explanation: '年金現価係数2.487を使う。PV ＝ 400 × 2.487 ＝ 994.8万円。毎年同額のCFが続く場合は年金現価係数が使える。',
      },
      {
        id: 2, question: '【Step 2】NPV（正味現在価値）を計算せよ。',
        choices: [
          'A. −5.2万円　（994.8 − 1,000）',
          'B. ＋200万円　（1,200 − 1,000、割引なし）',
          'C. ＋94.8万円　（1,094.8 − 1,000）',
          'D. −90.9万円　（909.1 − 1,000）',
        ],
        correct: 0,
        explanation: 'NPV ＝ CF現在価値合計 − 初期投資額 ＝ 994.8 − 1,000 ＝ −5.2万円。',
      },
      {
        id: 3, question: '【Step 3】この投資に関する判断として正しいものを選べ。',
        choices: [
          'A. 投資を見送る（NPV < 0 のため価値を毀損する）',
          'B. 投資を実行する（累計CF 1,200万 > 投資額 1,000万）',
          'C. 投資を実行する（NPV −5.2万は誤差範囲）',
          'D. 追加情報なしには判断不能',
        ],
        correct: 0,
        explanation: 'NPV法：NPV ≥ 0 なら採択、NPV < 0 なら棄却。−5.2万円は負のため投資を見送る。Bは割引を無視した誤り。',
      },
    ],
  },
  {
    id: 'npv_02', type: 'npv', title: '回収期間法による投資判断', icon: '⏱️',
    xp: 60, partialXp: 15,
    intro: '初期投資600万円、年間CFは1年目200万円・2年目250万円・3年目300万円の投資案がある。回収期間を求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】1年終了時点の未回収残高を求めよ。',
        choices: [
          'A. 400万円　（600 − 200）',
          'B. 200万円　（CF1年目の金額）',
          'C. 350万円　（600 − 250）',
          'D. 150万円　（600 − 450）',
        ],
        correct: 0,
        explanation: '1年後未回収残高 ＝ 600 − 200 ＝ 400万円。この残高を2年目以降のCFで回収する。',
      },
      {
        id: 2, question: '【Step 2】2年終了時点の未回収残高を求めよ。',
        choices: [
          'A. 150万円　（400 − 250）',
          'B. 100万円　（400 − 300）',
          'C. 250万円　（2年目CFのみ）',
          'D. 200万円　（600 − 400）',
        ],
        correct: 0,
        explanation: '2年後未回収残高 ＝ 400 − 250 ＝ 150万円。3年目のCF（300万）で残り150万を回収する。',
      },
      {
        id: 3, question: '【Step 3】この投資案の回収期間を求めよ。',
        choices: [
          'A. 2.5年　（2年 ＋ 150÷300）',
          'B. 3年　（3年分のCFで完全回収）',
          'C. 2年　（2年で全額回収）',
          'D. 2.8年　（2年 ＋ 150÷200）',
        ],
        correct: 0,
        explanation: '回収期間 ＝ 2年 ＋（150 ÷ 300）＝ 2.5年。回収期間法は計算が簡単だが時間価値を考慮しない欠点がある。',
      },
    ],
  },
  {
    id: 'npv_03', type: 'npv', title: '設備更新投資の正味売却額', icon: '🔧',
    xp: 70, partialXp: 17,
    intro: '現設備の帳簿価額200万円、売却価格150万円、法人税率30%。旧設備を売却した場合の正味手取額（税効果考慮後）を求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】旧設備の売却損益を求めよ。',
        choices: [
          'A. −50万円の売却損　（売却価格150 − 帳簿価額200）',
          'B. ＋50万円の売却益　（帳簿価額200 − 売却価格150）',
          'C. 0円　（損益なし）',
          'D. −150万円　（売却価格がそのまま損失）',
        ],
        correct: 0,
        explanation: '売却損益 ＝ 売却価格 − 帳簿価額 ＝ 150 − 200 ＝ −50万円（売却損）。売却損が発生すると節税効果が生じる。',
      },
      {
        id: 2, question: '【Step 2】売却損による節税額を求めよ。',
        choices: [
          'A. 15万円　（売却損50万 × 税率30%）',
          'B. 45万円　（売却価格150万 × 税率30%）',
          'C. 60万円　（帳簿価額200万 × 税率30%）',
          'D. 10万円　（売却損50万 × 税率20%）',
        ],
        correct: 0,
        explanation: '節税額 ＝ 売却損 × 税率 ＝ 50 × 0.30 ＝ 15万円。損失が出ることで税金が減り、実質的なキャッシュアウトが抑えられる。',
      },
      {
        id: 3, question: '【Step 3】旧設備売却の正味手取額（税効果考慮後）を求めよ。',
        choices: [
          'A. 165万円　（売却価格150 ＋ 節税額15）',
          'B. 150万円　（売却価格のみ）',
          'C. 135万円　（売却価格150 − 節税額15）',
          'D. 200万円　（帳簿価額と同額）',
        ],
        correct: 0,
        explanation: '正味手取額 ＝ 売却価格 ＋ 節税額 ＝ 150 ＋ 15 ＝ 165万円。これが新設備投資の初期支出を軽減する。',
      },
    ],
  },
  // ===== 財務比率分析 =====
  {
    id: 'ratio_01', type: 'ratio', title: '収益性・安全性指標の計算', icon: '📉',
    xp: 60, partialXp: 15,
    intro: '売上高2,000万円、営業利益200万円、純利益140万円、総資産1,600万円、自己資本800万円、流動資産600万円、流動負債400万円。各財務比率を求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】売上高営業利益率を求めよ。',
        choices: [
          'A. 10%　（営業利益200 ÷ 売上高2,000）',
          'B. 7%　（純利益140 ÷ 売上高2,000）',
          'C. 12.5%　（営業利益200 ÷ 総資産1,600）',
          'D. 8.75%　（純利益140 ÷ 総資産1,600）',
        ],
        correct: 0,
        explanation: '売上高営業利益率 ＝ 営業利益 ÷ 売上高 ＝ 200 ÷ 2,000 ＝ 10%。営業活動の収益性を示す。',
      },
      {
        id: 2, question: '【Step 2】自己資本比率を求めよ。',
        choices: [
          'A. 50%　（自己資本800 ÷ 総資産1,600）',
          'B. 25%　（自己資本800 ÷ 売上高2,000 × 50%）',
          'C. 40%　（自己資本800 ÷ 負債800 × 50%）',
          'D. 60%　（負債比率の逆数）',
        ],
        correct: 0,
        explanation: '自己資本比率 ＝ 自己資本 ÷ 総資産 ＝ 800 ÷ 1,600 ＝ 50%。高いほど財務の安全性が高い（40%以上が目安）。',
      },
      {
        id: 3, question: '【Step 3】流動比率を求め、安全性を評価せよ。',
        choices: [
          'A. 150%（流動資産600 ÷ 流動負債400）→ やや注意',
          'B. 200%（流動資産600 ÷ 固定負債300）→ 安全',
          'C. 67%（流動負債400 ÷ 流動資産600）→ 危険',
          'D. 250%（流動資産600 ÷ 当座資産240）→ 安全',
        ],
        correct: 0,
        explanation: '流動比率 ＝ 流動資産 ÷ 流動負債 ＝ 600 ÷ 400 ＝ 150%。目安は200%以上。150%はやや低く、短期的な支払い余力に注意が必要。',
      },
    ],
  },
  {
    id: 'ratio_02', type: 'ratio', title: 'ROA分解（デュポン分析）', icon: '🔍',
    xp: 70, partialXp: 17,
    intro: '売上高3,000万円、純利益180万円、総資産2,000万円。デュポン分析を使ってROAを2つの指標に分解せよ。',
    steps: [
      {
        id: 1, question: '【Step 1】総資産回転率を求めよ。',
        choices: [
          'A. 1.5回　（売上高3,000 ÷ 総資産2,000）',
          'B. 0.67回　（総資産2,000 ÷ 売上高3,000）',
          'C. 2.0回　（売上高3,000 ÷ 純利益1,500）',
          'D. 1.2回　（売上高3,000 ÷ 仮の自己資本2,500）',
        ],
        correct: 0,
        explanation: '総資産回転率 ＝ 売上高 ÷ 総資産 ＝ 3,000 ÷ 2,000 ＝ 1.5回。資産の効率的活用度を示す。',
      },
      {
        id: 2, question: '【Step 2】売上高純利益率を求めよ。',
        choices: [
          'A. 6%　（純利益180 ÷ 売上高3,000）',
          'B. 9%　（純利益180 ÷ 総資産2,000）',
          'C. 10%　（仮定値）',
          'D. 4%　（純利益120 ÷ 売上高3,000）',
        ],
        correct: 0,
        explanation: '売上高純利益率 ＝ 純利益 ÷ 売上高 ＝ 180 ÷ 3,000 ＝ 6%。売上からどれだけ利益が残るかを示す。',
      },
      {
        id: 3, question: '【Step 3】デュポン公式を使ってROAを求めよ。',
        choices: [
          'A. 9%　（売上高純利益率6% × 総資産回転率1.5）',
          'B. 6%　（純利益率のみ）',
          'C. 7.5%　（純利益率6% × 回転率1.25）',
          'D. 12%　（純利益率6% × 2）',
        ],
        correct: 0,
        explanation: 'ROA ＝ 売上高純利益率 × 総資産回転率 ＝ 6% × 1.5 ＝ 9%。直接計算（180 ÷ 2,000 ＝ 9%）と一致することを確認。',
      },
    ],
  },
  // ===== キャッシュフロー計算 =====
  {
    id: 'cashflow_01', type: 'cashflow', title: '間接法による営業キャッシュフロー', icon: '💧',
    xp: 70, partialXp: 17,
    intro: '当期純利益500万円、減価償却費100万円、売掛金増加80万円、買掛金増加30万円。間接法でCF計算書（営業CF）を作成せよ。',
    steps: [
      {
        id: 1, question: '【Step 1】純利益に非資金費用を加算した小計を求めよ。',
        choices: [
          'A. 600万円　（純利益500 ＋ 減価償却費100）',
          'B. 500万円　（純利益のみ）',
          'C. 400万円　（純利益500 − 減価償却費100）',
          'D. 650万円　（500 ＋ 100 ＋ 50）',
        ],
        correct: 0,
        explanation: '間接法では純利益から出発し、非現金費用（減価償却費）を加算する。小計 ＝ 500 ＋ 100 ＝ 600万円。',
      },
      {
        id: 2, question: '【Step 2】運転資本変動による調整額を求めよ。',
        choices: [
          'A. −50万円　（売掛金増加−80 ＋ 買掛金増加＋30）',
          'B. ＋110万円　（80 ＋ 30）',
          'C. −110万円　（−80 − 30）',
          'D. ＋50万円　（符号を逆にした誤り）',
        ],
        correct: 0,
        explanation: '売掛金の増加はキャッシュ未回収のためマイナス。買掛金の増加は支払い猶予なのでプラス。調整額 ＝ −80 ＋ 30 ＝ −50万円。',
      },
      {
        id: 3, question: '【Step 3】営業キャッシュフローの合計を求めよ。',
        choices: [
          'A. 550万円　（小計600 ＋ 調整−50）',
          'B. 650万円　（小計600 ＋ 調整＋50）',
          'C. 500万円　（純利益と同額）',
          'D. 480万円　（別途計算の誤り）',
        ],
        correct: 0,
        explanation: '営業CF ＝ 600 ＋（−50）＝ 550万円。純利益より少ないのは売掛金が積み上がっているため。黒字倒産の防止にCFの把握が重要。',
      },
    ],
  },
  {
    id: 'cashflow_02', type: 'cashflow', title: 'フリーキャッシュフローの計算', icon: '🆓',
    xp: 80, partialXp: 20,
    intro: 'EBIT（利息・税引前利益）300万円、法人税率30%、減価償却費80万円、設備投資200万円、運転資本増加30万円。FCFを求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】税引後営業利益（NOPAT）を求めよ。',
        choices: [
          'A. 210万円　（EBIT300 × （1 − 0.30））',
          'B. 300万円　（EBITそのまま）',
          'C. 90万円　（EBIT300 × 税率0.30）',
          'D. 240万円　（EBIT300 × （1 − 0.20））',
        ],
        correct: 0,
        explanation: 'NOPAT ＝ EBIT × （1 − 税率）＝ 300 × 0.70 ＝ 210万円。利息・税引後の営業利益。',
      },
      {
        id: 2, question: '【Step 2】NOPATに減価償却費を加算した営業CF（簡易）を求めよ。',
        choices: [
          'A. 290万円　（NOPAT210 ＋ 減価償却費80）',
          'B. 210万円　（NOPATのみ）',
          'C. 380万円　（EBIT300 ＋ 減価償却費80）',
          'D. 130万円　（NOPAT210 − 減価償却費80）',
        ],
        correct: 0,
        explanation: 'NOPATに非現金費用（減価償却）を戻すと事業CF ＝ 290万円が求まる。',
      },
      {
        id: 3, question: '【Step 3】フリーキャッシュフロー（FCF）を求めよ。',
        choices: [
          'A. 60万円　（290 − 設備投資200 − 運転資本増加30）',
          'B. 290万円　（投資前のCF）',
          'C. 90万円　（290 − 200のみ）',
          'D. −10万円　（290 − 200 − 100）',
        ],
        correct: 0,
        explanation: 'FCF ＝ 営業CF − 設備投資 − 運転資本増加 ＝ 290 − 200 − 30 ＝ 60万円。FCFが正なら事業が自己資金を生み出している。',
      },
    ],
  },
];

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
  financeProgress: {},
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
// FinanceTab
// ============================================================

function FinanceTab({ data, onFinanceComplete }) {
  const [view, setView]                   = useState('list');
  const [filterType, setFilterType]       = useState('all');
  const [activeProblem, setActiveProblem] = useState(null);
  const [currentStep, setCurrentStep]     = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stepResults, setStepResults]     = useState([]);
  const [solverDone, setSolverDone]       = useState(false);

  function resetSolver() {
    setCurrentStep(0);
    setSelectedChoice(null);
    setShowExplanation(false);
    setStepResults([]);
    setSolverDone(false);
  }

  function startProblem(problem) {
    setActiveProblem(problem);
    resetSolver();
    setView('solver');
  }

  function handleChoiceSelect(idx) {
    if (selectedChoice !== null) return;
    setSelectedChoice(idx);
    setShowExplanation(true);
  }

  function handleNext() {
    const isCorrect = selectedChoice === activeProblem.steps[currentStep].correct;
    const newResults = [...stepResults, isCorrect];
    if (currentStep + 1 >= activeProblem.steps.length) {
      setStepResults(newResults);
      setSolverDone(true);
      onFinanceComplete(activeProblem.id, newResults.filter(Boolean).length, activeProblem.steps.length);
    } else {
      setStepResults(newResults);
      setCurrentStep(s => s + 1);
      setSelectedChoice(null);
      setShowExplanation(false);
    }
  }

  function getProblemProgress(problemId) {
    return data.financeProgress?.[problemId] || { attempts: 0, bestCorrect: 0, completed: false };
  }

  const filterTypes = [
    { id: 'all', label: 'すべて' },
    { id: 'cvp', label: 'CVP分析' },
    { id: 'npv', label: 'NPV分析' },
    { id: 'ratio', label: '財務比率' },
    { id: 'cashflow', label: 'CF計算' },
  ];
  const filtered = filterType === 'all'
    ? FINANCE_PROBLEMS
    : FINANCE_PROBLEMS.filter(p => p.type === filterType);

  // ---- List view ----
  if (view === 'list') {
    return (
      <div style={{ padding: '16px 16px 80px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          事例IV 財務計算
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>ステップ別選択問題</div>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {filterTypes.map(ft => (
            <button
              key={ft.id}
              onClick={() => setFilterType(ft.id)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: 'none',
                background: filterType === ft.id ? C.accent : C.card,
                color: filterType === ft.id ? '#000' : C.muted,
                fontWeight: filterType === ft.id ? 700 : 400,
                cursor: 'pointer', fontSize: 12,
              }}
            >{ft.label}</button>
          ))}
        </div>

        {/* Problem cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const prog = getProblemProgress(p.id);
            const typeColor = FINANCE_TYPE_COLORS[p.type] || C.muted;
            return (
              <div
                key={p.id}
                onClick={() => startProblem(p)}
                style={{
                  background: prog.completed ? '#0a1f0a' : C.card,
                  border: `1px solid ${prog.completed ? C.green + '66' : C.border}`,
                  borderRadius: 14, padding: '14px 16px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ fontSize: 26 }}>{p.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: typeColor,
                      background: typeColor + '22', borderRadius: 4, padding: '2px 6px',
                    }}>{FINANCE_TYPE_LABELS[p.type]}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {p.steps.length}ステップ · ＋{p.xp} XP
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {prog.completed ? (
                    <div style={{ fontSize: 22, color: C.green }}>✓</div>
                  ) : prog.attempts > 0 ? (
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {prog.bestCorrect}/{p.steps.length}
                    </div>
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${C.border}` }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const step = activeProblem?.steps[currentStep];
  const totalSteps = activeProblem?.steps.length || 0;

  // ---- Completion screen ----
  if (solverDone) {
    const correctCount = stepResults.filter(Boolean).length;
    const perfect = correctCount === totalSteps;
    return (
      <div style={{ padding: '16px 16px 80px' }}>
        <button
          onClick={() => { setView('list'); resetSolver(); setActiveProblem(null); }}
          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 22, padding: 0, marginBottom: 20 }}
        >←</button>
        <div style={{
          textAlign: 'center', padding: '32px 20px',
          background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{perfect ? '🎉' : '📝'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: perfect ? C.gold : C.text, marginBottom: 8 }}>
            {perfect ? '全問正解！' : '結果'}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: perfect ? C.gold : C.accent, marginBottom: 4 }}>
            {correctCount} / {totalSteps}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            {perfect ? `＋${activeProblem.xp} XP 獲得！` : `＋${correctCount * activeProblem.partialXp} XP 獲得`}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {stepResults.map((ok, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: ok ? C.green : C.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#fff', fontWeight: 700,
              }}>{ok ? '✓' : '✗'}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => startProblem(activeProblem)}
              style={{
                padding: '12px 20px', borderRadius: 10, border: `1px solid ${C.accent}`,
                background: 'transparent', color: C.accent,
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >もう一度</button>
            <button
              onClick={() => { setView('list'); resetSolver(); setActiveProblem(null); }}
              style={{
                padding: '12px 20px', borderRadius: 10, border: 'none',
                background: C.accent, color: '#000',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >問題一覧へ</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Solver view ----
  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => { setView('list'); resetSolver(); setActiveProblem(null); }}
          style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 22, padding: 0 }}
        >←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{activeProblem?.title}</div>
          <div style={{ fontSize: 12, color: C.muted }}>Step {currentStep + 1} / {totalSteps}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 16 }}>
        <div style={{
          height: '100%', width: `${(currentStep / totalSteps) * 100}%`,
          background: C.accent, borderRadius: 2, transition: 'width 0.3s',
        }} />
      </div>

      {/* Problem intro (step 0 only) */}
      {currentStep === 0 && (
        <div style={{
          background: C.purple + '11', border: `1px solid ${C.purple}33`,
          borderRadius: 12, padding: 14, marginBottom: 16,
          fontSize: 13, color: C.text, lineHeight: 1.7,
        }}>
          <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, marginBottom: 6 }}>問題文</div>
          {activeProblem?.intro}
        </div>
      )}

      {/* Step question */}
      <div style={{
        background: C.card, border: `1px solid ${C.accent}44`,
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.7 }}>
          {step?.question}
        </div>
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {step?.choices.map((choice, idx) => {
          let bg = C.card, border = C.border, color = C.text;
          if (selectedChoice !== null) {
            if (idx === step.correct) {
              bg = C.green + '22'; border = C.green; color = C.green;
            } else if (idx === selectedChoice) {
              bg = C.red + '22'; border = C.red; color = C.red;
            } else {
              color = C.muted;
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleChoiceSelect(idx)}
              disabled={selectedChoice !== null}
              style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 10, padding: '12px 14px',
                color, textAlign: 'left',
                cursor: selectedChoice === null ? 'pointer' : 'default',
                fontSize: 13, lineHeight: 1.5,
                fontWeight: idx === step.correct && selectedChoice !== null ? 700 : 400,
                transition: 'all 0.2s',
              }}
            >{choice}</button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div style={{
          background: selectedChoice === step.correct ? C.green + '11' : C.red + '11',
          border: `1px solid ${selectedChoice === step.correct ? C.green + '44' : C.red + '44'}`,
          borderRadius: 12, padding: 14, marginBottom: 16,
          fontSize: 13, color: C.text, lineHeight: 1.7,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, marginBottom: 6,
            color: selectedChoice === step.correct ? C.green : C.red,
          }}>
            {selectedChoice === step.correct ? '✓ 正解！' : '✗ 不正解'}
          </div>
          {step?.explanation}
        </div>
      )}

      {/* Next button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: 14,
            background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`,
            border: 'none', borderRadius: 12,
            color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          {currentStep + 1 >= totalSteps ? '結果を見る →' : '次へ →'}
        </button>
      )}
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
    { id: 'finance',    label: '財務',    icon: '💰' },
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
          <span style={{ fontSize: 9, fontWeight: active === tab.id ? 700 : 400 }}>
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

  function handleFinanceComplete(problemId, correctCount, totalCount) {
    const problem = FINANCE_PROBLEMS.find(p => p.id === problemId);
    const prev = data.financeProgress?.[problemId] || { attempts: 0, bestCorrect: 0, completed: false };
    const newBest = Math.max(prev.bestCorrect, correctCount);
    const nowCompleted = newBest === totalCount;
    const alreadyCompleted = prev.completed;

    let d = {
      ...data,
      financeProgress: {
        ...data.financeProgress,
        [problemId]: { attempts: prev.attempts + 1, bestCorrect: newBest, completed: nowCompleted },
      },
    };

    let xpAwarded = 0;
    if (nowCompleted && !alreadyCompleted) {
      xpAwarded = problem.xp;
    } else if (!alreadyCompleted && correctCount > 0) {
      xpAwarded = correctCount * problem.partialXp;
    }

    if (xpAwarded > 0) {
      const hi = buildHistoryItem(problem.icon, `${problem.title} クリア`, xpAwarded);
      d = applyXpGain(d, xpAwarded, hi);
      commit(d);
      setReward({
        icon: problem.icon, title: problem.title, xp: xpAwarded,
        message: nowCompleted ? '全問正解！' : `${correctCount}/${totalCount} 正解`,
      });
      setParticles(xpAwarded);
    } else {
      commit(d);
    }
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
      {tab === 'finance'    && <FinanceTab    data={data} onFinanceComplete={handleFinanceComplete} />}

      <BottomNav active={tab} onChange={setTab} />

      {reward   && <RewardPopup reward={reward} onClose={() => setReward(null)} />}
      {particles && <XPParticles xp={particles} onDone={() => setParticles(null)} />}
    </div>
  );
}
