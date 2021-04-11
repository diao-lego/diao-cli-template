const fse = require('fs-extra')
const inquirer = require('inquirer')
const ejs = require('ejs')
const glob = require('glob').sync

async function ejsRender(options) {
  const dir = options.targetPath
  return new Promise((resolve, reject) => {
    let files = glob('**', {
      cwd: dir,
      ignore: options.ignore || '',
      nodir: true
    })
    Promise.all(files.map(file => {
      const filePath = path.join(dir, file)
      const projectInfo = options.data
      return new Promise((resolve1, reject1) => {
        ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
          if(err) {
            reject1(err)
          } else {
            fse.writeFileSync(filePath, result)
            resolve1(result)
          }
        })
      })
    })).then(() => {
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}

async function install(options) {
  console.log(options)
    const projectPrompt = []
    const descriptionPrompt = {
      type: 'input',
      name: 'description',
      message: '请输入项目描述信息',
      default: '',
      validate: function(v) {
        const done = this.async();
        setTimeout(function() {
          if (!v) {
            done('请输入项目描述信息');
            return;
          }
          done(null, true);
        }, 0);
      }
    }
    projectPrompt.push(descriptionPrompt)
    const projectInfo = await inquirer.prompt(projectPrompt)
    options.projectInfo.description = projectInfo.description
    const { sourcePath, targetPath } = options
    try {
      fse.ensureDirSync(sourcePath)
      fse.ensureDirSync(targetPath)
      fse.copySync(sourcePath, targetPath)
      const templateIgnore = options.templateInfo.ignore || []
      const ignore = ['**/node_modules/**', ...templateIgnore]
      await ejsRender({
          ignore,
          targetPath,
          data: options.projectInfo
        })
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
}

module.exports = install