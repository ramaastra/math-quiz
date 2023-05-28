const maxQuestionCount = 2;
let questionCount = 1;
let roundHistory = [];

window.addEventListener('load', () => {
  const Home = String.raw`
    <div class="text-center text-neutral">
      <div id="badge" class="badge badge-secondary"></div>
      <h1 class="font-semibold text-4xl my-1">{ Math Quiz }</h1>
      <p class="mb-4">Are your brain ready to get a <span class="font-semibold">new high score</span>?</p>
      <button onclick="showRules()" class="btn btn-primary">Get Started</button>
    </div>
  `;

  setContent(Home);
  showHighScore();

  document.querySelector('button').focus();
  document.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON') document.querySelector('button').focus();
  };
});

function setContent(content) {
  const container = document.querySelector('#container');
  container.innerHTML = '';
  container.innerHTML = content;
}

function showHighScore() {
  document.querySelector('#badge').innerHTML = `High Score: ${!localStorage.getItem('HIGH_SCORE') ? 0 : localStorage.getItem('HIGH_SCORE')} pts.`;
}

function setHighScore(points) {
  localStorage.setItem('HIGH_SCORE', points);
}

function showRules() {
  const Rules = String.raw`
    <div class="card bg-neutral text-neutral-content shadow-xl">
      <div class="card-body items-center text-center">
        <h2 class="card-title">Before You Start</h2>
        <ul class="text- w-96">
          <li><span class="text-accent">#</span> There will be 10 questions for each round.</li>
          <li><span class="text-accent">#</span> Each question can only be answered for 10s.</li>
          <li><span class="text-accent">#</span> Faster you answer, more score you could get.</li>
          <li><span class="text-accent">#</span> If you can't answer at least 8 questions, I think you should go back to school.</li>
        </ul>
        <div class="card-actions justify-end">
          <button onclick="location.reload()" class="btn btn-ghost">Go Back</button>
          <button onclick="startGame()" class="btn btn-primary">Start Now</button>
        </div>
      </div>
    </div>
  `;

  setContent(Rules);

  document.querySelector('button[onclick="startGame()"]').focus();
  document.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON') document.querySelector('button[onclick="startGame()"]').focus();
    else document.onclick = null;
  };
}

