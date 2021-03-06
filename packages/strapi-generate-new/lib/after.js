'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');
const { exec } = require('child_process');

// Public node modules.
const _ = require('lodash');
const fs = require('fs-extra');
const npm = require('enpeem');
const getInstalledPath = require('get-installed-path');

// Logger.
const logger = require('strapi-utils').logger;

/**
 * Runs after this generator has finished
 *
 * @param {Object} scope
 * @param {Function} cb
 */

module.exports = (scope, cb) => {
  const packageJSON = require(path.resolve(scope.rootPath, 'package.json'));
  const strapiRootPath = path.resolve(scope.strapiRoot, '..');

  process.chdir(scope.rootPath);

  // Copy the default files.
  fs.copySync(path.resolve(__dirname, '..', 'files'), path.resolve(scope.rootPath));

  const availableDependencies = [];
  const dependencies = _.get(packageJSON, 'dependencies');
  const strapiDependencies = Object.keys(dependencies).filter(key => key.indexOf('strapi') !== -1);
  const othersDependencies = Object.keys(dependencies).filter(key => key.indexOf('strapi') === -1);

  // Verify if the dependencies are available into the global
  _.forEach(strapiDependencies, (key) => {
    try {
      const isInstalled = getInstalledPath.sync(key);

      availableDependencies.push({
        key,
        global: true,
        path: isInstalled
      });
    } catch (e) {
      othersDependencies.push(key);
    }
  });

  logger.info('Installing dependencies...');
  if (!_.isEmpty(othersDependencies)) {
    npm.install({
      dependencies: othersDependencies,
      loglevel: 'silent',
      production: true,
      'cache-min': 999999999
    }, err => {
      if (err) {
        console.log();
        logger.warn('You should run `npm install` into your application before starting it.');
        console.log();
        logger.warn('Some dependencies could not be installed:');
        _.forEach(othersDependencies, value => logger.warn('• ' + value));
        console.log();

        return cb();
      }

      pluginsInstallation();
    });
  } else {
    pluginsInstallation();
  }

  function pluginsInstallation() {
    exec('strapi install settings-manager', (err, stdout) => {
      logger.info('Installing plugin `Settings Manager`...');

      if (err) {
        logger.error('An error occured during Settings Manager plugin installation.');
        logger.error(stdout);
      }

      availableDependencies.forEach(dependency => {
        logger.info(`Linking \`${dependency.key}\` dependency to the project...`);

        if (dependency.global) {
          fs.symlinkSync(dependency.path, path.resolve(scope.rootPath, 'node_modules', dependency.key), 'dir');
        } else {
          fs.symlinkSync(path.resolve(scope.strapiRoot, 'node_modules', dependency.key), path.resolve(scope.rootPath, 'node_modules', dependency.key), 'dir');
        }
      });

      logger.info('Your new application `' + scope.name + '` is ready at `' + scope.rootPath + '`.');

      cb();
    });
  }
};
