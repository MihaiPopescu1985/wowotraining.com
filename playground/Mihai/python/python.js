// Constants
const PYTHON_KEYWORDS = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];

const WORD_PLACEHOLDER = '***';
const EXERCISE_DELIMITER = '\n\n';

const HTML_EXERCISE_CONTAINER = 'exercise_container';
const HTML_EXERCISE_TITLE = 'exercise_title';
const HTML_EXERCISE_AREA = 'exercise_area';
const HTML_CODE_AREA = 'code_area';
const HTML_COMMENT_AREA = 'comment_area'
const HTML_WORD_LIST = 'word_list';
const HTML_BTN_PREV_EXERCISE = 'prev_exercise';
const HTML_BTN_NEXT_EXERCISE = 'next_exercise';

// HTML document variables
var title_area;
var exercise_area;
var code_area;
var comment_area;
var word_list_area;
var prev_exercise_btn;
var next_exercise_btn;

// State variables
var exercises = PYTHON_SYNTAX_TUTORIAL.trimStart().trimEnd().split(EXERCISE_DELIMITER);
var current_exercise_index = -1;
var current_exercise;
var line_generator;
var current_line;


function initExercise() {
  title_area = document.getElementById(HTML_EXERCISE_TITLE);
  exercise_area = document.getElementById(HTML_EXERCISE_AREA);
  code_area = document.getElementById(HTML_CODE_AREA);
  comment_area = document.getElementById(HTML_COMMENT_AREA);
  word_list_area = document.getElementById(HTML_WORD_LIST);
  prev_exercise_btn = document.getElementById(HTML_BTN_PREV_EXERCISE);
  next_exercise_btn = document.getElementById(HTML_BTN_NEXT_EXERCISE);

  showNextExercise();
}

function showNextExercise() {
  if (current_exercise_index < exercises.length-1) {
    current_exercise_index++;
    startExercise();
  }
}

function showPrevExercise() {
  if (current_exercise_index > 0) {
    current_exercise_index--;
    startExercise();
  }
}

function startExercise() {
  _resetAreas();
  _loadExercise();

  _showTitle();
  _showNextLine();
  _showWords();
}

function _resetAreas() {
  title_area.innerHTML = "";
  code_area.innerText = "";
  comment_area.innerText = "";
  word_list_area.innerHTML = "";
  prev_exercise_btn.setAttribute("disabled", "");
  next_exercise_btn.setAttribute("disabled", "");
}

function _loadExercise() {
  current_exercise = exercises[current_exercise_index].split('\n');
  line_generator = _lineGenerator(current_exercise);
}

function* _lineGenerator(exercise) {
  for (const line of exercise) {
    yield line; // returns one exercise line at a time
  }
}

function _showTitle() {
  let next_line = line_generator.next().value;
  if (next_line !== undefined) {
    current_line = _splitExerciseLine(next_line);
    title_area.innerText = current_line.comment;
  }
}

function _showNextLine() {
  let next_line = line_generator.next().value;

  if (next_line !== undefined) {
    current_line = _splitExerciseLine(next_line);
    _setExerciseAreas();

    if (_isSolution()) {
     _enableButtons();
    }
    _showWords();

  } else {
    _enableButtons();
  }
}

function _setExerciseAreas() {
  
  if (code_area.innerText === "") { 
    code_area.innerText = current_line.obscured_code;
  } else {
    code_area.innerText = code_area.innerText + "\n" + current_line.obscured_code;
  }
  comment_area.innerText = current_line.comment;
}

function _enableButtons() {
  prev_exercise_btn.removeAttribute("disabled");
  next_exercise_btn.removeAttribute("disabled");
}

function _showWords() {
  word_list_area.innerHTML = '';

  if (current_line !== undefined) {
    let words = shuffle(current_line.words);
    for (const word of words) {
      word_list_area.innerHTML += _getWordHtml(word);
    }
  }
}

function addWord(word) {
  code_area.innerText = code_area.innerText.replace(WORD_PLACEHOLDER, word);
  word_list_area.innerHTML = word_list_area.innerHTML.replace(_getWordHtml(word), '');
  
  if (_isSolution()) {
    _showNextLine();
  }
}

function _isSolution() {
  try {
    let want = current_line.target_code;
    let have = code_area.innerText.split('\n').pop();
    
    return want === have;

  } catch (TypeError) {
    return false;
  }
}

function _getWordHtml(word) {
   return '<pre class="m-1 p-1 border" style="cursor: pointer;" onclick="addWord(&quot;' + word + '&quot;)">' + word + '</pre>';
}

function shuffle(array) {
  for (let i in array) {
    let j = Math.floor(Math.random() * array.length);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function _splitExerciseLine(line) {

  let words = [];
  let comment = '';
  let target_code = '';
  let obscured_code = '';
  
  let length = line.length;
  for (i = 0; i < length; i++) {
    let token = '';
    let is_string = false;
    
    while (i < length && _isWord(line[i])) {
      is_string = true;
      token += line[i];
      i++;
    }
    if (is_string) {
      words = words.concat(token);
      token = '';
      i--;
    }
    if (line[i] === "#") {
      comment = line.slice(i);
      target_code = line.slice(0, i);
      break;
    }
    if (i == length-1) {
      target_code = line;
    }
  }

  obscured_code = target_code;
  for (const word of words) {
    obscured_code = obscured_code.replace(word, WORD_PLACEHOLDER)
  }

  return {
    comment: comment,
    words: words,
    target_code: target_code,
    obscured_code: obscured_code
  }
}

function _isWord(ch) {
  let is_word = false;
  try {
    is_word = (ch.toLowerCase() !== ch.toUpperCase()) || (ch === '_');
  } catch (TypeError) {
    console.log(ch + " is not a valid character")
  }
  return is_word;
}