function startCountdown() {
  let time = 5;

  let Countdown = String.raw`
    <span class="countdown text-[172px] text-center">5</span>
  `;

  setContent(Countdown);

  const countdownInterval = setInterval(() => {
    Countdown = String.raw`
      <span class="countdown text-[172px] text-center">${--time}</span>
    `;

    setContent(Countdown);

    if (time === 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function startQuizCountdown() {
  let time = 10;
  const countdown = document.querySelector('.countdown span');

  const countdownInterval = setInterval(() => {
    countdown.style.cssText = `--value: ${--time}`;
    if (time <= 3) {
      countdown.classList.add('font-semibold');
      countdown.classList.add('text-error');
    }

    if (time < 0) {
      roundHistory[roundHistory.length - 1]['timeRemaining'] = 0;
      clearInterval(countdownInterval);
      showQuizResult();
    } else if (document.querySelector('#quiz-result')) {
      clearInterval(countdownInterval);
      roundHistory[roundHistory.length - 1]['timeRemaining'] = ++time;
    }
  }, 1000);
}

function startContinueCountdown() {
  let time = 3;
  const continueBtn = document.querySelector('button[onclick="nextQuiz()"] span');
  continueBtn.parentElement.disabled = true;
  
  const countdownInterval = setInterval(() => {
    continueBtn.innerHTML = `(${--time}s)`;
    
    if (time === 0) {
      clearInterval(countdownInterval);
      continueBtn.innerHTML = '';
    }
  }, 1000);

  setTimeout(() => {
    continueBtn.parentElement.removeAttribute('disabled');
    continueBtn.parentElement.focus();
  }, 3000);
}

function getQuizAnswer() {
  const { num1, num2, operator } = roundHistory[roundHistory.length - 1];

  switch (operator) {
    case '+':
      return num1 + num2;
    case '-':
      return num1 - num2;
    case '×':
      return num1 * num2;
    case '÷':
      return num1 / num2;
  }
}

function getQuizPoints() {  
  const hardQuestionPoints = 70;
  const normalQuestionPoints = 50;

  setTimeout(() => {
    const currentQuiz = roundHistory[roundHistory.length - 1]
    const { operator, timeRemaining } = currentQuiz;

    if (timeRemaining === 0) {
      currentQuiz['points'] = operator === '×' || operator === '÷' ? hardQuestionPoints : normalQuestionPoints;
    } else {
      currentQuiz['points'] = operator === '×' || operator === '÷' ? hardQuestionPoints * timeRemaining : normalQuestionPoints * timeRemaining;
    }
  }, 1000);
}

function showQuizResult() {
  if (document.querySelector('#quiz-result')) document.querySelector('#quiz-result').remove();

  const currentQuiz = roundHistory[roundHistory.length - 1];
  const expectedAnswer = getQuizAnswer();
  const userAnswer = parseInt(document.querySelector('input').value);

  currentQuiz['expectedAnswer'] = expectedAnswer;
  currentQuiz['userAnswer'] = userAnswer;

  const isCorrect = expectedAnswer === userAnswer;

  let resultDisplay;

  if (!userAnswer && userAnswer !== 0) {
    currentQuiz['points'] = 0;

    resultDisplay = String.raw`
      <div id="quiz-result" class="modal modal-bottom sm:modal-middle modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg">You Didn't Answer The Quiz</h3>
          <p class="py-4">If you can't calculate the answer, at least give your best guess.</p>
          <div class="modal-action">
            <button onclick="nextQuiz()" class="btn">Continue <span class="ml-1">(3s)</span></button>
          </div>
        </div>
      </div>
    `;
  } else if (isCorrect) {
    getQuizPoints();

    resultDisplay = String.raw`
      <div id="quiz-result" class="modal modal-bottom sm:modal-middle modal-open">
        <div class="modal-box">
          <div class="flex gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-success flex-shrink-0 h-6 w-6 my-auto" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 class="font-bold text-lg my-auto">You Are Correct!</h3>
          </div>
          <p class="py-4">You did a good job this time. Keep on going in the next question!</p>
          <div class="modal-action">
            <button onclick="nextQuiz()" class="btn">Continue <span class="ml-1">(3s)</span></button>
          </div>
        </div>
      </div>
    `;
  } else if (!isCorrect) {
    currentQuiz['points'] = 0;

    resultDisplay = String.raw`
      <div id="quiz-result" class="modal modal-bottom sm:modal-middle modal-open">
        <div class="modal-box">
          <div class="flex gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-error flex-shrink-0 h-6 w-6 my-auto" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 class="font-bold text-lg my-auto">That's Not the Answer!</h3>
          </div>
          <p class="py-4">You answer ${userAnswer} but the correct one is <span class="font-bold">${expectedAnswer}</span>. Better luck next time!</p>
          <div class="modal-action">
            <button onclick="nextQuiz()" class="btn">Continue <span class="ml-1">(3s)</span></button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML += resultDisplay;

  startContinueCountdown();

  document.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON') document.querySelector('button[onclick="nextQuiz()"]').focus();
  }
}

function makeQuiz() {
  const operatorList = ['+', '-', '×', '÷'];

  let num1 = Math.round(Math.random() * 20);
  let num2 = Math.round(Math.random() * 20);
  const operator  = operatorList[Math.floor(Math.random() * operatorList.length)];

  while ((operator === '×' || operator === '÷') && num2 > 10) {
    num2 = Math.round(Math.random() * 10);
  }

  while (operator === '÷' && num2 === 0) {
    num2 = Math.round(Math.random() * 10);
  }

  while (operator === '÷' && num1 < num2) {
    num1 = Math.round(Math.random() * 20);
  }

  while (operator === '÷' && num1 % num2 !== 0) {
    num2 = Math.round(Math.random() * 10);
  }

  roundHistory.push({num1, operator, num2});

  const Quiz = String.raw`
    <div class="card bg-primary text-primary-content">
      <div class="card-body gap-5">
        <div class="flex justify-between items-center">
          <div class="badge badge-outline">Question #${questionCount}</div>
          <span class="w-1/3 h-[1.5px] bg-"></span>
          <span id="quiz-countdown" class="countdown text-xl text-center">
            <span style="--value: 10;"></span>
          </span>
        </div>
        <div>
          <p class="text-center">What is the result of</p>
          <h2 class="text-center text-6xl font-semibold">${num1} ${operator} ${num2}</h2>
        </div>
        <div class="card-actions justify-center gap-0">
          <form class="flex justify-center w-full">
            <input type="Number" placeholder="Your answer" class="input w-1/2 rounded-r-none focus:outline-none" />
            <button type="submit" class="btn w-1/4 rounded-l-none">Submit</button>
          </form>
        </div>
      </div>
    </div>
  `;

  setContent(Quiz);
  startQuizCountdown();

  document.querySelector('input').focus();
  document.onclick = (e) => {
    if (e.target.tagName !== 'INPUT') document.querySelector('input').focus();
  };

  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    showQuizResult();
  });
}

function nextQuiz() {
  questionCount++;

  if (questionCount > maxQuestionCount) {
    showRoundRecap();
    return;
  }

  document.querySelector('#quiz-result').remove();
  makeQuiz();
}

function startGame() {
  startCountdown();

  setTimeout(() => {
    makeQuiz();
  }, 5000);
}

function showRoundRecap() {
  let questionCount = 1;
  let totalPoints = 0;

  const RoundRecap = String.raw`
    <div class="flex flex-col gap-4 items-center">
      <div>
        <span class="mr-1">Round Recap</span>
        <div class="badge badge-accent badge-outline badge-lg font-semibold">5070 Points</div>
      </div>
      <div class="overflow-x-auto">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th></th>
              <th>Question</th>
              <th>Answer</th>
              <th>Your Ans.</th>
              <th>Time Left</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      <button onclick="location.reload()" class="btn">Back to Home</button>
    </div>
  `;

  setContent(RoundRecap);

  let resultTable = document.querySelector('tbody');

  for (question of roundHistory) {
    const { num1, num2, operator, expectedAnswer, timeRemaining, points } = question;
    let { userAnswer } = question;
    userAnswer = !userAnswer && userAnswer !== 0 ? '-' : userAnswer;

    resultTable.innerHTML += String.raw`
      <tr class="text-center">
        <th>${questionCount++}</th>
        <td>${`${num1} ${operator} ${num2}`}</td>
        <td>${expectedAnswer}</td>
        <td class="font-bold">${userAnswer}</td>
        <td>${timeRemaining}s</td>
        <td>${points}</td>
      </tr>
    `;

    const userAnswerRow = document.querySelectorAll('td.font-bold')[questionCount - 2];
    if (userAnswer === expectedAnswer) userAnswerRow.classList.add('text-success')
    else userAnswerRow.classList.add('text-error');

    totalPoints += points;
  }

  if (totalPoints > localStorage.getItem('HIGH_SCORE')) setHighScore(totalPoints);

  document.querySelector('.badge').innerHTML = `${totalPoints} Points`;

  document.querySelector('button').focus();
  document.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON') document.querySelector('button').focus();
  };
}
