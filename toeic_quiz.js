(() => {
  'use strict';

  // ========= 画面要素の取得 =========
  const questionNumberDiv = document.getElementById('questionNumber');
  const questionTextDiv   = document.getElementById('questionText');
  const choicesDiv        = document.getElementById('choices');
  const feedbackDiv       = document.getElementById('feedback');
  const explanationDiv    = document.getElementById('explanation');
  const translationDiv    = document.getElementById('translation');
  const nextBtn           = document.getElementById('nextBtn');
  const scoreBoardDiv     = document.getElementById('scoreBoard');

  // ========= 変数の初期化 =========
  let questions      = [];
  let currentIndex   = 0;
  let score          = 0;

  // ========= ユーティリティ =========
  // Fisher–Yates シャッフル
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // ========= クイズ描画 =========
  function renderQuestion() {
    const qObj = questions[currentIndex];

    questionNumberDiv.textContent = `問題 ${currentIndex + 1} / ${questions.length}`;
    questionTextDiv.textContent = qObj.q;

    // 既存表示を初期化
    choicesDiv.innerHTML = '';
    feedbackDiv.textContent = '';
    explanationDiv.innerHTML = '';
    translationDiv.innerHTML = '';
    nextBtn.style.display = 'none';

    qObj.choices.forEach((choiceText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choiceBtn';
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${choiceText}`;
      btn.addEventListener('click', () => handleChoice(btn, idx));
      choicesDiv.appendChild(btn);
    });
  }

  // ========= 解答ハンドラ =========
  function handleChoice(btn, chosenIdx) {
    const qObj = questions[currentIndex];

    // 全ボタンを無効化
    const buttons = choicesDiv.querySelectorAll('button');
    buttons.forEach(b => (b.disabled = true));

    // 正誤判定
    if (chosenIdx === qObj.answer) {
      btn.classList.add('correct');
      feedbackDiv.textContent = '正解！';
      feedbackDiv.style.color = '#28a745';
      score++;
    } else {
      btn.classList.add('wrong');
      feedbackDiv.textContent = '不正解！';
      feedbackDiv.style.color = '#dc3545';
      buttons[qObj.answer].classList.add('correct');
    }

    // 解説を表示
    if (qObj.explanation) {
      explanationDiv.innerHTML = `<strong>解説:</strong> ${qObj.explanation}`;
    }
    if (qObj.translation) {
      translationDiv.innerHTML = `<strong>日本語訳:</strong> ${qObj.translation}`;
    }

    nextBtn.style.display = 'inline-block';
  }

  // ========= 最終スコア表示 =========
  function showFinalScore() {
    questionNumberDiv.textContent = '結果';
    questionTextDiv.textContent   = '';
    choicesDiv.innerHTML          = '';
    feedbackDiv.textContent       = '';
    explanationDiv.innerHTML      = '';
    translationDiv.innerHTML      = '';
    nextBtn.style.display         = 'none';

    const percentage = Math.round((score / questions.length) * 100);
    scoreBoardDiv.textContent = `あなたのスコア: ${score} / ${questions.length} (${percentage}%)`;
  }

  // ========= 次の問題へボタン =========
  nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < questions.length) {
      renderQuestion();
    } else {
      showFinalScore();
    }
  });

  // ========= 問題セットの読み込み =========
  async function loadQuestions() {
    try {
      const res = await fetch('toeic_questions.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('問題セットが読み込めませんでした。');
      }

      // -------------------------------
      // 出題数を 10 問に制限し、ランダムに抽出
      // -------------------------------
      // 元データをコピーしてシャッフル後、先頭 10 件を採用する。
      // データ数が 10 未満の場合は、存在する問題のみを使用。
      const tmp = [...data];
      shuffle(tmp);
      questions = tmp.slice(0, Math.min(10, tmp.length));
      renderQuestion();
    } catch (err) {
      questionTextDiv.textContent = '問題データの読み込みに失敗しました。';
      console.error(err);
    }
  }

  // ========= 初期処理 =========
  loadQuestions();
})();
