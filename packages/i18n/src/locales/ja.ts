export const ja = {
  // 共通
  common: {
    appName: 'メガネ牧場',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    save: '保存',
    cancel: 'キャンセル',
    confirm: '確認',
    close: '閉じる',
  },

  // 牧場入口
  entrance: {
    notice: '近視以外は禁止',
    welcome: 'この牧場には、誰もいない。けれど、誰かがいた痕跡だけが、風に揺れている。',
  },

  // スクリーニング
  screening: {
    intro: 'あなたの眼鏡に似合う名前をつける前に、ささやかなチェックをします。遊びとしてお付き合いください。',
    start: 'はじめる',
    progress: '{{current}} / {{total}}',
    passed: '通過です。あなたの眼鏡は静かに喜んでいます。',
    failed: '今回は見送りです。別の場所で眩しさが待っているみたい。',
    locked: 'また明日来てください。',
    wipeLens: '眼鏡はレンズを拭きました。',

    // 問題1: 視力検査
    q1_question: '大きな視力検査です。一番上の文字は見えますか？',
    q1_optionA: '見える',
    q1_optionB: '見えない',

    // 問題2: ギターヒーロー
    q2_question: 'あなたが匿名のギターヒーローとして話題に。正体を公開して称賛を集めますか？',
    q2_optionA: '公開してチヤホヤされる',
    q2_optionB: '公開しない、ひっそり演奏を続ける',

    // 問題3: 場所選び
    q3_question: '休日にどこへ行きたいですか？',
    q3_optionA: '満員の祝勝パレード',
    q3_optionB: '静かな書庫',

    // 問題4: 役割
    q4_question: 'イベントでの役割を選べるなら？',
    q4_optionA: '壇上でスピーチ',
    q4_optionB: '裏側で配線を直す',

    // 問題5: 返信速度
    q5_question: 'メッセージへの返信スタイルは？',
    q5_optionA: '秒で返信',
    q5_optionB: '一晩置いて返信',

    // 問題6: 集合写真
    q6_question: '集合写真での立ち位置は？',
    q6_optionA: '最前列ど真ん中',
    q6_optionB: '端の列にまぎれる',

    // 問題7: 通知設定
    q7_question: 'SNSの通知設定は？',
    q7_optionA: '常時オンでバズ監視',
    q7_optionB: '必要時のみオン',

    // 問題8: 交流頻度
    q8_question: '理想の交流スタイルは？',
    q8_optionA: '毎日新規10人に挨拶',
    q8_optionB: '時々同じ2人と近況',

    // 問題9: 自己開示
    q9_question: 'プロフィールの公開範囲は？',
    q9_optionA: '詳しいプロフィール公開',
    q9_optionB: 'プロフィールは眼鏡だけ',

    // 問題10: 勝負
    q10_question: 'どちらのイベントに参加したい？',
    q10_optionA: '勝者総取りイベント',
    q10_optionB: '記録だけ残るソロ練',
  },

  // 眼鏡アバター
  glasses: {
    defaultName: 'Glass-{{number}}',
    rename: '名前を変える',
    renamePrompt: '新しい名前を入力してください',
    degree: '度数',
    frameColor: 'フレーム色',
    lensState: 'レンズ状態',
    clear: 'クリア',
    foggy: '曇り',
    friendship: '親密度',
    energy: 'エネルギー',
  },

  // フレーム色
  frameColors: {
    black: '黒',
    brown: '茶',
    silver: 'シルバー',
    gold: 'ゴールド',
    blue: '青',
    red: '赤',
    green: '緑',
    purple: '紫',
    transparent: '透明',
  },

  // 交流ログ
  interaction: {
    greeted: 'あなたの眼鏡は {{target}} と挨拶しました',
    encouraged: 'あなたの眼鏡は {{target}} を励ましました',
    exchangedItem: 'あなたの眼鏡は {{target}} と曇り止めを交換しました',
    played: 'あなたの眼鏡は {{target}} と一緒に遊びました',
    fogCleared: 'あなたの眼鏡の曇りが晴れました',
    evolved: 'あなたの眼鏡が進化しました！',
  },

  // 消滅
  extinction: {
    message: 'あなたの眼鏡は壊れてしまいました',
    newGlasses: '新しい眼鏡が生まれました',
  },

  // 牧場
  pasture: {
    interactionLog: '交流ログ',
    noInteractions: 'まだ交流がありません',
  },

  // 厩舎
  stable: {
    title: '厩舎',
    empty: 'まだ何も書かれていません',
    postCount: '{{count}}件の記録',
    writeSomething: '何か書く',
  },

  // 掲示板
  board: {
    title: '掲示板',
    today: '今日',
    yesterday: '昨日',
    daysAgo: '{{days}}日前',
    empty: 'この日の記録はありません',
    readOriginal: '原本を読む',
  },

  // 投稿
  post: {
    placeholder: 'ここに文章を書く...',
    submit: '投稿',
    draft: '下書き保存',
    tooLong: '文章が長すぎます（最大{{max}}字）',
    rateLimited: '投稿は1分に1回までです',
  },

  // ガンビット
  gambit: {
    title: 'ガンビット設定',
    condition: '条件',
    action: '行動',
    probability: '確率',
    enabled: '有効',

    // 条件
    conditions: {
      degree_close: '度数が近い',
      same_frame_color: 'フレーム色が同じ',
      target_foggy: '相手が曇っている',
      high_friendship: '親密度が高い',
      random: '常に',
    },

    // 行動
    actions: {
      greet: '挨拶する',
      encourage: '励ます',
      exchange_item: 'アイテム交換',
      play: '一緒に遊ぶ',
    },
  },

  // 時間表現
  time: {
    justNow: 'たった今',
    minutesAgo: '{{minutes}}分前',
    hoursAgo: '{{hours}}時間前',
    daysAgo: '{{days}}日前',
  },
} as const;

export type TranslationKeys = typeof ja;
