const { program } = require('commander'); //підкл. бібліотеки
const fs = require('fs'); //підкл. модуль для роботи з файлами

program
  .requiredOption('-i, --input <path>', 'шлях до вхідного файлу')
  .option('-o, --output <path>', 'шлях до вихідного файлу')
  .option('-d, --display', 'вивести результат у консоль')
  // Додаткові параметри для Варіанту 4
  .option('-v, --variety', 'відображати вид квітки (поле variety)')
  .option('-l, --length <number>', 'відображати лише записи з довжиною пелюстки більшою за задану');

program.parse(process.argv); //зчитуєм арг. з команд. рядка

const options = program.opts(); //отримуєм всі введені опції

if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1); //завершити прог. з кодом помилки
}

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

const raw = fs.readFileSync(options.input, 'utf-8'); //читаємо вміст файлу(рядком у форматі UTF-8)

//Парсимо файл як JSON-масив або NDJSON
let records;
if (raw.trim().startsWith('[')) {
  records = JSON.parse(raw);
} else {
  // інакше припускаємо NDJSON (кожен рядок окремий JSON-обʼєкт)
  records = raw
    .trim()
    .split(/\r?\n/)
    .filter(line => line)      // пропускаємо пусті рядки
    .map(line => JSON.parse(line));
}

// Функція для гнучкого доступу до полів
function getValue(obj, path) {
  if (obj.hasOwnProperty(path)) {
    return obj[path];
  }

  const parts = path.split('.');
  let cur = obj; // Починаємо з кореневого об'єкта
  for (const p of parts) { //Для кожного елементу p в масиві parts - виконати код у тілі циклу
    if (!cur || !cur.hasOwnProperty(p)) {
      return undefined;
    }
    cur = cur[p]; // Переходимо до наступного вкладеного об'єкта
  }
  return cur;
}

// Фільтрація за довжиною пелюстки 
if (options.length) {
  const minLength = parseFloat(options.length);
  records = records.filter(record => {
    const petalLength = getValue(record, "petal.length");
    return petalLength !== undefined && petalLength > minLength;
  });
}

if (!options.output && !options.display) {
  process.exit(0);
}

// 7. Формуємо текст з даних
let outLines = records.map(r => {
  const len = getValue(r, "petal.length");
  const wid = getValue(r, "petal.width");
  const variety = getValue(r, "variety");

  // Формуємо рядок залежно від параметрів
  let line = `${len ?? ''} ${wid ?? ''}`;

  // Додаємо variety тільки якщо вказано параметр -v
  if (options.variety && variety) {
    line += ` ${variety}`;
  }

  return line.trim();
});

const outputText = outLines.join('\n');

if (options.display) {
  console.log(outputText);
}

if (options.output) {
  fs.writeFileSync(options.output, outputText);
}