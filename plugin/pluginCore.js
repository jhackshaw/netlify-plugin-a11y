const { extname } = require('path')

const pa11y = require('pa11y');
const readdirp = require('readdirp')
const { isDirectory, isFile } = require('path-type')

exports.runPa11y = async function({ htmlFilePaths, testMode, debugMode }) {
  let results = await Promise.all(htmlFilePaths.map(pa11y));
  results = results
    .filter((res) => res.issues.length)
    .map((res) =>
      res.issues.map((issue) => ({
        ...issue,
        documentTitle: res.documentTitle,
        pageUrl: res.pageUrl.slice(7)
      }))
    );
  let flattenedResults = [];
  results.forEach(
    (res) => void (flattenedResults = flattenedResults.concat(res))
  );
  if (debugMode) {
    console.log({ flattenedResults, results });
  }
  return flattenedResults;
};

exports.generateFilePaths = async function({
  fileAndDirPaths, // array, mix of html and directories
  PUBLISH_DIR,
  testMode,
  debugMode
}) {
  const htmlFilePaths = await Promise.all(
    fileAndDirPaths.map(fileAndDirPath => findHtmlFiles(`${PUBLISH_DIR}/${fileAndDirPath}`))
  )
  return [].concat(...htmlFilePaths)
};

const findHtmlFiles = async function(fileAndDirPath) {
  if (await isDirectory(fileAndDirPath)) {
    const fileInfos = await readdirp.promise(fileAndDirPath, { fileFilter: '*.html' })
    return fileInfos.map(({ fullPath }) => fullPath)
  }

  if (!(await isFile(fileAndDirPath))) {
    console.warn(`Folder ${fileAndDirPath} was provided in "checkPaths", but does not exist - it either indicates something went wrong with your build, or you can simply delete this folder from your "checkPaths" in netlify.toml`)
    return []
  }

  if (extname(fileAndDirPath) !== '.html') {
    return []
  }

  return [fileAndDirPath]
}

//  res:
//    [ { code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
//        type: 'error',
//        typeCode: 1,
//        message:
//         'Img element missing an alt attribute. Use the alt attribute to specify a short text alternative.',
//        context: '<img src="https://placekitten.com/200/300">',
//        selector: 'html > body > img',
//        runner: 'htmlcs',
//        runnerExtras: {} } ] }
