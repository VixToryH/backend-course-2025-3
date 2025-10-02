const { program } = require('commander'); //підкл. бібліотеки
const fs = require('fs'); //підкл. модуль для роботи з файлами

program
  .requiredOption('-i, --input <path>', 'шлях до вхідного файлу')
  .option('-o, --output <path>', 'шлях до вихідного файлу')
  .option('-d, --display', 'вивести результат у консоль');

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

const data = fs.readFileSync(options.input, 'utf-8'); //читаємо вміст файлу(рядком у форматі UTF-8)

if (!options.output && !options.display) {
  process.exit(0);
}

if (options.display) {
  console.log(data);
}

if (options.output) {
  fs.writeFileSync(options.output, data);
}
