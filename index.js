const prompts = require('prompts');
const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');
const licenseChoices = require('./licenses');

const YEAR = new Date().getFullYear();

const packagePath = path.resolve(__dirname, 'package.json');
const questions = {
  type: 'toggle',
  name: 'autoFill',
  message:
    'A package.json file has been detected. Would you like to generate a license based on available entries(author, license)? ',
  initial: true,
  active: 'Yes',
  inactive: 'No',
};

const promptPackageDotJSONFile = async () => {
  try {
    const resp = await prompts(questions);
    return resp.autoFill;
  } catch (error) {
    console.log(error);
  }
};

const getDataFromPackageDotJSON = (data) => {
  const HOLDER = data.author;
  const LICENSE = data.license.toLowerCase();

  return {
    holder: HOLDER,
    license: LICENSE,
  };
};

const generateLicense = (holder, license) => {
  // check if license file exists
  console.log('holder', holder);
  console.log('license', license);
  fs.access(`./licenses/${license}.md`, fs.F_OK, (err) => {
    if (err) {
      console.log(`${license} is not available.`);
      return;
    }

    const licenseTemplate = fs.readFileSync(
      `./licenses/${license}.md`,
      'utf-8',
    );
    const formattedData = `${YEAR} ${holder}`;

    fs.writeFileSync(
      'LICENSE',
      licenseTemplate.replace('<YEAR> <HOLDER>', formattedData),
    );
  });
};

const getDataFromUser = async () => {
  const promptUser = [
    {
      type: 'text',
      name: 'author',
      message: 'Name(Full Name)',
    },
    {
      type: 'select',
      name: 'license',
      message: 'Select a license',
      choices: licenseChoices,
      initial: 0,
    },
  ];
  try {
    const resp = await prompts(promptUser);
    return {
      author: resp.author,
      choice: resp.license,
    };
  } catch (error) {
    console.log(error);
  }
};

fs.access(packagePath, fs.F_OK, (err) => {
  if (err) {
    console.log('error', err);
    return;
  }

  let data = require('./package.json');
  data = data ? data : null;
  promptPackageDotJSONFile().then((res) => {
    // if true
    if (res) {
      // add function
      if (data) {
        const { holder, license } = getDataFromPackageDotJSON(data);
        //  generate license
        generateLicense(holder, license);
      } else {
        console.log(colors.bold.red('License file not generate!'));
      }
    } else {
      getDataFromUser().then(({ author, choice }) => {
        // console.log('choice', choice);
        generateLicense(author, choice);
      });
    }
  });
});
