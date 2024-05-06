const {exec} = require('child_process');
const fs = require('fs');
const {exit} = require('process');

const channelList = [
  'B01',
  'B02',
  'B03',
  'B04',
  'B05',
  'B06',
  'B07',
  'B08',
  'B09',
  'FB01',
  'GoogleH5',
  'GP-bull',
  'kerala-share',
  'landing',
  'Refer',
  'Schat01',
  'TG01',
  'WA01',
  'YTB01',
  'GG01',
  'J01',
  'J02',
  'J03',
  'J04',
  'indus',
  'singam', // 默认渠道
];

function replaceAndBuild(channel) {
  const appFile = 'src/config.ts';
  let content = fs.readFileSync(appFile, 'utf8');
  content = content.replace(
    /export const defaultChannel = '([^']+)'/,
    `export const defaultChannel = '${channel}'`,
  );
  fs.writeFileSync(appFile, content);
  return new Promise((resolve, reject) => {
    exec('npm run build:prod', {stdio: 'inherit'}, err => {
      if (err) {
        reject(err);
        return;
      }
      const apkName = `singam${channel === 'singam' ? '' : '-' + channel}.apk`;
      exec(
        `mv ./android/app/build/outputs/apk/release/app-release.apk ~/Desktop/apps/${apkName}`,
        {stdio: 'inherit'},
        _err => {
          if (_err) {
            reject(_err);
            return;
          }

          resolve();
        },
      );
    });
  });
}

async function main() {
  for (let i = 0; i < channelList.length; i++) {
    const channel = channelList[i];
    console.log(`正在处理渠道 ${channel}`);

    try {
      await replaceAndBuild(channel);
      console.log(`渠道 ${channel} 打包成功!`);
      exec(`say 渠道 ${channel} 打包成功!`);
    } catch (err) {
      console.error(`渠道 ${channel} 打包失败:`, err);
      exec(`say 渠道 ${channel} 打包失败!`);
      exit(1);
    }
  }

  console.log('渠道打包完成!');
}

main();
