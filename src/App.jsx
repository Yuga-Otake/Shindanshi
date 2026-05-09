import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = 'shindan_quest_v4';

const LEVELS = [
  { lv: 1, name: '見習い診断士',     xp: 0    },
  { lv: 2, name: '一次突破者',       xp: 100  },
  { lv: 3, name: '事例読者',         xp: 250  },
  { lv: 4, name: '与件マスター',     xp: 500  },
  { lv: 5, name: '骨子職人',         xp: 900  },
  { lv: 6, name: '模範解答ハンター', xp: 1500 },
  { lv: 7, name: '2次試験合格者',    xp: 2500 },
];

const QUESTS = [
  { id: 'jikenread',   name: '与件文リーディング',    xp: 30, minutes: 5,  icon: '📖' },
  { id: 'keyword',     name: 'キーワード抽出',        xp: 40, minutes: 7,  icon: '🔑' },
  { id: 'skeleton',    name: '解答骨子づくり',        xp: 50, minutes: 8,  icon: '🦴' },
  { id: 'modelread',   name: '模範解答を読む',        xp: 35, minutes: 5,  icon: '📚' },
  { id: 'framework',   name: 'フレームワーク確認',    xp: 25, minutes: 3,  icon: '🗂️' },
  { id: 'reflect',     name: '昨日の振り返り',        xp: 20, minutes: 3,  icon: '🔄' },
  { id: 'aasvideo',    name: 'AAS動画を見る',         xp: 45, minutes: 20, icon: '🎬' },
  { id: 'jireifolder', name: 'GoodNotesを整理する',  xp: 15, minutes: 2,  icon: '📁' },
  { id: 'jikosaten',   name: '自己採点・比較',        xp: 40, minutes: 10, icon: '✏️' },
  { id: 'financecalc', name: '財務計算の練習',        xp: 45, minutes: 10, icon: '💰' },
  { id: 'goodjob',     name: '今日の自分を褒める',    xp: 10, minutes: 1,  icon: '⭐' },
];

const PHASE_COLORS = {
  '準備':    '#64748b',
  '読む':    '#00e5ff',
  '考える':  '#7c3aed',
  '書く':    '#ff6b35',
  '見直す':  '#ffd700',
  '振り返る':'#10b981',
};

const STEPS = [
  { id: 1, phase: '準備',    title: 'GoodNotesを開く',    minutes: 2,  hint: '前回セットしておいた事例をそのまま開く' },
  { id: 2, phase: '読む',    title: '設問を読む',          minutes: 8,  hint: '設問にキーワードをマーキングしておく' },
  { id: 3, phase: '読む',    title: '与件文を読む',        minutes: 15, hint: '青=強み、赤=弱み、緑=機会、黄=脅威で色分け' },
  { id: 4, phase: '考える',  title: '骨子を作る',          minutes: 10, hint: 'メモ書きでいい。文章を書こうとしない' },
  { id: 5, phase: '書く',    title: '解答を書く',          minutes: 35, hint: '骨子通りに書くことを優先' },
  { id: 6, phase: '見直す',  title: '見直し・誤字確認',    minutes: 5,  hint: '設問文と解答の1行目だけ確認' },
  { id: 7, phase: '振り返る', title: '自己採点・振り返り', minutes: 10, hint: 'この振り返りを振り返りタブに入力する' },
];

const CASES = [
  { id: 'case1', name: '事例I',   full: '事例I（人事・組織）' },
  { id: 'case2', name: '事例II',  full: '事例II（マーケティング）' },
  { id: 'case3', name: '事例III', full: '事例III（生産・技術）' },
  { id: 'case4', name: '事例IV',  full: '事例IV（財務・会計）' },
];

