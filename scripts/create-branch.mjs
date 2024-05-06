import {exec} from 'child_process';
import inquirer from 'inquirer';

const projectNameList = ['common', 'bhau', 'singam', '99lotto'];

const checkStatus = () => {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', (error, stdout) => {
      if (error) {
        console.error(`执行 git status --porcelain 命令时出错: ${error}`);
        process.exit(1);
      }
      if (stdout.trim() !== '') {
        console.log('请先清空工作区');
        reject();
      } else {
        resolve();
      }
    });
  });
};

checkStatus().then(() => {
  getFeatureOptions();
});

let projectName = '';
let featureType = '';
let featureName = '';

const getFeatureOptions = () => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'projectName',
        message: '项目名称(全局功能请选择common)',
        default: projectNameList[0],
        choices: projectNameList.map(v => ({
          name: v,
          value: v,
        })),
      },
      {
        type: 'list',
        name: 'featureType',
        message: '功能类型',
        default: 'feature',
        choices: [
          {name: '开发或优化某个功能', value: 'feature'},
          {name: '修复线上功能的问题', value: 'fix'},
          {name: '修复线上功能的紧急问题', value: 'hotfix'},
        ],
      },
      {
        type: 'input',
        name: 'featureName',
        message: '功能名称',
        validate: function (value) {
          if (value.trim() !== '') {
            return true;
          }
          return '功能名称不能为空';
        },
      },
    ])
    .then(opt => {
      ({projectName, featureType, featureName} = opt);
      checkBranch(projectName === 'common' ? 'master' : projectName + '-main');
    });
};

const checkBranch = branch => {
  // eslint-disable-next-line prettier/prettier
  console.log(`即将基于${branch}创建分支${featureType}/${projectName}/${featureName}`);
  exec(`git checkout ${branch}`, error => {
    if (error) {
      console.error(`执行 git checkout ${branch} 命令时出错: ${error}`);
      process.exit(1);
    }
    const cb = _error => {
      if (_error) {
        // eslint-disable-next-line prettier/prettier
        console.error(`执行 git checkout -b ${featureType}/${projectName}/${featureName} 命令时出错: ${error}`);
        process.exit(1);
      }
    };
    exec(`git checkout -b ${featureType}/${projectName}/${featureName}`, cb);
  });
};
