import * as fs from 'fs';
import * as path from 'path';


const DIST_DIR = path.join(path.resolve(__dirname), '../dist');

const filenames = fs.readdirSync(DIST_DIR, { recursive: true }).map(it => path.join(DIST_DIR, it)).filter(it => fs.lstatSync(it).isFile());


type Token = {
  c: string;
  x: number;
  y: number;
  i: number;
  done: boolean;
  start: number;
  end: number;
}

function* parse(contents: string) {
  let i: number = 0;
  let x: number = 0;
  let y: number = 0;
  const len = contents.length;

  const next = (): Token => {
    const c = contents[i];

    const token: Token = {
      x,
      y,
      i,
      c,
      done: i >= len-1,
      start: 0,
      end: 0
    };

    i++;

    if (c === '\n') {
      x = 0;
      y += 1;
    } else {
      x += 1;
    }

    return token;
  }

  let tok = next();

  while (!tok.done) {
    if (tok.c === '"') {
      let current: string = '';
      const start = tok;
      tok = next()
      while (tok.c !== '"') {
        current += tok.c;
        tok = next()
      }
      const end = tok;

      yield {
        start: start.i,
        end: end.i,
        c: current
      };
    }

    tok = next()
  }
}

const fixFile = (filename: string) => {
  console.log('fixing....');
  let contents = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });


  const gen = parse(contents);

  let next = gen.next()

  while (!next.done) {
    const tok = next.value;
    if (!tok) break;

    if (tok.c.includes('#/shared')) {
      contents = contents.replace(tok.c, 'shared');
    }
    next = gen.next()
  }

  fs.writeFileSync(filename, contents, { encoding: 'utf8' });
}

filenames.forEach(fixFile);
