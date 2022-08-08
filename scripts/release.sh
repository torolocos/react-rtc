export PATH=$(npm bin):$PATH

VERSION=`auto version`

## Support for label 'skip-release'
if [ ! -z "$VERSION" ]; then
  ## Update Changelog
  ## auto changelog

  ## Publish Package
  yarn workspace @torolocos/react-rtc version --$VERSION
  yarn workspace @torolocos/react-rtc publish --version $npm_package_version --access public

  # Update dependencies
  yarn workspace example upgrade @torolocos/react-rtc

  ## Create GitHub Release
  git push --follow-tags --set-upstream origin $branch
  auto release
fi