const C = {
  bg:     '#0a0e1a',
  card:   '#111827',
  accent: '#00e5ff',
  purple: '#7c3aed',
  orange: '#ff6b35',
  gold:   '#ffd700',
  text:   '#e2e8f0',
  muted:  '#64748b',
  green:  '#10b981',
  red:    '#ef4444',
  border: '#1f2937',
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
  // ===== 応用問題 =====
  {
    id: 'cvp_adv_01', type: 'cvp', title: '特殊注文の受否判断（増分分析）', icon: '📋',
    xp: 100, partialXp: 20, difficulty: '応用',
    intro: '工場に余剰生産能力あり。通常販売価格4,000円（変動費2,000円）の製品に対し、特別注文（2,500円/個×100個）が来た。月次固定費200万円。受け入れるべきか。',
    steps: [
      {
        id: 1, question: '【Step 1】特殊注文1個あたりの限界利益を求めよ。',
        choices: [
          'A. 500円　（特殊注文単価2,500 − 変動費2,000）',
          'B. 2,000円　（通常価格4,000 − 特殊注文価格2,000）',
          'C. 1,500円　（変動費のみ）',
          'D. −1,500円　（通常価格4,000 − 特殊注文2,500 − 変動費500）',
        ],
        correct: 0,
        explanation: '特殊注文の限界利益 ＝ 特殊注文単価 − 変動費 ＝ 2,500 − 2,000 ＝ 500円。関連するのは変動費のみ。',
      },
      {
        id: 2, question: '【Step 2】固定費200万円の扱いとして正しいものを選べ。',
        choices: [
          'A. 埋没原価として意思決定に含めない（どちらの選択でも発生する）',
          'B. 特殊注文のコストに100個で按分して加算する',
          'C. 特殊注文を受けると固定費が増加するため加算する',
          'D. 固定費を回収できる量だけ受け入れる',
        ],
        correct: 0,
        explanation: '余剰能力がある場合、固定費はすでに発生しており意思決定に無関係な埋没原価。増分分析では変動費のみが関連原価。',
      },
      {
        id: 3, question: '【Step 3】余剰能力がある前提で特殊注文全体の増分利益を求め、受否を判断せよ。',
        choices: [
          'A. ＋5万円（500円 × 100個）→ 受け入れる',
          'B. −15万円（固定費200万を按分）→ 断る',
          'C. ＋25万円（特殊注文売上のみ）→ 受け入れる',
          'D. 0円（利益変化なし）→ どちらでもよい',
        ],
        correct: 0,
        explanation: '増分利益 ＝ 500円 × 100個 ＝ 5万円 > 0。固定費は無関係。余剰能力があれば増分利益が正の注文は受け入れるべき。',
      },
      {
        id: 4, question: '【Step 4】もし余剰能力がなく既存販売100個を減らす必要があった場合、この特殊注文を受けるべきか。',
        choices: [
          'A. 断る（機会原価20万 > 特殊注文増分利益5万）',
          'B. 受け入れる（依然として増分利益が正）',
          'C. 受け入れる（既存販売の減少は関係ない）',
          'D. 条件次第（価格交渉次第）',
        ],
        correct: 0,
        explanation: '機会原価 ＝ 既存販売の限界利益 ＝（4,000 − 2,000）× 100個 ＝ 20万円。増分利益5万 < 機会原価20万 なので断るべき。能力制約がある場合は機会原価を考慮する。',
      },
    ],
  },
  {
    id: 'npv_adv_01', type: 'npv', title: 'タックスシールドを含むNPV計算', icon: '🛡️',
    xp: 110, partialXp: 22, difficulty: '応用',
    intro: '初期投資3,000万円、耐用年数5年（残存価値0・定額法）、税引前年間CF 900万円、法人税率30%、割引率8%。年金現価係数（5年・8%）＝ 3.993。タックスシールドを考慮してNPVを求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】年間減価償却費を求めよ。',
        choices: [
          'A. 600万円　（取得原価3,000 ÷ 耐用年数5年）',
          'B. 900万円　（税引前CFと同額）',
          'C. 300万円　（3,000 × 10%）',
          'D. 500万円　（3,000 ÷ 6）',
        ],
        correct: 0,
        explanation: '定額法：減価償却費 ＝ 取得原価 ÷ 耐用年数 ＝ 3,000 ÷ 5 ＝ 600万円。残存価値0なのでそのまま割り算。',
      },
      {
        id: 2, question: '【Step 2】タックスシールドを考慮した税引後年間CFを求めよ。公式：税引後CF ＝ 税引前CF×(1−t) ＋ 減価償却費×t',
        choices: [
          'A. 810万円　（900×0.7 ＋ 600×0.3 ＝ 630＋180）',
          'B. 630万円　（900×0.7 のみ、タックスシールド無視）',
          'C. 870万円　（900×0.97 の誤計算）',
          'D. 900万円　（税金を無視）',
        ],
        correct: 0,
        explanation: '税引後CF ＝ 900×0.7 ＋ 600×0.3 ＝ 630 ＋ 180 ＝ 810万円。減価償却費×税率 が「タックスシールド（節税額）」。現金支出なしに税金が減る効果。',
      },
      {
        id: 3, question: '【Step 3】5年間のCF現在価値合計を求めよ。',
        choices: [
          'A. 3,234.3万円　（810 × 3.993）',
          'B. 3,593.7万円　（900 × 3.993、税引前CFを使用）',
          'C. 2,515.6万円　（630 × 3.993）',
          'D. 4,500万円　（900 × 5年、割引なし）',
        ],
        correct: 0,
        explanation: 'CF現在価値合計 ＝ 税引後CF × 年金現価係数 ＝ 810 × 3.993 ＝ 3,234.3万円。必ず税引後CFを使うこと。',
      },
      {
        id: 4, question: '【Step 4】NPVを求め、投資の可否を判断せよ。',
        choices: [
          'A. ＋234.3万円　→ 投資採択（3,234.3 − 3,000）',
          'B. −406.3万円　→ 投資棄却（計算ミス）',
          'C. ＋593.7万円　→ 投資採択（税引前CFで計算）',
          'D. −300万円　→ 投資棄却（初期投資のみ考慮）',
        ],
        correct: 0,
        explanation: 'NPV ＝ 3,234.3 − 3,000 ＝ ＋234.3万円 > 0 → 投資採択。タックスシールドを含めることで、含めない場合（NPV ＝ 630×3.993−3,000 ＝ −483.4万円）と判断が逆転する点が重要。',
      },
    ],
  },
  {
    id: 'ratio_adv_01', type: 'ratio', title: 'WACC（加重平均資本コスト）の計算', icon: '⚖️',
    xp: 110, partialXp: 22, difficulty: '応用',
    intro: '借入金8,000万円（年利率5%）、株式の時価総額1億2,000万円（株主資本コスト12%）、法人税率30%。WACCを求めよ。',
    steps: [
      {
        id: 1, question: '【Step 1】税引後負債コストを求めよ。',
        choices: [
          'A. 3.5%　（5% × (1 − 0.30)）',
          'B. 5.0%　（税効果を無視）',
          'C. 1.5%　（5% × 0.30 のみ）',
          'D. 3.0%　（5% − 2% の誤計算）',
        ],
        correct: 0,
        explanation: '税引後負債コスト ＝ 利率 × (1 − 税率) ＝ 5% × 0.70 ＝ 3.5%。利息は損金算入できるため実質コストは低くなる。',
      },
      {
        id: 2, question: '【Step 2】資本構成の重みを求めよ。（総資本 ＝ 8,000 ＋ 12,000 ＝ 2億円）',
        choices: [
          'A. 負債40%・自己資本60%　（各 ÷ 総資本2億）',
          'B. 負債50%・自己資本50%　（単純平均）',
          'C. 負債60%・自己資本40%　（逆転）',
          'D. 負債33%・自己資本67%　（帳簿価額ベースの誤り）',
        ],
        correct: 0,
        explanation: '負債比率 ＝ 8,000 ÷ 20,000 ＝ 40%、自己資本比率 ＝ 12,000 ÷ 20,000 ＝ 60%。WACCは時価ベースの加重平均。',
      },
      {
        id: 3, question: '【Step 3】WACCを求めよ。',
        choices: [
          'A. 8.6%　（3.5%×0.40 ＋ 12%×0.60 ＝ 1.4＋7.2）',
          'B. 7.75%　（税効果なしの5%×0.40 ＋ 12%×0.60）',
          'C. 8.5%　（(5%＋12%)÷2）',
          'D. 7.0%　（3.5%＋12% の誤った平均）',
        ],
        correct: 0,
        explanation: 'WACC ＝ 税引後負債コスト×負債比率 ＋ 株主資本コスト×自己資本比率 ＝ 3.5%×0.40 ＋ 12%×0.60 ＝ 1.4% ＋ 7.2% ＝ 8.6%。',
      },
      {
        id: 4, question: '【Step 4】このWACCの活用方法として正しいものを選べ。',
        choices: [
          'A. NPV計算の割引率として使用する（企業全体のリスクを反映）',
          'B. 株主への配当率として使用する',
          'C. 借入金利の上限として使用する',
          'D. 損益分岐点の計算に使用する',
        ],
        correct: 0,
        explanation: 'WACCは企業全体の資本コストであり、投資プロジェクトのNPV計算における割引率として使用する。プロジェクトの収益率がWACCを上回れば企業価値が創造される。',
      },
    ],
  },
  {
    id: 'cvp_adv_02', type: 'cvp', title: '内製vs外注（Make or Buy）の意思決定', icon: '🏭',
    xp: 100, partialXp: 20, difficulty: '応用',
    intro: '部品Xを月1,000個内製中。変動費1,200円/個、固定費総額120万円/月（うち60万円は外注時に回避可能）。外注価格1,500円/個。どちらが有利か。',
    steps: [
      {
        id: 1, question: '【Step 1】内製の「関連コスト」（意思決定に影響するコスト）を計算せよ。',
        choices: [
          'A. 180万円　（変動費120万 ＋ 回避可能固定費60万）',
          'B. 240万円　（変動費120万 ＋ 固定費全額120万）',
          'C. 120万円　（変動費のみ）',
          'D. 60万円　（回避可能固定費のみ）',
        ],
        correct: 0,
        explanation: '関連コスト ＝ 変動費 ＋ 回避可能固定費 ＝ 1,200×1,000 ＋ 60万 ＝ 120万 ＋ 60万 ＝ 180万円。回避できない固定費60万は埋没原価で無関係。',
      },
      {
        id: 2, question: '【Step 2】外注コスト合計を計算せよ。',
        choices: [
          'A. 150万円　（1,500円 × 1,000個）',
          'B. 210万円　（外注150万 ＋ 残存固定費60万）',
          'C. 120万円　（1,200円 × 1,000個）',
          'D. 180万円　（内製の関連コストと同額と仮定）',
        ],
        correct: 0,
        explanation: '外注コスト ＝ 外注単価 × 数量 ＝ 1,500円 × 1,000個 ＝ 150万円。残存固定費60万はどちらを選んでも発生するため比較に含めない。',
      },
      {
        id: 3, question: '【Step 3】差額分析の結果と意思決定を選べ。',
        choices: [
          'A. 外注が30万円有利　（外注150万 < 内製関連コスト180万）',
          'B. 内製が30万円有利　（固定費全額を含めた誤り）',
          'C. 損得なし（差額ゼロ）',
          'D. 内製が90万円有利　（変動費のみで比較）',
        ],
        correct: 0,
        explanation: '差額 ＝ 内製関連コスト180万 − 外注コスト150万 ＝ 30万円。外注の方が30万円有利。意思決定では埋没原価（回避不能固定費60万）を除いた関連コストのみで比較する。',
      },
      {
        id: 4, question: '【Step 4】外注後も残る回避不能な固定費60万円の正しい扱いを選べ。',
        choices: [
          'A. 埋没原価として意思決定に含めない（どちらを選んでも発生する）',
          'B. 外注コストに加算して比較する（全コストを考慮）',
          'C. 内製コストから差し引く（節約できると考える）',
          'D. 外注価格の値下げ交渉の根拠にする',
        ],
        correct: 0,
        explanation: '回避不能な固定費は埋没原価（Sunk Cost）であり、意思決定に含めてはならない。含めてしまうと正しい判断ができなくなる。埋没原価の概念は試験頻出。',
      },
    ],
  },
  {
    id: 'cashflow_adv_01', type: 'cashflow', title: 'キャッシュコンバージョンサイクル（CCC）', icon: '⏰',
    xp: 100, partialXp: 20, difficulty: '応用',
    intro: '売上高3,600万円（全額掛売）、売上原価2,400万円（全額掛仕入）、売上債権360万円、棚卸資産200万円、仕入債務160万円。CCCを求めよ（1年＝360日）。',
    steps: [
      {
        id: 1, question: '【Step 1】売上債権回転日数を求めよ。（売上債権 × 360 ÷ 売上高）',
        choices: [
          'A. 36日　（360 × 360 ÷ 3,600）',
          'B. 30日　（200 × 360 ÷ 2,400、棚卸資産と混同）',
          'C. 24日　（160 × 360 ÷ 2,400、仕入債務と混同）',
          'D. 10日　（3,600 ÷ 360）',
        ],
        correct: 0,
        explanation: '売上債権回転日数 ＝ 売上債権360万 × 360日 ÷ 売上高3,600万 ＝ 36日。売上代金の回収までに平均36日かかることを示す。',
      },
      {
        id: 2, question: '【Step 2】棚卸資産回転日数を求めよ。（棚卸資産 × 360 ÷ 売上原価）',
        choices: [
          'A. 30日　（200 × 360 ÷ 2,400）',
          'B. 20日　（200 × 360 ÷ 3,600、売上高を誤使用）',
          'C. 36日　（売上債権の値と混同）',
          'D. 24日　（仕入債務の値と混同）',
        ],
        correct: 0,
        explanation: '棚卸資産回転日数 ＝ 棚卸資産200万 × 360日 ÷ 売上原価2,400万 ＝ 30日。在庫として滞留する平均日数。分母は売上高でなく売上原価を使う。',
      },
      {
        id: 3, question: '【Step 3】仕入債務回転日数を求めよ。（仕入債務 × 360 ÷ 売上原価）',
        choices: [
          'A. 24日　（160 × 360 ÷ 2,400）',
          'B. 16日　（160 × 360 ÷ 3,600、売上高を誤使用）',
          'C. 30日　（棚卸資産の値と混同）',
          'D. 40日　（160 × 360 ÷ 1,440 の誤算）',
        ],
        correct: 0,
        explanation: '仕入債務回転日数 ＝ 仕入債務160万 × 360日 ÷ 売上原価2,400万 ＝ 24日。仕入代金の支払いまでの平均日数。長いほど企業に有利（支払いを猶予できる）。',
      },
      {
        id: 4, question: '【Step 4】CCC（キャッシュコンバージョンサイクル）を求めよ。',
        choices: [
          'A. 42日　（売上債権36 ＋ 棚卸資産30 − 仕入債務24）',
          'B. 90日　（三者の合計）',
          'C. 66日　（仕入債務を加算してしまう誤り）',
          'D. 6日　（36 − 30）',
        ],
        correct: 0,
        explanation: 'CCC ＝ 売上債権回転日数 ＋ 棚卸資産回転日数 − 仕入債務回転日数 ＝ 36＋30−24 ＝ 42日。CCCが短いほど資金効率が高い。仕入債務はキャッシュアウトを遅らせるのでマイナス。',
      },
    ],
  },
  {
    id: 'ratio_adv_02', type: 'ratio', title: 'EVA（経済的付加価値）の計算', icon: '💎',
    xp: 110, partialXp: 22, difficulty: '応用',
    intro: '税引後営業利益（NOPAT）600万円、投下資本5,000万円、WACC 10%。EVA（経済的付加価値）を求め、企業価値創造の有無を判断せよ。',
    steps: [
      {
        id: 1, question: '【Step 1】資本コスト（金額）を求めよ。',
        choices: [
          'A. 500万円　（投下資本5,000万 × WACC 10%）',
          'B. 600万円　（NOPATと同額）',
          'C. 50万円　（WACC 10% × 500万の誤計算）',
          'D. 5,000万円　（投下資本そのまま）',
        ],
        correct: 0,
        explanation: '資本コスト（金額）＝ 投下資本 × WACC ＝ 5,000 × 0.10 ＝ 500万円。これが投資家が最低限期待するリターン。',
      },
      {
        id: 2, question: '【Step 2】EVAを計算せよ。',
        choices: [
          'A. ＋100万円　（NOPAT600 − 資本コスト500）',
          'B. ＋1,100万円　（600 ＋ 500 の誤り）',
          'C. −100万円　（符号が逆）',
          'D. 0円　（NOPATと資本コストが等しいと仮定）',
        ],
        correct: 0,
        explanation: 'EVA ＝ NOPAT − 資本コスト ＝ 600 − 500 ＝ ＋100万円。EVA ＞ 0 であれば資本コストを超える利益を稼いでいる。',
      },
      {
        id: 3, question: '【Step 3】EVA ＝ ＋100万円の解釈として正しいものを選べ。',
        choices: [
          'A. 企業価値を創造している（資本コストを上回る利益を獲得）',
          'B. 企業価値を毀損している（利益が小さい）',
          'C. 損益分岐点ちょうど（利益ゼロ）',
          'D. 判断には株価情報が必要',
        ],
        correct: 0,
        explanation: 'EVA > 0 ＝ 企業価値の創造。投資家が要求する収益率（WACC）を超えて稼いでいることを意味する。従来の会計利益ではなく資本コストを控除した「本当の利益」を示す。',
      },
      {
        id: 4, question: '【Step 4】NOPATが480万円に減少した場合のEVAと判断を選べ。',
        choices: [
          'A. EVA ＝ −20万円　→ 企業価値を毀損している（480 − 500）',
          'B. EVA ＝ ＋20万円　（符号を誤って逆転）',
          'C. EVA ＝ 480万円　（資本コストを差し引かない）',
          'D. EVA ＝ 0　（NOPATが下がればWACCも下がる）',
        ],
        correct: 0,
        explanation: 'EVA ＝ 480 − 500 ＝ −20万円。EVA < 0 となり企業価値を毀損。会計上は黒字でもEVAが負なら投資家の期待を下回っている。この概念が試験で重要。',
      },
    ],
  },
];

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr() {
  return localDateStr(new Date());
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return localDateStr(d);
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

function formatStudyTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分`;
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
  weeklyData:      [0, 0, 0, 0, 0, 0, 0],
  weeklyXpData:    [0, 0, 0, 0, 0, 0, 0],
  weeklyXpHistory: [],
  weekStart: '',
  notes: [],
  financeProgress: {},
  procedureCase:    null,
  procedureChecked: [],
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
  const today     = todayStr();
  const weekStart = getWeekStart();
  let u = { ...d };

  if (u.lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    u.streak = u.lastDate === localDateStr(yesterday) ? (u.streak || 0) + 1 : 0;
    u.completedToday = [];
  }

  if (u.weekStart !== weekStart) {
    const currentWeekXp = (u.weeklyXpData || []).reduce((a, b) => a + b, 0);
    if (currentWeekXp > 0) {
      const wh = [...(u.weeklyXpHistory || []), currentWeekXp];
      u.weeklyXpHistory = wh.slice(-8);
    }
    u.weeklyData   = [0, 0, 0, 0, 0, 0, 0];
    u.weeklyXpData = [0, 0, 0, 0, 0, 0, 0];
    u.weekStart    = weekStart;
  }

  return u;
}

// ============================================================
// LevelUpModal
// ============================================================

function LevelUpModal({ level, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000,
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #1a0d2e, #0d1a2e)',
        border: `2px solid ${C.gold}`,
        borderRadius: 24, padding: '48px 40px',
        textAlign: 'center',
        boxShadow: `0 0 80px ${C.gold}55`,
        animation: 'lvlUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
        <div style={{ fontSize: 13, color: C.muted, letterSpacing: 3, marginBottom: 8 }}>
          LEVEL UP!
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.gold, lineHeight: 1 }}>
          Lv.{level.lv}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.accent, marginTop: 12, marginBottom: 24 }}>
          {level.name}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>タップで閉じる</div>
      </div>
      <style>{`
        @keyframes lvlUp { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

// ============================================================
// TimerModal
// ============================================================

function TimerModal({ item, onClose, onComplete }) {
  const [seconds,   setSeconds]   = useState(0);
  const [running,   setRunning]   = useState(false);
  const [countdown, setCountdown] = useState(false);
  const [flash,     setFlash]     = useState(false);
  const prevSecondsRef = useRef(-1);
  const intervalRef    = useRef(null);
  const target = item.minutes * 60;
  const over   = seconds > target;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Flash + vibrate when target is first reached
  useEffect(() => {
    if (seconds === target && prevSecondsRef.current === target - 1) {
      setFlash(true);
      navigator.vibrate?.([100, 50, 100]);
      const t = setTimeout(() => setFlash(false), 1000);
      prevSecondsRef.current = seconds;
      return () => clearTimeout(t);
    }
    prevSecondsRef.current = seconds;
  }, [seconds, target]);

  const display = countdown ? Math.max(target - seconds, 0) : seconds;

  function handleComplete() {
    clearInterval(intervalRef.current);
    navigator.vibrate?.([80, 40, 80]);
    onComplete(seconds);
  }

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
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {item.title || item.name}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>目安: {item.minutes}分</div>

        <button
          onClick={() => setCountdown(c => !c)}
          style={{
            background: 'none', border: `1px solid ${C.muted}44`,
            borderRadius: 6, padding: '3px 12px', color: C.muted,
            cursor: 'pointer', fontSize: 11, marginBottom: 20,
          }}
        >
          {countdown ? '⏳ カウントダウン' : '⏱ カウントアップ'}
        </button>

        <div style={{
          fontSize: 60, fontWeight: 700, fontFamily: 'monospace',
          color: over ? C.orange : flash ? C.gold : C.accent,
          marginBottom: 8, letterSpacing: 2,
          transition: 'color 0.2s',
          animation: flash ? 'timerFlash 0.4s ease alternate 2' : 'none',
        }}>
          {formatTimer(display)}
        </div>

        {seconds === target && !over && (
          <div style={{ fontSize: 12, color: C.gold, marginBottom: 4 }}>✨ 目安時間に達しました！</div>
        )}
        {over && (
          <div style={{ fontSize: 12, color: C.orange, marginBottom: 4 }}>⚠ 目安時間を超えました</div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: running ? C.muted + '55' : C.accent,
              color: running ? C.text : '#000',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}
          >
            {running ? '停止' : '開始'}
          </button>
          <button
            onClick={handleComplete}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: C.green, color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}
          >
            完了
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: '#1f2937', color: C.muted,
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}
          >
            閉じる
          </button>
        </div>
      </div>
      <style>{`
        @keyframes timerFlash {
          from { opacity: 1; transform: scale(1.06); }
          to   { opacity: 0.5; transform: scale(0.96); }
        }
      `}</style>
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
          color: C.gold, fontWeight: 700, fontSize: 13,
          left: `${(i - 3) * 28}px`, top: 0,
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
  const max  = Math.max(...weeklyData, 1);

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

  const level      = getLevel(data.xp);
  const nextLevel  = getNextLevel(data.xp);
  const progress   = getXpProgress(data.xp);
  const todayIndex = getDayIndex();
  const todayDone  = data.completedToday.length;
  const thisWeek   = data.weeklyData.reduce((a, b) => a + b, 0);

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
          { label: '今日完了', value: todayDone,       color: C.accent },
          { label: '累計',    value: data.totalTasks,  color: C.purple },
          { label: '今週',    value: thisWeek,         color: C.gold   },
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
          onComplete={(elapsed) => { onCompleteQuest(timerItem, elapsed); setTimerItem(null); }}
        />
      )}
    </div>
  );
}

