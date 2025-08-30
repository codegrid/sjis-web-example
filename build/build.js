const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const iconv = require('iconv-lite');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const publicDir = path.join(projectRoot, 'public');
const templatesDir = path.join(srcDir, 'templates');

async function build() {
  try {
    console.log('Starting build...');

    // publicディレクトリを空にする
    await fs.emptyDir(publicDir);
    console.log('Cleaned public directory.');

    // 1. EJSテンプレートをHTML文字列にレンダリング（UTF-8）
    const templatePath = path.join(templatesDir, 'index.ejs');
    const templateStr = await fs.readFile(templatePath, 'utf-8');
    const htmlUtf8 = await ejs.render(templateStr, {}, { async: true });
    console.log('Rendered EJS template to HTML.');

    // 2. HTML文字列をShift-JIS（CP932）バッファに変換
    const htmlSjisBuffer = iconv.encode(htmlUtf8, 'cp932');
    console.log('Converted HTML to Shift-JIS (CP932) buffer.');

    // 3. Shift-JISバッファをindex.htmlに書き出し
    await fs.writeFile(path.join(publicDir, 'index.html'), htmlSjisBuffer);
    console.log('Wrote index.html (Shift-JIS).');

    // 4. CSSとJSファイルをコピー
    await fs.copy(path.join(srcDir, 'css'), path.join(publicDir, 'css'));
    await fs.copy(path.join(srcDir, 'js'), path.join(publicDir, 'js'));
    console.log('Copied CSS and JS files.');

    // 5. node_modulesからaxiosをコピー
    // require.resolve('axios')はpackage.jsonを指すので、そのディレクトリを取得
    const axiosPackageJsonPath = require.resolve('axios/package.json');
    const axiosRootDir = path.dirname(axiosPackageJsonPath);
    await fs.ensureDir(path.join(publicDir, 'js', 'vendor'));
    await fs.copy(
      path.join(axiosRootDir, 'dist', 'axios.min.js'),
      path.join(publicDir, 'js', 'vendor', 'axios.min.js')
    );
    console.log('Copied axios library.');

    console.log('Build completed successfully!');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
