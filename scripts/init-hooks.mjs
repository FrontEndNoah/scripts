import fs from 'fs';
import path from 'path';
import {exec} from 'child_process';

const hooksTpls = ['pre-commit', 'pre-push'];
const hooksDir = '.git/hooks/';

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, {recursive: true});
}

const promises = hooksTpls.map(fileName => {
  return new Promise((res, rej) => {
    const destinationPath = path.join(hooksDir, fileName);
    const readStream = fs.createReadStream('scripts/git-hooks/' + fileName);
    const writeStream = fs.createWriteStream(destinationPath);
    readStream.on('error', err => {
      console.error(`读取文件 ${fileName} 错误:`, err);
      rej();
    });

    writeStream.on('error', err => {
      console.error(`写入文件 ${destinationPath} 错误:`, err);
      rej();
    });

    writeStream.on('finish', () => {
      res();
    });

    readStream.pipe(writeStream);
  });
});

Promise.all(promises).then(() => {
  exec('chmod +x .git/hooks/*', error => {
    if (error) {
      console.error(`设置权限出错${error}`);
      process.exit(1);
    }
  });
});
