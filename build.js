import electronBuilder from 'electron-builder';

// Then use electronBuilder.build() when needed

electronBuilder.build({
  config: {
    appId: 'com.yourcompany.yourapp',
    productName: 'Ping Pong Online',
    directories: {
      output: 'dist'
    },
    files: [
      '**/*',
      '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
      '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
      '!**/node_modules/*.d.ts',
      '!**/node_modules/.bin',
      '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
      '!.editorconfig',
      '!**/._*',
      '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
      '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
      '!**/{appveyor.yml,.travis.yml,circle.yml}',
      '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
    ],
    mac: {
      target: ['dmg', 'zip'],
      identity: null
    },
    win: {
      target: ['nsis', 'portable'],
      sign: null
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      runAfterFinish: true,
      deleteAppDataOnUninstall: true,
      allowElevation: true,
      include: 'installer.nsh'
    },
    afterSign: null,
    linux: {
      target: ['AppImage', 'deb']
    }
  }
}).then(() => {
  console.log('Build complete!');
}).catch((error) => {
  console.error('Build failed:', error);
});