// ============================================================
// ProcedureTab
// ============================================================

function ProcedureTab({ data, onCompleteCase, onNavigate, onUpdateProcedure }) {
  const [timerItem, setTimerItem] = useState(null);

  const selectedCase = data.procedureCase || null;
  const checkedSteps = data.procedureChecked || [];
  const allDone      = checkedSteps.length === STEPS.length;

  function setSelectedCase(c) {
    onUpdateProcedure({ procedureCase: c, procedureChecked: [] });
  }

  function goBack() {
    onUpdateProcedure({ procedureCase: null, procedureChecked: [] });
  }

  function toggleStep(id) {
    const next = checkedSteps.includes(id)
      ? checkedSteps.filter(x => x !== id)
      : [...checkedSteps, id];
    onUpdateProcedure({ procedureChecked: next });
  }

  function handleComplete() {
    onCompleteCase(selectedCase);
    onUpdateProcedure({ procedureCase: null, procedureChecked: [] });
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
          onClick={goBack}
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
          const pc   = PHASE_COLORS[step.phase] || C.muted;
          return (
            <div key={step.id} style={{
              background: done ? '#0d1a10' : C.card,
              border: `1px solid ${done ? C.green + '44' : C.border}`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  <div style={{ marginBottom: 3 }}>
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
  const [selectedCase,  setSelectedCase]  = useState(null);
  const [date,          setDate]          = useState(todayStr());
  const [good,          setGood]          = useState('');
  const [improve,       setImprove]       = useState('');
  const [keywords,      setKeywords]      = useState('');
  const [nextAction,    setNextAction]    = useState('');
  const [saved,         setSaved]         = useState(false);
  const [selectedNote,  setSelectedNote]  = useState(null);

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
          { label: '改善点',        value: selectedNote.improve,    color: C.orange },
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
    border: '1px solid #374151', borderRadius: 8,
    color: C.text, fontSize: 14, resize: 'vertical',
    minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ padding: '16px 16px 80px' }}>
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

      {[
        { label: '✅ よかった点',    value: good,       setter: setGood,       color: C.green  },
        { label: '🔧 改善点',        value: improve,    setter: setImprove,    color: C.orange },
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

function HistoryTab({ data }) {
  const history        = data.history || [];
  const recent         = [...history].slice(-40).reverse();
  const totalSeconds   = history.reduce((sum, item) => sum + (item.elapsed || 0), 0);
  const caseClears     = history.filter(item => (item.name || '').includes('クリア')).length;
  const weeklyXpHistory = data.weeklyXpHistory || [];
  const currentWeekXp  = (data.weeklyXpData || []).reduce((a, b) => a + b, 0);

  // Build chart: past weeks + current week (only if there's something to show)
  const chartWeeks = [...weeklyXpHistory.slice(-4), currentWeekXp];
  const maxWkXp    = Math.max(...chartWeeks, 1);
  const showChart  = chartWeeks.some(v => v > 0);

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      {/* Statistics section */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>📊 学習統計</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: showChart ? 16 : 0 }}>
          <div style={{
            background: C.accent + '11', border: `1px solid ${C.accent}33`,
            borderRadius: 10, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>⏱ 総学習時間</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>
              {totalSeconds > 0 ? formatStudyTime(totalSeconds) : '—'}
            </div>
          </div>
          <div style={{
            background: C.gold + '11', border: `1px solid ${C.gold}33`,
            borderRadius: 10, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>🎯 事例クリア</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{caseClears}回</div>
          </div>
        </div>

        {showChart && (
          <>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>週別XP推移</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
              {chartWeeks.map((xp, i) => {
                const isCurrent = i === chartWeeks.length - 1;
                const weeksAgo  = chartWeeks.length - 1 - i;
                const label     = isCurrent ? '今週' : `${weeksAgo}週前`;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ fontSize: 9, color: C.muted, minHeight: 12 }}>{xp > 0 ? xp : ''}</div>
                    <div style={{
                      width: '100%',
                      height: `${Math.max((xp / maxWkXp) * 40, 3)}px`,
                      background: isCurrent
                        ? `linear-gradient(180deg, ${C.accent}, ${C.purple})`
                        : C.muted + '55',
                      borderRadius: 3,
                    }} />
                    <div style={{
                      fontSize: 9,
                      color: isCurrent ? C.accent : C.muted,
                      fontWeight: isCurrent ? 700 : 400,
                    }}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* History list */}
      {recent.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📜</div>
          <div style={{ fontSize: 16 }}>まだ履歴がありません</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>クエストを完了すると表示されます</div>
        </div>
      ) : (
        <>
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
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {item.time}{item.elapsed ? ` · ${formatStudyTime(item.elapsed)}` : ''}
                  </div>
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
        </>
      )}
    </div>
  );
}

// ============================================================
// FinanceTab
// ============================================================

function FinanceTab({ data, onFinanceComplete }) {
  const [view, setView]                   = useState('list');
  const [filterType, setFilterType]           = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
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
  const filtered = FINANCE_PROBLEMS.filter(p => {
    const typeOk = filterType === 'all' || p.type === filterType;
    const diffOk = filterDifficulty === 'all' || (p.difficulty || '基礎') === filterDifficulty;
    return typeOk && diffOk;
  });

  // ---- List view ----
  if (view === 'list') {
    return (
      <div style={{ padding: '16px 16px 80px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          事例IV 財務計算
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>ステップ別選択問題</div>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
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

        {/* Difficulty filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { id: 'all', label: 'すべて' },
            { id: '基礎', label: '⭐ 基礎' },
            { id: '応用', label: '⭐⭐ 応用' },
          ].map(df => (
            <button
              key={df.id}
              onClick={() => setFilterDifficulty(df.id)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none',
                background: filterDifficulty === df.id ? C.gold : C.card,
                color: filterDifficulty === df.id ? '#000' : C.muted,
                fontWeight: filterDifficulty === df.id ? 700 : 400,
                cursor: 'pointer', fontSize: 12,
              }}
            >{df.label}</button>
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
                    {p.difficulty === '応用' && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: C.gold,
                        background: C.gold + '22', borderRadius: 4, padding: '2px 6px',
                      }}>⭐⭐ 応用</span>
                    )}
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

      {/* Problem intro */}
      <div style={{
        background: C.purple + '11', border: `1px solid ${C.purple}33`,
        borderRadius: 12, padding: 14, marginBottom: 16,
        fontSize: 13, color: C.text, lineHeight: 1.7,
      }}>
        <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, marginBottom: 6 }}>問題文</div>
        {activeProblem?.intro}
      </div>

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

function BottomNav({ active, onChange, remainingCount }) {
  const tabs = [
    { id: 'quest',      label: 'クエスト', icon: '⚔️' },
    { id: 'procedure',  label: '手順',     icon: '📋' },
    { id: 'reflection', label: '振り返り', icon: '📝' },
    { id: 'history',    label: '履歴',     icon: '📜' },
    { id: 'finance',    label: '財務',     icon: '💰' },
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
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.id === 'quest' && remainingCount > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -8,
                background: C.red, borderRadius: '50%',
                minWidth: 16, height: 16, padding: '0 2px',
                fontSize: 10, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {remainingCount}
              </div>
            )}
          </div>
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
  const [tab,      setTab]      = useState('quest');
  const [data,     setData]     = useState(() => applyDateReset(loadData()));
  const [reward,   setReward]   = useState(null);
  const [particles, setParticles] = useState(null);
  const [levelUp,  setLevelUp]  = useState(null);

  function commit(newData) {
    setData(newData);
    saveData(newData);
  }

  function buildHistoryItem(icon, name, xp, elapsed) {
    const item = { icon, name, xp, time: formatDateTime() };
    if (elapsed != null && elapsed > 0) item.elapsed = elapsed;
    return item;
  }

  function applyXpGain(base, xp, historyItem) {
    const today     = todayStr();
    const weekStart = getWeekStart();
    const dayIdx    = getDayIndex();
    let d = { ...base };

    if (d.weekStart !== weekStart) {
      const currentWeekXp = (d.weeklyXpData || []).reduce((a, b) => a + b, 0);
      if (currentWeekXp > 0) {
        const wh = [...(d.weeklyXpHistory || []), currentWeekXp];
        d.weeklyXpHistory = wh.slice(-8);
      }
      d.weeklyData   = [0, 0, 0, 0, 0, 0, 0];
      d.weeklyXpData = [0, 0, 0, 0, 0, 0, 0];
      d.weekStart    = weekStart;
    }
    if (d.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      d.streak = d.lastDate === localDateStr(yesterday) ? (d.streak || 0) + 1 : 0;
      d.completedToday = [];
    }

    d.xp         = (d.xp || 0) + xp;
    d.totalTasks = (d.totalTasks || 0) + 1;
    d.lastDate   = today;

    const weekly = [...(d.weeklyData || [0, 0, 0, 0, 0, 0, 0])];
    weekly[dayIdx] = (weekly[dayIdx] || 0) + 1;
    d.weeklyData = weekly;

    const xpData = [...(d.weeklyXpData || [0, 0, 0, 0, 0, 0, 0])];
    xpData[dayIdx] = (xpData[dayIdx] || 0) + xp;
    d.weeklyXpData = xpData;

    const hist = [...(d.history || []), historyItem];
    d.history = hist.length > 40 ? hist.slice(-40) : hist;

    return d;
  }

  function handleCompleteQuest(quest, elapsed) {
    if (data.completedToday.includes(quest.id)) return;
    const prevLevel = getLevel(data.xp);
    const hi = buildHistoryItem(quest.icon, quest.name, quest.xp, elapsed);
    let d = applyXpGain(data, quest.xp, hi);
    d.completedToday = [...(d.completedToday || []), quest.id];
    commit(d);
    const newLevel = getLevel(d.xp);
    if (newLevel.lv > prevLevel.lv) setLevelUp(newLevel);
    setReward({ icon: quest.icon, title: quest.name, xp: quest.xp, message: 'クエスト完了！' });
    setParticles(quest.xp);
  }

  function handleCompleteCase(caseItem) {
    const xp        = 100;
    const prevLevel = getLevel(data.xp);
    const hi = buildHistoryItem('🎯', `${caseItem.full} クリア`, xp);
    const d  = applyXpGain(data, xp, hi);
    commit(d);
    const newLevel = getLevel(d.xp);
    if (newLevel.lv > prevLevel.lv) setLevelUp(newLevel);
    setReward({ icon: '🎯', title: `${caseItem.full} クリア！`, xp, message: '手順ガイド完了！' });
    setParticles(xp);
    navigator.vibrate?.([100, 50, 100]);
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

  function handleUpdateProcedure(updates) {
    commit({ ...data, ...updates });
  }

  const remainingQuests = QUESTS.filter(q => !data.completedToday.includes(q.id)).length;

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

      {tab === 'quest' && (
        <QuestTab data={data} onCompleteQuest={handleCompleteQuest} onNavigate={setTab} />
      )}
      {tab === 'procedure' && (
        <ProcedureTab
          data={data}
          onCompleteCase={handleCompleteCase}
          onNavigate={setTab}
          onUpdateProcedure={handleUpdateProcedure}
        />
      )}
      {tab === 'reflection' && (
        <ReflectionTab data={data} onSaveNote={handleSaveNote} />
      )}
      {tab === 'history' && (
        <HistoryTab data={data} />
      )}
      {tab === 'finance' && (
        <FinanceTab data={data} onFinanceComplete={handleFinanceComplete} />
      )}

      <BottomNav active={tab} onChange={setTab} remainingCount={remainingQuests} />

      {reward   && <RewardPopup  reward={reward}  onClose={() => setReward(null)}   />}
      {particles && <XPParticles xp={particles}   onDone={() => setParticles(null)} />}
      {levelUp  && <LevelUpModal level={levelUp}  onClose={() => setLevelUp(null)}  />}
    </div>
  );
}
